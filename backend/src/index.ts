import express from "express";
import cors from "cors";
import { config } from "./config";
import { authRouter } from "./routes/auth";
import { diagnosisRouter } from "./routes/diagnosis";
import { therapistsRouter } from "./routes/therapists";
import { bookingsRouter } from "./routes/bookings";
import { paymentsRouter } from "./routes/payments";
import { reviewsRouter } from "./routes/reviews";
import { couponsRouter } from "./routes/coupons";
import { safetyRouter } from "./routes/safety";
import { adsRouter } from "./routes/ads";
import { dashboardRouter } from "./routes/dashboard";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "hanuman-api" }));

app.use("/auth", authRouter);
app.use("/diagnosis", diagnosisRouter);
app.use("/therapists", therapistsRouter);
app.use("/bookings", bookingsRouter);
app.use("/payments", paymentsRouter);
app.use("/reviews", reviewsRouter);
app.use("/coupons", couponsRouter);
app.use("/safety", safetyRouter);
app.use("/ads", adsRouter);
app.use("/dashboard", dashboardRouter);

app.listen(config.port, () => {
  console.log(`🐒 หนุมาน API running on http://localhost:${config.port}`);
});
