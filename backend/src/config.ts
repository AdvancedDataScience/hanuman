import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  commissionRate: Number(process.env.COMMISSION_RATE ?? 0.15),
  promptpayMerchantId: process.env.PROMPTPAY_MERCHANT_ID ?? "0000000000000",
};
