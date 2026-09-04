/**
 * Per-step teaching views.
 */

export const THINK_STAGES = [
  {
    id: "embed",
    title: "Embedding",
    titleTh: "ฝังความหมาย",
    detail: "รหัส Token ยังไม่มีความหมาย — ต้องแปลงเป็นเวกเตอร์แล้วบอกตำแหน่งก่อนเข้าบล็อก",
    caption: "Embedding คือตารางแปลงรหัส Token เป็นจุดในปริภูมิความหมาย แล้วบวกตำแหน่งในประโยค",
    example: "ประโยคสอน: แมว กิน ปลา → ได้สามรหัส เช่น 4821, 8910, 3344 แล้วกลายเป็นสามเวกเตอร์คนละอัน",
    inModel: "ชั้นล่างสุดของโครงโมเดล ก่อนเข้า Transformer block — ดูกล่อง Embedding ด้านซ้าย",
    bullets: [
      "หลัง Tokenize เหลือแค่เลข ID — โมเดลยังไม่รู้ว่า แมว ใกล้ แมวตัว หรือ หมา",
      "ตาราง Embedding มีแถวเท่าจำนวนคำในคลัง แต่ละแถวเป็นเวกเตอร์หลายร้อยถึงหลายพันมิติ",
      "คำที่ความหมายใกล้กัน มักได้เวกเตอร์ที่ «อยู่ใกล้กัน» ในปริภูมินี้",
      "บวก Positional Encoding เพื่อแยก แมว กิน ปลา ออกจาก ปลา กิน แมว",
      "ผลลัพธ์: ทุกช่องใน Context Window มีเวกเตอร์หนึ่งอัน พร้อมให้ Attention อ่าน",
    ],
  },
  {
    id: "attention",
    title: "Attention",
    titleTh: "ความสนใจ",
    detail: "แต่ละ Token มอง Token อื่นในหน้าต่าง แล้วชั่งน้ำหนักว่าจะอ่านใครมากน้อย",
    caption: "Self-Attention ให้ Token อ่านกันใน Context Window ตามน้ำหนัก — นี่คือจุดที่บริบทถูกดึงมาใช้",
    example: "ในประโยค «แมวกินปลา เพราะมันหิว» คำว่า มัน ให้น้ำหนักสูงกับ แมว ไม่ใช่กับ ปลา",
    inModel: "กล่อง Self-Attention ในบล็อกกลาง ทำซ้ำหลายหัว (multi-head) และหลายชั้น",
    bullets: [
      "จากเวกเตอร์เดิมสร้างสามชุด: Query (ถาม) Key (กุญแจ) Value (ค่าที่จะอ่าน)",
      "คะแนน = Query คูณ Key แล้ว softmax เป็นน้ำหนัก 0–1 รวมกันได้ประมาณ 1",
      "น้ำหนักสูง = อ่านมาก น้ำหนักต่ำ = มองผ่าน — เลยจับสรรพนามกับคำนามได้",
      "ทำขนานทั้งลำดับในหน้าต่างเดียวกัน จึงเห็นประโยคยาวได้ในรอบเดียว",
      "Multi-head คือมองหลายมุมพร้อมกัน เช่น ใครทำ / ทำอะไร / ชี้กลับไปใคร",
    ],
  },
  {
    id: "ffn",
    title: "Feed-forward",
    titleTh: "ชั้นแปลงความหมาย",
    detail: "หลังได้อ่านบริบทแล้ว แปลงเวกเตอร์ทีละตำแหน่ง เพื่อคิดต่อ ไม่ผสมข้าม Token",
    caption: "Feed-forward ไม่ดึง Token อื่นมาปน — มันแปลงความหมายของตำแหน่งนั้นหลัง Attention รวมบริบทแล้ว",
    example: "ตำแหน่งคำว่า มัน ตอนนี้มีบริบทของ แมว แล้ว FFN ช่วยสรุปเป็น «สรรพนามชี้แมว»",
    inModel: "กล่อง Feed-forward ในบล็อกเดียวกับ Attention — คู่นี้ถูกซ้อนหลายสิบชั้น",
    bullets: [
      "ต่างจาก Attention: ชั้นนี้ดูทีละตำแหน่ง ไม่ได้ดึงของช่องอื่นมาปนในรอบนี้",
      "โครงคล้าย MLP สั้น: ขยายมิติ (มักประมาณ 4 เท่า) → ฟังก์ชันไม่เชิงเส้น → บีบกลับ",
      "Residual บวกของเดิมเข้าไป LayerNorm ช่วยให้ซ้อนชั้นซ้ำ ๆ ได้โดยไม่พัง",
      "บล็อก Attention + FFN คือ «ตัวโมเดล» ส่วนใหญ่ ไม่ใช่ Embedding หรือ LM Head",
      "ยิ่งซ้อนหลายชั้น ยิ่งผสมบริบทลึก แต่ละชั้นยังทำงานใน Context Window เดิม",
    ],
  },
  {
    id: "generate",
    title: "Generation",
    titleTh: "สร้างคำตอบ",
    detail: "ทาย Token ถัดไปทีละตัว แปะต่อท้าย แล้ววนทั้งบล็อกใหม่จนกว่าจะจบ",
    caption: "ขาออกเกิดทีละ Token — เลือกจากคลัง แล้ววนกลับไป Embedding ไม่ได้พิมพ์ทั้งย่อหน้าในครั้งเดียว",
    example: "มีแล้ว: แมว กิน  → โมเดลให้ ปลา 62%, อาหาร 24%, นม 14% แล้วเลือก ปลา ต่อท้าย",
    inModel: "กล่อง LM Head บนสุด หลังจากผ่านบล็อกมาแล้ว — แล้วลูกศรวนกลับไปต้นลำดับ",
    bullets: [
      "เวกเตอร์ตำแหน่งล่าสุดผ่าน LM Head กลายเป็นคะแนนของทุก Token ในคลัง",
      "softmax แปลงคะแนนเป็นความน่าจะเป็น รวมกันได้ 1 เช่น ปลา 62%",
      "เลือกตัวที่สูงสุด หรือสุ่มตามอุณหภูมิ — ได้ออกมาเพียง 1 Token",
      "Token ใหม่ถูกต่อท้าย ลำดับใน Context Window ยาวขึ้น 1 แล้ววน Embedding ใหม่",
      "หยุดเมื่อเจอจุดจบ หรือครบจำนวนที่กำหนด — นี่คือที่มาของคำตอบทีละคำบนหน้าจอ",
    ],
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
  const { report, models, model, formatTokens, formatUsd, calcCostUsd, outputTokens } = ctx;
  const input = report.counts.input;
  const output = outputTokens.length;
  const rows = models
    .map((item) => {
      const inCost = calcCostUsd(input, item.inputPricePerMillion);
      const outCost = calcCostUsd(output, item.outputPricePerMillion);
      const overflow = Math.max(0, input - item.contextLimit);
      return {
        item,
        inCost,
        outCost,
        total: inCost + outCost,
        overflow,
        active: item.id === model.id,
      };
    })
    .sort((a, b) => a.total - b.total);
  const cheapest = rows[0]?.item.id;
  const selected = rows.find((row) => row.active) || rows[0];
  const body = rows
    .map((row) => {
      const mark = row.active ? ' <span class="text-indigo-300">← ที่เลือก</span>' : "";
      const cheap = row.item.id === cheapest ? ' <span class="text-emerald-300">ถูกสุด</span>' : "";
      return `<tr class="${row.active ? "row-active" : ""}">
        <td class="thai">${escape(ctx, row.item.name)}${mark}${cheap}</td>
        <td class="mono">${formatTokens(row.item.contextLimit)}</td>
        <td class="mono">${formatUsd(row.item.inputPricePerMillion)}</td>
        <td class="mono">${formatUsd(row.item.outputPricePerMillion)}</td>
        <td class="mono">${formatUsd(row.inCost)}</td>
        <td class="mono">${formatUsd(row.outCost)}</td>
        <td class="mono">${formatUsd(row.total)}</td>
        <td class="mono ${row.overflow ? "text-rose-400" : "text-emerald-300"}">${row.overflow ? `ล้น ${formatTokens(row.overflow)}` : "พอดี"}</td>
      </tr>`;
    })
    .join("");

  return `
    <div class="stage-head">
      <p class="help-kicker">Step 4</p>
      <h2 class="thai text-xl font-semibold mt-1">เทียบต้นทุนหลายโมเดล</h2>
      <p class="thai text-sm text-zinc-400 mt-2">ใช้ Token ขาเข้า ${formatTokens(input)} และขาออกจำลอง ${formatTokens(output)} คูณราคาต่อล้านของแต่ละรุ่น</p>
    </div>
    <div class="glass panel p-4 mt-5 overflow-x-auto">
      <table class="cost-table">
        <thead>
          <tr>
            <th>โมเดล</th>
            <th>Context</th>
            <th>In / 1M</th>
            <th>Out / 1M</th>
            <th>ค่า Input</th>
            <th>ค่า Output</th>
            <th>รวมรอบนี้</th>
            <th>หน้าต่าง</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
    <article class="glass panel p-4 sm:p-5 mt-4">
      <p class="help-kicker">สูตรคิดราคาของรุ่นที่เลือก</p>
      <p class="thai text-sm text-zinc-300 mt-3 leading-relaxed">
        Input = ${formatTokens(input)} ÷ 1,000,000 × ${formatUsd(selected.item.inputPricePerMillion)}
        = <span class="mono text-indigo-300">${formatUsd(selected.inCost)}</span>
      </p>
      <p class="thai text-sm text-zinc-300 mt-2 leading-relaxed">
        Output = ${formatTokens(output)} ÷ 1,000,000 × ${formatUsd(selected.item.outputPricePerMillion)}
        = <span class="mono text-emerald-300">${formatUsd(selected.outCost)}</span>
      </p>
      <p class="thai text-sm mt-3">รวมรอบนี้บน ${escape(ctx, selected.item.name)} =
        <span class="mono">${formatUsd(selected.total)}</span>
      </p>
    </article>
    <p class="thai text-sm text-zinc-400 mt-4">เรียงจากรวมถูกสุดขึ้นก่อน · Output ยังเป็นคำตอบจำลอง ไม่ใช่ราคาบิลจริง · ส่วนที่ล้นคิดราคาไม่ได้เพราะโมเดลไม่อ่าน</p>
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
    <div id="model-peek" class="mt-4"></div>
  `;
}

function renderThinkStage(ctx) {
  const index = ctx.thinkIndex % THINK_STAGES.length;
  const current = THINK_STAGES[index];
  const cards = THINK_STAGES.map((stage, i) => {
    const active = i === index;
    return `<button type="button" class="think-card ${active ? "active" : ""}" data-think="${i}">
      <p class="mono text-xs text-zinc-500">0${i + 1} / 04</p>
      <h3 class="font-medium mt-1">${escape(ctx, stage.title)}</h3>
      <p class="thai text-xs text-zinc-500 mt-1">${escape(ctx, stage.titleTh)}</p>
    </button>`;
  }).join("");
  const bullets = current.bullets
    .map((item) => `<li class="thai text-sm text-zinc-300 leading-relaxed">${escape(ctx, item)}</li>`)
    .join("");

  return `
    <div class="stage-head">
      <p id="think-kicker" class="help-kicker">Step 6 · ชั้นในโมเดล · 0${index + 1} / 04</p>
      <h2 class="thai text-xl font-semibold mt-1">${escape(ctx, current.title)} — ${escape(ctx, current.titleTh)}</h2>
      <p id="think-status" class="thai text-sm text-zinc-400 mt-2">${escape(ctx, current.detail)}</p>
    </div>
    <div id="think-dwell" class="think-dwell playing mt-4" style="--think-ms: 11s"><span></span></div>
    <p class="text-[11px] text-zinc-500 thai mt-2">แถบนี้เต็มใน 11 วินาทีต่อชั้น — กดหยุดอัตโนมัติถ้าจะอธิบายเอง</p>
    <div id="think-flow" class="mt-4"></div>
    <div class="grid md:grid-cols-2 gap-3 mt-4">
      <article class="glass panel p-4 sm:p-5">
        <p class="help-kicker">อ่านให้จบก่อนไปขั้นย่อยถัดไป</p>
        <ul id="think-bullets" class="mt-3 space-y-2 list-disc pl-5">${bullets}</ul>
      </article>
      <article class="glass panel p-4 sm:p-5">
        <p class="help-kicker">ตัวอย่างในห้อง</p>
        <p id="think-example" class="thai text-sm text-zinc-300 mt-3 leading-relaxed">${escape(ctx, current.example)}</p>
        <p class="help-kicker mt-4">ตำแหน่งในโครงโมเดล</p>
        <p id="think-in-model" class="thai text-sm text-zinc-300 mt-2 leading-relaxed">${escape(ctx, current.inModel)}</p>
      </article>
    </div>
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-2 mt-4">${cards}</div>
    <div class="flex flex-wrap gap-2 mt-4">
      <button type="button" id="think-prev" class="h-10 px-4 rounded-xl border hairline soft-hover text-xs thai">ย้อนขั้นย่อย</button>
      <button type="button" id="think-pause" class="h-10 px-4 rounded-xl border hairline soft-hover text-xs thai">หยุดอัตโนมัติ</button>
      <button type="button" id="think-next" class="btn-primary h-10 px-4 rounded-xl text-xs font-semibold thai">ขั้นย่อยถัดไป</button>
    </div>
    <p class="text-[11px] text-zinc-500 thai mt-2">เดินช้าเป็นห้องเรียน · กดการ์ดเพื่อกระโดด · จบ Generation แล้วค่อยกด Next ของขั้น 7</p>
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
