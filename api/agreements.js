import { readJson, json, randomId, isAdmin } from "./_utils.js";
import { readDb, writeDb } from "./_store.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });

  if (!isAdmin(req)) return json(res, 401, { ok: false, error: "unauthorized" });

  if (req.method === "GET") {
    const db = await readDb();
    return json(res, 200, { ok: true, agreements: db.agreements.slice().reverse() });
  }

  if (req.method === "POST") {
    const body = await readJson(req);
    const agreement = {
      id: randomId(),
      ts: new Date().toISOString(),
      universityId: String(body.universityId || ""),
      stage: String(body.stage || "Lead"),
      expectedMonthlyCOP: Number(body.expectedMonthlyCOP || 0),
      notes: String(body.notes || "")
    };
    if (!agreement.universityId) return json(res, 400, { ok: false, error: "missing universityId" });

    const db = await readDb();
    db.agreements.push(agreement);
    db.agreements = db.agreements.slice(-5000);
    await writeDb(db);
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { ok: false, error: "method_not_allowed" });
}
