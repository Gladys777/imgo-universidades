import React from "react";
import { Link } from "react-router-dom";
import { Plus, X } from "lucide-react";
import Badge from "./Badge";
import InstitutionLogo from "./InstitutionLogo";
import { ProgramHit } from "../lib/types";
import { formatCOP, isSenaName, fixAccents } from "../lib/utils";

function priceBadge(program: ProgramHit["program"]) {
  const pr = program.priceRangeCOP;
  if (pr) {
    const label = pr.min === pr.max ? formatCOP(pr.min) : `${formatCOP(pr.min)}–${formatCOP(pr.max)}`;
    const suffix = pr.billing === "curso" ? " / curso" : pr.billing === "mes" ? " / mes" : " / año";
    return `${label}${suffix}`;
  }
  const min = program.tuitionCOPYearMin ?? Math.round(program.tuitionCOPYear * 0.9);
  const max = program.tuitionCOPYearMax ?? Math.round(program.tuitionCOPYear * 1.1);
  const label = min === max ? formatCOP(min) : `${formatCOP(min)}–${formatCOP(max)}`;
  const note = program.tuitionNote ? ` · ${program.tuitionNote}` : " · Estimado";
  return `${label} / año${note}`;
}

export default function ProgramCard({
  hit,
  selected,
  onToggleCompare,
  onOpenDetails
}: {
  hit: ProgramHit;
  selected: boolean;
  onToggleCompare: () => void;
  onOpenDetails: () => void;
}) {
  const { university, program } = hit;
  // Reviews are not shown as demo; indicators are used instead.

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <InstitutionLogo u={university} size={48} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-tight truncate">{fixAccents(program.title)}</h3>
              <p className="mt-0.5 text-xs text-slate-600 truncate">
                {fixAccents(university.name)} · {fixAccents(university.city)}, {fixAccents(university.department)}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2 shrink-0">
              <Link
                to={`/institucion/${university.id}`}
                className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50"
                title="Ver ficha de la institución"
              >
                Ver más
              </Link>

              <Link
                to={`/programa/${hit.id}`}
                className="inline-flex items-center rounded-xl bg-[#044AA9] px-3 py-2 text-xs text-white hover:bg-[#033f93]"
                title="Abrir ficha del programa"
              >
                Ver programa
              </Link>

              <button
                onClick={onOpenDetails}
                className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50"
                title="Ver detalles rápidos"
                type="button"
              >
                Detalles
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge>{program.level}</Badge>
            <Badge>{program.modality}</Badge>
            <Badge>{program.area}</Badge>
            <Badge>{Math.round(program.durationMonths / 6)} sem</Badge>
            <Badge>{isSenaName(university.name) ? "Gratis" : priceBadge(program)}</Badge>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              {university.institutionCode ? (
                <span className="rounded-full bg-slate-100 px-2 py-1">SNIES/IES: {university.institutionCode}</span>
              ) : null}
              <span className="rounded-full bg-slate-100 px-2 py-1">Programas: {university.programs.length}</span>
            </div>

            <button
              onClick={onToggleCompare}
              className={
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs " +
                (selected
                  ? "border-[#044AA9] bg-[#044AA9] text-white hover:bg-[#033f93]"
                  : "border-slate-200 hover:bg-slate-50")
              }
              type="button"
            >
              {selected ? (
                <>
                  Quitar <X size={14} />
                </>
              ) : (
                <>
                  Comparar <Plus size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
