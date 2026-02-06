import { readJson, json, randomId } from "./_utils.js";
import { readDb, writeDb } from "./_store.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "method_not_allowed" });

  const body = await readJson(req);
  const event = {
    id: randomId(),
    ts: new Date().toISOString(),
    sessionId: String(body.sessionId || ""),
    name: String(body.name || ""),
    props: body.props && typeof body.props === "object" ? body.props : {}
  };

  if (!event.sessionId || !event.name) {
    return json(res, 400, { ok: false, error: "missing sessionId/name" });
  }

  const db = await readDb();
  db.events.push(event);
  db.events = db.events.slice(-20000);
  await writeDb(db);

  return json(res, 200, { ok: true });
}
