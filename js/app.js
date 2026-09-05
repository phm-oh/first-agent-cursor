import {
  initTokenizer,
  tokenizeText,
  extractTextFromFile,
  readImageDimensions,
  estimateVisionTokens,
  formatTokenPreview,
} from "./tokenizer.js";
import {
  loadModels,
  getModels,
  getModelById,
  calcCostUsd,
  formatUsd,
  formatTokens,
  usagePercent,
} from "./models.js";
import { loadTemplates, generateMockResponse } from "./mock.js";
import { loadLessons, getLessons, getLesson } from "./lessons.js?v=plain1";
import { STEPS, TOTAL_STEPS, getStep } from "./simulation.js?v=plain1";
import { renderStage, THINK_STAGES } from "./stages.js?v=plain1";
import { mountVirtualChips } from "./virtual-chips.js";
import { mountDataFlow, typeText } from "./animation.js?v=plain1";
import { mountThinkLesson, mountModelPeek, pickLessonTokens } from "./model-diagrams.js?v=plain1";

const THINK_DWELL_MS = 11000;

const OVERFLOW_SEED = `ช่วยสรุปบทเรียนเรื่อง Token และหน้าต่างบริบท ให้ยาวพอสำหรับสาธิตข้อความที่ล้น

ประเด็นหลัก: ถ้าข้อความยาวเกินลิมิต โมเดลจะมองไม่เห็นส่วนที่ล้น และส่วนนั้นจะไม่ถูกนำไปคิดราคาฝั่งความเข้าใจ

`;
const OVERFLOW_PAD =
  "รายละเอียดเพิ่มเติมสำหรับสอนข้อความที่ล้นหน้าต่างบริบท — นักเรียนถามซ้ำเรื่อง Token ต้นทุน และส่วนที่โมเดลอ่านไม่ถึง ";

const state = {
  theme: "dark",
  viewMode: "overview",
  modelId: "model-a",
  systemPrompt: "",
  turns: [{ id: uid(), role: "user", content: "" }],
  attachments: [],
  started: false,
  currentStep: 0,
  report: emptyReport(),
  outputText: "",
  outputTokens: [],
  thinkIndex: 0,
  thinkPlaying: true,
  thinkDepth: "simple",
  presenting: false,
  lessonId: "token-basics",
};

let debounceTimer = null;
let thinkTimer = null;
let unmountChips = null;
let stopMotion = null;

