import { Router } from "express";
import { prisma } from "../db";
import { distanceKm } from "../services/geo";
import { Specialty } from "@hanuman/shared";

export const therapistsRouter = Router();

/**
 * GET /therapists?specialty=OFFICE_SYNDROME&lat=..&lng=..&sort=distance|rating|price
 * คืนหมอนวดที่ได้รับการรับรอง สธ. เรียงตามใกล้/รีวิว/ราคา
 */
therapistsRouter.get("/", async (req, res) => {
  const specialty = req.query.specialty as Specialty | undefined;
  const lat = req.query.lat ? Number(req.query.lat) : undefined;
  const lng = req.query.lng ? Number(req.query.lng) : undefined;
  const sort = (req.query.sort as string) ?? "rating";

  const therapists = await prisma.therapistProfile.findMany({
    where: {
      mophCertified: true,
      ...(specialty ? { specialties: { has: specialty } } : {}),
    },
    include: { services: { where: { active: true } } },
  });

  let items = therapists.map((t) => {
    const startingPrice = t.services.length
      ? Math.min(...t.services.map((s) => s.price))
      : 0;
    const dist =
      lat != null && lng != null && t.baseLat != null && t.baseLng != null
        ? distanceKm(lat, lng, t.baseLat, t.baseLng)
        : undefined;
    return {
      id: t.id,
      displayName: t.displayName,
      avatarEmoji: t.avatarEmoji,
      specialties: t.specialties,
      rating: t.ratingAvg,
      reviewCount: t.reviewCount,
      distanceKm: dist,
      mophCertified: t.mophCertified,
      startingPrice,
    };
  });

  items.sort((a, b) => {
    if (sort === "distance") return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    if (sort === "price") return a.startingPrice - b.startingPrice;
    return b.rating - a.rating; // default rating
  });

  res.json(items);
});

// GET /therapists/:id — โปรไฟล์เต็ม
therapistsRouter.get("/:id", async (req, res) => {
  const t = await prisma.therapistProfile.findUnique({
    where: { id: req.params.id },
    include: {
      services: { where: { active: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!t) return res.status(404).json({ error: "ไม่พบหมอนวด" });
  res.json(t);
});
