export type AnalyticsEventName =
  | "page_view"
  | "search"
  | "open_institution"
  | "open_program"
  | "compare_open"
  | "favorite_toggle"
  | "lead_submit";

const SESSION_KEY = "imgo_session_id";

export function getSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

export async function track(name: AnalyticsEventName, props: Record<string, any> = {}) {
  try {
    const sessionId = getSessionId();
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, name, props })
    });
  } catch {
    // ignore in demo
  }
}
