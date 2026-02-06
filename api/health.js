import { json } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  return json(res, 200, { ok: true, time: new Date().toISOString() });
}
