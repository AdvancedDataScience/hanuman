import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

export const bookingsRouter = Router();

const createSchema = z.object({
  therapistId: z.string(),
  serviceId: z.string(),
  mode: z.enum(["HOME_VISIT", "IN_CLINIC"]),
  scheduledAt: z.string(), // ISO
  addressText: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  couponCode: z.string().optional(),
});

// POST /bookings — สร้างการจอง (ยังไม่ชำระเงิน)
bookingsRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;

  const service = await prisma.therapistService.findUnique({ where: { id: d.serviceId } });
  if (!service) return res.status(404).json({ error: "ไม่พบบริการ" });

  const travelFee = d.mode === "HOME_VISIT" ? 50 : 0;

  // ตรวจคูปอง
  let discount = 0;
  let couponId: string | undefined;
  if (d.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: d.couponCode } });
    if (coupon && coupon.active) {
      const base = service.price + travelFee;
      if (base >= coupon.minSpend) {
        discount = coupon.percentOff
          ? Math.round((base * coupon.percentOff) / 100)
          : coupon.amountOff ?? 0;
        couponId = coupon.id;
      }
    }
  }

  const total = service.price + travelFee - discount;

  const booking = await prisma.booking.create({
    data: {
      patientId: req.userId!,
      therapistId: d.therapistId,
      serviceId: d.serviceId,
      mode: d.mode,
      scheduledAt: new Date(d.scheduledAt),
      addressText: d.addressText,
      lat: d.lat,
      lng: d.lng,
      servicePrice: service.price,
      travelFee,
      discount,
      couponId,
      total,
      status: "PENDING_PAYMENT",
    },
  });

  res.json(booking);
});

// GET /bookings/mine — การจองของฉัน
bookingsRouter.get("/mine", requireAuth, async (req: AuthedRequest, res) => {
  const items = await prisma.booking.findMany({
    where: { patientId: req.userId },
    orderBy: { createdAt: "desc" },
    include: { therapist: true, service: true, payment: true },
  });
  res.json(items);
});
