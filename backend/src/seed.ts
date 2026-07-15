import bcrypt from "bcryptjs";
import { prisma } from "./db";

async function main() {
  // กันข้อมูลซ้ำเวลา deploy ใหม่: ถ้ามีหมอนวดอยู่แล้วให้ข้าม
  const already = await prisma.therapistProfile.count();
  if (already > 0) {
    console.log("มีข้อมูลอยู่แล้ว ข้ามการ seed");
    return;
  }

  const pass = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { phone: "0800000000" },
    update: {},
    create: { fullName: "แอดมินหนุมาน", phone: "0800000000", role: "ADMIN", passwordHash: pass },
  });

  const patient = await prisma.user.upsert({
    where: { phone: "0811111111" },
    update: {},
    create: {
      fullName: "คุณนภา ใจดี",
      phone: "0811111111",
      role: "PATIENT",
      passwordHash: pass,
      lat: 13.7563,
      lng: 100.5018,
      patientProfile: { create: { defaultScheme: "SOCIAL_SECURITY" } },
      emergencyContacts: { create: { name: "คุณแม่", phone: "0822222222" } },
    },
  });

  const therapistsSeed = [
    {
      phone: "0900000001",
      name: "หมอสมพร ใจดี",
      emoji: "doctor-f",
      specialties: ["OFFICE_SYNDROME", "FROZEN_SHOULDER", "KNEE_OSTEOARTHRITIS", "RELAXATION"],
      rating: 4.9, reviews: 213, lat: 13.7565, lng: 100.5020, license: "พท.12345",
      services: [
        { title: "นวดคลายออฟฟิศซินโดรม 60 นาที", specialty: "OFFICE_SYNDROME", dur: 60, price: 450 },
        { title: "นวดราชสำนัก ประคบ 90 นาที", specialty: "OFFICE_SYNDROME", dur: 90, price: 650 },
        { title: "นวดผ่อนคลาย 60 นาที", specialty: "RELAXATION", dur: 60, price: 400 },
      ],
    },
    {
      phone: "0900000002",
      name: "หมอวิชัย มั่นคง",
      emoji: "doctor-m",
      specialties: ["PARESIS_PARALYSIS", "OFFICE_SYNDROME", "TRIGGER_FINGER"],
      rating: 4.8, reviews: 158, lat: 13.7600, lng: 100.5100, license: "พท.23456",
      services: [
        { title: "นวดฟื้นฟูอัมพฤกษ์ 60 นาที", specialty: "PARESIS_PARALYSIS", dur: 60, price: 600 },
        { title: "นวดคลายออฟฟิศซินโดรม 60 นาที", specialty: "OFFICE_SYNDROME", dur: 60, price: 400 },
      ],
    },
    {
      phone: "0900000003",
      name: "หมอกานดา อ่อนโยน",
      emoji: "doctor-f",
      specialties: ["RELAXATION", "KNEE_OSTEOARTHRITIS", "PIRIFORMIS"],
      rating: 4.7, reviews: 96, lat: 13.7700, lng: 100.5200, license: "พท.34567",
      services: [
        { title: "นวดผ่อนคลายน้ำมัน 60 นาที", specialty: "RELAXATION", dur: 60, price: 500 },
        { title: "นวดคลายสลักเพชร 60 นาที", specialty: "PIRIFORMIS", dur: 60, price: 550 },
      ],
    },
  ];

  for (const t of therapistsSeed) {
    const user = await prisma.user.upsert({
      where: { phone: t.phone },
      update: {},
      create: { fullName: t.name, phone: t.phone, role: "THERAPIST", passwordHash: pass },
    });
    const profile = await prisma.therapistProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: t.name,
        avatarEmoji: t.emoji,
        specialties: t.specialties as any,
        mophCertified: true,
        mophLicenseNo: t.license,
        mophVerifiedAt: new Date(),
        baseLat: t.lat,
        baseLng: t.lng,
        ratingAvg: t.rating,
        reviewCount: t.reviews,
        yearsExp: 8,
      },
    });
    for (const s of t.services) {
      await prisma.therapistService.create({
        data: {
          therapistId: profile.id,
          title: s.title,
          specialty: s.specialty as any,
          durationMin: s.dur,
          price: s.price,
        },
      });
    }
  }

  await prisma.coupon.upsert({
    where: { code: "HANU100" },
    update: {},
    create: { code: "HANU100", titleTh: "สมาชิกใหม่ลด 100 บาท", amountOff: 100, minSpend: 300 },
  });
  await prisma.coupon.upsert({
    where: { code: "NEXT15" },
    update: {},
    create: { code: "NEXT15", titleTh: "ส่วนลดนวดครั้งถัดไป 15%", percentOff: 15, pointCost: 200 },
  });

  await prisma.ad.create({
    data: { titleTh: "สมาชิกใหม่ลด 100 บาท", bodyTh: "ใช้โค้ด HANU100", placement: "home", targetUrl: "/register" },
  });
  await prisma.ad.create({
    data: { titleTh: "ลูกประคบสมุนไพรแท้ ส่งฟรีทั่วไทย", placement: "list", targetUrl: "/shop" },
  });

  console.log("Seed done - patient:", patient.phone);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
