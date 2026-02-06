import React from "react";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-3xl bg-white ring-1 ring-slate-200 p-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Términos</h1>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <p>
            <b>ImGo no es una institución educativa</b>: es un comparador. La información publicada es orientativa y puede estar desactualizada.
            ImGo no representa a las instituciones ni garantiza cupos, precios o condiciones.
          </p>
          <p>Al usar ImGo aceptas que debes verificar directamente con la institución/plataforma antes de tomar decisiones.</p>
          <p>
            <b>Fuentes de datos:</b> SNIES y otras fuentes públicas, más aportes de instituciones/plataformas. El uso está sujeto a los términos de
            las fuentes y a la normativa vigente.
          </p>
          <p>
            Si una institución desea corregir/actualizar su información o solicitar la eliminación de contenidos, puede hacerlo desde la página de
            <Link to="/contacto" className="text-[#044AA9] hover:underline"> contacto</Link>.
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
