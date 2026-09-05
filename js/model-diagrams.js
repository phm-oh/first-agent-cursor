/**
 * Classroom Transformer cartoons for Step 6.
 * One story, the learner's tokens, progressive detail. Not a real model.
 */

const NS = 'xmlns="http://www.w3.org/2000/svg"';
const FONT = 'font-family="Sarabun, Inter, sans-serif"';
const MONO = 'font-family="IBM Plex Mono, ui-monospace, monospace"';
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#22d3ee"];

const FALLBACK_IN = [
  { text: "แมว", id: 4821 },
  { text: "กิน", id: 8910 },
  { text: "ปลา", id: 3344 },
];
const FALLBACK_OUT = [
  { text: "คือ" },
  { text: "หน่วย" },
  { text: "เล็ก" },
];

export function pickLessonTokens(pieces, outputTokens, formatPreview) {
  const preview = formatPreview || ((value) => String(value || "·"));
  const all = (pieces || []).filter(isContentToken);
  const userPieces = all.filter((piece) => piece.kind === "user");
  const usable = (userPieces.length >= 2 ? userPieces : all).slice(0, 4);
  const fromUser = usable.length >= 2;
  const source = fromUser ? usable : FALLBACK_IN;
  const tokens = source.map((piece, i) => ({
    text: clipLabel(preview(piece.text)),
    id: Number.isFinite(piece.id) ? piece.id : i + 1,
    color: COLORS[i % COLORS.length],
    pos: i + 1,
  }));
  const outs = (outputTokens || []).filter(isContentToken).slice(0, 3);
  const nextSource = outs.length ? outs : FALLBACK_OUT;
  const next = nextSource.map((piece, i) => ({
    text: clipLabel(preview(piece.text)),
    pct: [0.58, 0.26, 0.16][i] || 0.08,
  }));
  return {
    tokens,
    next,
    fromUser,
    query: Math.max(0, tokens.length - 1),
    key: 0,
  };
}

export function diagramForThink(index, lesson) {
  const ctx = lesson || pickLessonTokens([], [], (v) => v);
  switch (index) {
    case 0:
      return embeddingDiagram(ctx);
    case 1:
      return attentionDiagram(ctx);
    case 2:
      return feedForwardDiagram(ctx);
    case 3:
      return generationDiagram(ctx);
    default:
      return embeddingDiagram(ctx);
  }
}

export function residualHighway(activeIndex) {
  const stops = [
    { x: 70, label: "จำความหมาย", sub: "ชิ้นนี้คืออะไร", stage: 0 },
    { x: 280, label: "อ่านบริบท", sub: "มองย้อนไปคำก่อน", stage: 1 },
    { x: 490, label: "คิดต่อ", sub: "สรุปที่คำนั้น", stage: 2 },
    { x: 700, label: "ทายคำถัดไป", sub: "ทีละคำเท่านั้น", stage: 3 },
  ];
  const nodes = stops
    .map((stop) => {
      const on = stop.stage === activeIndex;
      return `
        <g>
          <circle cx="${stop.x}" cy="58" r="${on ? 22 : 16}"
            fill="${on ? "rgba(99,102,241,0.28)" : "rgba(255,255,255,0.05)"}"
            stroke="${on ? "#a5b4fc" : "rgba(255,255,255,0.2)"}"
            stroke-width="${on ? 2.5 : 1.2}" class="${on ? "stack-on" : ""}"/>
          <text x="${stop.x}" y="96" text-anchor="middle" fill="${on ? "#e0e7ff" : "#a1a1aa"}" font-size="12" ${FONT}>${stop.label}</text>
          <text x="${stop.x}" y="112" text-anchor="middle" fill="#71717a" font-size="10" ${FONT}>${stop.sub}</text>
        </g>`;
    })
    .join("");
  return `
    <svg class="model-svg highway-svg" viewBox="0 0 780 128" ${NS} aria-label="เส้นข้อมูลหลักอย่างย่อ">
      <text x="390" y="18" text-anchor="middle" fill="#71717a" font-size="11" ${FONT}>สี่ขั้นที่โมเดลทำซ้ำจนกว่าจะจบคำตอบ</text>
      <path d="M36 58 H 744" stroke="rgba(129,140,248,0.45)" stroke-width="4" stroke-linecap="round"/>
      <path class="d-draw" d="M36 58 H 744" stroke="#818cf8" stroke-width="1.5" fill="none"/>
      ${nodes}
    </svg>
  `;
}

