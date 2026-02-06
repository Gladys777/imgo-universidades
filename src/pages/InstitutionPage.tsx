import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { pageTitle, siteUrl } from "../lib/seo";
import { Link, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { ArrowLeft, Search, Scale } from "lucide-react";
import { University } from "../lib/types";
import { normalizeUrl, fixAccents, isSenaName } from "../lib/utils";
import { FixedSizeList as List } from "react-window";
import InstitutionLogo from "../components/InstitutionLogo";
import LeadBox from "../components/LeadBox";
import { track } from "../lib/analytics";

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function InstitutionPage({
  universities,
  dataLoading,
  dataError,
  compareIds,
  setCompareIds
}: {
  universities: University[];
  dataLoading: boolean;
  dataError: string | null;
  compareIds: string[];
  setCompareIds: (next: string[] | ((prev: string[]) => string[])) => void;
}) {
  const { id } = useParams();
  const uni = useMemo(() => universities.find((u) => u.id === id) || null, [universities, id]);

  useEffect(() => {
    if (uni) track("open_institution", { universityId: uni.id });
  }, [uni]);

  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState<number>(100);
  const [page, setPage] = useState<number>(1);
  const debouncedQ = useDebounced(q, 250);

  const programs = useMemo(() => {
    if (!uni) return [];
    const qq = debouncedQ.trim().toLowerCase();
    if (!qq) return uni.programs;
    return uni.programs.filter((p) => `${p.title} ${p.level} ${p.modality} ${p.area}`.toLowerCase().includes(qq));
  }, [uni, debouncedQ]);
useEffect(() => {
  setPage(1);
}, [debouncedQ, id]);

const totalPages = useMemo(() => Math.max(1, Math.ceil(programs.length / pageSize)), [programs.length, pageSize]);
const currentPage = useMemo(() => Math.min(Math.max(1, page), totalPages), [page, totalPages]);

const pageNumbers = useMemo(() => {
  const maxButtons = 7;
  if (totalPages <= maxButtons) return Array.from({ length: totalPages }, (_, i) => i + 1);
  let start = Math.max(1, currentPage - 3);
  let end = Math.min(totalPages, start + (maxButtons - 1));
  start = Math.max(1, end - (maxButtons - 1));
  const nums: number[] = [];
  for (let n = start; n <= end; n++) nums.push(n);
  return nums;
}, [currentPage, totalPages]);
const pageItems = useMemo(() => {
  const start = (currentPage - 1) * pageSize;
  return programs.slice(start, start + pageSize);
}, [programs, currentPage, pageSize]);



  return (
    <div className="min-h-screen bg-slate-50">
  <Helmet>
    <title>{pageTitle(uni ? fixAccents(uni.name) : "Institución")}</title>
    <meta
      name="description"
      content={
        uni
          ? `Programas, modalidades y detalles de ${fixAccents(uni.name)} en ${fixAccents(uni.city)}, ${fixAccents(uni.department)}.`
          : "Ficha de institución educativa en Colombia."
      }
    />
    <link rel="canonical" href={`${siteUrl()}/institucion/${id || ""}`} />
    <meta property="og:title" content={pageTitle(uni ? fixAccents(uni.name) : "Institución")} />
    <meta
      property="og:description"
      content={
        uni
          ? `Explora programas de ${fixAccents(uni.name)} y encuentra la opción ideal.`
          : "Explora instituciones educativas en Colombia."
      }
    />
    <meta property="og:type" content="website" />
  </Helmet>

      <TopBar activeCategory={uni?.category || ""} />

      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            <ArrowLeft size={18} /> Volver
          </Link>
          <Link
            to="/comparar"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#044AA9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#033f93]"
          >
            <Scale size={18} /> Comparar ({compareIds.length}/4)
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {dataLoading && (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 text-sm">Cargando…</div>
        )}
        {dataError && (
          <div className="rounded-2xl bg-red-50 ring-1 ring-red-200 p-4 text-sm">
            Error cargando datos: <span className="font-semibold">{dataError}</span>
          </div>
        )}

        {!dataLoading && !dataError && !uni && (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6">
            <p className="text-sm font-semibold">Institución no encontrada</p>
            <p className="mt-1 text-sm text-slate-600">Verifica el enlace o vuelve al inicio.</p>
          </div>
        )}

        {!dataLoading && !dataError && uni && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold">{fixAccents(uni.name)}</p>
                {isSenaName(uni.name) ? (
                  <span className="text-xs rounded-full px-2 py-1 border border-emerald-200 bg-emerald-50 text-emerald-900">
                    Programas Gratis
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <InstitutionLogo u={uni} size={56} />
                <div className="min-w-0">
                  <p className="text-xs text-slate-600">Logo automático (Clearbit) o iniciales si no existe</p>
                  <p className="text-xs text-slate-500 truncate">Mejora confianza/conversión sin cargar 400 logos a mano.</p>
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {uni.type} · {fixAccents(uni.city)}, {fixAccents(uni.department)}
              </p>

              {isSenaName(uni.name) ? (
                <p className="mt-2 text-xs text-slate-700">
                  Esta institución es <b>SENA</b>: todos los programas se muestran como <b>Gratis</b>.
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
                {uni.institutionCode ? (
                  <span className="rounded-full bg-slate-100 px-2 py-1">SNIES/IES: {uni.institutionCode}</span>
                ) : null}
                <span className="rounded-full bg-slate-100 px-2 py-1">Modalidades: {Array.from(new Set(uni.programs.map((p) => p.modality))).slice(0, 3).join(", ")}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">Áreas: {Array.from(new Set(uni.programs.map((p) => p.area))).slice(0, 3).join(", ")}</span>
              </div>

              {uni.website && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <a
                    href={normalizeUrl(uni.website)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm text-slate-900 underline underline-offset-2"
                  >
                    Ver sitio oficial
                  </a>
                  <span
                    className={
                      "text-[11px] rounded-full px-2 py-0.5 border " +
                      (uni.websiteStatus === "valid"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : uni.websiteStatus === "invalid"
                          ? "border-rose-200 bg-rose-50 text-rose-900"
                          : "border-slate-200 bg-slate-50 text-slate-700")
                    }
                    title={
                      uni.websiteStatus === "valid"
                        ? "Sitio validado"
                        : uni.websiteStatus === "invalid"
                          ? "Sitio con problemas o no validado"
                          : "Pendiente de validación (demo)"
                    }
                  >
                    {uni.websiteStatus === "valid" ? "Validado" : uni.websiteStatus === "invalid" ? "Revisar" : "Sin validar"}
                  </span>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search size={16} className="text-slate-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar dentro de los programas de esta institución…"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <p className="mt-3 text-xs text-slate-600">
                Programas: <span className="font-semibold text-slate-900">{programs.length}</span>
              </p>
<div className="mt-3 flex items-center justify-between gap-2">
  <label className="text-[11px] text-slate-600">Registros por página</label>
  <select
    value={pageSize}
    onChange={(e) => setPageSize(Number(e.target.value))}
    className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs"
  >
    {[50, 100, 200, 500].map((n) => (
      <option key={n} value={n}>
        {n}
      </option>
    ))}
  </select>
</div>

<div className="mt-2 flex flex-wrap items-center justify-between gap-2">
  <button
    onClick={() => setPage((p) => Math.max(1, p - 1))}
    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
    disabled={currentPage <= 1}
    type="button"
  >
    Anterior
  </button>

  <div className="flex items-center gap-1">
    {pageNumbers.map((n) => (
      <button
        key={n}
        onClick={() => setPage(n)}
        className={
          "h-8 w-8 rounded-xl border text-xs " +
          (n === currentPage
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white hover:bg-slate-50")
        }
        type="button"
      >
        {n}
      </button>
    ))}
  </div>

  <button
    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
    disabled={currentPage >= totalPages}
    type="button"
  >
    Siguiente
  </button>
</div>

            </div>

            <div className="rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden">
              <List height={720} itemCount={pageItems.length} itemSize={54} width={"100%"}>
                {({ index, style }: any) => {
                  const p = pageItems[index];
                  return (
                    <div style={style} className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-slate-600 truncate">{p.level} · {p.modality} · {p.area}</p>
                      </div>
                      <Link
                        to={`/programa/${encodeURIComponent(`${uni.id}::${p.id}`)}`}
                        className="text-xs rounded-xl px-3 py-1.5 bg-[#044AA9] text-white hover:bg-[#033f93]"
                      >
                        Ver
                      </Link>
                    </div>
                  );
                }}
              </List>
            </div>

            <LeadBox university={uni} />
          </div>
        )}
      </main>
    </div>
  );
}
