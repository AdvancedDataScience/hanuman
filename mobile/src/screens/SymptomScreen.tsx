import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api } from "../api";
import type { DiagnosisResult } from "../shared";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Symptom">;

const SYMPTOMS = [
  { code: "neck_shoulder_pain", label: "ปวดคอ บ่า ไหล่" },
  { code: "low_back_pain", label: "ปวดหลังส่วนล่าง" },
  { code: "numb_limb", label: "ชาลงขา/แขน" },
  { code: "finger_lock", label: "นิ้วงอ/สะดุด" },
  { code: "cant_raise_arm", label: "ยกแขนไม่ขึ้น" },
  { code: "hip_pain_radiating", label: "ปวดสะโพกร้าวลงขา" },
  { code: "knee_stiff_pain", label: "เข่าฝืด/ปวดเข่า" },
  { code: "limb_weakness", label: "แขนขาอ่อนแรง" },
  { code: "stress_tired", label: "เครียด/อ่อนล้า" },
];

export default function SymptomScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const toggle = (c: string) =>
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  async function run() {
    try {
      setResult(await api.diagnose({ symptomCodes: selected, painLevel: 6 }));
    } catch {
      // fallback offline
      setResult({
        specialty: "RELAXATION" as any,
        specialtyLabelTh: "นวดผ่อนคลาย",
        confidence: 0.5,
        summaryTh: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ (แสดงผลตัวอย่าง)",
        recommendationsTh: ["รัน backend แล้วลองใหม่"],
      });
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.h1}>เลือกอาการที่ตรงกับคุณ</Text>
      <View style={s.chips}>
        {SYMPTOMS.map((sym) => (
          <TouchableOpacity
            key={sym.code}
            style={[s.chip, selected.includes(sym.code) && s.chipOn]}
            onPress={() => toggle(sym.code)}
          >
            <Text style={[s.chipText, selected.includes(sym.code) && s.chipTextOn]}>
              {sym.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={s.btn} onPress={run}>
        <Text style={s.btnText}>🔎 วินิจฉัยเบื้องต้น</Text>
      </TouchableOpacity>

      {result && (
        <View style={s.result}>
          <Text style={s.rTitle}>ผลวินิจฉัย: {result.specialtyLabelTh}</Text>
          <Text style={s.rBody}>{result.summaryTh}</Text>
          {result.recommendationsTh.map((r) => (
            <Text key={r} style={s.rItem}>• {r}</Text>
          ))}
          <TouchableOpacity
            style={s.btn}
            onPress={() => navigation.navigate("Therapists", { specialty: result.specialty })}
          >
            <Text style={s.btnText}>👐 ดูหมอนวดที่ชำนาญด้านนี้</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4EEE4" },
  h1: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  chip: {
    backgroundColor: "#fff", borderColor: "#E6DCCB", borderWidth: 2, borderRadius: 20,
    paddingVertical: 9, paddingHorizontal: 14, marginRight: 8, marginBottom: 8,
  },
  chipOn: { backgroundColor: "#B4232A", borderColor: "#B4232A" },
  chipText: { fontSize: 15 },
  chipTextOn: { color: "#fff" },
  btn: { backgroundColor: "#B4232A", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  result: { backgroundColor: "#FBF2D8", borderColor: "#D4A017", borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 16 },
  rTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  rBody: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  rItem: { fontSize: 15, lineHeight: 24 },
});
