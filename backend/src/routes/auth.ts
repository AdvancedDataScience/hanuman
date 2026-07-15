import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db";
import { signToken, requireAuth, AuthedRequest } from "../middleware/auth";

export const authRouter = Router();

const registerSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(9),
  email: z.string().email().optional(),
  password: z.string().min(6),
  role: z.enum(["PATIENT", "THERAPIST"]).default("PATIENT"),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { fullName, phone, email, password, role } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { phone } });
  if (exists) return res.status(409).json({ error: "เบอร์นี้ถูกใช้แล้ว" });

  const user = await prisma.user.create({
    data: {
      fullName,
      phone,
      email,
      role,
      passwordHash: await bcrypt.hash(password, 10),
      patientProfile: role === "PATIENT" ? { create: {} } : undefined,
    },
  });
  res.json({ token: signToken(user.id, user.role), user: { id: user.id, fullName, role } });
});

authRouter.post("/login", async (req, res) => {
  const { phone, password } = req.body ?? {};
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !(await bcrypt.compare(password ?? "", user.passwordHash))) {
    return res.status(401).json({ error: "เบอร์หรือรหัสผ่านไม่ถูกต้อง" });
  }
  res.json({
    token: signToken(user.id, user.role),
    user: { id: user.id, fullName: user.fullName, role: user.role },
  });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, fullName: true, role: true, loyaltyPoints: true },
  });
  res.json(user);
});
