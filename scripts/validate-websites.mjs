import fs from "fs";
import path from "path";

// Validates institution websites in src/data/universities.json
// Adds fields:
// - websiteNormalized
// - websiteStatus: valid | redirect | invalid | missing
// - websiteCheckedAt (ISO)
//
// Usage:
//   node scripts/validate-websites.mjs

const DATA_PATH = path.resolve("src/data/universities.json");

function normalizeUrl(u) {
  if (!u) return "";
  let s = String(u).trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  // remove trailing spaces
  return s;
}

async function requestWithTimeout(url, options, timeoutMs=8000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, redirect: "manual", signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function checkUrl(url) {
  if (!url) return { status: "missing", code: null, location: null };
  try {
    // Try HEAD first
    let res = await requestWithTimeout(url, { method: "HEAD" });
    if (res.status === 405 || res.status === 403) {
      res = await requestWithTimeout(url, { method: "GET" });
    }
    const code = res.status;
    const location = res.headers.get("location");
    if (code >= 200 && code < 300) return { status: "valid", code, location: null };
    if (code >= 300 && code < 400 && location) return { status: "redirect", code, location };
    return { status: "invalid", code, location: null };
  } catch (e) {
    return { status: "invalid", code: null, location: null, error: String(e?.message || e) };
  }
}

async function main() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("universities.json must be an array");

  let i = 0;
  let ok = 0;
  let redirect = 0;
  let invalid = 0;
  let missing = 0;

  for (const uni of data) {
    i++;
    const norm = normalizeUrl(uni.website || "");
    const r = await checkUrl(norm);
    uni.websiteNormalized = norm;
    uni.websiteStatus = r.status;
    uni.websiteCheckedAt = new Date().toISOString();
    if (r.location) uni.websiteRedirectTo = r.location;
    else delete uni.websiteRedirectTo;

    if (r.status === "valid") ok++;
    else if (r.status === "redirect") redirect++;
    else if (r.status === "invalid") invalid++;
    else missing++;

    if (i % 25 === 0) {
      console.log(`Checked ${i}/${data.length}... ok=${ok} redirect=${redirect} invalid=${invalid} missing=${missing}`);
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
  console.log("Done:", { total: data.length, ok, redirect, invalid, missing });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
