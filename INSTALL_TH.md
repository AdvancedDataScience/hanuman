# 🐒 หนุมาน — คู่มือติดตั้ง Step by step (สำหรับ macOS)

คู่มือนี้พาติดตั้งตั้งแต่ศูนย์จนรันได้ทั้ง backend + web + mobile
คำสั่งทั้งหมดพิมพ์ใน **Terminal** (เปิดด้วย `⌘ + Space` แล้วพิมพ์ "Terminal")

---

## ขั้นที่ 0 — เตรียมเครื่องมือ (ทำครั้งเดียว)

### 0.1 ติดตั้ง Homebrew (ตัวจัดการโปรแกรมของ Mac)
วางบรรทัดนี้ใน Terminal แล้วกด Enter (ถ้ามี Homebrew อยู่แล้วข้ามได้):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
เช็กว่าติดตั้งสำเร็จ:
```bash
brew --version
```

### 0.2 ติดตั้ง Node.js (เวอร์ชัน 20)
```bash
brew install node@20
node -v      # ควรได้ v20.x.x
npm -v       # ควรได้เลขเวอร์ชัน
```

### 0.3 ติดตั้ง Docker Desktop (ใช้รันฐานข้อมูล PostgreSQL)
```bash
brew install --cask docker
```
จากนั้น **เปิดแอป Docker** จาก Launchpad หนึ่งครั้ง รอจนไอคอนปลาวาฬมุมขวาบนนิ่ง (สถานะ running)
เช็ก:
```bash
docker --version
```

> ทางเลือกถ้าไม่อยากใช้ Docker: ติดตั้ง Postgres ตรงๆ ด้วย `brew install postgresql@16` แล้วข้ามขั้น 3

---

## ขั้นที่ 1 — เอาโค้ดโปรเจกต์มาไว้ในเครื่อง

แตกไฟล์ `hanuman_project.zip` ที่ได้รับ จะได้โฟลเดอร์ชื่อ `hanuman`
แล้ว `cd` เข้าไป (ลากโฟลเดอร์มาวางใน Terminal หลังพิมพ์ `cd ` ก็ได้):
```bash
cd ~/Downloads/hanuman      # เปลี่ยน path ตามที่วางไฟล์ไว้
ls                          # ควรเห็น backend  web  mobile  shared  package.json
```

---

## ขั้นที่ 2 — ติดตั้ง dependencies + สร้าง types ที่ใช้ร่วมกัน

```bash
npm install          # ติดตั้งทุก workspace พร้อมกัน (ใช้เวลาสักครู่)
npm run build:shared # สร้าง @hanuman/shared ให้ backend/web เรียกใช้ได้
```

---

## ขั้นที่ 3 — ตั้งค่า + เปิดฐานข้อมูล

คัดลอกไฟล์ตั้งค่า:
```bash
cp .env.example .env
```
เปิดฐานข้อมูล PostgreSQL ด้วย Docker (ต้องเปิดแอป Docker ไว้ก่อน):
```bash
npm run db:up        # ยก container postgres ขึ้นที่พอร์ต 5432
docker ps            # ควรเห็น hanuman-db สถานะ Up
```

---

## ขั้นที่ 4 — สร้างตาราง + ใส่ข้อมูลตัวอย่าง

```bash
npm run db:migrate   # สร้างตารางทั้งหมดจาก schema (ครั้งแรกจะถามชื่อ ตอบ Enter ได้)
npm run db:seed      # ใส่หมอนวด 3 คน คูปอง โฆษณา และบัญชีตัวอย่าง
```
ถ้าสำเร็จจะขึ้นข้อความ `✅ Seed สำเร็จ ...`

---

## ขั้นที่ 5 — รันแอป (เปิด Terminal แยกแท็บ/หน้าต่างสำหรับแต่ละตัว)

เปิดแท็บใหม่ใน Terminal ด้วย `⌘ + T`

**แท็บ 1 — Backend (เซิร์ฟเวอร์ API):**
```bash
cd ~/Downloads/hanuman
npm run dev:backend
```
สำเร็จเมื่อขึ้น `🐒 หนุมาน API running on http://localhost:4000`
ทดสอบเปิดในเบราว์เซอร์: <http://localhost:4000/health>

**แท็บ 2 — Web (เว็บแอป):**
```bash
cd ~/Downloads/hanuman
npm run dev:web
```
เปิดเบราว์เซอร์ที่ <http://localhost:5173>

**แท็บ 3 — Mobile (iOS/Android ผ่าน Expo):**
```bash
cd ~/Downloads/hanuman
npm run dev:mobile
```
จะขึ้น QR code — ติดตั้งแอป **Expo Go** จาก App Store / Play Store บนมือถือ
แล้วสแกน QR (iOS สแกนด้วยกล้อง, Android สแกนในแอป Expo Go)
มือถือกับคอมต้องอยู่ Wi-Fi เดียวกัน

---

## ขั้นที่ 6 — ลองใช้งาน

บัญชีตัวอย่าง (รหัสผ่านทั้งหมด `password123`):

| บทบาท | เบอร์ (username) |
|-------|------------------|
| ผู้ป่วย | 0811111111 |
| หมอนวด | 0900000001 |
| แอดมิน (ดู Dashboard) | 0800000000 |

ลองกด "บอกอาการ" เลือกอาการ → กดวินิจฉัย → ดูรายชื่อหมอนวด

---

## ปิดงาน / เปิดใหม่วันหลัง

- หยุดแอปแต่ละตัว: กด `Ctrl + C` ในแท็บนั้น
- หยุดฐานข้อมูล: `docker compose stop`
- วันหลังเปิดใหม่: `npm run db:up` แล้วรันขั้นที่ 5 ได้เลย (ไม่ต้อง install/migrate ซ้ำ)

---

## แก้ปัญหาที่พบบ่อย

| อาการ | วิธีแก้ |
|-------|--------|
| `Cannot find module '@hanuman/shared'` | ยังไม่ได้รัน `npm run build:shared` — รันแล้วลองใหม่ |
| `Can't reach database server at localhost:5432` | Docker ยังไม่เปิด หรือยังไม่ได้ `npm run db:up` |
| เว็บขึ้น "เชื่อมต่อ API ไม่ได้" | ยังไม่ได้รัน backend (แท็บ 1) หรือ backend ล่ม |
| `port 4000 already in use` | มีโปรเซสเก่าค้าง — ปิดด้วย `Ctrl+C` หรือ `lsof -ti:4000 \| xargs kill` |
| มือถือสแกน QR แล้วโหลดไม่ขึ้น | เช็กว่ามือถือกับคอมอยู่ Wi-Fi เดียวกัน และแก้ `EXPO_PUBLIC_API_URL` ใน `.env` เป็น IP ของคอม (เช่น `http://192.168.1.10:4000`) แทน localhost |

> เจอ error ไหนที่ไม่อยู่ในตาราง ให้ก็อป error ทั้งบรรทัดมาถามได้เลย
