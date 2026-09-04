/**
 * Conceptual Transformer diagrams for classroom Step 6.
 * Slow, labelled, not a real model.
 */

const NS = 'xmlns="http://www.w3.org/2000/svg"';
const FONT = 'font-family="Sarabun, Inter, sans-serif"';
const MONO = 'font-family="IBM Plex Mono, ui-monospace, monospace"';

export function diagramForThink(index) {
  switch (index) {
    case 0:
      return embeddingDiagram();
    case 1:
      return attentionDiagram();
    case 2:
      return feedForwardDiagram();
    case 3:
      return generationDiagram();
    default:
      return embeddingDiagram();
  }
}

export function stackOverview(activeIndex) {
  const layers = [
    { y: 36, h: 44, label: "Input IDs", sub: "รหัส Token", stage: -1 },
    { y: 92, h: 50, label: "Embedding + ตำแหน่ง", sub: "ID → เวกเตอร์", stage: 0 },
    { y: 168, h: 52, label: "Self-Attention", sub: "Token มองหากัน", stage: 1 },
    { y: 226, h: 36, label: "Add & Norm", sub: "Residual", stage: 1 },
    { y: 274, h: 52, label: "Feed-forward", sub: "แปลงทีละตำแหน่ง", stage: 2 },
    { y: 332, h: 36, label: "Add & Norm", sub: "Residual", stage: 2 },
    { y: 392, h: 50, label: "LM Head + Softmax", sub: "ทาย Token ถัดไป", stage: 3 },
  ];

  const boxes = layers
    .map((layer) => {
      const on = layer.stage === activeIndex;
      const fill = on ? "rgba(99,102,241,0.28)" : "rgba(255,255,255,0.04)";
      const stroke = on ? "#a5b4fc" : "rgba(255,255,255,0.12)";
      const glow = on ? 'class="stack-on d-fade"' : "";
      return `
        <g ${glow}>
          <rect x="28" y="${layer.y}" width="224" height="${layer.h}" rx="12"
            fill="${fill}" stroke="${stroke}" stroke-width="${on ? 2 : 1}"/>
          <text x="140" y="${layer.y + (layer.h > 44 ? 22 : 16)}" text-anchor="middle" fill="#fafafa" font-size="13" ${FONT}>${layer.label}</text>
          <text x="140" y="${layer.y + (layer.h > 44 ? 40 : 30)}" text-anchor="middle" fill="#a1a1aa" font-size="11" ${FONT}>${layer.sub}</text>
        </g>`;
    })
    .join("");

  return `
    <svg class="model-svg" viewBox="0 0 280 470" ${NS} aria-label="โครง Transformer อย่างย่อ">
      <text x="140" y="18" text-anchor="middle" fill="#71717a" font-size="10" ${FONT}>โครงโมเดล (ย่อ · ไม่ใช่ของจริง)</text>
      ${boxes}
      <rect x="18" y="158" width="244" height="220" rx="16" fill="none" stroke="rgba(129,140,248,0.35)" stroke-dasharray="5 4"/>
      <text x="140" y="154" text-anchor="middle" fill="#818cf8" font-size="10" ${FONT}>Transformer block × หลายสิบชั้น</text>
      <path class="d-draw" d="M140 80 v12" stroke="#71717a" stroke-width="1.5" fill="none"/>
      <path class="d-draw" d="M12 210 v150" stroke="#6366f1" stroke-width="1.5" fill="none" opacity="0.7"/>
      <text x="8" y="288" fill="#6366f1" font-size="9" ${FONT} transform="rotate(-90 8 288)">skip / residual</text>
      <path class="d-draw" d="M140 368 v24" stroke="#71717a" stroke-width="1.5" fill="none"/>
      <text x="140" y="460" text-anchor="middle" fill="#71717a" font-size="10" ${FONT}>จุดสว่าง = ชั้นที่กำลังสอน</text>
    </svg>
  `;
}

function defs() {
  return `
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#a1a1aa"/>
      </marker>
      <marker id="arr-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#fb7185"/>
      </marker>
      <linearGradient id="emb-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.05"/>
      </linearGradient>
    </defs>
  `;
}

