import fs from "fs";
import path from "path";

// Minimal persistence for serverless:
// - If Vercel KV is configured, we use it.
// - Otherwise we fall back to a JSON file.
//   On Vercel, filesystem is ephemeral; we use /tmp to at least keep state
//   during warm invocations. For real persistence, enable KV.

const LOCAL_DB = path.resolve("server/data/db.json");
const TMP_DB = path.join("/tmp", "imgo_db.json");

async function getKv() {
  try {
    const mod = await import("@vercel/kv");
    return mod.kv || null;
  } catch {
    return null;
  }
}

function readFileDb(file) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw);
    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
      leads: Array.isArray(parsed.leads) ? parsed.leads : [],
      agreements: Array.isArray(parsed.agreements) ? parsed.agreements : []
    };
  } catch {
    return { events: [], leads: [], agreements: [] };
  }
}

function writeFileDb(file, db) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // ignore
  }
}

export async function readDb() {
  const kv = await getKv();
  if (kv) {
    const [events, leads, agreements] = await Promise.all([
      kv.get("imgo:events"),
      kv.get("imgo:leads"),
      kv.get("imgo:agreements")
    ]);
    return {
      events: Array.isArray(events) ? events : [],
      leads: Array.isArray(leads) ? leads : [],
      agreements: Array.isArray(agreements) ? agreements : []
    };
  }

  // Prefer local DB when running locally
  const base = fs.existsSync(LOCAL_DB) ? LOCAL_DB : TMP_DB;
  return readFileDb(base);
}

export async function writeDb(db) {
  const kv = await getKv();
  if (kv) {
    await Promise.all([
      kv.set("imgo:events", db.events),
      kv.set("imgo:leads", db.leads),
      kv.set("imgo:agreements", db.agreements)
    ]);
    return;
  }
  const base = fs.existsSync(LOCAL_DB) ? LOCAL_DB : TMP_DB;
  writeFileDb(base, db);
}
