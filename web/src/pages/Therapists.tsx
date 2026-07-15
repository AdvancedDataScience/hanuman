import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { SPECIALTY_LABEL_TH, Specialty, type TherapistSummary } from "@hanuman/shared";

export default function Therapists() {
  const [params] = useSearchParams();
  const specialty = params.get("specialty") ?? undefined;
  const [sort, setSort] = useState("rating");
  const [items, setItems] = useState<TherapistSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .therapists(specialty, sort)
      .then(setItems)
      .catch((e) => setError(String(e.message)));
  }, [specialty, sort]);

  return (
    <div>
      <h1>
        หมอนวดใกล้คุณ
        {specialty ? ` · ${SPECIALTY_LABEL_TH[specialty as Specialty]}` : ""}
      </h1>
      <div style={{ marginBottom: 12 }}>
        {[
          ["rating", "รีวิวสูงสุด"],
          ["distance", "ใกล้ที่สุด"],
          ["price", "ราคาน้อยสุด"],
        ].map(([k, label]) => (
          <span key={k} className={"chip" + (sort === k ? " on" : "")} onClick={() => setSort(k)}>
            {label}
          </span>
        ))}
      </div>

      {error && <p className="muted">เชื่อมต่อ API ไม่ได้ (รัน backend ก่อน): {error}</p>}

      <div className="grid">
        {items.map((t) => (
          <div className="card" key={t.id}>
            <div style={{ fontSize: 40 }}>{t.avatarEmoji}</div>
            <b>{t.displayName}</b>{" "}
            {t.mophCertified && <span className="badge">✓ สธ.รับรอง</span>}
            <p className="muted" style={{ margin: "6px 0" }}>
              {t.specialties.map((s) => SPECIALTY_LABEL_TH[s]).join(" · ")}
            </p>
            <div>
              <span className="star">★ {t.rating}</span>{" "}
              <span className="muted">
                ({t.reviewCount}){t.distanceKm != null ? ` · ${t.distanceKm} กม.` : ""}
              </span>
            </div>
            <p style={{ color: "var(--primary)", fontWeight: 700, fontSize: 20 }}>
              เริ่ม ฿{t.startingPrice}
            </p>
            <button className="btn">📅 จองคิว</button>
          </div>
        ))}
      </div>
    </div>
  );
}
