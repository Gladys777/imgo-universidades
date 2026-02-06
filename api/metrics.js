import { json, isAdmin } from "./_utils.js";
import { readDb } from "./_store.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "GET") return json(res, 405, { ok: false, error: "method_not_allowed" });
  if (!isAdmin(req)) return json(res, 401, { ok: false, error: "unauthorized" });

  const db = await readDb();
  const events = Array.isArray(db.events) ? db.events : [];

  const uniqueUsers = new Set(events.map((e) => e.sessionId)).size;
  const pageViews = events.filter((e) => e.name === "page_view").length;

  const funnelSteps = ["search", "open_institution", "open_program", "lead_submit"];
  const funnel = funnelSteps.map((step) => {
    const users = new Set(events.filter((e) => e.name === step).map((e) => e.sessionId));
    return { step, users: users.size };
  });

  return json(res, 200, {
    ok: true,
    totals: {
      uniqueUsers,
      pageViews,
      leads: Array.isArray(db.leads) ? db.leads.length : 0,
      agreements: Array.isArray(db.agreements) ? db.agreements.length : 0
    },
    funnel,
    lastEvents: events.slice(-200).reverse()
  });
}
