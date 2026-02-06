import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { pageTitle, siteUrl } from "../lib/seo";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CompareTable from "../components/CompareTable";
import { ProgramHit } from "../lib/types";
import TopBar from "../components/TopBar";
import { track } from "../lib/analytics";

export default function ComparePage({
  allHits,
  compareIds,
  setCompareIds,
  dataLoading,
  dataError
}: {
  allHits: ProgramHit[];
  compareIds: string[];
  setCompareIds: (next: string[] | ((prev: string[]) => string[])) => void;
  dataLoading: boolean;
  dataError: string | null;
}) {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const ids = (sp.get("ids") || "").split(",").map((s) => decodeURIComponent(s.trim())).filter(Boolean);
    if (ids.length > 0 && compareIds.length === 0) {
      setCompareIds(ids.slice(0, 4));
    }
    // track opening of compare page
    track("compare_open", { idsCount: compareIds.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const hits = useMemo(() => {
    const set = new Set(compareIds);
    return allHits.filter((h) => set.has(h.id));
  }, [allHits, compareIds]);

  const shareUrl = useMemo(() => {
    try {
      const u = new URL(window.location.href);
      u.pathname = "/comparar";
      u.searchParams.set("ids", compareIds.map((x) => encodeURIComponent(x)).join(","));
      return u.toString();
    } catch {
      return `/comparar?ids=${compareIds.map((x) => encodeURIComponent(x)).join(",")}`;
    }
  }, [compareIds]);

  return (
    <div className="min-h-screen bg-slate-50">
  <Helmet>
    <title>{pageTitle("Comparar")}</title>
    <meta name="description" content="Compara hasta 4 programas educativos y toma una mejor decisión." />
    <link rel="canonical" href={`${siteUrl()}/comparar`} />
    <meta property="og:title" content={pageTitle("Comparar")} />
    <meta property="og:description" content="Compara programas por nivel, modalidad, duración y más." />
    <meta property="og:type" content="website" />
  </Helmet>

      <TopBar />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            <ArrowLeft size={18} /> Volver
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                } catch {}
              }}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              disabled={compareIds.length === 0}
            >
              {copied ? "Link copiado" : "Compartir link"}
            </button>

            <button
            onClick={() => setCompareIds([])}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Limpiar comparación
            </button>
          </div>
        </div>
        {dataLoading && (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 text-sm">Cargando…</div>
        )}
        {dataError && (
          <div className="rounded-2xl bg-red-50 ring-1 ring-red-200 p-4 text-sm">
            Error cargando datos: <span className="font-semibold">{dataError}</span>
          </div>
        )}
        {!dataLoading && !dataError && hits.length === 0 && (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6">
            <p className="text-sm font-semibold">No tienes programas para comparar</p>
            <p className="mt-1 text-sm text-slate-600">Vuelve al inicio y selecciona hasta 4.</p>
          </div>
        )}
        {!dataLoading && !dataError && hits.length > 0 && (
          <CompareTable
            items={hits}
            onClear={() => setCompareIds([])}
            onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
          />
        )}
      </main>
    </div>
  );
}
