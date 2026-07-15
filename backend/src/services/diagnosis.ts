import {
  Specialty,
  SPECIALTY_LABEL_TH,
  DiagnosisRequest,
  DiagnosisResult,
} from "@hanuman/shared";

/**
 * Rule-based preliminary Thai-medicine diagnosis.
 *
 * NOTE: นี่เป็นการคัดกรองเบื้องต้นตามอาการเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์
 * โครงสร้างนี้ออกแบบให้เปลี่ยนไปใช้ ML/LLM ภายหลังได้ โดยคง interface เดิม
 */

// symptom code -> คะแนนของแต่ละความชำนาญ
const SYMPTOM_WEIGHTS: Record<string, Partial<Record<Specialty, number>>> = {
  neck_shoulder_pain: { [Specialty.OFFICE_SYNDROME]: 3, [Specialty.FROZEN_SHOULDER]: 1 },
  desk_work_long: { [Specialty.OFFICE_SYNDROME]: 2 },
  low_back_pain: { [Specialty.HERNIATED_DISC]: 2, [Specialty.PIRIFORMIS]: 1 },
  numb_limb: { [Specialty.HERNIATED_DISC]: 3, [Specialty.PARESIS_PARALYSIS]: 1 },
  finger_lock: { [Specialty.TRIGGER_FINGER]: 4 },
  cant_raise_arm: { [Specialty.FROZEN_SHOULDER]: 4 },
  hip_pain_radiating: { [Specialty.PIRIFORMIS]: 4, [Specialty.HERNIATED_DISC]: 1 },
  knee_stiff_pain: { [Specialty.KNEE_OSTEOARTHRITIS]: 4 },
  limb_weakness: { [Specialty.PARESIS_PARALYSIS]: 4 },
  stress_tired: { [Specialty.RELAXATION]: 3 },
};

const SUMMARY_TH: Record<Specialty, string> = {
  [Specialty.OFFICE_SYNDROME]:
    "กลุ่มอาการปวดกล้ามเนื้อ บ่า คอ ไหล่ จากการนั่งทำงานนาน (ลมปลายปัตคาต)",
  [Specialty.FROZEN_SHOULDER]:
    "ข้อไหล่ติด ขยับ/ยกแขนได้จำกัด กล้ามเนื้อรอบหัวไหล่ตึงเกร็ง",
  [Specialty.TRIGGER_FINGER]: "นิ้วล็อก ปลอกหุ้มเอ็นอักเสบ งอ-เหยียดนิ้วสะดุด",
  [Specialty.PIRIFORMIS]:
    "กลุ่มอาการสลักเพชรจม กล้ามเนื้อสะโพกกดทับเส้นประสาท ปวดร้าวลงขา",
  [Specialty.HERNIATED_DISC]:
    "อาการเข้าข่ายหมอนรองกระดูกทับเส้นประสาท ปวดหลังร้าวลงขา ชา",
  [Specialty.PARESIS_PARALYSIS]:
    "อ่อนแรงครึ่งซีก/แขนขา ต้องการการฟื้นฟูสมรรถภาพร่วมกับแพทย์",
  [Specialty.KNEE_OSTEOARTHRITIS]: "ข้อเข่าเสื่อม ปวด/ฝืดข้อเข่า เดินลงน้ำหนักลำบาก",
  [Specialty.RELAXATION]: "ความเครียด อ่อนล้า ต้องการนวดผ่อนคลายกล้ามเนื้อ",
};

const RECS_TH: Record<Specialty, string[]> = {
  [Specialty.OFFICE_SYNDROME]: [
    "นวดราชสำนักคลายกล้ามเนื้อบ่า–สะบัก",
    "กดจุดสัญญาณเปิดประตูลม",
    "ประคบสมุนไพรร้อนลดการเกร็ง",
    "ท่าฤๅษีดัดตนสำหรับทำเองที่บ้าน",
  ],
  [Specialty.FROZEN_SHOULDER]: [
    "นวดคลายกล้ามเนื้อรอบข้อไหล่",
    "ดัด-ดึงเพิ่มพิสัยการเคลื่อนไหว",
    "ประคบร้อนก่อนบริหารข้อไหล่",
  ],
  [Specialty.TRIGGER_FINGER]: [
    "นวดคลายเอ็นและปลอกหุ้มเอ็นบริเวณฝ่ามือ",
    "ประคบสมุนไพร ลดการอักเสบ",
    "งดใช้งานนิ้วซ้ำๆ",
  ],
  [Specialty.PIRIFORMIS]: [
    "นวดคลายกล้ามเนื้อสะโพกและกดจุด",
    "ยืดกล้ามเนื้อสลักเพชร",
    "ประคบร้อนบริเวณสะโพก",
  ],
  [Specialty.HERNIATED_DISC]: [
    "นวดคลายกล้ามเนื้อหลังอย่างระมัดระวัง",
    "หลีกเลี่ยงการดัดหลังรุนแรง",
    "ควรพบแพทย์เพื่อประเมินร่วม",
  ],
  [Specialty.PARESIS_PARALYSIS]: [
    "นวดฟื้นฟูกระตุ้นการไหลเวียนและกล้ามเนื้อ",
    "ทำต่อเนื่องควบคู่กายภาพบำบัด",
    "ต้องอยู่ภายใต้การดูแลของแพทย์",
  ],
  [Specialty.KNEE_OSTEOARTHRITIS]: [
    "นวดคลายกล้ามเนื้อรอบเข่า",
    "ประคบสมุนไพรลดปวด",
    "บริหารกล้ามเนื้อต้นขาเสริมความมั่นคงข้อเข่า",
  ],
  [Specialty.RELAXATION]: [
    "นวดน้ำมันผ่อนคลายทั่วตัว",
    "นวดกดจุดคลายเครียด",
    "ประคบอโรมาสมุนไพร",
  ],
};

// อาการที่ควรเตือนให้พบแพทย์
const RED_FLAGS = new Set<Specialty>([
  Specialty.HERNIATED_DISC,
  Specialty.PARESIS_PARALYSIS,
]);

export function diagnose(req: DiagnosisRequest): DiagnosisResult {
  const scores = new Map<Specialty, number>();
  for (const code of req.symptomCodes) {
    const weights = SYMPTOM_WEIGHTS[code];
    if (!weights) continue;
    for (const [spec, w] of Object.entries(weights)) {
      const s = spec as Specialty;
      scores.set(s, (scores.get(s) ?? 0) + (w ?? 0));
    }
  }

  // default หากไม่ตรงอะไรเลย -> นวดผ่อนคลาย
  let best: Specialty = Specialty.RELAXATION;
  let bestScore = 0;
  let total = 0;
  for (const [spec, score] of scores) {
    total += score;
    if (score > bestScore) {
      best = spec;
      bestScore = score;
    }
  }

  const confidence = total > 0 ? Math.min(1, bestScore / total) : 0.5;
  const warningTh = RED_FLAGS.has(best)
    ? "⚠️ ควรพบแพทย์เพื่อประเมินเพิ่มเติม โดยเฉพาะหากมีอาการชาหรืออ่อนแรงร่วม"
    : req.painLevel && req.painLevel >= 8
      ? "⚠️ อาการปวดค่อนข้างมาก แนะนำปรึกษาแพทย์หากไม่ดีขึ้น"
      : undefined;

  return {
    specialty: best,
    specialtyLabelTh: SPECIALTY_LABEL_TH[best],
    confidence: Number(confidence.toFixed(2)),
    summaryTh: SUMMARY_TH[best],
    recommendationsTh: RECS_TH[best],
    warningTh,
  };
}