function uid() {
  return `id-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
}

function emptyReport() {
  return {
    systemTokens: [],
    turnTokens: [],
    fileTokens: [],
    imageItems: [],
    allPieces: [],
    counts: {
      system: 0,
      user: 0,
      files: 0,
      images: 0,
      input: 0,
      limit: 0,
      remaining: 0,
      overflow: 0,
      percent: 0,
    },
    cost: 0,
  };
}

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function currentModel() {
  return getModelById(state.modelId);
}

function collectUserText() {
  return state.turns.map((turn) => turn.content).join("\n");
}

function sourceText() {
  return [state.systemPrompt, collectUserText(), ...state.attachments.map((item) => item.text || "")]
    .filter(Boolean)
    .join("\n");
}

function buildReport() {
  const model = currentModel();
  const systemTokens = tokenizeText(state.systemPrompt);
  const turnTokens = state.turns.map((turn) => ({
    id: turn.id,
    role: turn.role,
    tokens: tokenizeText(turn.content),
  }));
  const fileTokens = state.attachments
    .filter((item) => item.kind === "file")
    .map((item) => ({
      id: item.id,
      name: item.name,
      tokens: tokenizeText(item.text || ""),
    }));
  const imageItems = state.attachments.filter((item) => item.kind === "image");

  const systemCount = systemTokens.length;
  const userCount = turnTokens.reduce((sum, item) => sum + item.tokens.length, 0);
  const fileCount = fileTokens.reduce((sum, item) => sum + item.tokens.length, 0);
  const imageCount = imageItems.reduce((sum, item) => sum + (item.visionTokens || 0), 0);
  const input = systemCount + userCount + fileCount + imageCount;
  const overflow = Math.max(0, input - model.contextLimit);
  const remaining = Math.max(0, model.contextLimit - input);

  const allPieces = [
    ...systemTokens.map((token) => ({ ...token, kind: "system" })),
    ...turnTokens.flatMap((item) => item.tokens.map((token) => ({ ...token, kind: "user" }))),
    ...fileTokens.flatMap((item) => item.tokens.map((token) => ({ ...token, kind: "file" }))),
    ...imageItems.flatMap((item) =>
      Array.from({ length: Math.min(item.visionTokens || 0, 400) }, (_, index) => ({
        text: `IMG`,
        id: index,
        kind: "image",
      }))
    ),
  ];

  return {
    systemTokens,
    turnTokens,
    fileTokens,
    imageItems,
    allPieces,
    counts: {
      system: systemCount,
      user: userCount,
      files: fileCount,
      images: imageCount,
      input,
      limit: model.contextLimit,
      remaining,
      overflow,
      percent: usagePercent(input, model.contextLimit),
    },
    cost: calcCostUsd(input, model.inputPricePerMillion),
  };
}

function scheduleAnalyze() {
  if (state.started) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    state.report = buildReport();
    renderVisualization();
    renderLiveBadge();
  }, 180);
}

function renderSteps() {
  const rail = $("step-rail");
  rail.innerHTML = STEPS.map((step) => {
    let status = "upcoming";
    if (state.started && step.id === state.currentStep) status = "active";
    else if (state.started && step.id < state.currentStep) status = "done";
    return `
      <button type="button" class="step-item ${status}" data-step="${step.id}" title="${escapeHtml(step.caption)}">
        <div class="step-dot">${step.id}</div>
        <div class="step-label text-[11px] text-zinc-400 thai text-center leading-tight">${escapeHtml(step.titleTh)}</div>
        <div class="step-line"></div>
      </button>
    `;
  }).join("");

  rail.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!state.started) return;
      goToStep(Number(btn.dataset.step));
    });
  });
}

function renderTurns() {
  const wrap = $("turns-wrap");
  wrap.innerHTML = state.turns
    .map(
      (turn, index) => `
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs text-zinc-400 thai">${turn.role === "assistant" ? "คำตอบจำลอง" : "ข้อความผู้ใช้"} ${state.turns.length > 1 ? index + 1 : ""}</label>
          ${
            state.turns.length > 1
              ? `<button type="button" data-remove-turn="${turn.id}" class="text-[11px] text-rose-300 hover:text-rose-200">ลบ</button>`
              : ""
          }
        </div>
        <textarea data-turn="${turn.id}" class="field thai text-sm min-h-[88px] sm:min-h-[120px]" placeholder="พิมพ์คำถาม หรือบทสนทนาที่อยากจำลอง...">${escapeHtml(turn.content)}</textarea>
      </div>`
    )
    .join("");

  wrap.querySelectorAll("textarea").forEach((area) => {
    area.addEventListener("input", () => {
      const turn = state.turns.find((item) => item.id === area.dataset.turn);
      if (turn) turn.content = area.value;
      scheduleAnalyze();
    });
  });
  wrap.querySelectorAll("[data-remove-turn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.turns = state.turns.filter((item) => item.id !== btn.dataset.removeTurn);
      if (!state.turns.length) state.turns = [{ id: uid(), role: "user", content: "" }];
      renderTurns();
      scheduleAnalyze();
      refreshIcons();
    });
  });
}

function renderModels() {
  const select = $("model-select");
  select.innerHTML = getModels()
    .map((model) => {
      const selected = model.id === state.modelId ? "selected" : "";
      return `<option value="${model.id}" ${selected}>${escapeHtml(model.name)} · ${formatTokens(model.contextLimit)}</option>`;
    })
    .join("");
  const model = currentModel();
  $("model-desc").textContent = `${model.description} · ข้อความเข้า ${formatUsd(model.inputPricePerMillion)} / 1 ล้าน Token`;
}

function renderFiles() {
  const list = $("file-list");
  if (!state.attachments.length) {
    list.innerHTML = "";
    return;
  }
  list.innerHTML = state.attachments
    .map((item) => {
      const meta =
        item.kind === "image"
          ? `${item.width}×${item.height} · ${formatTokens(item.visionTokens)} Token ของรูป`
          : `${formatTokens(tokenizeText(item.text || "").length)} Token`;
      const thumb = item.previewUrl
        ? `<img class="thumb" src="${item.previewUrl}" alt="">`
        : `<div class="thumb grid place-items-center text-zinc-500"><i data-lucide="${item.kind === "image" ? "image" : "file-text"}" class="w-4 h-4"></i></div>`;
      return `
        <div class="file-chip">
          ${thumb}
          <div class="min-w-0 flex-1">
            <p class="text-xs truncate">${escapeHtml(item.name)}</p>
            <p class="mono text-[11px] text-zinc-500">${meta}</p>
          </div>
          <button type="button" data-remove-file="${item.id}" class="text-zinc-500 hover:text-rose-300">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>`;
    })
    .join("");

  list.querySelectorAll("[data-remove-file]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = state.attachments.find((item) => item.id === btn.dataset.removeFile);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      state.attachments = state.attachments.filter((item) => item.id !== btn.dataset.removeFile);
      renderFiles();
      scheduleAnalyze();
      refreshIcons();
    });
  });
  refreshIcons();
}

function renderLiveBadge() {
  $("live-badge").textContent = `${formatTokens(state.report.counts.input)} Token`;
}

function renderVisualization() {
  const model = currentModel();
  const { counts } = state.report;
  const overflowing = counts.overflow > 0;
  const frame = $("context-frame");
  frame.classList.toggle("overflowing", overflowing);

  $("frame-model").textContent = model.name;
  $("frame-limit").textContent = `ความจุ ${formatTokens(model.contextLimit)} Token`;
  $("usage-label").textContent = `${Math.min(counts.percent, 999).toFixed(counts.percent >= 10 ? 1 : 2)}%`;
  $("usage-label").className = `mono text-2xl font-semibold tracking-tight ${overflowing ? "text-rose-400" : "text-zinc-50"}`;
  $("usage-sub").textContent = overflowing
    ? `ล้น ${formatTokens(counts.overflow)} Token นอกหน้าต่าง`
    : counts.input
      ? `ใช้ไป ${formatTokens(counts.input)} จาก ${formatTokens(counts.limit)}`
      : "ยังไม่มี Token ในหน้าต่าง";

  const usedWidth = Math.min(100, counts.percent);
  const parts = [
    { key: "system", color: "#6366f1", value: counts.system },
    { key: "user", color: "#10b981", value: counts.user },
    { key: "files", color: "#f59e0b", value: counts.files },
    { key: "images", color: "#f43f5e", value: counts.images },
  ];
  const basis = Math.max(1, counts.input);
  $("tank").innerHTML = counts.input
    ? parts
        .map((part) => {
          const width = (part.value / basis) * usedWidth;
          if (width <= 0) return "";
          return `<div class="tank-seg" style="width:${width}%;background:${part.color}" title="${part.key}"></div>`;
        })
        .join("")
    : "";

  const overflowTrack = $("overflow-track");
  if (overflowing) {
    overflowTrack.classList.remove("hidden");
    const overflowPct = Math.min(100, (counts.overflow / Math.max(counts.limit, 1)) * 100);
    $("overflow-fill").style.width = `${Math.max(8, overflowPct)}%`;
  } else {
    overflowTrack.classList.add("hidden");
    $("overflow-fill").style.width = "0%";
  }

  $("legend").innerHTML = [
    ["ระบบ", "#6366f1", counts.system],
    ["ผู้ใช้", "#10b981", counts.user],
    ["ไฟล์", "#f59e0b", counts.files],
    ["รูปภาพ", "#f43f5e", counts.images],
  ]
    .map(
      ([label, color, value]) =>
        `<span class="inline-flex items-center gap-2"><span class="legend-dot" style="background:${color}"></span>${label} · ${formatTokens(value)}</span>`
    )
    .join("");

  $("metrics").innerHTML = [
    ["Token ข้อความเข้า", formatTokens(counts.input), ""],
    ["เหลือ", formatTokens(counts.remaining), counts.remaining === 0 && counts.input ? "text-amber-300" : ""],
    ["ส่วนที่ล้น", formatTokens(counts.overflow), overflowing ? "text-rose-400" : ""],
    ["ประมาณค่าข้อความเข้า", formatUsd(counts.input ? state.report.cost : 0), ""],
  ]
    .map(
      ([label, value, extra]) => `
      <article class="metric-card fade-up">
        <div class="label">${label}</div>
        <div class="value ${extra}">${value}</div>
      </article>`
    )
    .join("");

  if (state.viewMode === "tokens") renderIdleTokenPreview();
}

function renderIdleTokenPreview() {
  const pieces = state.report.allPieces;
  const limit = state.report.counts.limit;
  const host = $("token-chips");
  if (unmountChips) {
    unmountChips();
    unmountChips = null;
  }
  if (!pieces.length) {
    host.innerHTML = "";
    $("token-chips-note").textContent = "ยังไม่มี Token ให้แสดง";
    return;
  }
  unmountChips = mountVirtualChips(host, pieces, {
    limit,
    format: formatTokenPreview,
    escapeHtml,
  });
  $("token-chips-note").textContent = `ทั้งหมด ${formatTokens(pieces.length)} Token · เลื่อนดูได้ทั้งหมด`;
}

function setViewMode(mode) {
  state.viewMode = mode;
  $("mode-overview").className =
    mode === "overview"
      ? "px-3 h-8 rounded-lg text-xs thai bg-indigo-500 text-white"
      : "px-3 h-8 rounded-lg text-xs thai text-zinc-400 hover:text-white";
  $("mode-tokens").className =
    mode === "tokens"
      ? "px-3 h-8 rounded-lg text-xs thai bg-indigo-500 text-white"
      : "px-3 h-8 rounded-lg text-xs thai text-zinc-400 hover:text-white";
  $("detail-panel").classList.toggle("hidden", mode !== "tokens");
  if (mode === "tokens") renderIdleTokenPreview();
}

function setCaption(text) {
  $("caption").textContent = text;
}

function stageContext() {
  return {
    report: state.report,
    model: currentModel(),
    models: getModels(),
    attachments: state.attachments,
    systemPrompt: state.systemPrompt,
    turns: state.turns,
    outputText: state.outputText,
    outputTokens: state.outputTokens,
    thinkIndex: state.thinkIndex,
    thinkDepth: state.thinkDepth,
    formatTokens,
    formatUsd,
    calcCostUsd,
    escapeHtml,
    formatTokenPreview,
  };
}

function stopThinkLoop() {
  if (thinkTimer) {
    clearInterval(thinkTimer);
    thinkTimer = null;
  }
}

function startThinkLoop() {
  stopThinkLoop();
  if (!state.thinkPlaying) return;
  thinkTimer = setInterval(() => {
    if (!state.thinkPlaying || state.currentStep !== 6) return;
    if (state.thinkIndex >= THINK_STAGES.length - 1) {
      state.thinkPlaying = false;
      stopThinkLoop();
      updateThinkPauseLabel();
      restartThinkDwell();
      return;
    }
    state.thinkIndex += 1;
    applyThinkView();
  }, THINK_DWELL_MS);
}

function restartThinkDwell() {
  const bar = $("think-dwell");
  if (!bar) return;
  bar.classList.toggle("playing", state.thinkPlaying);
  const fill = bar.querySelector("span");
  if (!fill) return;
  fill.style.animation = "none";
  void fill.offsetWidth;
  if (state.thinkPlaying) {
    fill.style.animation = "";
  }
}

function currentLesson() {
  return pickLessonTokens(state.report.allPieces, state.outputTokens, formatTokenPreview);
}

function applyThinkView() {
  const stage = THINK_STAGES[state.thinkIndex];
  if (!stage) return;
  mountThinkLesson($("think-flow"), state.thinkIndex, currentLesson());
  const status = $("think-status");
  if (status) status.textContent = stage.plain;
  const title = document.querySelector("#stage-root h2");
  if (title) title.textContent = stage.titleTh;
  const kicker = $("think-kicker");
    if (kicker) kicker.textContent = `ขั้นที่ 6 · ${state.thinkIndex + 1} จาก 4 · ทายคำทีละคำ`;
  const studentNote = $("think-student-note");
  if (studentNote) {
    if (stage.studentNote) {
      studentNote.textContent = stage.studentNote;
      studentNote.classList.remove("hidden");
    } else {
      studentNote.textContent = "";
      studentNote.classList.add("hidden");
    }
  }
  const example = $("think-example");
  if (example) example.textContent = stage.example;
  const inModel = $("think-in-model");
  if (inModel) inModel.textContent = stage.inModel;
  document.querySelectorAll("[data-think]").forEach((card) => {
    card.classList.toggle("active", Number(card.dataset.think) === state.thinkIndex);
  });
  const lesson = $("think-bullets");
  if (lesson) {
    lesson.innerHTML = stage.bullets
      .map((item) => `<li class="thai text-sm text-zinc-300 leading-relaxed">${escapeHtml(item)}</li>`)
      .join("");
  }
  const details = $("think-details");
  if (details) details.classList.toggle("hidden", state.thinkDepth !== "teacher");
  $("think-depth-simple")?.classList.toggle("active", state.thinkDepth === "simple");
  $("think-depth-teacher")?.classList.toggle("active", state.thinkDepth === "teacher");
  setCaption(stage.caption);
  updateThinkPauseLabel();
  restartThinkDwell();
}

function updateThinkPauseLabel() {
  const btn = $("think-pause");
  if (!btn) return;
  btn.textContent = state.thinkPlaying ? "หยุดอัตโนมัติ" : "เล่นอัตโนมัติ";
}

function bindThinkControls() {
  document.querySelectorAll("[data-think]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.thinkIndex = Number(btn.dataset.think);
      state.thinkPlaying = false;
      stopThinkLoop();
      applyThinkView();
    });
  });
  $("think-prev")?.addEventListener("click", () => {
    state.thinkIndex = Math.max(0, state.thinkIndex - 1);
    state.thinkPlaying = false;
    stopThinkLoop();
    applyThinkView();
  });
  $("think-next")?.addEventListener("click", () => {
    state.thinkIndex = Math.min(THINK_STAGES.length - 1, state.thinkIndex + 1);
    state.thinkPlaying = false;
    stopThinkLoop();
    applyThinkView();
  });
  $("think-pause")?.addEventListener("click", () => {
    state.thinkPlaying = !state.thinkPlaying;
    if (state.thinkPlaying) startThinkLoop();
    else stopThinkLoop();
    updateThinkPauseLabel();
    restartThinkDwell();
  });
  document.querySelectorAll("[data-depth]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.thinkDepth = btn.dataset.depth === "teacher" ? "teacher" : "simple";
      $("think-details")?.classList.toggle("hidden", state.thinkDepth !== "teacher");
      $("think-depth-simple")?.classList.toggle("active", state.thinkDepth === "simple");
      $("think-depth-teacher")?.classList.toggle("active", state.thinkDepth === "teacher");
    });
  });
}

function clearMotion() {
  if (stopMotion) {
    stopMotion();
    stopMotion = null;
  }
}

function renderCurrentStage() {
  if (unmountChips) {
    unmountChips();
    unmountChips = null;
  }
  clearMotion();
  const root = $("stage-root");
  root.innerHTML = renderStage(state.currentStep, stageContext());
  if (state.currentStep === 2) {
    const host = $("chip-scroll");
    if (host) {
      unmountChips = mountVirtualChips(host, state.report.allPieces, {
        limit: state.report.counts.limit,
        format: formatTokenPreview,
        escapeHtml,
      });
      const note = $("chip-note");
      if (note) {
        note.textContent = `เลื่อนดูได้ทั้งหมด ${formatTokens(state.report.allPieces.length)} Token · เขียวอยู่ในความจุ · แดงคือล้น`;
      }
    }
  }
  if (state.currentStep === 5) {
    stopMotion = mountDataFlow($("data-flow"));
    mountModelPeek($("model-peek"));
  }
  if (state.currentStep === 6) {
    mountThinkLesson($("think-flow"), state.thinkIndex, currentLesson());
    bindThinkControls();
    updateThinkPauseLabel();
    restartThinkDwell();
    setCaption(THINK_STAGES[state.thinkIndex].caption);
  }
  if (state.currentStep === 7) {
    stopMotion = typeText($("typed-output"), state.outputText, 32);
  }
  if (state.currentStep === 8) {
    const host = $("output-chip-scroll");
    if (host && state.outputTokens.length) {
      unmountChips = mountVirtualChips(
        host,
        state.outputTokens.map((token) => ({ ...token, kind: "user" })),
        { format: formatTokenPreview, escapeHtml }
      );
    }
  }
}

function updateChrome() {
  document.body.classList.toggle("is-simulating", state.started);
  $("idle-viz").classList.toggle("hidden", state.started);
  $("stage-root").classList.toggle("hidden", !state.started);
  $("reset-btn").disabled = !state.started;
  $("next-btn").disabled = !state.started || state.currentStep >= TOTAL_STEPS;
  $("restart-btn").classList.toggle("hidden", !state.started);
  $("next-btn").textContent = state.currentStep >= TOTAL_STEPS ? "จบแล้ว" : "ขั้นถัดไป →";
  $("reset-btn").textContent = state.currentStep <= 1 ? "แก้ไขข้อความ" : "ย้อนกลับ";

  const step = getStep(state.currentStep);
  if (!state.started) {
    $("step-progress").textContent = "ยังไม่เริ่ม — กดเริ่มกระบวนการเมื่อพร้อม";
    $("phase-label").textContent = "ห้องเรียน";
  } else {
    $("step-progress").textContent = `ขั้นที่ ${state.currentStep} จาก ${TOTAL_STEPS} · ${step.titleTh}`;
    $("phase-label").textContent = `ขั้น ${state.currentStep} / ${TOTAL_STEPS}`;
    setCaption(step.caption);
  }
}

function applySimulation() {
  renderSteps();
  updateChrome();
  if (state.started) {
    if (state.currentStep === 6) {
      state.thinkIndex = 0;
      state.thinkPlaying = true;
      startThinkLoop();
    } else stopThinkLoop();
    renderCurrentStage();
  } else {
    stopThinkLoop();
    clearMotion();
    renderVisualization();
    renderLiveBadge();
  }
  refreshIcons();
}

function startProcess() {
  const hasText = state.systemPrompt.trim() || collectUserText().trim();
  const hasFiles = state.attachments.length > 0;
  if (!hasText && !hasFiles) {
    $("start-btn").classList.remove("shake");
    void $("start-btn").offsetWidth;
    $("start-btn").classList.add("shake");
    setCaption("พิมพ์ข้อความ หรือแนบไฟล์ก่อนเริ่ม — ไม่งั้นโมเดลจะไม่มีอะไรให้อ่าน");
    return;
  }

  state.report = buildReport();
  state.outputText = generateMockResponse(sourceText());
  state.outputTokens = tokenizeText(state.outputText);
  state.started = true;
  state.currentStep = 1;
  state.thinkIndex = 0;
  applySimulation();
}

function goToStep(index) {
  if (!state.started) return;
  state.currentStep = Math.min(TOTAL_STEPS, Math.max(1, index));
  applySimulation();
}

function goNext() {
  if (!state.started || state.currentStep >= TOTAL_STEPS) return;
  goToStep(state.currentStep + 1);
}

function goBack() {
  if (!state.started) return;
  if (state.currentStep <= 1) {
    exitSimulation();
    return;
  }
  goToStep(state.currentStep - 1);
}

function exitSimulation() {
  state.started = false;
  state.currentStep = 0;
  applySimulation();
  setCaption("กลับไปแก้ไขข้อความได้แล้ว เมื่อพร้อมกดเริ่มกระบวนการอีกครั้ง");
}

function buildOverflowText(limit, systemText) {
  const padTokens = Math.max(1, tokenizeText(OVERFLOW_PAD).length);
  const seedTokens = tokenizeText(`${systemText || ""}\n${OVERFLOW_SEED}`).length;
  const need = Math.max(padTokens, limit + 1200 - seedTokens);
  const repeats = Math.ceil(need / padTokens);
  return OVERFLOW_SEED + OVERFLOW_PAD.repeat(repeats);
}

function clearAttachments() {
  for (const item of state.attachments) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  }
  state.attachments = [];
  const input = $("file-input");
  if (input) input.value = "";
}

function renderLessons() {
  const select = $("lesson-select");
  if (!select) return;
  const items = getLessons();
  select.innerHTML = items
    .map(
      (lesson, index) =>
        `<option value="${escapeHtml(lesson.id)}" ${lesson.id === state.lessonId ? "selected" : ""}>${index + 1}. ${escapeHtml(lesson.title)}</option>`
    )
    .join("");
  const current = getLesson(state.lessonId);
  const hint = $("lesson-hint");
  if (hint && current) hint.textContent = current.hint || "เลือกบทแล้วกดโหลด";
}

function applyLesson(id) {
  const lesson = getLesson(id);
  if (!lesson) return;
  if (state.started) exitSimulation();
  clearAttachments();
  renderFiles();
  state.lessonId = lesson.id;
  state.systemPrompt = lesson.system || "";
  $("system-input").value = state.systemPrompt;
  if (lesson.overflow) {
    state.modelId = lesson.modelId || "model-f";
    const limit = getModelById(state.modelId).contextLimit;
    state.turns = [{ id: uid(), role: "user", content: buildOverflowText(limit, state.systemPrompt) }];
  } else {
    if (lesson.modelId) state.modelId = lesson.modelId;
    const turns = Array.isArray(lesson.turns) && lesson.turns.length ? lesson.turns : [{ role: "user", content: "" }];
    state.turns = turns.map((turn) => ({
      id: uid(),
      role: turn.role === "assistant" ? "assistant" : "user",
      content: turn.content || "",
    }));
  }
  renderTurns();
  renderModels();
  renderLessons();
  state.report = buildReport();
  renderVisualization();
  renderLiveBadge();
  setCaption(
    lesson.overflow
      ? "โหลดบทข้อความยาวจนล้นแล้ว — เลือกโมเดลหน้าต่างเล็กไว้ให้ เพื่อให้เห็นส่วนที่ล้นเป็นสีแดง"
      : `โหลดบทเรียน «${lesson.title}» แล้ว สังเกตจำนวน Token แล้วกดเริ่มกระบวนการได้`
  );
  refreshIcons();
}

function updatePresentButton() {
  const btn = $("present-btn");
  if (!btn) return;
  btn.setAttribute("aria-pressed", state.presenting ? "true" : "false");
  btn.title = state.presenting ? "ออกจากโหมดนำเสนอ" : "โหมดนำเสนอเต็มจอ";
  btn.innerHTML = state.presenting
    ? '<i data-lucide="minimize-2" class="w-4 h-4 mx-auto"></i>'
    : '<i data-lucide="maximize-2" class="w-4 h-4 mx-auto"></i>';
  refreshIcons();
}

function setPresenting(on) {
  state.presenting = Boolean(on);
  document.body.classList.toggle("is-presenting", state.presenting);
  updatePresentButton();
  if (state.presenting) {
    document.documentElement.requestFullscreen?.().catch(() => {});
    setCaption("โหมดนำเสนอ · ลูกศรซ้ายขวาเดินขั้น · Esc เพื่อออก");
  } else if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
  }
}

function togglePresenting() {
  setPresenting(!state.presenting);
}

async function handleFiles(fileList) {
  for (const file of fileList) {
    try {
      if (file.type.startsWith("image/")) {
        const dims = await readImageDimensions(file);
        state.attachments.push({
          id: uid(),
          kind: "image",
          name: file.name,
          width: dims.width,
          height: dims.height,
          previewUrl: dims.previewUrl,
          visionTokens: estimateVisionTokens(dims.width, dims.height),
        });
      } else {
        const text = await extractTextFromFile(file);
        state.attachments.push({
          id: uid(),
          kind: "file",
          name: file.name,
          text,
        });
      }
    } catch (error) {
      setCaption(error.message || "อ่านไฟล์ไม่สำเร็จ");
    }
  }
  renderFiles();
  scheduleAnalyze();
}

function bindEvents() {
  $("system-input").addEventListener("input", (event) => {
    state.systemPrompt = event.target.value;
    scheduleAnalyze();
  });

  $("add-turn").addEventListener("click", () => {
    const last = state.turns[state.turns.length - 1];
    const nextRole = last?.role === "user" ? "assistant" : "user";
    state.turns.push({ id: uid(), role: nextRole, content: "" });
    renderTurns();
    refreshIcons();
  });

  $("model-select").addEventListener("change", (event) => {
    state.modelId = event.target.value;
    renderModels();
    scheduleAnalyze();
  });

  $("start-btn").addEventListener("click", startProcess);
  $("reset-btn").addEventListener("click", goBack);
  $("next-btn").addEventListener("click", goNext);
  $("restart-btn").addEventListener("click", exitSimulation);
  $("lesson-load")?.addEventListener("click", () => applyLesson($("lesson-select").value));
  $("lesson-select")?.addEventListener("change", () => {
    state.lessonId = $("lesson-select").value;
    renderLessons();
  });
  $("present-btn")?.addEventListener("click", togglePresenting);
  $("mode-overview").addEventListener("click", () => setViewMode("overview"));
  $("mode-tokens").addEventListener("click", () => setViewMode("tokens"));
  $("theme-toggle").addEventListener("click", toggleTheme);

  const dropzone = $("dropzone");
  const fileInput = $("file-input");
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
    handleFiles(event.dataTransfer.files);
  });
  fileInput.addEventListener("change", (event) => handleFiles(event.target.files));

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (!state.started) startProcess();
      return;
    }
    const typing = event.target.tagName === "TEXTAREA" || event.target.tagName === "INPUT" || event.target.tagName === "SELECT";
    if (event.key === "Escape" && state.presenting) {
      event.preventDefault();
      setPresenting(false);
      return;
    }
    if (!typing && (event.key === "p" || event.key === "P") && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      togglePresenting();
      return;
    }
    if (state.started && !typing) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goBack();
      }
    }
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && state.presenting) {
      state.presenting = false;
      document.body.classList.remove("is-presenting");
      updatePresentButton();
    }
  });
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.documentElement.classList.toggle("light", state.theme === "light");
  document.documentElement.classList.toggle("dark", state.theme === "dark");
  $("theme-toggle").innerHTML =
    state.theme === "dark"
      ? '<i data-lucide="sun" class="w-4 h-4 mx-auto"></i>'
      : '<i data-lucide="moon" class="w-4 h-4 mx-auto"></i>';
  refreshIcons();
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function updateTokenizerStatus(mode) {
  const ready = mode === "o200k_base";
  $("tokenizer-dot").classList.toggle("ready", ready);
  $("tokenizer-label").textContent = ready ? "Tokenizer พร้อมแล้ว" : "Tokenizer แบบประมาณค่า";
}

async function boot() {
  refreshIcons();
  renderSteps();
  renderTurns();
  bindEvents();
  setViewMode("overview");
  updateChrome();

  await Promise.all([loadModels(), loadTemplates(), loadLessons()]);
  renderModels();
  renderLessons();
  state.report = buildReport();
  renderVisualization();
  renderLiveBadge();
  refreshIcons();

  const mode = await initTokenizer();
  updateTokenizerStatus(mode);
  state.report = buildReport();
  renderVisualization();
  renderLiveBadge();
}

boot();
