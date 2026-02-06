import React from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { ProgramHit } from "../lib/types";
import { normalizeUrl, formatCOP, isSenaName, fixAccents } from "../lib/utils";
import Badge from "./Badge";

export default function CompareTable({
  items,
  onClear,
  onRemove
}: {
  items: ProgramHit[];
  onClear: () => void;
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-600">
        Agrega hasta 3 programas para compararlos.
      </div>
    );
  }

  function priceLabel(h: ProgramHit) {
    if (isSenaName(h.university.name)) return "Gratis";
    const pr = h.program.priceRangeCOP;
    if (pr) {
      const label = pr.min === pr.max ? formatCOP(pr.min) : `${formatCOP(pr.min)}–${formatCOP(pr.max)}`;
      const suffix = pr.billing === "curso" ? " / curso" : pr.billing === "mes" ? " / mes" : " / año";
      return `${label}${suffix}`;
    }
    const min = h.program.tuitionCOPYearMin ?? Math.round(h.program.tuitionCOPYear * 0.9);
    const max = h.program.tuitionCOPYearMax ?? Math.round(h.program.tuitionCOPYear * 1.1);
    const label = min === max ? formatCOP(min) : `${formatCOP(min)}–${formatCOP(max)}`;
    const note = h.program.tuitionNote ? ` · ${h.program.tuitionNote}` : " · Estimado";
    return `${label} / año${note}`;
  }

  const rows: Array<{ label: string; get: (h: ProgramHit) => React.ReactNode }> = [
    { label: "Institución", get: (h) => <span className="font-semibold">{fixAccents(h.university.name)}</span> },
    { label: "Ciudad", get: (h) => fixAccents(h.university.city) },
    { label: "Tipo", get: (h) => <Badge tone={h.university.type === "Pública" ? "emerald" : "sky"}>{h.university.type}</Badge> },
    { label: "Programa", get: (h) => fixAccents(h.program.title) },
    { label: "Nivel", get: (h) => <Badge tone="sky">{h.program.level}</Badge> },
    { label: "Área", get: (h) => <Badge tone="slate">{h.program.area}</Badge> },
    { label: "Modalidad", get: (h) => <Badge tone="emerald">{h.program.modality}</Badge> },
    { label: "Duración", get: (h) => `${h.program.durationMonths} meses` },
    { label: "Costo estimado", get: (h) => <span className="font-semibold">{priceLabel(h)}</span> },
    { label: "Requisitos", get: (h) => <ul className="list-disc pl-5 text-xs text-slate-700">{h.program.requirements.map((r) => <li key={r}>{r}</li>)}</ul> },
    {
      label: "Enlace",
      get: (h) => (
        <a
          href={normalizeUrl(h.university.website)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50"
        >
          Sitio oficial <ExternalLink size={14} />
        </a>
      )
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Comparando <span className="font-semibold">{items.length}</span> programa(s)
        </p>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs hover:bg-slate-50"
        >
          Limpiar comparación <Trash2 size={14} />
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
        <table className="min-w-[720px] w-full bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left text-xs font-semibold text-slate-700 px-4 py-3 w-44">Campo</th>
              {items.map((h) => (
                <th key={h.program.id} className="text-left text-xs font-semibold text-slate-700 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{h.university.name}</span>
                    <button
                      onClick={() => onRemove(h.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                      title="Quitar"
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3 text-xs font-semibold text-slate-700">{r.label}</td>
                {items.map((h) => (
                  <td key={h.program.id + r.label} className="px-4 py-3 text-sm text-slate-800">
                    {r.get(h)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        Tip: en una versión PRO puedes agregar costos por semestre, becas, puntajes de corte, ranking, y filtros por acreditación.
      </p>
    </div>
  );
}
