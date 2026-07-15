import { Router } from "express";
import { prisma } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";

export const dashboardRouter = Router();

/**
 * GET /dashboard/overview — Dashboard ผลงานรวม + commission บริษัท
 * (เฉพาะ ADMIN)
 */
dashboardRouter.get(
  "/overview",
  requireAuth,
  requireRole("ADMIN"),
  async (_req, res) => {
    const paid = await prisma.payment.findMany({
      where: { status: { in: ["PAID", "REIMBURSEMENT_SUBMITTED"] } },
      include: { booking: true },
    });

    const gmv = paid.reduce((s, p) => s + p.amount, 0);
    const commission = paid.reduce((s, p) => s + p.commissionAmount, 0);
    const bookings = paid.length;

    // แยกตามวิธีชำระเงิน
    const byMethod: Record<string, number> = {};
    for (const p of paid) byMethod[p.method] = (byMethod[p.method] ?? 0) + 1;

    // คะแนนเฉลี่ยรวม
    const ratingAgg = await prisma.review.aggregate({ _avg: { rating: true } });

    res.json({
      gmv,
      commission,
      bookings,
      avgRating: Number((ratingAgg._avg.rating ?? 0).toFixed(2)),
      byMethod,
    });
  }
);

/**
 * GET /dashboard/by-area — สรุปผลงานแยกพื้นที่ (mock grouping ด้วย province ในที่อยู่)
 * ในระบบจริงควรมี field province/region ที่ index ไว้
 */
dashboardRouter.get(
  "/by-area",
  requireAuth,
  requireRole("ADMIN"),
  async (_req, res) => {
    // ตัวอย่าง: group ด้วย raw query ตาม address (production ควรใช้ region field)
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COALESCE(split_part("addressText", ' ', -1), 'ไม่ระบุ') AS area,
             COUNT(*)::int AS bookings,
             COALESCE(SUM("total"),0)::int AS gmv
      FROM "Booking"
      WHERE "status" = 'COMPLETED'
      GROUP BY area
      ORDER BY gmv DESC
    `);
    res.json(rows);
  }
);
