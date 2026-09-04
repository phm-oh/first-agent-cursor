# ContextFlow

เครื่องมือสื่อการเรียนการสอนสำหรับเรื่อง **Token**, **Context Window** และต้นทุนของโมเดลภาษา  
ออกแบบมาให้เดินเรื่องทีละขั้น นักเรียนที่ไม่เคยรู้เรื่อง Token ก็เห็นภาพรวมได้ใน 5–7 นาที

> Phase 4 (ปัจจุบัน): Animation เส้นทางข้อมูล, จำลองในโมเดล, Mock Response, หน้าต่างแชท  
> เปิดบนมือถือได้ผ่าน GitHub Pages หลัง deploy

## เปิดบนเว็บ (GitHub Pages)

หลังเปิด Pages ที่ repo แล้ว ใช้ลิงก์:

https://phm-oh.github.io/first-agent-cursor/

## เปิดบนเครื่องตัวเอง

เปิดด้วยเว็บเซิร์ฟเวอร์ในโฟลเดอร์โปรเจกต์ (ไม่เปิดเป็นไฟล์ตรง ๆ เพราะต้องโหลด JSON และโมดูล)

```bash
python3 -m http.server 8080
```

แล้วเปิด [http://localhost:8080](http://localhost:8080)

## ใช้ในห้องเรียน

1. กด **โหลดตัวอย่าง** หรือพิมพ์ System + User เอง
2. เลือกโมเดลด้านซ้าย สังเกตลิมิตคนละขนาด
3. กด **เริ่มกระบวนการ**
4. กด **Next →** เพื่อเดิน 9 ขั้น: Input → Tokenize → Context → ต้นทุน → ส่งเข้าโมเดล → คิด → ผลลัพธ์ → ขากลับ → แชท
5. กด **ย้อนกลับ** หรือคลิกจุดบนเส้นทางเพื่อทบทวนขั้นที่ผ่านมา
6. อยากสอนเรื่องล้นหน้าต่าง ให้กด **ตัวอย่าง Overflow** แล้วเริ่มกระบวนการ

ลัดคีย์บอร์ด: `Ctrl` / `⌘` + `Enter` เพื่อเริ่ม · ลูกศรซ้าย/ขวา เพื่อย้อน/ถัดไป

## สิ่งที่รองรับแล้ว

- ข้อความ System + User + Multi-turn
- ไฟล์ TXT, DOC, DOCX
- รูปภาพ (คิด Vision Token จากขนาดภาพ ไม่แปลเนื้อหา)
- Tokenizer: `js-tiktoken` (`o200k_base`) พร้อม fallback แบบประมาณค่า
- Overview Mode และ Token Detail แบบ Virtual Scroll
- โหมดกด Next ทีละ 9 ขั้น พร้อม Focus Mode
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
js/stages.js
js/animation.js
js/virtual-chips.js
data/models.json
data/templates.json
README.md
```

แก้รายการโมเดลได้ที่ `data/models.json`  
ชุดคำตอบจำลองอยู่ที่ `data/templates.json` (จะใช้เต็มใน Phase จำลองคำตอบ)

## แผนระยะถัดไป

- Phase 3: ตารางเปรียบเทียบหลายโมเดลและต้นทุนแบบละเอียด
- Phase 4: Animation เส้นทางข้อมูลเต็มรูปแบบ และปรับ Mock Response / แชทให้สมจริงขึ้น
- Phase 5: ตัวอย่างเพิ่ม และคู่มือครูฉบับเต็ม
