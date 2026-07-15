import { Link } from "react-router-dom";
import { SPECIALTY_LABEL_TH, Specialty } from "@hanuman/shared";

export default function Home() {
  return (
    <div>
      <div className="card" style={{ background: "var(--primary)", color: "#fff", border: "none" }}>
        <h1 style={{ marginTop: 0 }}>มีอาการตรงไหน บอกได้เลย</h1>
        <p>ระบบช่วยวินิจฉัยแผนไทยเบื้องต้น แล้วแนะนำหมอนวดที่ชำนาญตรงอาการใกล้บ้านคุณ</p>
        <Link to="/symptom">
          <button className="btn gold">🩺 เริ่มบอกอาการ</button>
        </Link>
      </div>

      <h2>ค้นหาตามความชำนาญ</h2>
      <div>
        {Object.values(Specialty).map((s) => (
          <Link key={s} to={`/therapists?specialty=${s}`} className="chip">
            {SPECIALTY_LABEL_TH[s]}
          </Link>
        ))}
      </div>
    </div>
  );
}
