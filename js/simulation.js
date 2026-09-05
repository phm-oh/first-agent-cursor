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
    titleTh: "ติดป้ายส่งเข้า",
    titleEn: "Dispatch",
    caption:
      "ก่อนโมเดลอ่าน ระบบเขียนชื่อไว้ว่าข้อความไหนเป็นคำสั่งครู และข้อความไหนเป็นคำถามนักเรียน",
  },
  {
    id: 6,
    key: "think",
    titleTh: "ทายคำถัดไป",
    titleEn: "Think",
    caption:
      "โมเดลไม่ได้คิดทั้งย่อหน้าในครั้งเดียว แต่ทายทีละคำ แล้วต่อท้ายไปเรื่อย ๆ จนจบคำตอบ",
  },
  {
    id: 7,
    key: "output",
    titleTh: "พิมพ์คำตอบ",
    titleEn: "Output",
    caption: "คำที่ทายได้จะพิมพ์ขึ้นจอทีละคำ เหมือนคนพิมพ์ ไม่ใช่การวางทั้งย่อหน้าในครั้งเดียว",
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
