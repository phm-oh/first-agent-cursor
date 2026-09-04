/**
 * Per-step teaching views.
 */

export const THINK_STAGES = [
  {
    id: "embed",
    title: "Embedding",
    detail: "แต่ละ Token ถูกแปลงเป็นเวกเตอร์ตัวเลข เพื่อให้โมเดลคำนวณได้",
  },
  {
    id: "attention",
    title: "Attention",
    detail: "โมเดลดูว่า Token ใดสัมพันธ์กัน เช่น คำสรรพนามชี้กลับไปคำนาม",
  },
  {
    id: "ffn",
    title: "Feed-forward",
    detail: "ชั้นคำนวณเพิ่มเติมเพื่อสรุปความหมายของลำดับ Token",
  },
  {
    id: "generate",
    title: "Generation",
    detail: "โมเดลทาย Token ถัดไปทีละชิ้น จนประกอบเป็นคำตอบ",
  },
];

export const SPECIAL_TOKENS = [
  { id: "bos", text: "<|im_start|>", role: "structure", note: "จุดเริ่มลำดับ" },
  { id: "sys", text: "system", role: "role", note: "บทบาทระบบ" },
  { id: "user", text: "user", role: "role", note: "บทบาทผู้ใช้" },
  { id: "eos", text: "<|im_end|>", role: "structure", note: "จุดจบข้อความ" },
];

export function renderStage(step, ctx) {
  switch (step) {
    case 1:
      return renderInputStage(ctx);
    case 2:
      return renderTokenStage(ctx);
    case 3:
      return renderContextStage(ctx);
    case 4:
      return renderCostStage(ctx);
    case 5:
      return renderDispatchStage(ctx);
    case 6:
      return renderThinkStage(ctx);
    case 7:
      return renderOutputStage(ctx);
    case 8:
      return renderReturnStage(ctx);
    case 9:
      return renderChatStage(ctx);
    default:
      return "";
  }
}

function renderInputStage(ctx) {
  const { report, escapeHtml, formatTokens, attachments, systemPrompt, turns } = ctx;
  const files = attachments.filter((item) => item.kind === "file");
  const images = attachments.filter((item) => item.kind === "image");
  const preview = (text) => escapeHtml((text || "").trim() || "— ไม่มีข้อความ —").slice(0, 420);

  return `
    <div class="stage-head">
      <p class="help-kicker">Step 1</p>
      <h2 class="thai text-xl font-semibold mt-1">รับ Input</h2>
      <p class="thai text-sm text-zinc-400 mt-2">นี่คือทุกอย่างที่กำลังจะถูกส่งเข้าโมเดล ก่อนหั่นเป็น Token</p>
    </div>
    <div class="grid md:grid-cols-2 gap-3 mt-5">
      <article class="glass panel p-4">
        <p class="help-kicker">System</p>
        <p class="thai text-sm mt-2 leading-relaxed whitespace-pre-wrap">${preview(systemPrompt)}</p>
        <p class="mono text-xs text-indigo-300 mt-3">${formatTokens(report.counts.system)} tokens</p>
      </article>
      <article class="glass panel p-4">
        <p class="help-kicker">User / turns</p>
        <p class="thai text-sm mt-2 leading-relaxed whitespace-pre-wrap">${preview(turns.map((t) => t.content).join("\n"))}</p>
        <p class="mono text-xs text-emerald-300 mt-3">${formatTokens(report.counts.user)} tokens · ${turns.length} ข้อความ</p>
      </article>
      <article class="glass panel p-4">
        <p class="help-kicker">Files</p>
        <p class="thai text-sm mt-2">${files.length ? files.map((f) => escapeHtml(f.name)).join(", ") : "ไม่มีไฟล์"}</p>
        <p class="mono text-xs text-amber-300 mt-3">${formatTokens(report.counts.files)} tokens</p>
      </article>
      <article class="glass panel p-4">
        <p class="help-kicker">Images</p>
        <p class="thai text-sm mt-2">${images.length ? images.map((f) => `${escapeHtml(f.name)} (${f.width}×${f.height})`).join(", ") : "ไม่มีรูป"}</p>
        <p class="mono text-xs text-rose-300 mt-3">${formatTokens(report.counts.images)} vision tokens</p>
      </article>
    </div>
    <p class="thai text-sm text-zinc-400 mt-5">รวมขาเข้า ${formatTokens(report.counts.input)} tokens — กด Next เพื่อดูว่าข้อความถูกหั่นอย่างไร</p>
  `;
}

