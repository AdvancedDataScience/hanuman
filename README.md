# 🐒 หนุมาน (Hanuman)

แพลตฟอร์มจับคู่ผู้ป่วย/ผู้สูงอายุกับ **หมอนวดแผนไทยที่ได้รับการรับรองจากกระทรวงสาธารณสุข** —
วินิจฉัยแผนไทยเบื้องต้นจากอาการ แนะนำหมอที่ชำนาญตรงอาการในพื้นที่ใกล้เคียง จองคิว ชำระเงิน
(Thai QR / บัตรเครดิต / เบิกราชการ-กองทุน) รีวิว ทิป คูปอง ติดตามความปลอดภัย และ Dashboard
สำหรับผู้บริหารพร้อมการรวบรวมคอมมิชชั่นเข้าบริษัท

โครงโค้ดนี้เป็น **monorepo** ที่ครอบคลุมทั้ง 3 แพลตฟอร์มจาก codebase เดียว:

| ส่วน | เทคโนโลยี | โฟลเดอร์ |
|------|-----------|----------|
| Backend API | Node + Express + TypeScript + Prisma + PostgreSQL | `backend/` |
| เว็บ | React + Vite + TypeScript | `web/` |
| มือถือ (iOS + Android) | React Native + Expo + TypeScript | `mobile/` |
| ชนิดข้อมูลร่วม | TypeScript | `shared/` |

## ฟีเจอร์ที่ครอบคลุม (ทั้งหมดมี endpoint/โมเดลรองรับ)

- **วินิจฉัยแผนไทยเบื้องต้น** — rule engine แม็ปอาการ → 8 ความชำนาญ (ออฟฟิศซินโดรม, หัวไหล่ติด,
  นิ้วล็อก, สลักเพชรจม, หมอนรองกระดูกทับเส้นประสาท, อัมพฤกษ์ อัมพาต, ข้อเข่าเสื่อม, นวดผ่อนคลาย)
  พร้อมคำเตือนให้พบแพทย์ในอาการกลุ่มเสี่ยง — `backend/src/services/diagnosis.ts`
- **หมอนวดที่ สธ.รับรอง + ตั้งราคาเอง** — โมเดล `TherapistProfile` (mophCertified, license) และ
  `TherapistService` (ราคาที่หมอกำหนดเอง) ค้นหาเรียงตามใกล้/รีวิว/ราคา
- **ชำระเงิน 3 ช่องทาง** — Thai QR/พร้อมเพย์ (`promptpay-qr`), บัตรเครดิต (stub gateway),
  เบิกราชการ/กองทุน (ข้าราชการ, สปส., สปสช., กองทุนฟื้นฟู) — `backend/src/routes/payments.ts`
- **รีวิว + ทิป + คูปอง + แต้มสะสม** — `routes/reviews.ts`, `routes/coupons.ts`
- **ติดตามความปลอดภัย** — แชร์พิกัดสด, ผู้ติดต่อฉุกเฉิน, ปุ่ม SOS — `routes/safety.ts`
- **ระบบโฆษณา** — โมเดล `Ad` นับ impression/click ตาม placement — `routes/ads.ts`
- **Dashboard + คอมมิชชั่น** — GMV, commission บริษัท, แยกพื้นที่, สัดส่วนการจ่ายเงิน —
  `routes/dashboard.ts`, `services/commission.ts`

## เริ่มใช้งาน (Quick start)

```bash
# 0) ติดตั้ง dependencies ทั้ง workspace
npm install

# 1) เปิดฐานข้อมูล PostgreSQL (ต้องมี Docker)
cp .env.example .env
npm run db:up

# 2) สร้างตารางและ seed ข้อมูลตัวอย่าง (หมอ 3 คน, คูปอง, โฆษณา)
npm run build:shared
npm run db:migrate
npm run db:seed

# 3) รัน backend (http://localhost:4000)
npm run dev:backend

# 4) รันเว็บ (http://localhost:5173)
npm run dev:web

# 5) รันมือถือ (Expo — สแกน QR ด้วยแอป Expo Go บน iOS/Android)
npm run dev:mobile
```

บัญชีตัวอย่างหลัง seed: ผู้ป่วย `0811111111`, หมอนวด `0900000001`, แอดมิน `0800000000`
(รหัสผ่านทั้งหมด `password123`).

## แผนผัง API (สรุป)

```
POST /auth/register · /auth/login · GET /auth/me
POST /diagnosis                         วินิจฉัยจากอาการ
GET  /therapists?specialty=&sort=       ค้นหาหมอ (rating|distance|price)
GET  /therapists/:id                    โปรไฟล์เต็ม
POST /bookings · GET /bookings/mine     จองคิว
POST /payments · /payments/:id/confirm-qr   ชำระเงิน 3 ช่องทาง
POST /reviews                           รีวิว + ทิป + แต้ม
GET  /coupons/wallet · POST /coupons/redeem · /coupons/validate
POST /safety/start · /ping · /sos · /end    ติดตามความปลอดภัย
GET  /ads?placement= · POST /ads/:id/click  โฆษณา
GET  /dashboard/overview · /dashboard/by-area   (ADMIN)
```

## หมายเหตุ (จาก scaffold → production)

โครงนี้เน้นโครงสร้างและ business logic ที่ถูกต้อง ก่อนขึ้น production ควรทำเพิ่ม:
ต่อ payment gateway จริง (Omise/2C2P) และ webhook, ต่อระบบเบิกจ่ายภาครัฐจริง, เพิ่ม
push notification/SMS ให้ระบบ SafetySession, เพิ่ม field `region/province` เพื่อ Dashboard
แยกพื้นที่ที่แม่นยำ, และเพิ่มการยืนยันใบอนุญาต สธ. อัตโนมัติ รวมถึง test suite และ CI/CD

> ⚠️ การวินิจฉัยในแอปเป็นการคัดกรองเบื้องต้นตามอาการ ไม่ทดแทนการวินิจฉัยของแพทย์
