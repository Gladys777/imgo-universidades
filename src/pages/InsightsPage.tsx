import React, { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import { Helmet } from "react-helmet-async";

type Metrics = {
  ok: boolean;
  totals: {
    uniqueUsers: number;
    pageViews: number;
    leads: number;
    agreements: number;
  };
  funnel: { step: string; users: number }[];
};

const ADMIN_TOKEN_KEY = "imgo_admin_token";

export default function InsightsPage() {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY) || "admin-demo";
    } catch {
      return "admin-demo";
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Metrics | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/metrics", {
        headers: { "x-admin-token": token }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message || String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } catch {}
  }, [token]);

  const conversion = useMemo(() => {
    const unique = data?.totals.uniqueUsers || 0;
    const leads = data?.totals.leads || 0;
    return unique > 0 ? Math.round((leads / unique) * 1000) / 10 : 0;
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Insights (Tracción & Embudo) | ImGo</title>
      </Helmet>
      <TopBar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Insights</h1>
            <p className="mt-1 text-slate-700">
              Tracción, retención (proxy), embudo y monetización (demo local). Esto es lo que un inversionista quiere ver.
            </p>
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
              <button
                onClick={load}
                className="rounded-xl px-4 py-2 bg-slate-900 text-white"
              >
                Recargar
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Por defecto: <span className="font-mono">admin-demo</span>. (Configurable en servidor)
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            {error}
          </div>
        ) : null}

        <section className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat title="Usuarios únicos" value={data?.totals.uniqueUsers ?? "–"} />
          <Stat title="Page views" value={data?.totals.pageViews ?? "–"} />
          <Stat title="Leads" value={data?.totals.leads ?? "–"} />
          <Stat title="Conversión a lead" value={data ? `${conversion}%` : "–"} />
        </section>

        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Embudo</h2>
            <p className="text-sm text-slate-600">Usuarios por paso (conteo único por sessionId).</p>
            <div className="mt-4 space-y-2">
              {(data?.funnel || []).map((f) => (
                <div key={f.step} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-sm font-medium">{labelStep(f.step)}</span>
                  <span className="text-sm text-slate-700">{f.users}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Monetización (demo)</h2>
            <p className="text-sm text-slate-600">
              Cada lead crea un registro en el pipeline de acuerdos. Luego en Admin puedes marcar etapa y valor esperado.
            </p>
            <ul className="mt-4 list-disc pl-6 text-sm text-slate-700 space-y-1">
              <li>Lead → Contactado → Reunión → Propuesta → Cerrado</li>
              <li>Modelo sugerido: pago mensual por lead calificado o CPA.</li>
              <li>Este módulo es local; en producción se conecta a CRM real.</li>
            </ul>
          </div>
        </section>

        {loading ? <p className="mt-6 text-slate-600">Cargando…</p> : null}
      </main>
    </div>
  );
}

function labelStep(step: string) {
  switch (step) {
    case "search":
      return "Buscar";
    case "open_institution":
      return "Abrir institución";
    case "open_program":
      return "Abrir programa";
    case "lead_submit":
      return "Enviar lead";
    default:
      return step;
  }
}

function Stat({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold text-slate-600">{title}</div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{String(value)}</div>
    </div>
  );
}
