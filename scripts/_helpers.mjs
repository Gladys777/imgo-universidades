import fs from "node:fs";
import path from "node:path";

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

export function writeJSON(filePath, obj) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), "utf-8");
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== "") return obj[k];
  }
  return undefined;
}

export async function socrataFetchAll(datasetId, { where, select, limit = 50000 } = {}) {
  const base = `https://www.datos.gov.co/resource/${datasetId}.json`;
  const out = [];
  let offset = 0;

  while (true) {
    const params = new URLSearchParams();
    params.set("$limit", String(limit));
    params.set("$offset", String(offset));
    if (where) params.set("$where", where);
    if (select) params.set("$select", select);

    const url = `${base}?${params.toString()}`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(`Socrata fetch failed ${res.status} ${res.statusText} for ${url}`);
    const chunk = await res.json();
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    out.push(...chunk);
    offset += chunk.length;
    if (chunk.length < limit) break;
  }

  return out;
}

export function normalizeText(s) {
  return String(s ?? "").trim();
}

export function slugify(s) {
  return normalizeText(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
