/**
 * Model catalog, selection, and cost helpers.
 */

const FALLBACK_MODELS = [
  {
    id: "model-a",
    name: "Model A (GPT-4o style)",
    provider: "OpenAI-style",
    contextLimit: 128000,
    inputPricePerMillion: 2.5,
    outputPricePerMillion: 10.0,
    tokenizer: "o200k_base",
    color: "#6366f1",
    description: "สมดุลระหว่างความฉลาดกับความเร็ว — เหมาะกับงานทั่วไปในห้องเรียน",
  },
  {
    id: "model-b",
    name: "Model B (Claude Sonnet style)",
    provider: "Anthropic-style",
    contextLimit: 200000,
    inputPricePerMillion: 3.0,
    outputPricePerMillion: 15.0,
    tokenizer: "approximate",
    color: "#f59e0b",
    description: "เก่งด้านการให้เหตุผลและข้อความยาว — หน้าต่างบริบทกว้าง",
  },
  {
    id: "model-c",
    name: "Model C (GPT-4o mini style)",
    provider: "OpenAI-style",
    contextLimit: 128000,
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.6,
    tokenizer: "o200k_base",
    color: "#10b981",
    description: "ราคาประหยัด ความเร็วสูง — ใช้สอนเรื่องต้นทุนได้ชัดเจน",
  },
  {
    id: "model-d",
    name: "Model D (Claude Haiku style)",
    provider: "Anthropic-style",
    contextLimit: 200000,
    inputPricePerMillion: 0.8,
    outputPricePerMillion: 4.0,
    tokenizer: "approximate",
    color: "#22d3ee",
    description: "ตอบเร็ว ต้นทุนต่ำ เหมาะกับงานสั้นและตัวอย่างในชั้นเรียน",
  },
  {
    id: "model-e",
    name: "Model E (Gemini Pro style)",
    provider: "Google-style",
    contextLimit: 1048576,
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.0,
    tokenizer: "approximate",
    color: "#3b82f6",
    description: "หน้าต่างบริบทขนาดใหญ่มาก — ใช้สอนเรื่องเอกสารยาวและหลายไฟล์",
  },
  {
    id: "model-f",
    name: "Model F (หน้าต่างเล็ก)",
    provider: "Classroom",
    contextLimit: 4096,
    inputPricePerMillion: 0.5,
    outputPricePerMillion: 1.5,
    tokenizer: "o200k_base",
    color: "#f43f5e",
    description: "โมเดลจำลองหน้าต่างเล็ก สำหรับสอนข้อความที่ล้นอย่างเห็นภาพ",
  },
];

let models = [...FALLBACK_MODELS];

export async function loadModels() {
  try {
    const response = await fetch("data/models.json", { cache: "no-store" });
    if (!response.ok) throw new Error("models.json not found");
    const payload = await response.json();
    if (Array.isArray(payload.models) && payload.models.length) {
      models = payload.models;
    }
  } catch (error) {
    console.warn("Using built-in model catalog", error);
    models = [...FALLBACK_MODELS];
  }
  return models;
}

export function getModels() {
  return models;
}

export function getModelById(id) {
  return models.find((model) => model.id === id) ?? models[0];
}

export function calcCostUsd(tokenCount, pricePerMillion) {
  return (Number(tokenCount) / 1_000_000) * Number(pricePerMillion);
}

export function formatUsd(value) {
  if (!Number.isFinite(value)) return "$0.00";
  if (value === 0) return "$0.00";
  if (value < 0.0001) return "<$0.0001";
  if (value < 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(4)}`;
}

export function formatTokens(value) {
  return Number(value || 0).toLocaleString("en-US");
}

export function usagePercent(used, limit) {
  if (!limit) return 0;
  return Math.min(999, (used / limit) * 100);
}
