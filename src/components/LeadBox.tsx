import React, { useMemo, useState } from "react";
import { University } from "../lib/types";
import { getSessionId, track } from "../lib/analytics";

export default function LeadBox({
  university,
  programId
}: {
  university: University;
  programId?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const canSubmit = useMemo(() => {
    return Boolean(email.trim()) && consent;
  }, [email, consent]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setStatus("loading");
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getSessionId(),
          universityId: university.id,
          programId: programId || "",
          name,
          email,
          phone,
          message,
          consent
        })
      });
      track("lead_submit", { universityId: university.id, programId: programId || "" });
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Solicitar información</h3>
          <p className="text-sm text-slate-600">
            Captura de leads (demo local). Tu información se usa únicamente para que la institución te contacte.
          </p>
        </div>
        <span className="text-xs rounded-full px-2 py-1 bg-slate-100 text-slate-700">Lead</span>
      </div>

      <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (opcional)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email *"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
            type="email"
            required
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Teléfono (opcional)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="¿Qué quieres preguntar? (opcional)"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 min-h-[90px]"
        />

        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          <span>
            Acepto la política de privacidad y el tratamiento de datos para recibir información de la institución.
          </span>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || status === "loading"}
            className="rounded-xl px-4 py-2 bg-slate-900 text-white disabled:opacity-50"
          >
            {status === "loading" ? "Enviando..." : "Enviar"}
          </button>

          {status === "ok" ? (
            <span className="text-sm text-emerald-700">Listo. Te contactarán si hay cupos/disponibilidad.</span>
          ) : null}
          {status === "err" ? (
            <span className="text-sm text-rose-700">No se pudo enviar. Intenta nuevamente.</span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
