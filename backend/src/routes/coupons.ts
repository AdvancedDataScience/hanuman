import { Router } from "express";
import { prisma } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

export const couponsRouter = Router();

// GET /coupons/wallet — คูปองในกระเป๋าของฉัน
couponsRouter.get("/wallet", requireAuth, async (req: AuthedRequest, res) => {
  const wallet = await prisma.couponWallet.findMany({
    where: { userId: req.userId, used: false },
    include: { coupon: true },
  });
  res.json(wallet);
});

// POST /coupons/redeem — แลกคูปองด้วยแต้มสะสม
couponsRouter.post("/redeem", requireAuth, async (req: AuthedRequest, res) => {
  const { couponId } = req.body ?? {};
  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon || coupon.pointCost == null) {
    return res.status(400).json({ error: "คูปองนี้แลกด้วยแต้มไม่ได้" });
  }
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || user.loyaltyPoints < coupon.pointCost) {
    return res.status(400).json({ error: "แต้มสะสมไม่พอ" });
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: req.userId },
      data: { loyaltyPoints: { decrement: coupon.pointCost } },
    }),
    prisma.couponWallet.create({ data: { userId: req.userId!, couponId } }),
  ]);
  res.json({ ok: true });
});

// POST /coupons/validate — ตรวจโค้ดตอนชำระเงิน
couponsRouter.post("/validate", async (req, res) => {
  const { code, subtotal = 0 } = req.body ?? {};
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) return res.status(404).json({ error: "ไม่พบคูปอง" });
  if (subtotal < coupon.minSpend)
    return res.status(400).json({ error: `ต้องมียอดขั้นต่ำ ${coupon.minSpend} บาท` });
  const discount = coupon.percentOff
    ? Math.round((subtotal * coupon.percentOff) / 100)
    : coupon.amountOff ?? 0;
  res.json({ couponId: coupon.id, discount, titleTh: coupon.titleTh });
});