export function stackOverview(activeIndex) {
  return residualHighway(activeIndex);
}

function isContentToken(piece) {
  const text = String(piece?.text || "");
  if (!text.trim()) return false;
  if (text === "IMG") return false;
  if (text.startsWith("<|")) return false;
  return true;
}

function clipLabel(value) {
  const text = String(value || "·").replace(/\s+/g, " ").trim() || "·";
  return text.length > 8 ? `${text.slice(0, 8)}…` : text;
}

function svgEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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

function tokenSlots(tokens, y = 48) {
  const n = Math.max(tokens.length, 1);
  const width = 108;
  const span = 640;
  const start = 60;
  const gap = n === 1 ? 0 : Math.min(36, (span - n * width) / (n - 1));
  return tokens
    .map((token, i) => tokenBox(start + i * (width + gap), y, token.text, `id ${token.id}`, token.color))
    .join("");
}

function tokenCenters(tokens, y = 74) {
  const n = Math.max(tokens.length, 1);
  const width = 108;
  const span = 640;
  const start = 60;
  const gap = n === 1 ? 0 : Math.min(36, (span - n * width) / (n - 1));
  return tokens.map((token, i) => ({
    ...token,
    cx: start + i * (width + gap) + width / 2,
    cy: y,
  }));
}

function embeddingDiagram(lesson) {
  const tokens = lesson.tokens;
  const centers = tokenCenters(tokens);
  const arrows = centers
    .map(
      (item, i) =>
        `<path class="d-trace ${i ? `d-d${Math.min(i, 3)}` : ""}" d="M${item.cx} 100 v24" stroke="${item.color}" stroke-width="2" marker-end="url(#arr)"/>`
    )
    .join("");
  const vectors = tokens
    .map((token, i) => {
      const x = tokenCenters(tokens, 0)[i].cx - 48;
      const seed = (token.id % 90) / 100;
      return vectorBox(x, 210, [seed.toFixed(2), ((seed * 1.7) % 1 - 0.4).toFixed(2), "…"], token.color, `ตำแหน่ง ${token.pos}`);
    })
    .join("");
  const source = lesson.fromUser ? "Token จากข้อความของคุณ" : "ตัวอย่างในห้อง";
  return `
    <svg class="model-svg" viewBox="0 0 760 360" ${NS} aria-label="แผนภาพจำความหมาย">
      ${defs()}
      <text x="380" y="24" text-anchor="middle" fill="#a1a1aa" font-size="13" ${FONT}>${source}: ชิ้นข้อความยังไม่มีความหมาย จนกว่าโมเดลจะจำได้ว่าแต่ละชิ้นหมายถึงอะไร</text>
      ${tokenSlots(tokens)}
      ${arrows}
      <g class="d-fade d-d1">
        <rect x="50" y="128" width="660" height="56" rx="14" fill="url(#emb-grad)" stroke="rgba(129,140,248,0.45)"/>
        <text x="380" y="152" text-anchor="middle" fill="#e0e7ff" font-size="14" ${FONT}>จำความหมาย และจำไว้ว่าอยู่ตรงไหนในประโยค</text>
        <text x="380" y="172" text-anchor="middle" fill="#94a3b8" font-size="12" ${FONT}>คำที่ความหมายใกล้กันอยู่ใกล้กัน — สลับคำแล้วความหมายรวมไม่เหมือนเดิม</text>
      </g>
      <g class="d-fade d-d1">${vectors}</g>
      <text class="d-fade d-d3" x="380" y="342" text-anchor="middle" fill="#94a3b8" font-size="13" ${FONT}>หนึ่งช่องต่อหนึ่งชิ้นข้อความ</text>
    </svg>
  `;
}

