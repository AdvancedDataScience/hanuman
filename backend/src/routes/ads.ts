import { Router } from "express";
import { prisma } from "../db";

export const adsRouter = Router();

// GET /ads?placement=home — ดึงโฆษณาสำหรับตำแหน่งที่กำหนด
adsRouter.get("/", async (req, res) => {
  const placement = (req.query.placement as string) ?? "home";
  const ads = await prisma.ad.findMany({ where: { active: true, placement } });
  // นับ impression
  await prisma.ad.updateMany({
    where: { id: { in: ads.map((a) => a.id) } },
    data: { impressions: { increment: 1 } },
  });
  res.json(ads);
});

// POST /ads/:id/click — นับคลิกโฆษณา
adsRouter.post("/:id/click", async (req, res) => {
  await prisma.ad.update({
    where: { id: req.params.id },
    data: { clicks: { increment: 1 } },
  });
  res.json({ ok: true });
});
