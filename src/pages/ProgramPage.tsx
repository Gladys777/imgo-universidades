import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { ArrowLeft, Scale } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { pageTitle, siteUrl } from "../lib/seo";
import { ProgramHit } from "../lib/types";
import LeadBox from "../components/LeadBox";
import Badge from "../components/Badge";
import { formatCOP, isSenaName, fixAccents } from "../lib/utils";
import { track } from "../lib/analytics";

function priceText(
  pr?: { min: number; max: number; billing: "curso" | "mes" | "año" },
  tuition?: number,
  tuitionMin?: number,
  tuitionMax?: number,
  tuitionNote?: string
) {
  if (pr) {
    const label = pr.min === pr.max ? formatCOP(pr.min) : `${formatCOP(pr.min)}–${formatCOP(pr.max)}`;
    const suffix = pr.billing === "curso" ? " / curso" : pr.billing === "mes" ? " / mes" : " / año";
    return `${label}${suffix}`;
  }
  const min = tuitionMin ?? Math.round((tuition || 0) * 0.9);
  const max = tuitionMax ?? Math.round((tuition || 0) * 1.1);
  const label = min === max ? formatCOP(min) : `${formatCOP(min)}–${formatCOP(max)}`;
  const note = tuitionNote ? ` · ${tuitionNote}` : " · Estimado";
  return `${label} / año${note}`;
}

export default function ProgramPage({
  allHits,
  dataLoading,
  dataError,
  compareIds,
  setCompareIds
}: {
  allHits: ProgramHit[];
  dataLoading: boolean;
  dataError: string | null;
  compareIds: string[];
  setCompareIds: (next: string[] | ((prev: string[]) => string[])) => void;
}) {
  const { id } = useParams();
  const hit = useMemo(() => allHits.find((h) => h.id === id) || null, [allHits, id]);

  useEffect(() => {
    if (hit) track("open_program", { programId: hit.id, universityId: hit.university.id });
  }, [hit]);

  // Reviews are demo; we use indicators.

  const selected = !!id && compareIds.includes(id);

  const [favIds, setFavIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("imgo_favorites");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("imgo_favorites", JSON.stringify(favIds));
    } catch {}
  }, [favIds]);

  function toggleCompare() {
    if (!id || !hit) return;
    setCompareIds((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const exists = list.includes(id);
      if (exists) return list.filter((x) => x !== id);
      if (list.length >= 4) return list;
      return [...list, id];
    });
  }

  const isFav = !!id && favIds.includes(id);
  function toggleFav() {
    if (!id) return;
    setFavIds((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const on = list.includes(id);
      track("favorite_toggle", { id, on: !on });
      return on ? list.filter((x) => x !== id) : [...list, id];
    });
  }

  useEffect(() => {
    if (hit) track("open_program", { id: hit.id, uniId: hit.university.id });
  }, [hit]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>{pageTitle(hit ? hit.program.title : "Programa")}</title>
        <meta
          name="description"
          content={
            hit
              ? `Detalles del programa ${hit.program.title} en ${hit.university.name} (${hit.university.city}, ${hit.university.department}).`
              : "Ficha de programa educativo en Colombia."
          }
        />
        <link rel="canonical" href={`${siteUrl()}/programa/${id || ""}`} />
        <meta property="og:title" content={pageTitle(hit ? hit.program.title : "Programa")} />
        <meta
          property="og:description"
          content={hit ? `Compara y explora este programa en ${hit.university.name}.` : "Explora programas en Colombia."}
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <TopBar activeCategory={hit?.university.category || ""} />

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

        {!dataLoading && !dataError && !hit && (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6">
            <p className="text-sm font-semibold">Programa no encontrado</p>
            <p className="mt-1 text-sm text-slate-600">Verifica el enlace o vuelve al inicio.</p>
          </div>
        )}

        {!dataLoading && !dataError && hit && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-6">
              <p className="text-lg font-semibold">{fixAccents(hit.program.title)}</p>
              <p className="mt-1 text-sm text-slate-600">
                <Link to={`/institucion/${hit.university.id}`} className="underline underline-offset-2 text-slate-900">
                  {fixAccents(hit.university.name)}
                </Link>{" "}
                · {fixAccents(hit.university.city)}, {fixAccents(hit.university.department)}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{hit.program.level}</Badge>
                <Badge>{hit.program.modality}</Badge>
                <Badge>{hit.program.area}</Badge>
                <Badge>{Math.round(hit.program.durationMonths / 6)} sem</Badge>
                <Badge>
                  {isSenaName(hit.university.name)
                    ? "Gratis"
                    : priceText(
                        hit.program.priceRangeCOP,
                        hit.program.tuitionCOPYear,
                        hit.program.tuitionCOPYearMin,
                        hit.program.tuitionCOPYearMax,
                        hit.program.tuitionNote
                      )}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  {hit.university.institutionCode ? (
                    <span className="rounded-full bg-slate-100 px-2 py-1">SNIES/IES: {hit.university.institutionCode}</span>
                  ) : null}
                  <span className="rounded-full bg-slate-100 px-2 py-1">Programas: {hit.university.programs.length}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">Modalidad: {hit.program.modality}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFav}
                    className={
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs " +
                      (isFav ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:bg-slate-50")
                    }
                    type="button"
                  >
                    {isFav ? "Guardado" : "Guardar en favoritos"}
                  </button>

                  <button
                  onClick={toggleCompare}
                  className={
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs " +
                    (selected
                      ? "border-[#044AA9] bg-[#044AA9] text-white hover:bg-[#033f93]"
                      : "border-slate-200 hover:bg-slate-50")
                  }
                  type="button"
                >
                  {selected ? "Quitar de comparar" : "Agregar a comparar"}
                  </button>
                </div>
              </div>

              {hit.university.website ? (
                <div className="mt-4">
                  <a
                    href={hit.university.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-sm text-slate-900 underline underline-offset-2"
                  >
                    Abrir sitio web
                  </a>
                  <p className="mt-1 text-xs text-slate-600">
                    Nota: si el enlace proviene de una fuente pública (p. ej. SNIES) y no es el dominio oficial, puede requerir validación.
                  </p>
                </div>
              ) : null}
            </div>

            <LeadBox university={hit.university} programId={hit.program.id} />
          </div>
        )}
      </main>
    </div>
  );
}
