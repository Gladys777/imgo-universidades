import React from "react";
import { InstitutionCategory, InstitutionType, Modality } from "../lib/types";

export type Filters = {
  q: string;
  area: string;
  level: string;
  modality: "" | Modality;
  category: "" | InstitutionCategory;
  city: string; // exact match (dropdown)
  country: string; // exact match (dropdown)
  cityQuery: string; // contains match (textbox)
  countryQuery: string; // contains match (textbox)
  type: "" | InstitutionType;
  minTuition: number; // COP/year
  maxTuition: number; // COP/year
  minDurationMonths: number;
  maxDurationMonths: number;
};

const AREAS = [
  "",
  "Ingeniería y Tecnología",
  "Negocios",
  "Salud",
  "Derecho",
  "Ciencias Sociales",
  "Artes y Humanidades",
  "Ciencias",
  "Educación",
  "Otros"
] as const;

const LEVELS = ["", "Técnico", "Tecnológico", "Pregrado", "Especialización", "Maestría", "Doctorado"] as const;

export default function FilterPanel({
  filters,
  setFilters,
  cities,
  countries,
  compact
}: {
  filters: Filters;
  setFilters: (next: Filters) => void;
  cities: string[];
  countries: string[];
  compact?: boolean;
}) {
  function patch(p: Partial<Filters>) {
    setFilters({ ...filters, ...p });
  }

  if (compact) {
    return (
      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-44 flex-none">
          <select
            value={filters.modality}
            onChange={(e) => patch({ modality: e.target.value as any })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          >
            <option value="">Modalidad</option>
            <option value="Presencial">Presencial</option>
            <option value="Virtual">Virtual</option>
            <option value="Híbrida">Híbrida</option>
          </select>
        </div>

        <div className="w-44 flex-none">
          <select
            value={filters.category}
            onChange={(e) => patch({ category: e.target.value as any })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          >
            <option value="">Categoría</option>
            <option value="Nacional">Nacional</option>
            <option value="Internacional">Internacional</option>
            <option value="Plataformas Digitales">Plataformas Digitales</option>
            <option value="Idiomas e Inmersión">Idiomas e Inmersión</option>
          </select>
        </div>

        <div className="w-44 flex-none">
          <select
            value={filters.area}
            onChange={(e) => patch({ area: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          >
            <option value="">Área</option>
            {AREAS.filter((a) => a !== "").map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="w-44 flex-none">
          <select
            value={filters.level}
            onChange={(e) => patch({ level: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          >
            <option value="">Nivel</option>
            {LEVELS.filter((l) => l !== "").map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="w-44 flex-none">
          <select
            value={filters.city}
            onChange={(e) => patch({ city: e.target.value, cityQuery: "" })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          >
            <option value="">Ciudad</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

<div className="w-44 flex-none">
          <select
            value={filters.country}
            onChange={(e) => patch({ country: e.target.value, countryQuery: "" })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          >
            <option value="">País</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
</div>
    );
  }

  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate-700">Búsqueda</label>
        <input
          value={filters.q}
          onChange={(e) => patch({ q: e.target.value })}
          placeholder="Ej: ingeniería, medicina, data, derecho…"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-700">Categoría</label>
          <select
            value={filters.category}
            onChange={(e) => patch({ category: e.target.value as any })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Todas</option>
            <option value="Nacional">Nacional</option>
            <option value="Internacional">Internacional</option>
            <option value="Plataformas Digitales">Plataformas Digitales</option>
            <option value="Idiomas e Inmersión">Idiomas e Inmersión</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">Área</label>
          <select
            value={filters.area}
            onChange={(e) => patch({ area: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a === "" ? "Todas" : a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">Nivel</label>
          <select
            value={filters.level}
            onChange={(e) => patch({ level: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l === "" ? "Todos" : l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">Modalidad</label>
          <select
            value={filters.modality}
            onChange={(e) => patch({ modality: e.target.value as any })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Todas</option>
            <option value="Presencial">Presencial</option>
            <option value="Virtual">Virtual</option>
            <option value="Híbrida">Híbrida</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">Tipo</label>
          <select
            value={filters.type}
            onChange={(e) => patch({ type: e.target.value as any })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Todas</option>
            <option value="Pública">Pública</option>
            <option value="Privada">Privada</option>
            <option value="Universidad Internacional">Universidad Internacional</option>
            <option value="Plataforma">Plataforma</option>
            <option value="Bootcamp">Bootcamp</option>
            <option value="Academia">Academia</option>
            <option value="Centro">Centro</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">Ciudad (texto)</label>
          <input
            value={filters.cityQuery}
            onChange={(e) => patch({ cityQuery: e.target.value })}
            placeholder="Ej: Bogotá, Medellín, Cali"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700">País</label>
          <input
            value={filters.countryQuery}
            onChange={(e) => patch({ countryQuery: e.target.value })}
            placeholder="Ej: Colombia, México, España"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700">Ciudad</label>
        <select
          value={filters.city}
          onChange={(e) => patch({ city: e.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="">Todas</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Presupuesto (COP / año)</label>
          <span className="text-xs text-slate-600">
            {filters.minTuition.toLocaleString("es-CO")} – {filters.maxTuition.toLocaleString("es-CO")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            value={String(filters.minTuition)}
            onChange={(e) => patch({ minTuition: Number(e.target.value || 0) })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Mín"
          />
          <input
            type="number"
            min={0}
            value={String(filters.maxTuition)}
            onChange={(e) => patch({ maxTuition: Number(e.target.value || 0) })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Máx"
          />
        </div>
        <input
          type="range"
          min={500000}
          max={50000000}
          step={500000}
          value={filters.maxTuition}
          onChange={(e) => patch({ maxTuition: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Duración (meses)</label>
          <span className="text-xs text-slate-600">
            {filters.minDurationMonths} – {filters.maxDurationMonths}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            value={String(filters.minDurationMonths)}
            onChange={(e) => patch({ minDurationMonths: Number(e.target.value || 0) })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Mín"
          />
          <input
            type="number"
            min={0}
            value={String(filters.maxDurationMonths)}
            onChange={(e) => patch({ maxDurationMonths: Number(e.target.value || 0) })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Máx"
          />
        </div>
        <input
          type="range"
          min={12}
          max={180}
          step={6}
          value={filters.maxDurationMonths}
          onChange={(e) => patch({ maxDurationMonths: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() =>
            setFilters({
              q: "",
              area: "",
              level: "",
              modality: "",
              category: "",
              city: "",
              cityQuery: "",
              countryQuery: "",
              type: "",
              minTuition: 0,
              maxTuition: 50000000,
              minDurationMonths: 0,
              maxDurationMonths: 180
            })
          }
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        >
          Limpiar filtros
        </button>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Nota: este proyecto viene con datos de ejemplo (Colombia) para correr localmente. Puedes ampliar el JSON o
        conectarlo a una API más adelante.
      </p>
    </div>
  );
}