function embeddingDiagram() {
  return `
    <svg class="model-svg" viewBox="0 0 760 360" ${NS} aria-label="แผนภาพ Embedding">
      ${defs()}
      <text x="380" y="24" text-anchor="middle" fill="#a1a1aa" font-size="13" ${FONT}>จากรหัส Token → เวกเตอร์ความหมาย + ตำแหน่งในประโยค</text>

      <g>
        ${tokenBox(70, 48, "แมว", "ID 4821", "#6366f1")}
        ${tokenBox(300, 48, "กิน", "ID 8910", "#10b981")}
        ${tokenBox(530, 48, "ปลา", "ID 3344", "#f59e0b")}
      </g>

      <g class="d-fade d-d1">
        <rect x="70" y="128" width="620" height="56" rx="14" fill="url(#emb-grad)" stroke="rgba(129,140,248,0.45)"/>
        <text x="380" y="152" text-anchor="middle" fill="#e0e7ff" font-size="14" ${FONT}>ตาราง Embedding  (คลังคำ → เวกเตอร์หลายร้อยถึงหลายพันมิติ)</text>
        <text x="380" y="172" text-anchor="middle" fill="#94a3b8" font-size="12" ${FONT}>บวก Positional Encoding เพื่อรู้ว่าอยู่ลำดับที่ 1, 2, 3</text>
      </g>

      <path class="d-trace" d="M116 108 v20" stroke="#818cf8" stroke-width="2" marker-end="url(#arr)"/>
      <path class="d-trace d-d1" d="M346 108 v20" stroke="#34d399" stroke-width="2" marker-end="url(#arr)"/>
      <path class="d-trace d-d2" d="M576 108 v20" stroke="#fbbf24" stroke-width="2" marker-end="url(#arr)"/>

      <g class="d-fade d-d2">
        ${vectorBox(70, 208, ["0.21", "-0.44", "0.87", "…"], "#6366f1", "ตำแหน่ง 1")}
        ${vectorBox(300, 208, ["0.05", "0.62", "-0.11", "…"], "#10b981", "ตำแหน่ง 2")}
        ${vectorBox(530, 208, ["-0.33", "0.18", "0.54", "…"], "#f59e0b", "ตำแหน่ง 3")}
      </g>

      <text class="d-fade d-d3" x="380" y="338" text-anchor="middle" fill="#94a3b8" font-size="13" ${FONT}>ผลลัพธ์: แต่ละช่องใน Context Window มีเวกเตอร์หนึ่งอัน พร้อมให้ Attention อ่าน</text>
    </svg>
  `;
}

