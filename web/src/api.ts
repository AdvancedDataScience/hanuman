import type {
  DiagnosisRequest,
  DiagnosisResult,
  TherapistSummary,
} from "@hanuman/shared";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

let token: string | null = null;
export function setToken(t: string) {
  token = t;
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? res.statusText);
  return res.json() as Promise<T>;
}

export const api = {
  login: (phone: string, password: string) =>
    req<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    }),
  diagnose: (body: DiagnosisRequest) =>
    req<DiagnosisResult>("/diagnosis", { method: "POST", body: JSON.stringify(body) }),
  therapists: (specialty?: string, sort = "rating") =>
    req<TherapistSummary[]>(
      `/therapists?sort=${sort}${specialty ? `&specialty=${specialty}` : ""}`
    ),
  therapist: (id: string) => req<any>(`/therapists/${id}`),
  createBooking: (body: any) =>
    req<any>("/bookings", { method: "POST", body: JSON.stringify(body) }),
  pay: (body: any) => req<any>("/payments", { method: "POST", body: JSON.stringify(body) }),
  ads: (placement: string) => req<any[]>(`/ads?placement=${placement}`),
  dashboard: () => req<any>("/dashboard/overview"),
};