function attentionDiagram(lesson) {
  const tokens = lesson.tokens;
  const labels = tokens.map((token) => token.text);
  const q = lesson.query;
  const k = lesson.key;
  const n = tokens.length;
  const cells = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (__, c) => {
      if (r === q && c === k) return 0.92;
      if (r === c) return 0.42;
      return 0.18 + ((r + c) % 3) * 0.08;
    })
  );
  const heat = cells
    .map((row, r) =>
      row
        .map((v, c) => {
          const x = 70 + c * 52;
          const y = 186 + r * 34;
          const alpha = 0.1 + v * 0.75;
          return `<rect x="${x}" y="${y}" width="44" height="26" rx="6"
            fill="rgba(244,63,94,${alpha.toFixed(2)})" stroke="rgba(253,164,175,0.45)"/>`;
        })
        .join("")
    )
    .join("");
  const headLabels = labels
    .map((label, i) => `<text x="${92 + i * 52}" y="176" text-anchor="middle" fill="#a1a1aa" font-size="10" ${FONT}>${svgEscape(label)}</text>`)
    .join("");
  const sideLabels = labels
    .map((label, i) => `<text x="62" y="${204 + i * 34}" text-anchor="end" fill="#a1a1aa" font-size="10" ${FONT}>${svgEscape(label)}</text>`)
    .join("");
  const centers = tokenCenters(tokens);
  const from = centers[q] || centers[centers.length - 1];
  const to = centers[k] || centers[0];
  const qText = svgEscape(tokens[q]?.text || "ท้าย");
  const kText = svgEscape(tokens[k]?.text || "ต้น");
  return `
    <svg class="model-svg" viewBox="0 0 760 360" ${NS} aria-label="แผนภาพอ่านบริบท">
      ${defs()}
      <text x="380" y="24" text-anchor="middle" fill="#a1a1aa" font-size="13" ${FONT}>คำท้ายมองย้อนไปในข้อความของคุณ — สีเข้ม = อ่านมาก</text>
      ${tokenSlots(tokens)}
      <path class="d-trace" d="M${from.cx} 100 C ${(from.cx + to.cx) / 2} 150, ${(from.cx + to.cx) / 2} 150, ${to.cx} 100" fill="none" stroke="#fb7185" stroke-width="3" marker-end="url(#arr-hot)"/>
      <text class="d-fade d-d1" x="380" y="128" text-anchor="middle" fill="#fda4af" font-size="13" ${FONT}>«${qText}» อ่าน «${kText}» เป็นหลัก</text>
      <g>
        <text x="148" y="158" text-anchor="middle" fill="#94a3b8" font-size="11" ${FONT}>อ่านมากหรือน้อย</text>
        ${headLabels}${sideLabels}${heat}
      </g>
      <g class="d-fade d-d2">
        <rect x="430" y="168" width="290" height="168" rx="14" fill="rgba(99,102,241,0.08)" stroke="rgba(129,140,248,0.35)"/>
        <text x="575" y="198" text-anchor="middle" fill="#e4e4e7" font-size="13" ${FONT}>จำแค่ว่าคำมองหากัน</text>
        <text x="575" y="226" text-anchor="middle" fill="#a1a1aa" font-size="12" ${FONT}>ไม่ต้องจำสูตร</text>
        <text x="575" y="250" text-anchor="middle" fill="#94a3b8" font-size="12" ${FONT}>เลยรู้ว่า «มัน» ชี้ไปที่ใคร</text>
        <text x="575" y="278" text-anchor="middle" fill="#64748b" font-size="11" ${FONT}>มองได้หลายมุมพร้อมกัน</text>
        <text x="575" y="302" text-anchor="middle" fill="#64748b" font-size="11" ${FONT}>เช่น ใครทำ / ทำอะไร</text>
      </g>
    </svg>
  `;
}

