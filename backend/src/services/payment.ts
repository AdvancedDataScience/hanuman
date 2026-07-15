import generatePayload from "promptpay-qr";
import { config } from "../config";

/**
 * สร้าง payload มาตรฐาน EMVCo สำหรับ Thai QR / พร้อมเพย์
 * ฝั่ง client นำไป render เป็น QR image ได้เลย
 */
export function buildThaiQrPayload(amountBaht: number): string {
  return generatePayload(config.promptpayMerchantId, { amount: amountBaht });
}

/**
 * ตัวอย่าง stub สำหรับ card gateway (Omise / 2C2P / Stripe)
 * ใน production เชื่อม SDK ของผู้ให้บริการจริงและตรวจ webhook
 */
export async function chargeCard(
  token: string,
  amountBaht: number
): Promise<{ ok: boolean; gatewayRef: string }> {
  // TODO: integrate real gateway
  return { ok: true, gatewayRef: `card_${Date.now()}` };
}

/**
 * สร้างเลขอ้างอิงการเบิกจ่ายภาครัฐ (mock)
 * ใน production ต่อกับระบบเบิกจ่ายของกรมบัญชีกลาง/สปสช./สปส.
 */
export function createReimbursementClaim(scheme: string): string {
  return `CLAIM-${scheme}-${Date.now()}`;
}
