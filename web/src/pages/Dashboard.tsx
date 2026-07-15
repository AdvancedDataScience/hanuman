import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.dashboard().then(setData).catch((e) => setError(String(e.message)));
  }, []);

  if (error)
    return (
      <div>
        <h1>Dashboard</h1>
        <p className="muted">ต้องเข้าสู่ระบบด้วยบัญชี ADMIN และรัน backend ก่อน ({error})</p>
      </div>
    );
  if (!data) return <p>กำลังโหลด…</p>;

  return (
    <div>
      <h1>Dashboard ผลงานรวม</h1>
      <div className="grid">
        <div className="card stat"><div className="big">{data.bookings}</div>ครั้งการนวด</div>
        <div className="card stat"><div className="big">฿{data.gmv.toLocaleString()}</div>รายได้รวม (GMV)</div>
        <div className="card stat"><div className="big">฿{data.commission.toLocaleString()}</div>Commission บริษัท</div>
        <div className="card stat"><div className="big">{data.avgRating}</div>คะแนนเฉลี่ย</div>
      </div>
      <div className="card">
        <h2>สัดส่วนวิธีชำระเงิน</h2>
        {Object.entries(data.byMethod).map(([m, n]) => (
          <div key={m}>{m}: <b>{n as number}</b></div>
        ))}
      </div>
    </div>
  );
}
