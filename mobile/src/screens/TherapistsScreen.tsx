import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { api } from "../api";
import { SPECIALTY_LABEL_TH, Specialty, type TherapistSummary } from "../shared";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Therapists">;

export default function TherapistsScreen({ route }: Props) {
  const specialty = route.params?.specialty;
  const [items, setItems] = useState<TherapistSummary[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.therapists(specialty).then(setItems).catch((e) => setErr(String(e)));
  }, [specialty]);

  return (
    <View style={s.container}>
      {err && <Text style={s.err}>เชื่อมต่อ API ไม่ได้ (รัน backend ก่อน)</Text>}
      <FlatList
        data={items}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item: t }) => (
          <View style={s.card}>
            <Text style={{ fontSize: 34 }}>{t.avatarEmoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.name}>
                {t.displayName} {t.mophCertified ? "✓" : ""}
              </Text>
              <Text style={s.spec}>
                {t.specialties.map((x) => SPECIALTY_LABEL_TH[x as Specialty]).join(" · ")}
              </Text>
              <Text style={s.meta}>
                ★ {t.rating} ({t.reviewCount}) · เริ่ม ฿{t.startingPrice}
              </Text>
            </View>
            <TouchableOpacity style={s.book}>
              <Text style={s.bookText}>จอง</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4EEE4" },
  err: { padding: 16, color: "#7A6F66" },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 12,
    flexDirection: "row", alignItems: "center", borderColor: "#E6DCCB", borderWidth: 1,
  },
  name: { fontSize: 16, fontWeight: "700" },
  spec: { fontSize: 13, color: "#7A6F66", marginVertical: 2 },
  meta: { fontSize: 14, color: "#B4232A", fontWeight: "600" },
  book: { backgroundColor: "#B4232A", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  bookText: { color: "#fff", fontWeight: "700" },
});
