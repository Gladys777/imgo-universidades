import { readJson, json, randomId, isAdmin } from "./_utils.js";
import { readDb, writeDb } from "./_store.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });

  if (req.method === "POST") {
    const body = await readJson(req);
    const lead = {
      id: randomId(),
      ts: new Date().toISOString(),
      sessionId: String(body.sessionId || ""),
      universityId: String(body.universityId || ""),
      programId: String(body.programId || ""),
      name: String(body.name || ""),
      email: String(body.email || ""),
      phone: String(body.phone || ""),
      message: String(body.message || ""),
      consent: Boolean(body.consent)
    };

    if (!lead.email || !lead.universityId || !lead.consent) {
      return json(res, 400, { ok: false, error: "missing email/universityId/consent" });
    }

    const db = await readDb();
    db.leads.push(lead);
    db.leads = db.leads.slice(-5000);

    // auto-create a pipeline record for monetization demo
    db.agreements.push({
      id: randomId(),
      ts: new Date().toISOString(),
      universityId: lead.universityId,
      stage: "Lead",
      expectedMonthlyCOP: 0,
      notes: "Auto-creado por lead"
    });
    db.agreements = db.agreements.slice(-5000);

    await writeDb(db);
    return json(res, 200, { ok: true });
  }

  if (req.method === "GET") {
    if (!isAdmin(req)) return json(res, 401, { ok: false, error: "unauthorized" });
    const db = await readDb();
    return json(res, 200, { ok: true, leads: db.leads.slice().reverse() });
  }

  return json(res, 405, { ok: false, error: "method_not_allowed" });
}
