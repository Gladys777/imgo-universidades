import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { pageTitle, siteUrl } from "../lib/seo";
import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import FilterPanel, { Filters } from "../components/FilterPanel";
import ProgramCard from "../components/ProgramCard";
import Modal from "../components/Modal";
import { InstitutionCategory, ProgramHit, University } from "../lib/types";
import { FixedSizeList as List } from "react-window";
import MiniSearch from "minisearch";
import { normalizeText } from "../lib/search";
import TopBar from "../components/TopBar";
import { track } from "../lib/analytics";
import { isSenaName } from "../lib/utils";

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const DEFAULT_FILTERS: Filters = {
  q: "",
  area: "",
  level: "",
  modality: "",
  category: "",
  city: "",
  country: "",
  cityQuery: "",
  countryQuery: "",
  type: "",
  minTuition: 0,
  maxTuition: 60_000_000,
  minDurationMonths: 0,
  maxDurationMonths: 120
};

export default function HomePage({
  universities,
  allHits,
  dataLoading,
  dataError,
  compareIds,
  setCompareIds
}: {
  universities: University[];
  allHits: ProgramHit[];
  dataLoading: boolean;
  dataError: string | null;
  compareIds: string[];
  setCompareIds: (next: string[] | ((prev: string[]) => string[])) => void;
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [details, setDetails] = useState<ProgramHit | null>(null);
  const [pageSize, setPageSize] = useState<number>(50);
  const [page, setPage] = useState<number>(1);

  const location = useLocation();

  // Allow deep-linking to a category from the top nav: /?cat=Internacional
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat") || "";
    if (!cat) return;
    const allowed: InstitutionCategory[] = [
      "Nacional",
      "Internacional",
      "Plataformas Digitales",
      "Idiomas e Inmersión"
    ];
    const next = (allowed.includes(cat as InstitutionCategory) ? (cat as InstitutionCategory) : "") as
      | ""
      | InstitutionCategory;
    setFilters((prev) => ({ ...prev, category: next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const debouncedQ = useDebounced(filters.q, 250);


const hitById = useMemo(() => {
  const m = new Map<string, ProgramHit>();
  for (const h of allHits) m.set(h.id, h);
  return m;
}, [allHits]);

const mini = useMemo(() => {
  // Index only when we have data. This runs once per load.
  const ms = new MiniSearch({
    fields: ["title", "uni", "city", "dept", "area", "level", "modality"],
    storeFields: ["id"],
    searchOptions: { prefix: true }
  });
  // Avoid indexing when empty
  if (allHits.length === 0) return ms;

  const docs = allHits.map((h) => ({
    id: h.id,
    title: h.program.title,
    uni: h.university.name,
    city: h.university.city,
    dept: h.university.department,
    area: h.program.area,
    level: h.program.level,
    modality: h.program.modality
  }));
  ms.addAll(docs);
  return ms;
}, [allHits]);

  const cities = useMemo(
    () => Array.from(new Set(universities.map((u) => u.city))).filter(Boolean).sort(),
    [universities]
  );

  const countries = useMemo(
    () => Array.from(new Set(universities.map((u) => u.country))).filter(Boolean).sort(),
    [universities]
  );

  const filtered = useMemo(() => {
  const q = normalizeText(debouncedQ);

  // Start set: if query exists, use index; otherwise use all hits.
  let base: ProgramHit[] = allHits;

  if (q) {
    const results = mini.search(q);
    const ids = results.slice(0, 4000).map((r: any) => r.id as string);
    base = ids.map((id) => hitById.get(id)).filter(Boolean) as ProgramHit[];
  }

  return base.filter((h) => {
    const { university: u, program: p } = h;
    const isSena = isSenaName(u.name);
    if (filters.category && (u.category || "") !== filters.category) return false;
    if (filters.area && p.area !== filters.area) return false;
    if (filters.level && p.level !== filters.level) return false;
    if (filters.modality && p.modality !== filters.modality) return false;
    if (filters.city && u.city !== filters.city) return false;
    if (filters.country && (u.country || "") !== filters.country) return false;
    if (filters.cityQuery) {
      const cq = normalizeText(filters.cityQuery);
      if (!normalizeText(u.city || "").includes(cq)) return false;
    }
    if (filters.countryQuery) {
      const k = normalizeText(filters.countryQuery);
      if (!normalizeText(u.country || "").includes(k)) return false;
    }
    if (filters.type && u.type !== filters.type) return false;
    // Use min/max ranges (budget + duration)
    // SENA should always show as "Gratis" and must not be excluded by budget filters.
    if (!isSena) {
      if (filters.minTuition && p.tuitionCOPYear < filters.minTuition) return false;
      if (filters.maxTuition && p.tuitionCOPYear > filters.maxTuition) return false;
    }
    if (filters.minDurationMonths && p.durationMonths < filters.minDurationMonths) return false;
    if (filters.maxDurationMonths && p.durationMonths > filters.maxDurationMonths) return false;

    if (!q) return true;
    // If we used the index above, most non-matches are already excluded.
    // Keep a cheap guard for edge cases.
    const hay = normalizeText(`${p.title} ${u.name} ${u.city} ${u.department}`);
    return hay.includes(q);
  });
}, [allHits, debouncedQ, filters, hitById, mini]);

  useEffect(() => {
    const q = debouncedQ.trim();
    if (!q) return;
    track("search", {
      q,
      results: filtered.length,
      category: filters.category || undefined,
      city: filters.city || undefined
    });
  }, [debouncedQ, filtered.length, filters.category, filters.city]);

  useEffect(() => {
    setPage(1);
  }, [filters, debouncedQ]);

const totalPages = useMemo(() => {
  return Math.max(1, Math.ceil(filtered.length / pageSize));
}, [filtered.length, pageSize]);

const currentPage = useMemo(() => {
  return Math.min(Math.max(1, page), totalPages);
}, [page, totalPages]);

const pageItems = useMemo(() => {
  const start = (currentPage - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}, [filtered, currentPage, pageSize]);

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




  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const exists = list.includes(id);
      if (exists) return list.filter((x) => x !== id);
      if (list.length >= 4) return list; // límite
      return [...list, id];
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
  <Helmet>
    <title>{pageTitle()}</title>
    <meta
      name="description"
      content="Metabúsqueda y comparación de programas y universidades en Colombia. Filtra por modalidad, nivel, ciudad y más."
    />
    <link rel="canonical" href={`${siteUrl()}/`} />
    <meta property="og:title" content={pageTitle()} />
    <meta
      property="og:description"
      content="Compara programas e instituciones educativas en Colombia con filtros avanzados."
    />
    <meta property="og:type" content="website" />
  </Helmet>

      <TopBar activeCategory={filters.category || ""} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 px-6 py-10 text-center">
          <img
            src="/assets/imgo_logo.png"
            alt="ImGo"
            className="mx-auto h-14 w-auto"
            loading="eager"
            decoding="async"
          />
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Encuentra tu carrera ideal
          </h1>
<div id="search" className="mt-8 flex flex-col sm:flex-row items-stretch justify-center gap-3">
            <div className="w-full sm:w-[560px] rounded-2xl border border-[#f1c08a] bg-white px-4 py-3 flex items-center gap-3">
              <Search size={20} className="text-[#044AA9]" />
              <input
                value={filters.q}
                onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                placeholder="¿Qué te gustaría estudiar?"
                className="w-full outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                // No-op: search is live; keep for UX parity with the mock.
                const el = document.getElementById("search");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="rounded-2xl bg-[#ff8a1f] px-10 py-3 font-semibold text-white shadow-sm hover:brightness-95"
            >
              Buscar
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {(["", "Internacional", "Plataformas Digitales", "Idiomas e Inmersión"] as const).map((cat) => {
              const label = cat ? cat : `Todos (${universities.length})`;
              const active = (filters.category || "") === cat;

              const base = "rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition";
              const activeCls = "ring-slate-200";
              const inactiveCls = "ring-slate-200 hover:brightness-95";

              const palette = (c: string) => {
                if (!c) return { bg: "bg-slate-100", text: "text-slate-900" };
                if (c === "Internacional") return { bg: "bg-[#bfe2ff]", text: "text-[#044AA9]" };
                if (c === "Plataformas Digitales") return { bg: "bg-[#ffb24a]", text: "text-white" };
                return { bg: "bg-[#d8f2d8]", text: "text-[#1b6b3a]" };
              };
              const p = palette(cat);
              const cls =
                base +
                " " +
                p.bg +
                " " +
                p.text +
                " " +
                (active ? activeCls : inactiveCls);
              return (
                <button
                  key={cat || "all"}
                  type="button"
                  className={cls}
                  onClick={() => setFilters((p) => ({ ...p, category: cat }))}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Program list */}
        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-extrabold text-slate-900">Programas de estudios</h2>
            <Link
              to="/comparar"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Comparar ({compareIds.length}/4)
            </Link>
          </div>

          <div className="mt-5 rounded-3xl bg-white ring-1 ring-slate-200 p-4">
            {/* Inline filters like the mock */}
            <FilterPanel filters={filters} setFilters={setFilters} cities={cities} countries={countries} compact />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Resultados: <span className="font-semibold text-slate-900">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600">Registros</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs"
                >
                  {[25, 50, 100, 200].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6">
          {dataLoading && (
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 text-sm">
              Cargando instituciones y programas…
            </div>
          )}
          {dataError && (
            <div className="rounded-2xl bg-red-50 ring-1 ring-red-200 p-4 text-sm">
              Error cargando datos: <span className="font-semibold">{dataError}</span>
            </div>
          )}

          {!dataLoading && !dataError && filtered.length === 0 && (
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6">
              <p className="text-sm font-semibold">Sin resultados</p>
              <p className="mt-1 text-sm text-slate-600">Ajusta filtros o prueba otra búsqueda.</p>
            </div>
          )}

          {!dataLoading && !dataError && pageItems.length > 0 && (
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden">
              <List height={720} itemCount={pageItems.length} itemSize={190} width={"100%"}>
                {({ index, style }: any) => {
                  const h = pageItems[index];
                  return (
                    <div style={style} className="px-3 py-3 border-b border-slate-100">
                      <ProgramCard
                        hit={h}
                        selected={compareIds.includes(h.id)}
                        onToggleCompare={() => toggleCompare(h.id)}
                        onOpenDetails={() => setDetails(h)}
                      />
                    </div>
                  );
                }}
              </List>
            </div>
          )}

          {!dataLoading && !dataError && filtered.length > 0 && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
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
                        "h-8 min-w-[32px] rounded-xl px-2 text-xs ring-1 " +
                        (n === currentPage
                          ? "bg-[#044AA9] text-white ring-[#044AA9]"
                          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50")
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

              <p className="text-[11px] text-slate-600">
                Página <span className="font-semibold text-slate-900">{currentPage}</span> /{" "}
                <span className="font-semibold text-slate-900">{totalPages}</span>
              </p>
            </div>
          )}

          </div>
        </section>
      </main>

      <Modal
        open={!!details}
        title={details ? details.program.title : "Programa"}
        onClose={() => setDetails(null)}
      >
        {details && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
              <p className="text-sm font-semibold">{details.program.title}</p>
              <p className="text-xs text-slate-600">
                {details.university.name} · {details.university.city}, {details.university.department}
              </p>

              <Link
                to={`/institucion/${details.university.id}`}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#044AA9] px-3 py-2 text-xs text-white hover:bg-[#033f93]"
              >
                Ver institución
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}