import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { DiagnosisResult } from "@hanuman/shared";

const SYMPTOMS: { code: string; label: string }[] = [
  { code: "neck_shoulder_pain", label: "ปวดคอ บ่า ไหล่" },
  { code: "low_back_pain", label: "ปวดหลังส่วนล่าง" },
  { code: "numb_limb", label: "ชาลงขา/แขน" },
  { code: "finger_lock", label: "นิ้วงอ/สะดุด" },
  { code: "cant_raise_arm", label: "ยกแขนไม่ขึ้น" },
  { code: "hip_pain_radiating", label: "ปวดสะโพกร้าวลงขา" },
  { code: "knee_stiff_pain", label: "เข่าฝืด/ปวดเข่า" },
  { code: "limb_weakness", label: "แขนขาอ่อนแรง" },
  { code: "desk_work_long", label: "นั่งทำงานนาน" },
  { code: "stress_tired", label: "เครียด/อ่อนล้า" },
];

export default function Symptom() {
  const [selected, setSelected] = useState<string[]>([]);
  const [pain, setPain] = useState(6);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const nav = useNavigate();

  const toggle = (code: string) =>
    setSelected((s) => (s.includes(code) ? s.filter((c) => c !== code) : [...s, code]));

  async function run() {
    const r = await api.diagnose({ symptomCodes: selected, painLevel: pain });
    setResult(r);
  }

  return (
    <div>
      <h1>บอกอาการของคุณ</h1>
      <div className="card">
        <p className="muted">เลือกอาการที่ตรงกับคุณได้หลายข้อ</p>
        {SYMPTOMS.map((s) => (
          <span
            key={s.code}
            className={"chip" + (selected.includes(s.code) ? " on" : "")}
            onClick={() => toggle(s.code)}
          >
            {s.label}
          </span>
        ))}
        <p style={{ marginTop: 16 }}>
          ระดับความปวด: <b>{pain}/10</b>
        </p>
        <input type="range" min={1} max={10} value={pain} onChange={(e) => setPain(+e.target.value)} />
        <div style={{ marginTop: 16 }}>
          <button className="btn" onClick={run}>🔎 วินิจฉัยเบื้องต้น</button>
        </div>
      </div>

      {result && (
        <div className="card" style={{ background: "#FBF2D8", borderColor: "var(--gold)" }}>
          <h2>ผลวินิจฉัย: {result.specialtyLabelTh}</h2>
          <p>{result.summaryTh}</p>
          <ul>
            {result.recommendationsTh.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          {result.warningTh && <p style={{ color: "var(--primary)" }}>{result.warningTh}</p>}
          <button className="btn" onClick={() => nav(`/therapists?specialty=${result.specialty}`)}>
            👐 ดูหมอนวดที่ชำนาญด้านนี้
          </button>
        </div>
      )}
    </div>
  );
}
