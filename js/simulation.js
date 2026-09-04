/**
 * Step-by-step simulation curriculum.
 */

export const TOTAL_STEPS = 9;

export const STEPS = [
  {
    id: 1,
    key: "input",
    titleTh: "รับข้อความ",
    titleEn: "Input",
    caption:
      "ทุกอย่างเริ่มจากสิ่งที่คุณใส่: ข้อความระบบ ข้อความผู้ใช้ ไฟล์ และรูปภาพ",
  },
  {
    id: 2,
    key: "tokenize",
    titleTh: "หั่นเป็น Token",
    titleEn: "Tokenize",
    caption:
      "โมเดลไม่อ่านเป็นประโยค แต่หั่นข้อความเป็น Token ซึ่งเป็นหน่วยเล็กที่สุดที่โมเดลเข้าใจ",
  },
  {
    id: 3,
    key: "context",
    titleTh: "หน้าต่างบริบท",
    titleEn: "Context",
    caption:
      "Token ทั้งหมดถูกจัดเข้าหน้าต่างบริบท ถ้าเต็ม ส่วนที่ล้นจะอยู่นอกความจำของโมเดล",
  },
  {
    id: 4,
    key: "cost",
    titleTh: "คิดราคา",
    titleEn: "Cost",
    caption:
      "เทียบราคาข้อความเข้าและคำตอบออกของทุกโมเดลจาก Token รอบนี้ — รุ่นถูกสุดถูกทำเครื่องหมายไว้",
  },
  {
    id: 5,
    key: "dispatch",
    titleTh: "ส่งเข้าโมเดล",
    titleEn: "Dispatch",
    caption:
      "ก่อนเข้าโมเดล ระบบจะจัดเรียงข้อความและใส่เครื่องหมายพิเศษ เพื่อให้โมเดลอ่านลำดับได้",
  },
  {
    id: 6,
    key: "think",
    titleTh: "ในโมเดล",
    titleEn: "Think",
    caption:
      "หัวใจที่ใช้สอน: ทาย Token ถัดไป — แปลงรหัสเป็นจุด อ่านบริบทในหน้าต่าง คิดต่อที่ช่องนั้น แล้วเลือกตัวต่อไป",
  },
  {
    id: 7,
    key: "output",
    titleTh: "สร้างคำตอบ",
    titleEn: "Output",
    caption: "คำตอบที่เห็นประกอบจาก Token ของคำตอบทีละตัว ไม่ใช่การคัดลอกข้อความเข้าทั้งก้อน",
  },
  {
    id: 8,
    key: "return",
    titleTh: "นับคำตอบ",
    titleEn: "Return",
    caption: "คำตอบก็มี Token และราคาเช่นกัน รวมกับข้อความเข้าจึงเป็นต้นทุนทั้งหมดของรอบนี้",
  },
  {
    id: 9,
    key: "chat",
    titleTh: "กลับสู่แชท",
    titleEn: "Chat",
    caption: "ผู้ใช้เห็นเพียงบทสนทนา แต่เบื้องหลังคือ Token หน้าต่างบริบท และต้นทุนทั้งเข้าและออก",
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
