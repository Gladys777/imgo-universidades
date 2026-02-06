import React from "react";
import { Link } from "react-router-dom";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Contacto</h1>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <p>¿Quieres agregar tu institución o actualizar información? Escríbenos.</p>
          <p>
            <a className="text-[#044AA9] hover:underline" href="mailto:contacto@imgo.com">
              contacto@imgo.com
            </a>
          </p>
        </div>
        <div className="mt-8">
          <Link to="/" className="text-sm font-semibold text-[#044AA9] hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
