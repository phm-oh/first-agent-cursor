# ContextFlow

เครื่องมือสื่อการเรียนการสอนสำหรับเรื่อง **Token**, **Context Window** และต้นทุนของโมเดลภาษา  
ออกแบบมาให้เดินเรื่องทีละขั้น นักเรียนที่ไม่เคยรู้เรื่อง Token ก็เห็นภาพรวมได้ใน 5–7 นาที

> Phase 1 (ปัจจุบัน): Foundation + Overview UI  
> ยังไม่เปิดโหมดกด Next ครบ 9 ขั้น — จะต่อใน Phase ถัดไป

## เปิดใช้งาน

เปิดด้วยเว็บเซิร์ฟเวอร์ในโฟลเดอร์โปรเจกต์ (ไม่เปิดเป็นไฟล์ตรง ๆ เพราะต้องโหลด JSON และโมดูล)

```bash
python3 -m http.server 8080
```

แล้วเปิด [http://localhost:8080](http://localhost:8080)

## ใช้ในห้องเรียน (Phase 1)

1. กด **โหลดตัวอย่าง** หรือพิมพ์ System + User เอง
2. เลือกโมเดลด้านซ้าย สังเกตลิมิตคนละขนาด
3. ดูแถบ Context Window ด้านขวา: สีม่วง = System, เขียว = User, ส้ม = ไฟล์, แดง = รูป
4. กด **ดู Token ทั้งหมด** เพื่อเห็นชิ้น Token
5. อยากสอนเรื่องล้นหน้าต่าง ให้กด **ตัวอย่าง Overflow** แล้วใช้ Model F (Teaching Mini)

ลัดคีย์บอร์ด: `Ctrl` / `⌘` + `Enter` เพื่อเริ่มกระบวนการ

## สิ่งที่รองรับแล้ว

- ข้อความ System + User + Multi-turn
- ไฟล์ TXT, DOC, DOCX
- รูปภาพ (คิด Vision Token จากขนาดภาพ ไม่แปลเนื้อหา)
- Tokenizer: `js-tiktoken` (`o200k_base`) พร้อม fallback แบบประมาณค่า
- Overview Mode และ Token Detail Mode พื้นฐาน
- Dark Mode เป็นค่าเริ่มต้น

## โครงสร้างไฟล์

```
index.html
css/style.css
js/app.js
js/tokenizer.js
js/models.js
js/mock.js
js/simulation.js
data/models.json
data/templates.json
README.md
```

แก้รายการโมเดลได้ที่ `data/models.json`  
ชุดคำตอบจำลองอยู่ที่ `data/templates.json` (จะใช้เต็มใน Phase จำลองคำตอบ)

## แผนระยะถัดไป

- Phase 2: กด Next ทีละขั้น + Token chips ที่ไม่รก + Virtual Scroll
- Phase 3: ตารางเปรียบเทียบหลายโมเดลและต้นทุน
- Phase 4: Animation เส้นทางข้อมูล, จำลองในโมเดล, Mock Response, หน้าต่างแชท
- Phase 5: คำอธิบายสอน, ตัวอย่างเพิ่ม, คู่มือครูฉบับเต็ม
