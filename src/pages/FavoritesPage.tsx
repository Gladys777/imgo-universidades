import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import TopBar from "../components/TopBar";
import { ProgramHit, University } from "../lib/types";
import { Link } from "react-router-dom";
import { track } from "../lib/analytics";
import { isSenaName, fixAccents } from "../lib/utils";

type AlertConfig = { maxCOPYear: number };

type AlertMap = Record<string, AlertConfig>;

const FAV_KEY = "imgo_favorites";
const ALERT_KEY = "imgo_favorite_alerts";

export default function FavoritesPage({
  universities,
  allHits
}: {
  universities: University[];
  allHits: ProgramHit[];
}) {
  const hitById = useMemo(() => {
    const m = new Map<string, ProgramHit>();
    for (const h of allHits) m.set(h.id, h);
    return m;
  }, [allHits]);

  const [favIds, setFavIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [alerts, setAlerts] = useState<AlertMap>(() => {
    try {
      const raw = localStorage.getItem(ALERT_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? (parsed as AlertMap) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favIds));
    } catch {}
  }, [favIds]);

  useEffect(() => {
    try {
      localStorage.setItem(ALERT_KEY, JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  const favorites = useMemo(() => {
    return favIds.map((id) => hitById.get(id)).filter(Boolean) as ProgramHit[];
  }, [favIds, hitById]);

  const triggered = useMemo(() => {
    const out: { id: string; hit: ProgramHit; current: number; threshold: number }[] = [];
    for (const id of favIds) {
      const hit = hitById.get(id);
      const a = alerts[id];
      if (!hit || !a) continue;
      const min = hit.program.tuitionCOPYearMin ?? Math.round(hit.program.tuitionCOPYear * 0.9);
      if (min <= a.maxCOPYear) {
        out.push({ id, hit, current: min, threshold: a.maxCOPYear });
      }
    }
    return out;
  }, [favIds, hitById, alerts]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Favoritos y alertas | ImGo</title>
      </Helmet>
      <TopBar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Favoritos y alertas</h1>
        <p className="mt-1 text-slate-700">
          Guarda programas y crea alertas tipo “avísame si baja el precio / si el estimado queda por debajo de X”.
          (Demo local con almacenamiento en tu navegador)
        </p>

        {triggered.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="font-semibold text-amber-900">Alertas activas</div>
            <div className="mt-3 space-y-2">
              {triggered.map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-white border border-amber-100 px-3 py-2">
                  <div>
                    <div className="text-sm font-semibold">{fixAccents(t.hit.program.title)}</div>
                    <div className="text-xs text-slate-600">{fixAccents(t.hit.university.name)}</div>
                  </div>
                  <div className="text-sm text-amber-900">
                    Estimado actual: <b>${formatCOP(t.current)}</b> / año · Umbral: <b>${formatCOP(t.threshold)}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Tus favoritos</h2>

          {favorites.length === 0 ? (
            <div className="mt-3 text-slate-600">
              Aún no tienes favoritos. Abre un programa y toca “Guardar en favoritos”.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {favorites.map((h) => (
                <FavoriteCard
                  key={h.id}
                  hit={h}
                  alert={alerts[h.id]}
                  onRemove={() => {
                    setFavIds((prev) => prev.filter((x) => x !== h.id));
                    track("favorite_toggle", { id: h.id, on: false });
                  }}
                  onSetAlert={(max) => {
                    setAlerts((prev) => ({ ...prev, [h.id]: { maxCOPYear: max } }));
                  }}
                  onClearAlert={() => {
                    setAlerts((prev) => {
                      const copy = { ...prev };
                      delete copy[h.id];
                      return copy;
                    });
                  }}
                />
              ))}
            </div>
          )}

          <div className="mt-6 text-sm text-slate-600">
            Tip: tus comparaciones son compartibles desde <Link className="underline" to="/comparar">Comparar</Link>.
          </div>
        </section>
      </main>
    </div>
  );
}

function FavoriteCard({
  hit,
  alert,
  onRemove,
  onSetAlert,
  onClearAlert
}: {
  hit: ProgramHit;
  alert?: AlertConfig;
  onRemove: () => void;
  onSetAlert: (max: number) => void;
  onClearAlert: () => void;
}) {
  const isSena = isSenaName(hit.university.name);
  const min = hit.program.tuitionCOPYearMin ?? Math.round(hit.program.tuitionCOPYear * 0.9);
  const max = hit.program.tuitionCOPYearMax ?? Math.round(hit.program.tuitionCOPYear * 1.1);

  const [maxInput, setMaxInput] = useState<number>(alert?.maxCOPYear || min);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{fixAccents(hit.program.title)}</div>
          <div className="text-xs text-slate-600">{fixAccents(hit.university.name)}</div>
          <div className="mt-2 text-sm text-slate-800">
            {isSena ? (
              <>Costo: <b>Gratis</b></>
            ) : (
              <>Costo estimado: <b>${formatCOP(min)} – ${formatCOP(max)}</b> / año</>
            )}
          </div>
        </div>
        <button onClick={onRemove} className="text-sm rounded-xl px-3 py-2 bg-white border border-slate-200">
          Quitar
        </button>
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
        <Link
          to={`/programa/${encodeURIComponent(hit.id)}`}
          className="text-sm rounded-xl px-3 py-2 bg-slate-900 text-white w-fit"
        >
          Ver
        </Link>

        <div className="flex-1" />

        {!isSena ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={String(maxInput)}
              onChange={(e) => setMaxInput(Number(e.target.value || 0))}
              className="w-40 rounded-xl border border-slate-200 px-3 py-2"
              min={0}
            />
            <button
              onClick={() => onSetAlert(maxInput)}
              className="text-sm rounded-xl px-3 py-2 bg-white border border-slate-200"
            >
              {alert ? "Actualizar alerta" : "Crear alerta"}
            </button>
            {alert ? (
              <button onClick={onClearAlert} className="text-sm rounded-xl px-3 py-2 bg-white border border-slate-200">
                Borrar
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {!isSena ? (
        <div className="mt-2 text-xs text-slate-600">
          {alert ? (
            <>Alerta activa si el estimado baja a ≤ <b>${formatCOP(alert.maxCOPYear)}</b> / año.</>
          ) : (
            <>Sin alerta aún.</>
          )}
        </div>
      ) : (
        <div className="mt-2 text-xs text-slate-600">Programas del SENA: costo <b>Gratis</b>.</div>
      )}
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