function attentionDiagram() {
  const cells = [
    [0.4, 0.2, 0.1],
    [0.25, 0.45, 0.15],
    [0.82, 0.12, 0.06],
  ];
  const labels = ["แมว", "กิน", "มัน"];
  const heat = cells
    .map((row, r) =>
      row
        .map((v, c) => {
          const x = 78 + c * 54;
          const y = 188 + r * 36;
          const alpha = 0.12 + v * 0.75;
          const delay = `d-d${Math.min(4, r + c + 1)}`;
          return `<rect class="d-fade ${delay}" x="${x}" y="${y}" width="46" height="28" rx="6"
            fill="rgba(244,63,94,${alpha.toFixed(2)})" stroke="rgba(253,164,175,0.35)"/>`;
        })
        .join("")
    )
    .join("");
  const headLabels = labels
    .map((label, i) => `<text x="${101 + i * 54}" y="178" text-anchor="middle" fill="#a1a1aa" font-size="11" ${FONT}>${label}</text>`)
    .join("");
  const sideLabels = labels
    .map((label, i) => `<text x="68" y="${208 + i * 36}" text-anchor="end" fill="#a1a1aa" font-size="11" ${FONT}>${label}</text>`)
    .join("");

  return `
    <svg class="model-svg" viewBox="0 0 760 360" ${NS} aria-label="แผนภาพ Attention">
      ${defs()}
      <text x="380" y="24" text-anchor="middle" fill="#a1a1aa" font-size="13" ${FONT}>Self-Attention: แต่ละ Token ถามว่าควรอ่าน Token ไหนในหน้าต่าง</text>

      <g>
        ${tokenBox(80, 42, "แมว", "คำนาม", "#6366f1")}
        ${tokenBox(300, 42, "กิน", "กริยา", "#10b981")}
        ${tokenBox(520, 42, "มัน", "สรรพนาม", "#f43f5e")}
      </g>

      <path class="d-trace" d="M566 96 C 420 150, 220 150, 126 96" fill="none" stroke="#fb7185" stroke-width="3" marker-end="url(#arr-hot)"/>
      <path class="d-trace d-d2" d="M566 96 C 510 140, 380 140, 346 96" fill="none" stroke="rgba(244,63,94,0.35)" stroke-width="2"/>
      <text class="d-fade d-d2" x="380" y="128" text-anchor="middle" fill="#fda4af" font-size="13" ${FONT}>«มัน» ให้น้ำหนักสูงกับ «แมว» — อ่านบริบทย้อนกลับใน Context Window</text>

      <g class="d-fade d-d1">
        <rect x="400" y="168" width="330" height="150" rx="14" fill="rgba(99,102,241,0.08)" stroke="rgba(129,140,248,0.35)"/>
        <text x="565" y="196" text-anchor="middle" fill="#e4e4e7" font-size="13" ${FONT}>Q · K · V  (ถาม · กุญแจ · ค่า)</text>
        <text x="565" y="222" text-anchor="middle" fill="#a1a1aa" font-size="12" ${MONO}>softmax(QKᵀ / √d) · V</text>
        <text x="565" y="250" text-anchor="middle" fill="#94a3b8" font-size="12" ${FONT}>ไม่ต้องจำสูตร — จำว่า Token มองหากัน</text>
        <text x="565" y="276" text-anchor="middle" fill="#64748b" font-size="11" ${FONT}>ทำขนานทั้งลำดับในหน้าต่างเดียวกัน</text>
        <text x="565" y="298" text-anchor="middle" fill="#64748b" font-size="11" ${FONT}>Multi-head = มองหลายมุมพร้อมกัน</text>
      </g>

      <g>
        <text x="155" y="160" text-anchor="middle" fill="#94a3b8" font-size="11" ${FONT}>ตารางน้ำหนัก (ย่อ)</text>
        ${headLabels}
        ${sideLabels}
        ${heat}
      </g>
    </svg>
  `;
}

