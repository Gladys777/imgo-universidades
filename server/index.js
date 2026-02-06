import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import crypto from "node:crypto";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 5174;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-demo";

const DB_PATH = path.resolve("server/data/db.json");

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
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

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function requireAdmin(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// --------- Analytics ---------
app.post("/api/events", (req, res) => {
  const db = readDb();
  const body = req.body || {};
  const event = {
    id: cryptoRandomId(),
    ts: new Date().toISOString(),
    sessionId: String(body.sessionId || ""),
    name: String(body.name || ""),
    props: body.props && typeof body.props === "object" ? body.props : {}
  };

  if (!event.sessionId || !event.name) {
    return res.status(400).json({ ok: false, error: "missing sessionId/name" });
  }

  db.events.push(event);
  // keep db small for demo
  db.events = db.events.slice(-20000);
  writeDb(db);
  res.json({ ok: true });
});

app.get("/api/metrics", requireAdmin, (req, res) => {
  const db = readDb();
  const events = db.events;

  const uniqueUsers = new Set(events.map((e) => e.sessionId)).size;
  const pageViews = events.filter((e) => e.name === "page_view").length;

  const funnelSteps = ["search", "open_institution", "open_program", "lead_submit"];
  const funnel = funnelSteps.map((step) => {
    const users = new Set(events.filter((e) => e.name === step).map((e) => e.sessionId));
    return { step, users: users.size };
  });

  res.json({
    ok: true,
    totals: {
      uniqueUsers,
      pageViews,
      leads: db.leads.length,
      agreements: db.agreements.length
    },
    funnel,
    lastEvents: events.slice(-200).reverse()
  });
});

// --------- Leads ---------
app.post("/api/leads", (req, res) => {
  const db = readDb();
  const body = req.body || {};

  const lead = {
    id: cryptoRandomId(),
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
    return res.status(400).json({ ok: false, error: "missing email/universityId/consent" });
  }

  db.leads.push(lead);
  db.leads = db.leads.slice(-5000);
  writeDb(db);

  // auto-create a pipeline record for monetization demo
  db.agreements.push({
    id: cryptoRandomId(),
    ts: new Date().toISOString(),
    universityId: lead.universityId,
    stage: "Lead",
    expectedMonthlyCOP: 0,
    notes: "Auto-creado por lead"
  });
  db.agreements = db.agreements.slice(-5000);
  writeDb(db);

  res.json({ ok: true });
});

app.get("/api/leads", requireAdmin, (_req, res) => {
  const db = readDb();
  res.json({ ok: true, leads: db.leads.slice().reverse() });
});

// --------- Agreements / CRM ---------
app.get("/api/agreements", requireAdmin, (_req, res) => {
  const db = readDb();
  res.json({ ok: true, agreements: db.agreements.slice().reverse() });
});

app.post("/api/agreements", requireAdmin, (req, res) => {
  const db = readDb();
  const body = req.body || {};
  const agreement = {
    id: cryptoRandomId(),
    ts: new Date().toISOString(),
    universityId: String(body.universityId || ""),
    stage: String(body.stage || "Lead"),
    expectedMonthlyCOP: Number(body.expectedMonthlyCOP || 0),
    notes: String(body.notes || "")
  };
  if (!agreement.universityId) {
    return res.status(400).json({ ok: false, error: "missing universityId" });
  }
  db.agreements.push(agreement);
  writeDb(db);
  res.json({ ok: true });
});

function cryptoRandomId() {
  // Use node:crypto for compatibility across Node versions.
  try {
    return crypto.randomUUID();
  } catch {
    return String(Date.now()) + "_" + Math.random().toString(16).slice(2);
  }
}

app.listen(PORT, () => {
  console.log(`ImGo demo API running on http://localhost:${PORT}`);
  console.log(`Admin token (x-admin-token): ${ADMIN_TOKEN}`);
});
