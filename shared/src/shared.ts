// สำเนาเฉพาะ types/ค่าที่ฝั่ง mobile ใช้ (คัดจาก @hanuman/shared)
// แยกไว้ในโฟลเดอร์ mobile เพราะ Metro ตาม import ข้ามแพ็กเกจไม่ได้

export enum Specialty {
  OFFICE_SYNDROME = "OFFICE_SYNDROME",
  FROZEN_SHOULDER = "FROZEN_SHOULDER",
  TRIGGER_FINGER = "TRIGGER_FINGER",
  PIRIFORMIS = "PIRIFORMIS",
  HERNIATED_DISC = "HERNIATED_DISC",
  PARESIS_PARALYSIS = "PARESIS_PARALYSIS",
  KNEE_OSTEOARTHRITIS = "KNEE_OSTEOARTHRITIS",
  RELAXATION = "RELAXATION",
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

export interface DiagnosisRequest {
  symptomCodes: string[];
  freeText?: string;
  painLevel?: number;
}

export interface DiagnosisResult {
  specialty: Specialty;
  specialtyLabelTh: string;
  confidence: number;
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
  mophCertified: boolean;
  startingPrice: number;
}