function feedForwardDiagram() {
  return `
    <svg class="model-svg" viewBox="0 0 760 360" ${NS} aria-label="แผนภาพ Feed-forward">
      ${defs()}
      <text x="380" y="24" text-anchor="middle" fill="#a1a1aa" font-size="13" ${FONT}>หลังรวมบริบทแล้ว แปลงความหมายทีละตำแหน่ง — ไม่ดึง Token อื่นมาปน</text>

      <g>
        <rect x="36" y="86" width="110" height="140" rx="14" fill="rgba(16,185,129,0.14)" stroke="#34d399"/>
        <text x="91" y="148" text-anchor="middle" fill="#ecfdf5" font-size="13" ${FONT}>เวกเตอร์</text>
        <text x="91" y="170" text-anchor="middle" fill="#6ee7b7" font-size="11" ${FONT}>1 ตำแหน่ง</text>
        <text x="91" y="190" text-anchor="middle" fill="#6ee7b7" font-size="11" ${MONO}>d_model</text>
      </g>

      <path class="d-trace" d="M146 156 H 198" stroke="#a1a1aa" stroke-width="2" marker-end="url(#arr)"/>

      <g class="d-fade d-d1">
        <rect x="200" y="56" width="150" height="200" rx="14" fill="rgba(99,102,241,0.18)" stroke="#818cf8"/>
        <text x="275" y="140" text-anchor="middle" fill="#e0e7ff" font-size="13" ${FONT}>ขยายชั้นใน</text>
        <text x="275" y="162" text-anchor="middle" fill="#a5b4fc" font-size="11" ${MONO}>≈ 4 × d</text>
        <text x="275" y="184" text-anchor="middle" fill="#a5b4fc" font-size="11" ${FONT}>+ ฟังก์ชันไม่เชิงเส้น</text>
      </g>

      <path class="d-trace d-d2" d="M350 156 H 402" stroke="#a1a1aa" stroke-width="2" marker-end="url(#arr)"/>

      <g class="d-fade d-d2">
        <rect x="404" y="86" width="110" height="140" rx="14" fill="rgba(16,185,129,0.14)" stroke="#34d399"/>
        <text x="459" y="148" text-anchor="middle" fill="#ecfdf5" font-size="13" ${FONT}>เวกเตอร์ใหม่</text>
        <text x="459" y="170" text-anchor="middle" fill="#6ee7b7" font-size="11" ${FONT}>ความหมายที่คิดต่อ</text>
        <text x="459" y="190" text-anchor="middle" fill="#6ee7b7" font-size="11" ${MONO}>d_model</text>
      </g>

      <g class="d-fade d-d3">
        <path d="M91 86 C 91 40, 459 40, 459 86" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="6 5"/>
        <text x="275" y="48" text-anchor="middle" fill="#a5b4fc" font-size="12" ${FONT}>Residual: บวกของเดิมเข้าไป เพื่อไม่ให้ของเก่าหาย</text>
        <rect x="540" y="96" width="190" height="120" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)"/>
        <text x="635" y="128" text-anchor="middle" fill="#e4e4e7" font-size="13" ${FONT}>ทำซ้ำทั้งบล็อก</text>
        <text x="635" y="152" text-anchor="middle" fill="#a1a1aa" font-size="12" ${FONT}>Attention + FFN</text>
        <text x="635" y="176" text-anchor="middle" fill="#94a3b8" font-size="12" ${FONT}>ซ้อนกันหลายสิบชั้น</text>
        <text x="635" y="198" text-anchor="middle" fill="#64748b" font-size="11" ${FONT}>= ตัวโมเดลส่วนใหญ่</text>
      </g>

      <text class="d-fade d-d4" x="380" y="330" text-anchor="middle" fill="#94a3b8" font-size="13" ${FONT}>ต่างจาก Attention: ชั้นนี้ไม่ผสมข้าม Token — ช่วย «คิดต่อ» หลังได้อ่านบริบทแล้ว</text>
    </svg>
  `;
}

function generationDiagram() {
  return `
    <svg class="model-svg" viewBox="0 0 760 360" ${NS} aria-label="แผนภาพ Generation">
      ${defs()}
      <text x="380" y="24" text-anchor="middle" fill="#a1a1aa" font-size="13" ${FONT}>ทายทีละ Token แล้ววนทั้งบล็อกใหม่ — ไม่ได้สร้างทั้งย่อหน้าในครั้งเดียว</text>

      <g>
        ${tokenBox(48, 46, "แมว", "มีแล้ว", "#6366f1")}
        ${tokenBox(168, 46, "กิน", "มีแล้ว", "#10b981")}
        <rect class="d-glow" x="288" y="46" width="100" height="52" rx="12" fill="rgba(244,63,94,0.16)" stroke="#fb7185" stroke-dasharray="5 4"/>
        <text x="338" y="70" text-anchor="middle" fill="#fda4af" font-size="16" ${FONT}>?</text>
        <text x="338" y="88" text-anchor="middle" fill="#fb7185" font-size="10" ${FONT}>กำลังทาย</text>
        <text x="470" y="68" fill="#94a3b8" font-size="12" ${FONT}>LM Head อ่านเวกเตอร์ตำแหน่งล่าสุด</text>
        <text x="470" y="88" fill="#64748b" font-size="11" ${FONT}>แตกเป็นคะแนนของทุกคำในคลัง</text>
      </g>

      <g class="d-fade d-d1">
        <rect x="48" y="128" width="430" height="168" rx="16" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)"/>
        <text x="68" y="154" fill="#e4e4e7" font-size="13" ${FONT}>ความน่าจะเป็น (ตัวอย่าง)</text>
        ${probBar(68, 172, 248, 0.62, "ปลา", true)}
        ${probBar(68, 208, 140, 0.24, "อาหาร", false)}
        ${probBar(68, 244, 72, 0.14, "นม", false)}
      </g>

      <g class="d-fade d-d3">
        <path class="d-draw" d="M520 200 C 620 200, 680 200, 700 120 S 620 40, 400 46" fill="none" stroke="#818cf8" stroke-width="2" marker-end="url(#arr)"/>
        <rect x="500" y="128" width="230" height="168" rx="16" fill="rgba(99,102,241,0.1)" stroke="rgba(129,140,248,0.4)"/>
        <text x="615" y="164" text-anchor="middle" fill="#e0e7ff" font-size="13" ${FONT}>เลือก / สุ่ม 1 Token</text>
        <text x="615" y="190" text-anchor="middle" fill="#c7d2fe" font-size="16" ${FONT}>ปลา</text>
        <text x="615" y="216" text-anchor="middle" fill="#a1a1aa" font-size="12" ${FONT}>ต่อท้ายลำดับ</text>
        <text x="615" y="240" text-anchor="middle" fill="#94a3b8" font-size="12" ${FONT}>Context ยาวขึ้น 1</text>
        <text x="615" y="268" text-anchor="middle" fill="#64748b" font-size="11" ${FONT}>วน Embedding → Attention → FFN</text>
      </g>
    </svg>
  `;
}

