import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { splitRevenue } from "../services/commission";
import {
  buildThaiQrPayload,
  chargeCard,
  createReimbursementClaim,
} from "../services/payment";

export const paymentsRouter = Router();

/**
 * POST /payments — เริ่มการชำระเงินสำหรับ booking หนึ่งครั้ง
 * body: { bookingId, method, cardToken?, scheme? }
 */
paymentsRouter.post("/", requireAuth, async (req, res) => {
  const { bookingId, method, cardToken, scheme } = req.body ?? {};

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return res.status(404).json({ error: "ไม่พบการจอง" });

  const split = splitRevenue(booking.servicePrice - booking.discount, booking.tipAmount);

  const base = {
    bookingId,
    method,
    amount: booking.total,
    commissionRate: split.commissionRate,
    commissionAmount: split.commissionAmount,
    therapistNet: split.therapistNet,
  };

  if (method === "THAI_QR") {
    const qrPayload = buildThaiQrPayload(booking.total);
    const payment = await prisma.payment.create({
      data: { ...base, status: "PENDING", qrPayload },
    });
    return res.json({ payment, qrPayload });
  }

  if (method === "CREDIT_CARD") {
    const result = await chargeCard(cardToken ?? "", booking.total);
    const payment = await prisma.payment.create({
      data: {
        ...base,
        status: result.ok ? "PAID" : "FAILED",
        gatewayRef: result.gatewayRef,
        paidAt: result.ok ? new Date() : null,
      },
    });
    if (result.ok) await prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });
    return res.json({ payment });
  }

  if (method === "GOVERNMENT_REIMBURSEMENT") {
    const claimRef = createReimbursementClaim(scheme ?? "CIVIL_SERVANT");
    const payment = await prisma.payment.create({
      data: { ...base, status: "REIMBURSEMENT_SUBMITTED", scheme, claimRef },
    });
    await prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });
    return res.json({ payment, claimRef });
  }

  res.status(400).json({ error: "วิธีชำระเงินไม่ถูกต้อง" });
});

/**
 * POST /payments/:id/confirm-qr — จำลอง webhook ยืนยันว่าจ่าย QR สำเร็จ
 * ใน production: endpoint นี้คือ webhook จากธนาคาร/ผู้ให้บริการ
 */
paymentsRouter.post("/:id/confirm-qr", async (req, res) => {
  const payment = await prisma.payment.update({
    where: { id: req.params.id },
    data: { status: "PAID", paidAt: new Date() },
  });
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "CONFIRMED" },
  });
  res.json(payment);
});
