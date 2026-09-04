/**
 * Step-by-step simulation curriculum.
 */

export const TOTAL_STEPS = 9;

export const STEPS = [
  {
    id: 1,
    key: "input",
    titleTh: "รับ Input",
    titleEn: "Input",
    caption:
      "ทุกอย่างเริ่มจากข้อมูลที่คุณใส่: ข้อความระบบ, ข้อความผู้ใช้, ไฟล์ และรูปภาพ",
  },
  {
    id: 2,
    key: "tokenize",
    titleTh: "Tokenization",
    titleEn: "Tokenize",
    caption:
      "โมเดลไม่อ่านเป็นประโยค แต่หั่นข้อความเป็น Token ซึ่งเป็นหน่วยเล็กที่สุดที่โมเดลเข้าใจ",
  },
  {
    id: 3,
    key: "context",
    titleTh: "Context Window",
    titleEn: "Context",
    caption:
      "Token ทั้งหมดถูกจัดเข้า Context Window หากเต็ม ส่วนที่ล้นจะอยู่นอกความจำของโมเดล",
  },
  {
    id: 4,
    key: "cost",
    titleTh: "ต้นทุนโมเดล",
    titleEn: "Cost",
    caption:
      "เทียบราคา Input และ Output ของทุกโมเดลจาก Token รอบนี้ — รุ่นถูกสุดถูกไฮไลต์",
  },
  {
    id: 5,
    key: "dispatch",
    titleTh: "เตรียมส่งเข้า LLM",
    titleEn: "Dispatch",
    caption:
      "ก่อนเข้าโมเดล ระบบจะเพิ่ม Special Tokens และจัดเรียงข้อความเป็นลำดับที่โมเดลอ่านได้",
  },
  {
    id: 6,
    key: "think",
    titleTh: "ประมวลผลในโมเดล",
    titleEn: "Think",
    caption:
      "ห้องแล็บสอนเรื่องเดียว: ทาย Token ถัดไป — Embed อ่านรหัส, Attention อ่านหน้าต่าง, FFN คิดต่อ, แล้วเลือกตัวต่อไป",
  },
  {
    id: 7,
    key: "output",
    titleTh: "สร้างผลลัพธ์",
    titleEn: "Output",
    caption: "คำตอบที่เห็นคือข้อความที่ประกอบจาก Token ของขาออก ไม่ใช่การคัดลอก Input ทั้งก้อน",
  },
  {
    id: 8,
    key: "return",
    titleTh: "Tokenize ขากลับ",
    titleEn: "Return",
    caption: "ขาออกก็มี Token และราคาเช่นกัน รวมกับขาเข้าจึงเป็นต้นทุนทั้งหมดของรอบนี้",
  },
  {
    id: 9,
    key: "chat",
    titleTh: "กลับสู่หน้าต่างแชท",
    titleEn: "Chat",
    caption: "ผู้ใช้เห็นเพียงบทสนทนา แต่เบื้องหลังคือ Token, Context และต้นทุนทั้งขามา-ขากลับ",
  },
];

export function createSimulation() {
  return {
    current: 0,
    started: false,
    snapshot: null,
  };
}

export function startSimulation(sim, snapshot) {
  return {
    ...sim,
    started: true,
    current: 1,
    snapshot,
  };
}

export function goNext(sim) {
  if (!sim.started) return sim;
  return { ...sim, current: Math.min(TOTAL_STEPS, sim.current + 1) };
}

export function goBack(sim) {
  if (!sim.started) return sim;
  return { ...sim, current: Math.max(1, sim.current - 1) };
}

export function resetSimulation() {
  return createSimulation();
}

export function getStep(index) {
  return STEPS.find((step) => step.id === index) ?? null;
}
