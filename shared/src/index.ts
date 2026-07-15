// ---------------------------------------------------------------------------
// @hanuman/shared — domain types shared across backend, web and mobile
// ---------------------------------------------------------------------------

/** ความชำนาญของหมอนวดแผนไทย */
export enum Specialty {
  OFFICE_SYNDROME = "OFFICE_SYNDROME", // ออฟฟิศซินโดรม
  FROZEN_SHOULDER = "FROZEN_SHOULDER", // หัวไหล่ติด
  TRIGGER_FINGER = "TRIGGER_FINGER", // นิ้วล็อก
  PIRIFORMIS = "PIRIFORMIS", // สลักเพชรจม
  HERNIATED_DISC = "HERNIATED_DISC", // หมอนรองกระดูกทับเส้นประสาท
  PARESIS_PARALYSIS = "PARESIS_PARALYSIS", // อัมพฤกษ์ อัมพาต
  KNEE_OSTEOARTHRITIS = "KNEE_OSTEOARTHRITIS", // ข้อเข่าเสื่อม
  RELAXATION = "RELAXATION", // นวดผ่อนคลาย
}

export const SPECIALTY_LABEL_TH: Record<Specialty, string> = {
  [Specialty.OFFICE_SYNDROME]: "ออฟฟิศซินโดรม",
  [Specialty.FROZEN_SHOULDER]: "หัวไหล่ติด",
  [Specialty.TRIGGER_FINGER]: "นิ้วล็อก",
  [Specialty.PIRIFORMIS]: "สลักเพชรจม",
  [Specialty.HERNIATED_DISC]: "หมอนรองกระดูกทับเส้นประสาท",
  [Specialty.PARESIS_PARALYSIS]: "อัมพฤกษ์ อัมพาต",
  [Specialty.KNEE_OSTEOARTHRITIS]: "ข้อเข่าเสื่อม",
  [Specialty.RELAXATION]: "นวดผ่อนคลาย",
};

export enum PaymentMethod {
  THAI_QR = "THAI_QR", // Thai QR / พร้อมเพย์
  CREDIT_CARD = "CREDIT_CARD", // บัตรเครดิต/เดบิต
  GOVERNMENT_REIMBURSEMENT = "GOVERNMENT_REIMBURSEMENT", // เบิกราชการ/กองทุน
}

export enum GovernmentScheme {
  CIVIL_SERVANT = "CIVIL_SERVANT", // สิทธิข้าราชการ (กรมบัญชีกลาง)
  SOCIAL_SECURITY = "SOCIAL_SECURITY", // ประกันสังคม (สปส.)
  UNIVERSAL_COVERAGE = "UNIVERSAL_COVERAGE", // หลักประกันสุขภาพ (สปสช.)
  REHAB_FUND = "REHAB_FUND", // กองทุนฟื้นฟูสมรรถภาพ
}

export enum BookingStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  REIMBURSEMENT_SUBMITTED = "REIMBURSEMENT_SUBMITTED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum ServiceMode {
  HOME_VISIT = "HOME_VISIT", // นวดถึงบ้าน
  IN_CLINIC = "IN_CLINIC", // ไปที่ร้าน
}

// ---- API payloads ----

export interface DiagnosisRequest {
  symptomCodes: string[]; // e.g. ["neck_shoulder_pain", "numb_leg"]
  freeText?: string;
  painLevel?: number; // 1-10
}

export interface DiagnosisResult {
  specialty: Specialty;
  specialtyLabelTh: string;
  confidence: number; // 0-1
  summaryTh: string;
  recommendationsTh: string[];
  warningTh?: string;
}

export interface TherapistSummary {
  id: string;
  displayName: string;
  avatarEmoji?: string;
  specialties: Specialty[];
  rating: number;
  reviewCount: number;
  distanceKm?: number;
  mophCertified: boolean; // รับรองโดยกระทรวงสาธารณสุข
  startingPrice: number;
}

export interface Money {
  amount: number; // THB, integer baht
  currency: "THB";
}
