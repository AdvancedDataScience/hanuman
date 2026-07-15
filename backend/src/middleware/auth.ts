import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthedRequest extends Request {
  userId?: string;
  role?: string;
}

export function signToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: "30d" });
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "ต้องเข้าสู่ระบบก่อน" });
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as {
      userId: string;
      role: string;
    };
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "โทเคนไม่ถูกต้องหรือหมดอายุ" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึง" });
    }
    next();
  };
}
