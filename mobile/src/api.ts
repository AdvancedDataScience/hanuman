import type { DiagnosisRequest, DiagnosisResult, TherapistSummary } from "./shared";

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
  });
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<T>;
}

export const api = {
  diagnose: (body: DiagnosisRequest) =>
    req<DiagnosisResult>("/diagnosis", { method: "POST", body: JSON.stringify(body) }),
  therapists: (specialty?: string, sort = "rating") =>
    req<TherapistSummary[]>(
      `/therapists?sort=${sort}${specialty ? `&specialty=${specialty}` : ""}`
    ),
};