function tokenBox(x, y, label, sub, color) {
  return `<g>
    <rect x="${x}" y="${y}" width="108" height="52" rx="12" fill="${color}22" stroke="${color}"/>
    <text x="${x + 54}" y="${y + 24}" text-anchor="middle" fill="#fafafa" font-size="16" ${FONT}>${label}</text>
    <text x="${x + 54}" y="${y + 42}" text-anchor="middle" fill="${color}" font-size="11" ${MONO}>${sub}</text>
  </g>`;
}

function vectorBox(x, y, values, color, caption) {
  const rows = values
    .map(
      (value, i) =>
        `<text x="${x + 54}" y="${y + 22 + i * 18}" text-anchor="middle" fill="#d4d4d8" font-size="12" ${MONO}>${value}</text>`
    )
    .join("");
  return `<g>
    <rect x="${x}" y="${y}" width="108" height="96" rx="12" fill="${color}18" stroke="${color}"/>
    ${rows}
    <text x="${x + 54}" y="${y + 112}" text-anchor="middle" fill="#71717a" font-size="11" ${FONT}>${caption}</text>
  </g>`;
}

function probBar(x, y, width, pct, label, hot = false) {
  const color = hot ? "#34d399" : "#64748b";
  return `<g>
    <text x="${x}" y="${y + 13}" fill="#e4e4e7" font-size="13" ${FONT}>${label}</text>
    <rect x="${x + 78}" y="${y}" width="250" height="16" rx="8" fill="rgba(255,255,255,0.06)"/>
    <rect class="d-grow" x="${x + 78}" y="${y}" width="${width}" height="16" rx="8" fill="${color}"/>
    <text x="${x + 338}" y="${y + 13}" fill="#a1a1aa" font-size="12" ${MONO}>${Math.round(pct * 100)}%</text>
  </g>`;
}

export function mountThinkLesson(container, index) {
  if (!container) return;
  container.innerHTML = `
    <div class="think-layout">
      <div class="think-stack glass panel p-3">${stackOverview(index)}</div>
      <div class="think-diagram glass panel p-3">${diagramForThink(index)}</div>
    </div>
  `;
}

export function mountModelPeek(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="think-layout think-peek">
      <div class="think-stack glass panel p-3">${stackOverview(-1)}</div>
      <div class="glass panel p-4 sm:p-5">
        <p class="help-kicker">ข้างในโมเดลจะเจอโครงนี้</p>
        <h3 class="thai text-base font-medium mt-2">Embedding → Attention → Feed-forward → Generation</h3>
        <ul class="mt-3 space-y-2 thai text-sm text-zinc-300 leading-relaxed list-disc pl-5">
          <li>ขั้นถัดไปจะเดินทีละชั้นอย่างช้า พร้อมแผนภาพ</li>
          <li>บล็อกกลาง (Attention + FFN) ถูกซ้อนหลายสิบรอบ — นั่นคือตัวโมเดลส่วนใหญ่</li>
          <li>ขาออกไม่ได้ถูกสร้างทั้งก้อน: ทาย Token แล้ววนกลับไปอ่านใหม่</li>
        </ul>
      </div>
    </div>
  `;
}
