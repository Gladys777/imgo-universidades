import crypto from "node:crypto";

export async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-token");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.end(JSON.stringify(data));
}

export function isAdmin(req) {
  const token = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN || "admin-demo";
  return token && token === expected;
}

export function randomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return String(Date.now()) + "_" + Math.random().toString(16).slice(2);
  }
}