function renderTokenStage(ctx) {
  const { report, formatTokens } = ctx;
  return `
    <div class="stage-head flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="help-kicker">Step 2</p>
        <h2 class="thai text-xl font-semibold mt-1">Tokenization</h2>
        <p class="thai text-sm text-zinc-400 mt-2">Token คือหน่วยที่โมเดลอ่านได้ จีน/ไทยมักถูกหั่นถี่กว่าภาษาอังกฤษ</p>
      </div>
      <p class="mono text-sm text-zinc-400">${formatTokens(report.allPieces.length)} pieces</p>
    </div>
    <div class="flex flex-wrap gap-3 mt-4 text-xs text-zinc-400">
      <span class="inline-flex items-center gap-2"><span class="legend-dot" style="background:#6366f1"></span>System</span>
      <span class="inline-flex items-center gap-2"><span class="legend-dot" style="background:#10b981"></span>User</span>
      <span class="inline-flex items-center gap-2"><span class="legend-dot" style="background:#f59e0b"></span>Files</span>
      <span class="inline-flex items-center gap-2"><span class="legend-dot" style="background:#f43f5e"></span>Vision / Overflow</span>
    </div>
    <div id="chip-scroll" class="chip-virtual glass panel mt-4" aria-label="Token list"></div>
    <p id="chip-note" class="text-xs text-zinc-500 mt-3 thai"></p>
  `;
}

function renderContextStage(ctx) {
  const { report, model, formatTokens } = ctx;
  const { counts } = report;
  const overflowing = counts.overflow > 0;
  const usedWidth = Math.min(100, counts.percent);
  const basis = Math.max(1, counts.input);
  const parts = [
    ["system", "#6366f1", counts.system],
    ["user", "#10b981", counts.user],
    ["files", "#f59e0b", counts.files],
    ["images", "#f43f5e", counts.images],
  ];
  const segs = parts
    .map(([key, color, value]) => {
      const width = (value / basis) * usedWidth;
      if (width <= 0) return "";
      return `<div class="tank-seg" style="width:${width}%;background:${color}" title="${key}"></div>`;
    })
    .join("");
  const overflowPct = Math.min(100, (counts.overflow / Math.max(counts.limit, 1)) * 100);

  return `
    <div class="stage-head">
      <p class="help-kicker">Step 3</p>
      <h2 class="thai text-xl font-semibold mt-1">จัดเข้า Context Window</h2>
      <p class="thai text-sm text-zinc-400 mt-2">หน้าต่างนี้คือความจำต่อรอบ สีแดงคือส่วนที่โมเดลอ่านไม่ถึง</p>
    </div>
    <div class="context-frame glass mt-5 ${overflowing ? "overflowing" : ""}">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <p class="text-sm font-medium">${escape(ctx, model.name)}</p>
          <p class="mono text-xs text-zinc-500 mt-1">Limit ${formatTokens(model.contextLimit)} tokens</p>
        </div>
        <div class="text-right">
          <p class="mono text-2xl font-semibold tracking-tight ${overflowing ? "text-rose-400" : ""}">${counts.percent.toFixed(counts.percent >= 10 ? 1 : 2)}%</p>
          <p class="thai text-xs text-zinc-500">${overflowing ? `ล้น ${formatTokens(counts.overflow)} tokens` : `ใช้ไป ${formatTokens(counts.input)} จาก ${formatTokens(counts.limit)}`}</p>
        </div>
      </div>
      <div class="tank">${segs}</div>
      ${overflowing ? `<div class="tank-overflow"><div style="width:${Math.max(8, overflowPct)}%"></div></div>` : ""}
    </div>
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
      ${metric("Used", formatTokens(Math.min(counts.input, counts.limit)))}
      ${metric("Remaining", formatTokens(counts.remaining), counts.remaining === 0 ? "text-amber-300" : "")}
      ${metric("Overflow", formatTokens(counts.overflow), overflowing ? "text-rose-400" : "")}
      ${metric("Fit?", overflowing ? "ไม่ครบ" : "ครบ", overflowing ? "text-rose-400" : "text-emerald-300")}
    </div>
  `;
}

