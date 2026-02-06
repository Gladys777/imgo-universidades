import React, { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import { Helmet } from "react-helmet-async";
import { University } from "../lib/types";

type Lead = {
  id: string;
  ts: string;
  sessionId: string;
  universityId: string;
  programId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

type Agreement = {
  id: string;
  ts: string;
  universityId: string;
  stage: string;
  expectedMonthlyCOP: number;
  notes: string;
};

const ADMIN_TOKEN_KEY = "imgo_admin_token";

const STAGES = ["Lead", "Contactado", "Reunión", "Propuesta", "Cerrado"] as const;

export default function AdminPage({ universities }: { universities: University[] }) {
  const uniById = useMemo(() => {
    const m = new Map<string, University>();
    for (const u of universities) m.set(u.id, u);
    return m;
  }, [universities]);

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY) || "admin-demo";
    } catch {
      return "admin-demo";
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);

  const [newUniId, setNewUniId] = useState("");
  const [newStage, setNewStage] = useState<(typeof STAGES)[number]>("Lead");
  const [newExpected, setNewExpected] = useState<number>(0);
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } catch {}
  }, [token]);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const [lRes, aRes] = await Promise.all([
        fetch("/api/leads", { headers: { "x-admin-token": token } }),
        fetch("/api/agreements", { headers: { "x-admin-token": token } })
      ]);

      if (!lRes.ok) throw new Error(`Leads HTTP ${lRes.status}`);
      if (!aRes.ok) throw new Error(`Agreements HTTP ${aRes.status}`);

      const lJson = await lRes.json();
      const aJson = await aRes.json();

      setLeads(Array.isArray(lJson.leads) ? lJson.leads : []);
      setAgreements(Array.isArray(aJson.agreements) ? aJson.agreements : []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createAgreement() {
    if (!newUniId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({
          universityId: newUniId,
          stage: newStage,
          expectedMonthlyCOP: newExpected,
          notes: newNotes
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewNotes("");
      setNewExpected(0);
      setNewStage("Lead");
      await load();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const totalPipeline = useMemo(() => {
    return agreements.reduce((acc, a) => acc + (Number(a.expectedMonthlyCOP) || 0), 0);
  }, [agreements]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Admin / CRM | ImGo</title>
      </Helmet>
      <TopBar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin / CRM (demo local)</h1>
            <p className="mt-1 text-slate-700">Leads, pipeline de acuerdos y monetización (para vender a universidades).</p>
          </div>

          <div className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white p-4">
            <label className="block text-xs font-semibold text-slate-600">Admin token</label>
            <div className="mt-2 flex gap-2">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-slate-200 px-3 py-2"
                placeholder="admin-demo"
              />
              <button onClick={load} className="rounded-xl px-4 py-2 bg-slate-900 text-white">
                Recargar
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div>
        ) : null}

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Crear acuerdo</h2>
            <p className="text-sm text-slate-600">Simula acuerdos reales (MQL/SQL, fee mensual, CPA, etc.).</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={newUniId}
                onChange={(e) => setNewUniId(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="">Selecciona institución…</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>

              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value as any)}
                className="rounded-xl border border-slate-200 px-3 py-2"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <input
                value={String(newExpected)}
                onChange={(e) => setNewExpected(Number(e.target.value || 0))}
                type="number"
                min={0}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="Valor mensual esperado (COP)"
              />

              <input
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2"
                placeholder="Notas (opcional)"
              />
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={createAgreement}
                disabled={!newUniId || loading}
                className="rounded-xl px-4 py-2 bg-slate-900 text-white disabled:opacity-50"
              >
                Guardar
              </button>
              <span className="text-sm text-slate-600">Pipeline total: <b>${formatCOP(totalPipeline)}</b> / mes</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Pipeline</h2>
            <div className="mt-4 space-y-2 max-h-[360px] overflow-auto">
              {agreements.length === 0 ? (
                <p className="text-sm text-slate-600">Sin acuerdos aún.</p>
              ) : (
                agreements.map((a) => (
                  <div key={a.id} className="rounded-xl bg-slate-50 px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{uniById.get(a.universityId)?.name || a.universityId}</div>
                        <div className="text-xs text-slate-600">
                          {new Date(a.ts).toLocaleString()} · Etapa: <b>{a.stage}</b>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">${formatCOP(a.expectedMonthlyCOP || 0)}/mes</div>
                    </div>
                    {a.notes ? <div className="mt-1 text-sm text-slate-700">{a.notes}</div> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Leads</h2>
          <p className="text-sm text-slate-600">Capturas reales del formulario (guardadas localmente).</p>

          <div className="mt-4 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Institución</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Teléfono</th>
                  <th className="py-2 pr-4">Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100">
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(l.ts).toLocaleString()}</td>
                    <td className="py-2 pr-4">{uniById.get(l.universityId)?.name || l.universityId}</td>
                    <td className="py-2 pr-4">{l.email}</td>
                    <td className="py-2 pr-4">{l.phone || "–"}</td>
                    <td className="py-2 pr-4 max-w-[420px] truncate" title={l.message || ""}>
                      {l.message || "–"}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 ? (
                  <tr>
                    <td className="py-3 text-slate-600" colSpan={5}>
                      Sin leads todavía.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {loading ? <p className="mt-6 text-slate-600">Cargando…</p> : null}
      </main>
    </div>
  );
}

function formatCOP(n: number) {
  try {
    return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(Math.round(n));
  }
}
