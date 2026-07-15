import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

export const reviewsRouter = Router();

const schema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  tipAmount: z.number().int().min(0).optional(),
});

// POST /reviews — ให้คะแนน + ทิป (หลังนวดเสร็จ)
reviewsRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { bookingId, rating, comment, tipAmount = 0 } = parsed.data;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return res.status(404).json({ error: "ไม่พบการจอง" });

  const review = await prisma.review.create({
    data: {
      bookingId,
      authorId: req.userId!,
      therapistId: booking.therapistId,
      rating,
      comment,
    },
  });

  // อัปเดตทิป + สถานะ
  if (tipAmount > 0) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { tipAmount, total: booking.total + tipAmount, status: "COMPLETED" },
    });
  } else {
    await prisma.booking.update({ where: { id: bookingId }, data: { status: "COMPLETED" } });
  }

  // คำนวณค่าเฉลี่ยรีวิวใหม่ของหมอ
  const agg = await prisma.review.aggregate({
    where: { therapistId: booking.therapistId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.therapistProfile.update({
    where: { id: booking.therapistId },
    data: {
      ratingAvg: Number((agg._avg.rating ?? 0).toFixed(2)),
      reviewCount: agg._count,
    },
  });

  // สะสมแต้มให้ผู้ใช้ (รีวิว = 20 แต้ม)
  await prisma.user.update({
    where: { id: req.userId },
    data: { loyaltyPoints: { increment: 20 } },
  });

  res.json({ review, pointsEarned: 20 });
});
