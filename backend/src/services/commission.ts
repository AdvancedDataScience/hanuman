import { config } from "../config";

export interface Split {
  commissionRate: number;
  commissionAmount: number; // เข้าบริษัท
  therapistNet: number; // ยอดสุทธิถึงหมอ
}

/**
 * แบ่งรายได้: บริษัทหักคอมมิชชั่นจากค่าบริการ (ไม่รวมทิป)
 * ทิปให้หมอเต็มจำนวน
 */
export function splitRevenue(
  serviceAmount: number,
  tipAmount = 0,
  rate = config.commissionRate
): Split {
  const commissionAmount = Math.round(serviceAmount * rate);
  const therapistNet = serviceAmount - commissionAmount + tipAmount;
  return { commissionRate: rate, commissionAmount, therapistNet };
}
