import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Symptom from "./pages/Symptom";
import Therapists from "./pages/Therapists";
import Dashboard from "./pages/Dashboard";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <header className="topbar">
        <Link to="/" className="brand">🐒 หนุมาน</Link>
        <nav>
          <Link to="/symptom">บอกอาการ</Link>
          <Link to="/therapists">หมอนวด</Link>
          <Link to="/dashboard">แดชบอร์ด</Link>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/symptom" element={<Symptom />} />
          <Route path="/therapists" element={<Therapists />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
