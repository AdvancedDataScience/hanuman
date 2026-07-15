import { Router } from "express";
import { diagnose } from "../services/diagnosis";

export const diagnosisRouter = Router();

// POST /diagnosis — วินิจฉัยแผนไทยเบื้องต้นจากอาการ
diagnosisRouter.post("/", (req, res) => {
  const { symptomCodes = [], freeText, painLevel } = req.body ?? {};
  if (!Array.isArray(symptomCodes)) {
    return res.status(400).json({ error: "symptomCodes ต้องเป็น array" });
  }
  res.json(diagnose({ symptomCodes, freeText, painLevel }));
});
