/**
 * Per-step teaching views.
 */

export const THINK_STAGES = [
  {
    id: "embed",
    title: "Embedding",
    titleTh: "แปลงรหัสเป็นความหมาย",
    plain: "หลังหั่นข้อความแล้ว โมเดลเห็นแค่เลขรหัส ต้องแปลงเป็นจุดบนแผนที่ความหมายก่อน",
    detail: "Embedding คือตารางเปิดความหมายของแต่ละรหัส แล้วบอกว่าอยู่ตำแหน่งไหนในประโยค",
    caption: "Token จากข้อความของคุณถูกแปลงเป็นจุด แล้วโมเดลจึงทายคำตอบได้",
    example: "ใช้ Token จริงจากกล่องที่คุณพิมพ์ ไม่ใช่ประโยคคนละชุด — สลับลำดับแล้วจุดจะไม่เหมือนเดิม",
    inModel: "จุดแรกบนเส้นข้อมูลหลัก ก่อนชั้น Attention จะอ่านบริบท",
    bullets: [
      "หลังหั่นเป็น Token เหลือแค่เลขรหัส — ยังไม่รู้ว่าคำใกล้กันหรือตรงข้าม",
      "ตาราง Embedding มีแถวเท่าคลังคำ แต่ละแถวเป็นตัวเลขหลายร้อยถึงหลายพันค่า",
      "คำที่ความหมายใกล้กัน มักได้จุดที่อยู่ใกล้กัน",
      "บวกตำแหน่ง เพื่อแยกประโยคที่คำเหมือนกันแต่ลำดับต่างกัน",
      "ผลลัพธ์คือเส้นข้อมูลหลัก หนึ่งแถวต่อหนึ่งช่องในหน้าต่างบริบท",
    ],
  },
  {
    id: "attention",
    title: "Attention",
    titleTh: "อ่านบริบทในหน้าต่าง",
    plain: "Token ตัวท้ายมองย้อนไปในหน้าต่าง แล้วตัดสินว่าควรอ่านตัวไหนมาก",
    detail: "Attention ให้แต่ละ Token อ่าน Token อื่นในหน้าต่างตามน้ำหนัก — นี่คือบริบท",
    caption: "ชั้นนี้คือการอ่านและเขียนบนเส้นข้อมูลหลัก ไม่ใช่ความจำระยะยาว",
    example: "ภาพสอน: Token ล่าสุดชี้กลับไป Token แรก — สีเข้มกว่าไม่ได้มาจากการคำนวณจริง",
    inModel: "จุด Attention บนเส้นข้อมูลหลัก ทำหลายหัว แล้วเขียนกลับลงเส้นเดิม",
    bullets: [
      "สร้างสามชุดจากค่าเดิม: คำถาม กุญแจ และค่าที่จะอ่าน",
      "น้ำหนักในแผนภาพเป็นภาพสอน ให้เห็นว่าอ่านมากหรือน้อย ไม่ใช่ค่าจากโมเดล",
      "เลยจับสรรพนามกับคำนามได้ โดยไม่ต้องมีกฎไวยากรณ์แยก",
      "ทำพร้อมกันทั้งลำดับในหน้าต่างเดียวกัน",
      "หลายหัว = มองหลายมุม เช่น ใครทำ / ทำอะไร / ชี้กลับไปใคร",
    ],
  },
  {
    id: "ffn",
    title: "Feed-forward",
    titleTh: "คิดต่อทีละช่อง",
    plain: "หลังอ่านบริบทแล้ว ชั้นนี้คิดต่อที่ช่องนั้นช่องเดียว ไม่ดึง Token อื่นมาปน",
    detail: "ชั้น Feed-forward แปลงความหมายของตำแหน่งนั้น หลัง Attention รวมบริบทแล้ว",
    caption: "บนเส้นข้อมูลหลัก: Attention อ่านของคนอื่น ชั้นนี้สรุปของช่องนี้",
    example: "ช่อง Token ล่าสุดของคุณมีบริบทจากต้นประโยคแล้ว ชั้นนี้คิดต่อที่ช่องนั้น",
    inModel: "จุด Feed-forward บนเส้นข้อมูลหลัก คู่กับ Attention ถูกซ้อนหลายสิบชั้น",
    bullets: [
      "ต่างจาก Attention: ไม่ดึงช่องอื่นมาปนในรอบนี้",
      "ขยายจำนวนค่า แล้วบีบกลับ เพื่อคิดต่อหลังได้อ่านแล้ว",
      "บวกของเดิมกลับเข้าเส้นหลัก เพื่อไม่ให้ข้อมูลเก่าหาย",
      "คู่ Attention กับ Feed-forward คือตัวโมเดลส่วนใหญ่",
      "ซ้อนหลายชั้นแต่ยังทำงานในหน้าต่างบริบทเดิม",
    ],
  },
  {
    id: "generate",
    title: "Generation",
    titleTh: "ทาย Token ถัดไป",
    plain: "ทายได้ทีละตัว ต่อท้ายหน้าต่าง แล้ววนทั้งเส้นใหม่",
    detail: "คำตอบเกิดทีละตัว จากคลังคำ แชทที่คุ้นเคยเขียนบนจอแบบนี้",
    caption: "หัวใจที่ใช้สอน: โมเดลไม่ได้พิมพ์ทั้งย่อหน้าในครั้งเดียว",
    example: "แถบเปอร์เซ็นต์เป็นภาพสอน สมมติบนคำตอบจำลองของคุณ ไม่ใช่คะแนนจริงของโมเดล",
    inModel: "จุดท้ายเส้นข้อมูลหลัก แล้ววนกลับไปแปลงรหัสเป็นจุดอีกครั้ง",
    bullets: [
      "ช่องล่าสุดบนเส้นข้อมูลหลักถูกแปลงเป็นคะแนนของทั้งคลังคำ",
      "แถบเปอร์เซ็นต์ในหน้านี้เป็นภาพสอน ไม่ใช่คะแนนจริงของโมเดล",
      "เลือกตัวที่สูงสุด หรือสุ่มเล็กน้อย ได้แค่ 1 Token",
      "ต่อท้ายหน้าต่าง แล้ววน Embedding → Attention → Feed-forward",
      "หยุดเมื่อจบหรือครบจำนวน — นี่คือที่มาของคำตอบทีละคำ",
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
      <p class="help-kicker">ขั้นที่ 1</p>
      <h2 class="thai text-xl font-semibold mt-1">รับข้อความเข้า</h2>
      <p class="thai text-sm text-zinc-400 mt-2">นี่คือทุกอย่างที่กำลังจะถูกส่งเข้าโมเดล ก่อนหั่นเป็น Token</p>
    </div>
    <div class="grid md:grid-cols-2 gap-3 mt-5">
      <article class="glass panel p-4">
        <p class="help-kicker">ข้อความระบบ</p>
        <p class="thai text-sm mt-2 leading-relaxed whitespace-pre-wrap">${preview(systemPrompt)}</p>
        <p class="mono text-xs text-indigo-300 mt-3">${formatTokens(report.counts.system)} Token</p>
      </article>
      <article class="glass panel p-4">
        <p class="help-kicker">ข้อความผู้ใช้</p>
        <p class="thai text-sm mt-2 leading-relaxed whitespace-pre-wrap">${preview(turns.map((t) => t.content).join("\n"))}</p>
        <p class="mono text-xs text-emerald-300 mt-3">${formatTokens(report.counts.user)} Token · ${turns.length} ข้อความ</p>
      </article>
      <article class="glass panel p-4">
        <p class="help-kicker">ไฟล์</p>
        <p class="thai text-sm mt-2">${files.length ? files.map((f) => escapeHtml(f.name)).join(", ") : "ไม่มีไฟล์"}</p>
        <p class="mono text-xs text-amber-300 mt-3">${formatTokens(report.counts.files)} Token</p>
      </article>
      <article class="glass panel p-4">
        <p class="help-kicker">รูปภาพ</p>
        <p class="thai text-sm mt-2">${images.length ? images.map((f) => `${escapeHtml(f.name)} (${f.width}×${f.height})`).join(", ") : "ไม่มีรูป"}</p>
        <p class="mono text-xs text-rose-300 mt-3">${formatTokens(report.counts.images)} Token ของรูป</p>
      </article>
    </div>
    <p class="thai text-sm text-zinc-400 mt-5">รวมข้อความเข้า ${formatTokens(report.counts.input)} Token — กดขั้นถัดไปเพื่อดูว่าข้อความถูกหั่นอย่างไร</p>
  `;
}

function renderTokenStage(ctx) {
  const { report, formatTokens } = ctx;
  return `
    <div class="stage-head flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="help-kicker">ขั้นที่ 2</p>
        <h2 class="thai text-xl font-semibold mt-1">หั่นเป็น Token</h2>
        <p class="thai text-sm text-zinc-400 mt-2">Token คือหน่วยที่โมเดลอ่านได้ ภาษาไทยมักถูกหั่นละเอียดกว่าภาษาอังกฤษ</p>
      </div>
      <p class="mono text-sm text-zinc-400">${formatTokens(report.allPieces.length)} ชิ้น</p>
    </div>
    <div class="flex flex-wrap gap-3 mt-4 text-xs text-zinc-400">
      <span class="inline-flex items-center gap-2"><span class="legend-dot" style="background:#6366f1"></span>ระบบ</span>
      <span class="inline-flex items-center gap-2"><span class="legend-dot" style="background:#10b981"></span>ผู้ใช้</span>
      <span class="inline-flex items-center gap-2"><span class="legend-dot" style="background:#f59e0b"></span>ไฟล์</span>
      <span class="inline-flex items-center gap-2"><span class="legend-dot" style="background:#f43f5e"></span>รูป / ส่วนที่ล้น</span>
    </div>
    <div id="chip-scroll" class="chip-virtual glass panel mt-4" aria-label="รายการ Token"></div>
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
      <p class="help-kicker">ขั้นที่ 3</p>
      <h2 class="thai text-xl font-semibold mt-1">จัดเข้าหน้าต่างบริบท</h2>
      <p class="thai text-sm text-zinc-400 mt-2">หน้าต่างนี้คือความจำต่อรอบ สีแดงคือส่วนที่โมเดลอ่านไม่ถึง</p>
    </div>
    <div class="context-frame glass mt-5 ${overflowing ? "overflowing" : ""}">
      <div class="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <p class="text-sm font-medium">${escape(ctx, model.name)}</p>
          <p class="mono text-xs text-zinc-500 mt-1">ความจุ ${formatTokens(model.contextLimit)} Token</p>
        </div>
        <div class="text-right">
          <p class="mono text-2xl font-semibold tracking-tight ${overflowing ? "text-rose-400" : ""}">${counts.percent.toFixed(counts.percent >= 10 ? 1 : 2)}%</p>
          <p class="thai text-xs text-zinc-500">${overflowing ? `ล้น ${formatTokens(counts.overflow)} Token` : `ใช้ไป ${formatTokens(counts.input)} จาก ${formatTokens(counts.limit)}`}</p>
        </div>
      </div>
      <div class="tank">${segs}</div>
      ${overflowing ? `<div class="tank-overflow"><div style="width:${Math.max(8, overflowPct)}%"></div></div>` : ""}
    </div>
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
      ${metric("ใช้ไป", formatTokens(Math.min(counts.input, counts.limit)))}
      ${metric("เหลือ", formatTokens(counts.remaining), counts.remaining === 0 ? "text-amber-300" : "")}
      ${metric("ส่วนที่ล้น", formatTokens(counts.overflow), overflowing ? "text-rose-400" : "")}
      ${metric("พอดีหรือไม่", overflowing ? "ไม่ครบ" : "ครบ", overflowing ? "text-rose-400" : "text-emerald-300")}
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
      <p class="help-kicker">ขั้นที่ 4</p>
      <h2 class="thai text-xl font-semibold mt-1">เทียบต้นทุนหลายโมเดล</h2>
      <p class="thai text-sm text-zinc-400 mt-2">ใช้ Token ข้อความเข้า ${formatTokens(input)} และคำตอบจำลอง ${formatTokens(output)} คูณราคาต่อล้านของแต่ละรุ่น</p>
    </div>
    <div class="glass panel p-4 mt-5 overflow-x-auto">
      <table class="cost-table">
        <thead>
          <tr>
            <th>โมเดล</th>
            <th>ความจุ</th>
            <th>เข้า / 1 ล้าน</th>
            <th>ออก / 1 ล้าน</th>
            <th>ค่าข้อความเข้า</th>
            <th>ค่าคำตอบ</th>
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
        ข้อความเข้า = ${formatTokens(input)} ÷ 1,000,000 × ${formatUsd(selected.item.inputPricePerMillion)}
        = <span class="mono text-indigo-300">${formatUsd(selected.inCost)}</span>
      </p>
      <p class="thai text-sm text-zinc-300 mt-2 leading-relaxed">
        คำตอบ = ${formatTokens(output)} ÷ 1,000,000 × ${formatUsd(selected.item.outputPricePerMillion)}
        = <span class="mono text-emerald-300">${formatUsd(selected.outCost)}</span>
      </p>
      <p class="thai text-sm mt-3">รวมรอบนี้บน ${escape(ctx, selected.item.name)} =
        <span class="mono">${formatUsd(selected.total)}</span>
      </p>
    </article>
    <p class="thai text-sm text-zinc-400 mt-4">เรียงจากรวมถูกสุดขึ้นก่อน · คำตอบยังเป็นข้อความจำลอง ไม่ใช่ราคาบิลจริง · ส่วนที่ล้นคิดราคาไม่ได้เพราะโมเดลไม่อ่าน</p>
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
      <p class="help-kicker">ขั้นที่ 5</p>
      <h2 class="thai text-xl font-semibold mt-1">จัดลำดับแล้วส่งเข้าโมเดล</h2>
      <p class="thai text-sm text-zinc-400 mt-2">ดูเส้นทางข้อมูล: ข้อความถูกจัดลำดับ ใส่เครื่องหมายพิเศษ แล้วไหลเข้าโมเดล</p>
    </div>
    <div id="data-flow" class="glass panel p-4 mt-5 overflow-hidden"></div>
    <div class="glass panel p-5 mt-4">
      <p class="help-kicker">เครื่องหมายพิเศษที่ถูกเพิ่ม</p>
      <div class="flex flex-wrap gap-1.5 mt-3">${chips}</div>
      <p class="thai text-sm text-zinc-400 mt-4">โครงที่ใช้สอน: เริ่ม → ระบบ → ผู้ใช้ → จบ ตามด้วยเนื้อหา ${formatTokens(report.counts.input)} Token</p>
      <p class="mono text-xs text-indigo-300 mt-2">+${extras} เครื่องหมายพิเศษ (เชิงแนวคิด)</p>
    </div>
    <div id="model-peek" class="mt-4"></div>
  `;
}

function renderThinkStage(ctx) {
  const index = ctx.thinkIndex % THINK_STAGES.length;
  const current = THINK_STAGES[index];
  const teacher = ctx.thinkDepth === "teacher";
  const cards = THINK_STAGES.map((stage, i) => {
    const active = i === index;
    return `<button type="button" class="think-card ${active ? "active" : ""}" data-think="${i}">
      <p class="mono text-[10px] text-zinc-500">0${i + 1}</p>
      <h3 class="font-medium mt-0.5 text-sm">${escape(ctx, stage.title)}</h3>
      <p class="thai text-xs text-zinc-500 mt-0.5">${escape(ctx, stage.titleTh)}</p>
    </button>`;
  }).join("");
  const bullets = current.bullets
    .map((item) => `<li class="thai text-sm text-zinc-300 leading-relaxed">${escape(ctx, item)}</li>`)
    .join("");

  return `
    <div class="stage-head">
      <p id="think-kicker" class="help-kicker">ขั้นที่ 6 · หนึ่งเรื่องเดียว · ทาย Token ถัดไป</p>
      <h2 class="thai text-xl font-semibold mt-1">${escape(ctx, current.title)} — ${escape(ctx, current.titleTh)}</h2>
      <p id="think-status" class="thai text-sm text-zinc-400 mt-2">${escape(ctx, current.plain)}</p>
    </div>
    <div id="think-dwell" class="think-dwell playing mt-4" style="--think-ms: 11s"><span></span></div>
    <div class="flex flex-wrap items-center justify-between gap-2 mt-3">
      <p class="text-[11px] text-zinc-500 thai">11 วินาทีต่อชั้น · กดหยุดถ้าจะยืนอธิบาย</p>
      <div class="think-depth" role="tablist" aria-label="ระดับคำอธิบาย">
        <button type="button" id="think-depth-simple" class="think-depth-btn ${teacher ? "" : "active"}" data-depth="simple">นักเรียน</button>
        <button type="button" id="think-depth-teacher" class="think-depth-btn ${teacher ? "active" : ""}" data-depth="teacher">ครู</button>
      </div>
    </div>
    <div class="think-card-row mt-4">${cards}</div>
    <div id="think-flow" class="mt-4"></div>
    <div id="think-details" class="${teacher ? "" : "hidden"}">
      <div class="grid md:grid-cols-2 gap-3 mt-4">
        <article class="glass panel p-4 sm:p-5">
          <p class="help-kicker">รายละเอียดสำหรับครู</p>
          <p class="thai text-xs text-zinc-500 mt-2">ตัวเลขในแผนภาพเป็นภาพสอน ไม่ได้รันโมเดลจริง</p>
          <ul id="think-bullets" class="mt-3 space-y-2 list-disc pl-5">${bullets}</ul>
        </article>
        <article class="glass panel p-4 sm:p-5">
          <p class="help-kicker">จากข้อความนี้</p>
          <p id="think-example" class="thai text-sm text-zinc-300 mt-3 leading-relaxed">${escape(ctx, current.example)}</p>
          <p class="help-kicker mt-4">อยู่ตรงไหนบนเส้นข้อมูลหลัก</p>
          <p id="think-in-model" class="thai text-sm text-zinc-300 mt-2 leading-relaxed">${escape(ctx, current.inModel)}</p>
        </article>
      </div>
    </div>
    <div class="flex flex-wrap gap-2 mt-4">
      <button type="button" id="think-prev" class="h-10 px-4 rounded-xl border hairline soft-hover text-xs thai">ย้อนขั้นย่อย</button>
      <button type="button" id="think-pause" class="h-10 px-4 rounded-xl border hairline soft-hover text-xs thai">หยุดอัตโนมัติ</button>
      <button type="button" id="think-next" class="btn-primary h-10 px-4 rounded-xl text-xs font-semibold thai">ขั้นย่อยถัดไป</button>
    </div>
  `;
}

function renderOutputStage(ctx) {
  const { formatTokens, outputTokens } = ctx;
  return `
    <div class="stage-head">
      <p class="help-kicker">ขั้นที่ 7</p>
      <h2 class="thai text-xl font-semibold mt-1">สร้างคำตอบจำลอง</h2>
      <p class="thai text-sm text-zinc-400 mt-2">คำตอบถูกประกอบทีละ Token จากชุดข้อความสอน ไม่ได้เรียกบริการจริง</p>
    </div>
    <article class="glass panel p-5 mt-5">
      <div class="flex items-center gap-2">
        <span class="status-dot ready"></span>
        <p class="help-kicker">กำลังเขียนคำตอบ</p>
      </div>
      <div id="typed-output" class="thai text-sm leading-relaxed whitespace-pre-wrap mt-3 min-h-[6rem]"></div>
    </article>
    <p class="mono text-xs text-zinc-500 mt-3">คำตอบประมาณ ${formatTokens(outputTokens.length)} Token</p>
  `;
}

function renderReturnStage(ctx) {
  const { report, outputTokens, model, formatTokens, formatUsd, calcCostUsd } = ctx;
  const inputCost = calcCostUsd(report.counts.input, model.inputPricePerMillion);
  const outputCost = calcCostUsd(outputTokens.length, model.outputPricePerMillion);
  return `
    <div class="stage-head">
      <p class="help-kicker">ขั้นที่ 8</p>
      <h2 class="thai text-xl font-semibold mt-1">นับ Token ของคำตอบ แล้วรวมราคา</h2>
      <p class="thai text-sm text-zinc-400 mt-2">คำตอบถูกหั่นเป็น Token เหมือนข้อความเข้า แล้วคูณราคาฝั่งคำตอบ</p>
    </div>
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-5">
      ${metric("Token ข้อความเข้า", formatTokens(report.counts.input))}
      ${metric("Token ของคำตอบ", formatTokens(outputTokens.length))}
      ${metric("ค่าข้อความเข้า", formatUsd(inputCost))}
      ${metric("ค่าคำตอบ", formatUsd(outputCost))}
    </div>
    <div class="glass panel p-5 mt-4">
      <p class="help-kicker">รวมทั้งรอบ</p>
      <p id="total-cost" class="mono text-3xl font-semibold mt-2">${formatUsd(inputCost + outputCost)}</p>
      <p class="thai text-sm text-zinc-400 mt-2">รวมข้อความเข้าและคำตอบของรอบนี้ บน ${escape(ctx, model.name)}</p>
    </div>
    <div id="output-chip-scroll" class="chip-virtual glass panel mt-4" aria-label="Token ของคำตอบ"></div>
  `;
}

function renderChatStage(ctx) {
  const { systemPrompt, turns, outputText, report, outputTokens, formatTokens, escapeHtml, calcCostUsd, model, formatUsd } = ctx;
  const user = turns.map((t) => t.content).filter(Boolean).join("\n") || "—";
  const total = calcCostUsd(report.counts.input, model.inputPricePerMillion) +
    calcCostUsd(outputTokens.length, model.outputPricePerMillion);
  return `
    <div class="stage-head">
      <p class="help-kicker">ขั้นที่ 9</p>
      <h2 class="thai text-xl font-semibold mt-1">กลับสู่หน้าต่างแชท</h2>
      <p class="thai text-sm text-zinc-400 mt-2">นี่คือสิ่งที่ผู้ใช้เห็น — Token กับราคาถูกสรุปไว้ใต้บทสนทนา</p>
    </div>
    <div class="chat-thread glass panel p-4 sm:p-5 mt-5 space-y-3">
      ${systemPrompt.trim() ? `<div class="chat-bubble system thai text-sm chat-in">${escapeHtml(systemPrompt)}</div>` : ""}
      <div class="chat-bubble user thai text-sm chat-in" style="animation-delay:.12s">${escapeHtml(user)}</div>
      <div class="chat-bubble assistant thai text-sm whitespace-pre-wrap chat-in" style="animation-delay:.28s">${escapeHtml(outputText || "")}</div>
    </div>
    <div class="chat-meter glass panel p-4 mt-4 flex flex-wrap gap-3 justify-between items-center">
      <p class="thai text-sm">ข้อความเข้า ${formatTokens(report.counts.input)} · คำตอบ ${formatTokens(outputTokens.length)}</p>
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