function feedForwardDiagram(lesson) {
  const focus = lesson.tokens[lesson.query] || lesson.tokens[0];
  const label = svgEscape(focus?.text || "Token");
  return `
    <svg class="model-svg" viewBox="0 0 760 340" ${NS} aria-label="แผนภาพคิดต่อ">
      ${defs()}
      <text x="380" y="24" text-anchor="middle" fill="#a1a1aa" font-size="13" ${FONT}>หลังอ่านบริบทแล้ว คิดต่อที่คำ «${label}» รอบนี้คิดที่คำนี้คำเดียว</text>
      <g>
        <rect x="40" y="90" width="120" height="140" rx="14" fill="${(focus?.color || "#10b981")}22" stroke="${focus?.color || "#34d399"}"/>
        <text x="100" y="148" text-anchor="middle" fill="#fafafa" font-size="14" ${FONT}>${label}</text>
        <text x="100" y="170" text-anchor="middle" fill="#a1a1aa" font-size="11" ${FONT}>คำที่กำลังคิด</text>
      </g>
      <path class="d-trace" d="M160 160 H 214" stroke="#a1a1aa" stroke-width="2" marker-end="url(#arr)"/>
      <g class="d-fade d-d1">
        <rect x="216" y="60" width="160" height="200" rx="14" fill="rgba(99,102,241,0.18)" stroke="#818cf8"/>
        <text x="296" y="150" text-anchor="middle" fill="#e0e7ff" font-size="14" ${FONT}>สรุปในหัว</text>
        <text x="296" y="174" text-anchor="middle" fill="#a5b4fc" font-size="12" ${FONT}>คิดต่อหลังได้อ่านแล้ว</text>
      </g>
      <path class="d-trace d-d2" d="M376 160 H 430" stroke="#a1a1aa" stroke-width="2" marker-end="url(#arr)"/>
      <g class="d-fade d-d2">
        <rect x="432" y="90" width="120" height="140" rx="14" fill="rgba(16,185,129,0.14)" stroke="#34d399"/>
        <text x="492" y="154" text-anchor="middle" fill="#ecfdf5" font-size="14" ${FONT}>ความหมายใหม่</text>
        <text x="492" y="176" text-anchor="middle" fill="#6ee7b7" font-size="11" ${FONT}>ยังเก็บของเดิมไว้</text>
      </g>
      <g class="d-fade d-d3">
        <rect x="572" y="90" width="160" height="140" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)"/>
        <text x="652" y="140" text-anchor="middle" fill="#e4e4e7" font-size="13" ${FONT}>อ่านแล้วคิดต่อ</text>
        <text x="652" y="164" text-anchor="middle" fill="#94a3b8" font-size="12" ${FONT}>ทำซ้ำหลายรอบ</text>
        <text x="652" y="188" text-anchor="middle" fill="#64748b" font-size="11" ${FONT}>ยังอยู่ในข้อความรอบนี้</text>
      </g>
      <text class="d-fade d-d3" x="380" y="318" text-anchor="middle" fill="#94a3b8" font-size="13" ${FONT}>เก็บของเดิมไว้ = ไม่ให้สิ่งที่อ่านมาแล้วหายไประหว่างคิด</text>
    </svg>
  `;
}

function generationDiagram(lesson) {
  const shown = lesson.tokens.slice(-2);
  const next = lesson.next;
  const pick = next[0];
  const bars = next
    .map((item, i) => probBar(68, 172 + i * 36, Math.round(item.pct * 400), item.pct, item.text, i === 0))
    .join("");
  return `
    <svg class="model-svg" viewBox="0 0 760 360" ${NS} aria-label="แผนภาพทายคำถัดไป">
      ${defs()}
      <text x="380" y="24" text-anchor="middle" fill="#a1a1aa" font-size="13" ${FONT}>โมเดลทายแค่คำถัดไป แล้ววนใหม่ ไม่ได้พิมพ์ทั้งย่อหน้าในครั้งเดียว</text>
      ${shown
        .map((token, i) => tokenBox(48 + i * 120, 46, token.text, "มีแล้ว", token.color))
        .join("")}
      <rect class="d-glow" x="${48 + shown.length * 120}" y="46" width="100" height="52" rx="12" fill="rgba(244,63,94,0.16)" stroke="#fb7185" stroke-dasharray="5 4"/>
      <text x="${98 + shown.length * 120}" y="70" text-anchor="middle" fill="#fda4af" font-size="16" ${FONT}>?</text>
      <text x="${98 + shown.length * 120}" y="88" text-anchor="middle" fill="#fb7185" font-size="10" ${FONT}>กำลังทาย</text>
      <text x="520" y="68" fill="#94a3b8" font-size="12" ${FONT}>ดูคำล่าสุด แล้วเรียงคำที่อาจมาต่อ</text>
      <text x="520" y="88" fill="#64748b" font-size="11" ${FONT}>เลือกได้แค่หนึ่งคำต่อรอบ</text>
      <g class="d-fade d-d1">
        <rect x="48" y="128" width="430" height="168" rx="16" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)"/>
        <text x="68" y="154" fill="#e4e4e7" font-size="13" ${FONT}>คำที่อาจมาต่อ</text>
        ${bars}
      </g>
      <g class="d-fade d-d2">
        <rect x="500" y="128" width="230" height="168" rx="16" fill="rgba(99,102,241,0.1)" stroke="rgba(129,140,248,0.4)"/>
        <text x="615" y="164" text-anchor="middle" fill="#e0e7ff" font-size="13" ${FONT}>เลือก 1 คำ</text>
        <text x="615" y="196" text-anchor="middle" fill="#c7d2fe" font-size="18" ${FONT}>${svgEscape(pick?.text || "·")}</text>
        <text x="615" y="224" text-anchor="middle" fill="#a1a1aa" font-size="12" ${FONT}>ต่อท้ายแล้วทายใหม่</text>
        <text x="615" y="248" text-anchor="middle" fill="#94a3b8" font-size="12" ${FONT}>ไม่ต้องตั้งค่าในหน้านี้</text>
        <text x="615" y="272" text-anchor="middle" fill="#64748b" font-size="11" ${FONT}>จนกว่าจะจบคำตอบ</text>
      </g>
    </svg>
  `;
}

