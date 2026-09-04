import {
  initTokenizer,
  tokenizeText,
  extractTextFromFile,
  readImageDimensions,
  estimateVisionTokens,
  formatTokenPreview,
  getTokenizerMode,
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
import { loadTemplates } from "./mock.js";
import { STEPS } from "./simulation.js";

const MAX_VISIBLE_CHIPS = 280;

const SAMPLE_SYSTEM =
  "คุณเป็นผู้ช่วยสอนเรื่อง Token ของโมเดลภาษา ตอบกระชับ ชัดเจน และใช้ภาษาที่นักเรียนเข้าใจได้";

const SAMPLE_USER = `ช่วยอธิบายให้หน่อยว่า Token คืออะไร ต่างจากคำอย่างไร และทำไม Context Window ถึงสำคัญเมื่อเราคุยกับ ChatGPT

ฉันอยากได้ตัวอย่างภาษาไทยกับภาษาอังกฤษสั้น ๆ เพื่อเอาไปสอนในห้องเรียน`;

const OVERFLOW_SEED = `ช่วยสรุปบทเรียนเรื่อง Token และ Context Window ให้ยาวพอสำหรับสาธิต Overflow

ประเด็นหลัก: ถ้าข้อความยาวเกินลิมิต โมเดลจะมองไม่เห็นส่วนที่ล้น และส่วนนั้นจะไม่ถูกนำไปคิดราคาฝั่งความเข้าใจ

`;
const OVERFLOW_PAD =
  "รายละเอียดเพิ่มเติมสำหรับสอน Overflow ของหน้าต่างบริบท — นักเรียนถามซ้ำเรื่อง Token ต้นทุน และส่วนที่ล้น ";

const state = {
  theme: "dark",
  viewMode: "overview",
  modelId: "model-a",
  systemPrompt: "",
  turns: [{ id: uid(), role: "user", content: "" }],
  attachments: [],
  started: false,
  report: emptyReport(),
};

let debounceTimer = null;

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
      Array.from({ length: item.visionTokens || 0 }, (_, index) => ({
        text: `IMG:${item.name}:${index + 1}`,
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
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    state.report = buildReport();
    renderVisualization();
    renderLiveBadge();
  }, 180);
}

function renderSteps() {
  const rail = $("step-rail");
  rail.innerHTML = STEPS.map((step, index) => {
    const preview = index < 3 ? "preview" : "";
    const active = state.started && index < 3 ? "done" : "";
    return `
      <div class="step-item ${preview} ${active}" title="${escapeHtml(step.caption)}">
        <div class="step-dot">${step.id}</div>
        <div class="text-[11px] text-zinc-400 thai text-center leading-tight">${escapeHtml(step.titleTh)}</div>
        <div class="step-line"></div>
      </div>
    `;
  }).join("");
}

function renderTurns() {
  const wrap = $("turns-wrap");
  wrap.innerHTML = state.turns
    .map(
      (turn, index) => `
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs text-zinc-400 thai">${turn.role === "assistant" ? "Assistant" : "User"} ${state.turns.length > 1 ? index + 1 : ""}</label>
          ${
            state.turns.length > 1
              ? `<button type="button" data-remove-turn="${turn.id}" class="text-[11px] text-rose-300 hover:text-rose-200">ลบ</button>`
              : ""
          }
        </div>
        <textarea data-turn="${turn.id}" class="field thai text-sm min-h-[120px]" placeholder="พิมพ์คำถาม หรือบทสนทนาที่อยากจำลอง...">${escapeHtml(turn.content)}</textarea>
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
  $("model-desc").textContent = `${model.description} · Input ${formatUsd(model.inputPricePerMillion)} / 1M tokens`;
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
          ? `${item.width}×${item.height} · ${formatTokens(item.visionTokens)} vision tok`
          : `${formatTokens(tokenizeText(item.text || "").length)} tok`;
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
  $("live-badge").textContent = `${formatTokens(state.report.counts.input)} tok`;
}

function renderVisualization() {
  const model = currentModel();
  const { counts } = state.report;
  const overflowing = counts.overflow > 0;
  const frame = $("context-frame");
  frame.classList.toggle("overflowing", overflowing);

  $("frame-model").textContent = model.name;
  $("frame-limit").textContent = `Limit ${formatTokens(model.contextLimit)} tokens`;
  $("usage-label").textContent = `${Math.min(counts.percent, 999).toFixed(counts.percent >= 10 ? 1 : 2)}%`;
  $("usage-label").className = `mono text-2xl font-semibold tracking-tight ${overflowing ? "text-rose-400" : "text-zinc-50"}`;
  $("usage-sub").textContent = overflowing
    ? `ล้น ${formatTokens(counts.overflow)} tokens นอกหน้าต่าง`
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
    ["System", "#6366f1", counts.system],
    ["User", "#10b981", counts.user],
    ["Files", "#f59e0b", counts.files],
    ["Vision", "#f43f5e", counts.images],
  ]
    .map(
      ([label, color, value]) =>
        `<span class="inline-flex items-center gap-2"><span class="legend-dot" style="background:${color}"></span>${label} · ${formatTokens(value)}</span>`
    )
    .join("");

  $("metrics").innerHTML = [
    ["Input tokens", formatTokens(counts.input), ""],
    ["Remaining", formatTokens(counts.remaining), counts.remaining === 0 && counts.input ? "text-amber-300" : ""],
    ["Overflow", formatTokens(counts.overflow), overflowing ? "text-rose-400" : ""],
    ["Estimated input cost", formatUsd(counts.input ? state.report.cost : 0), ""],
  ]
    .map(
      ([label, value, extra]) => `
      <article class="metric-card fade-up">
        <div class="label">${label}</div>
        <div class="value ${extra}">${value}</div>
      </article>`
    )
    .join("");

  if (state.viewMode === "tokens") renderTokenChips();
}

function renderTokenChips() {
  const pieces = state.report.allPieces;
  const limit = state.report.counts.limit;
  const visible = pieces.slice(0, MAX_VISIBLE_CHIPS);
  $("token-chips").innerHTML = visible
    .map((piece, index) => {
      const overflow = index >= limit;
      const preview = escapeHtml(formatTokenPreview(piece.text));
      return `<span class="token-chip ${piece.kind} ${overflow ? "overflow" : ""}" title="#${index + 1}">${preview}</span>`;
    })
    .join("");
  $("token-chips-note").textContent =
    pieces.length > MAX_VISIBLE_CHIPS
      ? `แสดง ${formatTokens(MAX_VISIBLE_CHIPS)} จาก ${formatTokens(pieces.length)} tokens — Virtual Scroll จะมาใน Phase 2`
      : pieces.length
        ? `ทั้งหมด ${formatTokens(pieces.length)} tokens`
        : "ยังไม่มี Token ให้แสดง";
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
  if (mode === "tokens") renderTokenChips();
}

function setCaption(text) {
  $("caption").textContent = text;
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

  state.started = true;
  state.report = buildReport();
  renderSteps();
  renderVisualization();
  setCaption(
    state.report.counts.overflow
      ? "ข้อความถูกแปลงเป็น Token แล้ว และมีส่วนที่ล้น Context Window — ส่วนสีแดงคือสิ่งที่โมเดลอาจอ่านไม่ถึง"
      : "ข้อความถูกแปลงเป็น Token แล้ว จัดเข้า Context Window ตามลิมิตของโมเดลที่เลือก — นี่คือภาพรวมก่อนเดินทีละขั้น"
  );
  $("next-btn").disabled = true;
  $("next-btn").title = "ระบบกด Next ทีละขั้นจะมาใน Phase 2";
}

function resetProcess() {
  state.started = false;
  renderSteps();
  setCaption("พิมพ์ข้อความด้านซ้าย แล้วสังเกต Context Window ด้านขวาว่า Token ถูกใช้ไปเท่าไร");
}

function buildOverflowText(limit) {
  const padTokens = Math.max(1, tokenizeText(OVERFLOW_PAD).length);
  const seedTokens = tokenizeText(SAMPLE_SYSTEM + "\n" + OVERFLOW_SEED).length;
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

function loadSample(kind) {
  clearAttachments();
  renderFiles();
  state.systemPrompt = SAMPLE_SYSTEM;
  $("system-input").value = SAMPLE_SYSTEM;
  if (kind === "overflow") {
    state.modelId = "model-f";
    const limit = getModelById(state.modelId).contextLimit;
    state.turns = [{ id: uid(), role: "user", content: buildOverflowText(limit) }];
  } else {
    state.turns = [{ id: uid(), role: "user", content: SAMPLE_USER }];
  }
  renderTurns();
  renderModels();
  state.report = buildReport();
  renderVisualization();
  renderLiveBadge();
  setCaption(
    kind === "overflow"
      ? "โหลดตัวอย่าง Overflow แล้ว — Teaching Mini ถูกเลือกเพื่อให้เห็นส่วนที่ล้นเป็นสีแดง"
      : "โหลดตัวอย่างสำหรับห้องเรียนแล้ว สังเกตจำนวน Token แล้วกดเริ่มกระบวนการได้"
  );
  refreshIcons();
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
  $("reset-btn").addEventListener("click", resetProcess);
  $("sample-btn").addEventListener("click", () => loadSample("normal"));
  $("overflow-btn").addEventListener("click", () => loadSample("overflow"));
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
      startProcess();
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
  $("tokenizer-label").textContent = ready ? "js-tiktoken · o200k_base" : "Approximate tokenizer";
}

async function boot() {
  refreshIcons();
  renderSteps();
  renderTurns();
  bindEvents();
  setViewMode("overview");

  await Promise.all([loadModels(), loadTemplates()]);
  renderModels();
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
