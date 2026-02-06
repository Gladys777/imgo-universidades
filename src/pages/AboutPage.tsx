import React from "react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Sobre ImGo</h1>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <p>ImGo es un metabuscador para comparar opciones educativas: instituciones nacionales, internacionales, plataformas digitales y programas de idiomas/inmersión.</p>
          <p>La información se muestra como referencia para ayudarte a explorar y comparar; precios, duración y condiciones pueden cambiar.</p>
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