function tokenBox(x, y, label, sub, color) {
  return `<g>
    <rect x="${x}" y="${y}" width="108" height="52" rx="12" fill="${color}22" stroke="${color}"/>
    <text x="${x + 54}" y="${y + 24}" text-anchor="middle" fill="#fafafa" font-size="15" ${FONT}>${svgEscape(label)}</text>
    <text x="${x + 54}" y="${y + 42}" text-anchor="middle" fill="${color}" font-size="10" ${MONO}>${svgEscape(sub)}</text>
  </g>`;
}

function vectorBox(x, y, values, color, caption) {
  const rows = values
    .map(
      (value, i) =>
        `<text x="${x + 48}" y="${y + 22 + i * 18}" text-anchor="middle" fill="#d4d4d8" font-size="12" ${MONO}>${svgEscape(value)}</text>`
    )
    .join("");
  return `<g>
    <rect x="${x}" y="${y}" width="96" height="88" rx="12" fill="${color}18" stroke="${color}"/>
    ${rows}
    <text x="${x + 48}" y="${y + 104}" text-anchor="middle" fill="#71717a" font-size="11" ${FONT}>${svgEscape(caption)}</text>
  </g>`;
}

function probBar(x, y, width, pct, label, hot = false) {
  const color = hot ? "#34d399" : "#64748b";
  const bar = Math.max(12, Math.min(width, 250));
  return `<g>
    <text x="${x}" y="${y + 13}" fill="#e4e4e7" font-size="13" ${FONT}>${svgEscape(label)}</text>
    <rect x="${x + 78}" y="${y}" width="250" height="16" rx="8" fill="rgba(255,255,255,0.06)"/>
    <rect class="d-grow" x="${x + 78}" y="${y}" width="${bar}" height="16" rx="8" fill="${color}"/>
    <text x="${x + 338}" y="${y + 13}" fill="#a1a1aa" font-size="12" ${MONO}>${Math.round(pct * 100)}%</text>
  </g>`;
}

export function mountThinkLesson(container, index, lesson) {
  if (!container) return;
  const ctx = lesson || pickLessonTokens([], [], (v) => v);
  const source = ctx.fromUser ? "ใช้ Token จากข้อความที่คุณพิมพ์" : "ยังไม่มีข้อความพอ — ใช้ตัวอย่างในห้อง";
  container.innerHTML = `
    <div class="think-lab">
      <p class="think-disclaimer thai">${source}</p>
      <div class="think-highway glass panel p-3">${residualHighway(index)}</div>
      <div class="think-diagram glass panel p-3">${diagramForThink(index, ctx)}</div>
      <p class="teach-note thai"><span>หมายเหตุ</span> ข้อความและตัวเลขที่แสดง เป็นข้อมูลตัวอย่างประกอบการอธิบาย</p>
    </div>
  `;
}

export function mountModelPeek(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="think-lab">
      <div class="think-highway glass panel p-3">${residualHighway(-1)}</div>
      <div class="glass panel p-4 sm:p-5">
        <p class="help-kicker">ก่อนเข้าชั้นในโมเดล</p>
        <h3 class="thai text-base font-medium mt-2">ต่อไปโมเดลจะทายแค่คำถัดไป</h3>
        <p class="thai text-sm text-zinc-400 mt-2">ที่เหลือคือวิธีทำให้ทายได้ดีขึ้น ไม่ต้องตั้งค่าอะไรในขั้นนี้</p>
        <ol class="mt-3 space-y-2 thai text-sm text-zinc-300 leading-relaxed list-decimal pl-5">
          <li>เอาข้อความที่หั่นแล้วมาถามว่า คำต่อไปคืออะไร</li>
          <li>อ่านบริบท แล้วคิดต่อที่คำนั้น</li>
          <li>เลือกหนึ่งคำ ต่อท้าย แล้วทายใหม่จนกว่าจะจบ</li>
        </ol>
        <p class="teach-note thai mt-4"><span>หมายเหตุ</span> ข้อความและตัวเลขที่แสดง เป็นข้อมูลตัวอย่างประกอบการอธิบาย</p>
      </div>
    </div>
  `;
}
