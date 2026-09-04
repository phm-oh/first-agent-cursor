/**
 * ContextFlow tokenizer
 * Uses js-tiktoken (o200k_base) when available, with a Thai-aware fallback.
 */

const TIKTOKEN_LITE =
  "https://cdn.jsdelivr.net/npm/js-tiktoken@1.0.21/dist/lite.js/+esm";
const TIKTOKEN_O200K =
  "https://cdn.jsdelivr.net/npm/js-tiktoken@1.0.21/dist/ranks/o200k_base.js/+esm";

let encoder = null;
let tokenizerMode = "approximate";
let initPromise = null;

export function getTokenizerMode() {
  return tokenizerMode;
}

export function initTokenizer() {
  if (initPromise) return initPromise;
  initPromise = loadTiktoken();
  return initPromise;
}

async function loadTiktoken() {
  try {
    const [{ Tiktoken }, ranksMod] = await Promise.all([
      import(TIKTOKEN_LITE),
      import(TIKTOKEN_O200K),
    ]);
    const ranks = ranksMod.default ?? ranksMod;
    encoder = new Tiktoken(ranks);
    tokenizerMode = "o200k_base";
    return tokenizerMode;
  } catch (error) {
    console.warn("js-tiktoken unavailable, using approximation", error);
    encoder = null;
    tokenizerMode = "approximate";
    return tokenizerMode;
  }
}

/**
 * Encode text into educational token pieces.
 * Each piece: { text, id, index }
 */
export function tokenizeText(text) {
  if (!text) return [];
  if (encoder) return tokenizeWithTiktoken(text);
  return tokenizeApproximate(text);
}

function tokenizeWithTiktoken(text) {
  const ids = encoder.encode(text);
  const pieces = [];
  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i];
    let decoded = "";
    try {
      decoded = encoder.decode([id]);
    } catch {
      decoded = `⟦${id}⟧`;
    }
    pieces.push({
      text: decoded,
      id,
      index: i,
    });
  }
  return pieces;
}

/**
 * Educational approximation:
 * - Latin words ≈ 1 token / 4 chars (min 1)
 * - Thai / CJK ≈ closer to 1 token / 1–2 chars
 * - Whitespace and punctuation stay visible as their own pieces
 */
function tokenizeApproximate(text) {
  const chunks = text.split(/(\s+|[.,!?;:()[\]{}"'`“”‘’…—–-])/u);
  const pieces = [];
  let index = 0;

  for (const chunk of chunks) {
    if (!chunk) continue;
    if (/^\s+$/.test(chunk) || /^[.,!?;:()[\]{}"'`“”‘’…—–-]+$/.test(chunk)) {
      pieces.push({ text: chunk, id: hashId(chunk), index: index++ });
      continue;
    }

    const thaiOrCjk = /[\u0E00-\u0E7F\u3040-\u30FF\u4E00-\u9FFF]/.test(chunk);
    const unit = thaiOrCjk ? 2 : 4;
    if (chunk.length <= unit) {
      pieces.push({ text: chunk, id: hashId(chunk), index: index++ });
      continue;
    }

    for (let i = 0; i < chunk.length; i += unit) {
      const slice = chunk.slice(i, i + unit);
      pieces.push({ text: slice, id: hashId(slice), index: index++ });
    }
  }

  return pieces;
}

function hashId(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function countTokens(text) {
  return tokenizeText(text).length;
}

/**
 * OpenAI-style vision token estimate from pixel dimensions.
 * Low detail: 85 tokens. High detail: 85 + 170 × tiles.
 */
export function estimateVisionTokens(width, height, detail = "high") {
  const w0 = Math.max(1, Number(width) || 1);
  const h0 = Math.max(1, Number(height) || 1);
  if (detail === "low") return 85;

  let widthPx = w0;
  let heightPx = h0;
  const longest = Math.max(widthPx, heightPx);
  if (longest > 2048) {
    const scale = 2048 / longest;
    widthPx *= scale;
    heightPx *= scale;
  }

  const shortest = Math.min(widthPx, heightPx);
  const fit = 768 / shortest;
  widthPx *= fit;
  heightPx *= fit;

  const tiles = Math.ceil(widthPx / 512) * Math.ceil(heightPx / 512);
  return 85 + 170 * tiles;
}

export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || file.type === "text/plain") {
    return file.text();
  }
  if (name.endsWith(".docx")) {
    const mammothLib = window.mammoth;
    if (!mammothLib) {
      throw new Error("ยังโหลดตัวอ่าน DOCX ไม่สำเร็จ ลองรีเฟรชหน้าแล้วเลือกไฟล์อีกครั้ง");
    }
    const buffer = await file.arrayBuffer();
    const result = await mammothLib.extractRawText({ arrayBuffer: buffer });
    return result.value || "";
  }
  if (name.endsWith(".doc")) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const asText = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const cleaned = asText
      .replace(/[^\x09\x0A\x0D\x20-\x7E\u0E00-\u0E7F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length < 20) {
      throw new Error(
        "ไฟล์ .doc แบบเก่าอ่านได้จำกัด กรุณาบันทึกเป็น .docx หรือ .txt"
      );
    }
    return cleaned;
  }
  throw new Error("รองรับเฉพาะไฟล์ TXT, DOC, และ DOCX");
}

export function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      resolve({ width, height, previewUrl: url });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ไม่สามารถอ่านรูปภาพได้"));
    };
    image.src = url;
  });
}

export function formatTokenPreview(text) {
  if (!text) return "·";
  return text
    .replace(/ /g, "␣")
    .replace(/\n/g, "↵")
    .replace(/\t/g, "⇥");
}