function renderCostStage(ctx) {
  const { report, models, model, formatTokens, formatUsd, calcCostUsd } = ctx;
  const input = report.counts.input;
  const rows = models
    .map((item) => {
      const cost = calcCostUsd(input, item.inputPricePerMillion);
      const overflow = Math.max(0, input - item.contextLimit);
      const active = item.id === model.id;
      return `<tr class="${active ? "row-active" : ""}">
        <td class="thai">${escape(ctx, item.name)}${active ? ' <span class="text-indigo-300">← ที่เลือก</span>' : ""}</td>
        <td class="mono">${formatTokens(item.contextLimit)}</td>
        <td class="mono">${formatUsd(cost)}</td>
        <td class="mono ${overflow ? "text-rose-400" : "text-emerald-300"}">${overflow ? `ล้น ${formatTokens(overflow)}` : "พอดี"}</td>
      </tr>`;
    })
    .join("");

  return `
    <div class="stage-head">
      <p class="help-kicker">Step 4</p>
      <h2 class="thai text-xl font-semibold mt-1">ต้นทุนขาเข้าเบื้องต้น</h2>
      <p class="thai text-sm text-zinc-400 mt-2">ราคาคิดจากจำนวน Token × ราคาต่อล้าน — ตารางละเอียดขึ้นจะมาใน Phase 3</p>
    </div>
    <div class="glass panel p-4 mt-5 overflow-x-auto">
      <table class="cost-table">
        <thead>
          <tr>
            <th>โมเดล</th>
            <th>Limit</th>
            <th>ค่า Input</th>
            <th>พอดีหน้าต่าง?</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="thai text-sm text-zinc-400 mt-4">ขาเข้านี้ประมาณ ${formatUsd(calcCostUsd(input, model.inputPricePerMillion))} บนโมเดลที่เลือก · ยังไม่รวมขาออก</p>
  `;
}

function renderDispatchStage(ctx) {
  const { report, formatTokens, escapeHtml } = ctx;
  const extras = SPECIAL_TOKENS.length;
  const chips = SPECIAL_TOKENS.map(
    (token) =>
      `<span class="token-chip special" title="${escapeHtml(token.note)}">${escapeHtml(token.text)}</span>`
  ).join("");

  return `
    <div class="stage-head">
      <p class="help-kicker">Step 5</p>
      <h2 class="thai text-xl font-semibold mt-1">เตรียมส่งเข้า LLM</h2>
      <p class="thai text-sm text-zinc-400 mt-2">ดูเส้นทางข้อมูล: ข้อความถูกจัดลำดับ ใส่ Special Tokens แล้วไหลเข้าโมเดล</p>
    </div>
    <div id="data-flow" class="glass panel p-4 mt-5 overflow-hidden"></div>
    <div class="glass panel p-5 mt-4">
      <p class="help-kicker">Special tokens ที่ถูกเพิ่ม</p>
      <div class="flex flex-wrap gap-1.5 mt-3">${chips}</div>
      <p class="thai text-sm text-zinc-400 mt-4">โครงที่ใช้สอน: start → system → user → end ตามด้วยเนื้อหา ${formatTokens(report.counts.input)} tokens</p>
      <p class="mono text-xs text-indigo-300 mt-2">+${extras} special tokens (เชิงแนวคิด)</p>
    </div>
  `;
}

function renderThinkStage(ctx) {
  const index = ctx.thinkIndex % THINK_STAGES.length;
  const cards = THINK_STAGES.map((stage, i) => {
    const active = i === index;
    return `<article class="think-card ${active ? "active" : ""}" data-think="${i}">
      <p class="mono text-xs text-zinc-500">0${i + 1}</p>
      <h3 class="font-medium mt-1">${escape(ctx, stage.title)}</h3>
      <p class="thai text-sm text-zinc-400 mt-2 leading-relaxed">${escape(ctx, stage.detail)}</p>
    </article>`;
  }).join("");

  return `
    <div class="stage-head">
      <p class="help-kicker">Step 6</p>
      <h2 class="thai text-xl font-semibold mt-1">จำลองการประมวลผล</h2>
      <p class="thai text-sm text-zinc-400 mt-2">จุดที่สว่างคือขั้นที่กำลังคิด — เป็นภาพแนวคิด ไม่ใช่โมเดลจริง</p>
    </div>
    <div id="think-flow" class="glass panel p-4 mt-5 overflow-hidden"></div>
    <p id="think-status" class="thai text-sm text-indigo-300 mt-3">${escape(ctx, THINK_STAGES[index].title)} · ${escape(ctx, THINK_STAGES[index].detail)}</p>
    <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">${cards}</div>
  `;
}

