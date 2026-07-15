import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SPECIALTY_LABEL_TH, Specialty } from "../shared";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <View style={s.hero}>
        <Text style={s.heroTitle}>มีอาการตรงไหน บอกได้เลย</Text>
        <Text style={s.heroSub}>
          ระบบช่วยวินิจฉัยแผนไทยเบื้องต้น แล้วแนะนำหมอนวดที่ชำนาญตรงอาการใกล้บ้านคุณ
        </Text>
        <TouchableOpacity style={s.cta} onPress={() => navigation.navigate("Symptom")}>
          <Text style={s.ctaText}>🩺 เริ่มบอกอาการ</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.h2}>ค้นหาตามความชำนาญ</Text>
      <View style={s.chips}>
        {Object.values(Specialty).map((sp) => (
          <TouchableOpacity
            key={sp}
            style={s.chip}
            onPress={() => navigation.navigate("Therapists", { specialty: sp })}
          >
            <Text style={s.chipText}>{SPECIALTY_LABEL_TH[sp]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4EEE4" },
  hero: { backgroundColor: "#B4232A", borderRadius: 18, padding: 20, marginBottom: 20 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 8 },
  heroSub: { color: "#fff", opacity: 0.9, fontSize: 15, lineHeight: 22, marginBottom: 16 },
  cta: { backgroundColor: "#D4A017", borderRadius: 12, padding: 16, alignItems: "center" },
  ctaText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  h2: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    backgroundColor: "#fff",
    borderColor: "#E6DCCB",
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 15 },
});
