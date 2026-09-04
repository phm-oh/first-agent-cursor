/**
 * Classroom lesson prompts. Frontend-only; fetched from data/lessons.json.
 */

const FALLBACK_LESSONS = [
  {
    id: "token-basics",
    title: "Token คืออะไร",
    hint: "เริ่มต้นห้องเรียน · ไทยกับอังกฤษ",
    modelId: "model-a",
    system:
      "คุณเป็นผู้ช่วยสอนเรื่อง Token ของโมเดลภาษา ตอบกระชับ ชัดเจน และใช้ภาษาที่นักเรียนเข้าใจได้",
    turns: [
      {
        role: "user",
        content:
          "ช่วยอธิบายให้หน่อยว่า Token คืออะไร ต่างจากคำอย่างไร และทำไม Context Window ถึงสำคัญเมื่อเราคุยกับแชทบอท\n\nฉันอยากได้ตัวอย่างภาษาไทยกับภาษาอังกฤษสั้น ๆ เพื่อเอาไปสอนในห้องเรียน",
      },
    ],
  },
];

let lessons = [...FALLBACK_LESSONS];

export async function loadLessons() {
  try {
    const response = await fetch("data/lessons.json", { cache: "no-store" });
    if (!response.ok) throw new Error("lessons.json not found");
    const payload = await response.json();
    if (Array.isArray(payload.lessons) && payload.lessons.length) {
      lessons = payload.lessons;
    }
  } catch (error) {
    console.warn("Using built-in lessons", error);
    lessons = [...FALLBACK_LESSONS];
  }
  return lessons;
}

export function getLessons() {
  return lessons;
}

export function getLesson(id) {
  return lessons.find((item) => item.id === id) ?? lessons[0];
}
