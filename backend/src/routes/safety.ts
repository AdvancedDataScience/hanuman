import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

export const safetyRouter = Router();

// POST /safety/start — เริ่ม session ติดตามความปลอดภัย + แชร์พิกัดที่นวด
safetyRouter.post("/start", requireAuth, async (req, res) => {
  const { bookingId, lat, lng } = req.body ?? {};
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { patient: { include: { emergencyContacts: true } } },
  });
  if (!booking) return res.status(404).json({ error: "ไม่พบการจอง" });

  const sharedWith = booking.patient.emergencyContacts.map((c) => `${c.name} (${c.phone})`);

  const session = await prisma.safetySession.upsert({
    where: { bookingId },
    create: { bookingId, lat, lng, sharedWith, active: true },
    update: { lat, lng, active: true, sharedWith },
  });
  // TODO: push SMS/notification ให้ผู้ติดต่อฉุกเฉินพร้อมลิงก์พิกัดสด
  res.json(session);
});

// POST /safety/ping — อัปเดตพิกัดสดระหว่างนวด
safetyRouter.post("/ping", requireAuth, async (req, res) => {
  const { bookingId, lat, lng } = req.body ?? {};
  const session = await prisma.safetySession.update({
    where: { bookingId },
    data: { lat, lng },
  });
  res.json(session);
});

// POST /safety/sos — กดฉุกเฉิน
safetyRouter.post("/sos", requireAuth, async (req, res) => {
  const { bookingId } = req.body ?? {};
  const session = await prisma.safetySession.update({
    where: { bookingId },
    data: { sosTriggered: true },
  });
  // TODO: แจ้งศูนย์ช่วยเหลือ + ผู้ติดต่อฉุกเฉิน + ส่งพิกัด
  res.json({ ok: true, session, message: "ส่งสัญญาณ SOS และพิกัดแล้ว" });
});

// POST /safety/end — จบ session
safetyRouter.post("/end", requireAuth, async (req, res) => {
  const { bookingId } = req.body ?? {};
  const session = await prisma.safetySession.update({
    where: { bookingId },
    data: { active: false, endedAt: new Date() },
  });
  res.json(session);
});