function renderOutputStage(ctx) {
  const { formatTokens, outputTokens } = ctx;
  return `
    <div class="stage-head">
      <p class="help-kicker">Step 7</p>
      <h2 class="thai text-xl font-semibold mt-1">สร้างผลลัพธ์จำลอง</h2>
      <p class="thai text-sm text-zinc-400 mt-2">คำตอบถูกประกอบทีละ Token จากเทมเพลตการสอน ไม่ได้เรียก API จริง</p>
    </div>
    <article class="glass panel p-5 mt-5">
      <div class="flex items-center gap-2">
        <span class="status-dot ready"></span>
        <p class="help-kicker">กำลังเขียนคำตอบ</p>
      </div>
      <div id="typed-output" class="thai text-sm leading-relaxed whitespace-pre-wrap mt-3 min-h-[6rem]"></div>
    </article>
    <p class="mono text-xs text-zinc-500 mt-3">ขาออกประมาณ ${formatTokens(outputTokens.length)} tokens</p>
  `;
}

function renderReturnStage(ctx) {
  const { report, outputTokens, model, formatTokens, formatUsd, calcCostUsd } = ctx;
  const inputCost = calcCostUsd(report.counts.input, model.inputPricePerMillion);
  const outputCost = calcCostUsd(outputTokens.length, model.outputPricePerMillion);
  return `
    <div class="stage-head">
      <p class="help-kicker">Step 8</p>
      <h2 class="thai text-xl font-semibold mt-1">Tokenize ขากลับ + รวมราคา</h2>
      <p class="thai text-sm text-zinc-400 mt-2">ขาออกถูกหั่นเป็น Token เหมือนขาเข้า แล้วคูณราคาฝั่ง Output</p>
    </div>
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-5">
      ${metric("Input tokens", formatTokens(report.counts.input))}
      ${metric("Output tokens", formatTokens(outputTokens.length))}
      ${metric("Input cost", formatUsd(inputCost))}
      ${metric("Output cost", formatUsd(outputCost))}
    </div>
    <div class="glass panel p-5 mt-4">
      <p class="help-kicker">Total</p>
      <p id="total-cost" class="mono text-3xl font-semibold mt-2">${formatUsd(inputCost + outputCost)}</p>
      <p class="thai text-sm text-zinc-400 mt-2">รวมขามา-ขากลับของรอบนี้ บน ${escape(ctx, model.name)}</p>
    </div>
    <div id="output-chip-scroll" class="chip-virtual glass panel mt-4" aria-label="Output tokens"></div>
  `;
}

function renderChatStage(ctx) {
  const { systemPrompt, turns, outputText, report, outputTokens, formatTokens, escapeHtml, calcCostUsd, model, formatUsd } = ctx;
  const user = turns.map((t) => t.content).filter(Boolean).join("\n") || "—";
  const total = calcCostUsd(report.counts.input, model.inputPricePerMillion) +
    calcCostUsd(outputTokens.length, model.outputPricePerMillion);
  return `
    <div class="stage-head">
      <p class="help-kicker">Step 9</p>
      <h2 class="thai text-xl font-semibold mt-1">กลับสู่หน้าต่างแชท</h2>
      <p class="thai text-sm text-zinc-400 mt-2">นี่คือสิ่งที่ผู้ใช้เห็น — Token กับราคาถูกสรุปไว้ใต้บทสนทนา</p>
    </div>
    <div class="chat-thread glass panel p-4 sm:p-5 mt-5 space-y-3">
      ${systemPrompt.trim() ? `<div class="chat-bubble system thai text-sm chat-in">${escapeHtml(systemPrompt)}</div>` : ""}
      <div class="chat-bubble user thai text-sm chat-in" style="animation-delay:.12s">${escapeHtml(user)}</div>
      <div class="chat-bubble assistant thai text-sm whitespace-pre-wrap chat-in" style="animation-delay:.28s">${escapeHtml(outputText || "")}</div>
    </div>
    <div class="chat-meter glass panel p-4 mt-4 flex flex-wrap gap-3 justify-between items-center">
      <p class="thai text-sm">ขาเข้า ${formatTokens(report.counts.input)} · ขาออก ${formatTokens(outputTokens.length)}</p>
      <p class="mono text-sm text-indigo-300">รวม ${formatUsd(total)}</p>
    </div>
  `;
}

function metric(label, value, extra = "") {
  return `<article class="metric-card fade-up"><div class="label">${label}</div><div class="value ${extra}">${value}</div></article>`;
}

function escape(ctx, value) {
  return ctx.escapeHtml(value);
}
