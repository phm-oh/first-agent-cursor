/**
 * Mock response engine — template-based, with variation and safe fallbacks.
 * Full simulation of output happens in a later phase; this module is ready now.
 */

const FALLBACK_TEMPLATES = {
  tones: ["formal", "friendly"],
  lengths: ["short", "medium", "long"],
  structures: ["paragraphs", "bullets", "numbered", "table"],
  templates: [],
  fallbacks: {
    empty: "ยังไม่มีข้อมูลเพียงพอสำหรับสร้างคำตอบจำลอง",
    veryShort: "จากข้อความสั้น ๆ ที่ได้รับ ประเด็นหลักคือ {{topic}}",
    veryLong:
      "เนื่องจากข้อมูลค่อนข้างยาว จึงสรุปเฉพาะแกนหลัก: {{topic}} โดยเน้นที่ {{keyword}}",
  },
};

let catalog = FALLBACK_TEMPLATES;

export async function loadTemplates() {
  try {
    const response = await fetch("data/templates.json", { cache: "no-store" });
    if (!response.ok) throw new Error("templates.json not found");
    catalog = await response.json();
  } catch (error) {
    console.warn("Using built-in templates", error);
    catalog = FALLBACK_TEMPLATES;
  }
  return catalog;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function extractKeywords(text) {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return { topic: "ข้อมูลที่ได้รับ", keyword: "บริบท", takeaway: "ยังไม่มีสาระพอสรุป" };
  }
  const words = cleaned.split(" ").filter(Boolean);
  const topic = words.slice(0, 6).join(" ");
  const mid = Math.max(0, Math.floor(words.length / 2) - 2);
  const keyword = words.slice(mid, mid + 4).join(" ") || topic;
  const takeaway = words.slice(-8).join(" ");
  return { topic, keyword, takeaway };
}

function fill(template, vars) {
  return template
    .replaceAll("{{topic}}", vars.topic)
    .replaceAll("{{keyword}}", vars.keyword)
    .replaceAll("{{takeaway}}", vars.takeaway);
}

export function generateMockResponse(inputText, options = {}) {
  const text = (inputText || "").trim();
  if (!text) return catalog.fallbacks.empty;

  const vars = extractKeywords(text);
  const charCount = text.length;

  if (charCount < 24) {
    return fill(catalog.fallbacks.veryShort, vars);
  }

  const templates = catalog.templates || [];
  if (!templates.length) {
    return fill(catalog.fallbacks.veryLong, vars);
  }

  const length =
    options.length ||
    (charCount > 800 ? "short" : pick(catalog.lengths || ["medium"]));
  const tone = options.tone || pick(catalog.tones || ["formal"]);
  const template = pick(templates);
  const body = template?.tones?.[tone]?.[length];

  if (!body) return fill(catalog.fallbacks.veryLong, vars);
  return fill(body, vars);
}

export function getTemplateCatalog() {
  return catalog;
}
