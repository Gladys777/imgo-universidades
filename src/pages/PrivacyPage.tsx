import React from "react";
import TopBar from "../components/TopBar";
import { Helmet } from "react-helmet-async";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Política de privacidad | ImGo</title>
      </Helmet>
      <TopBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">Política de privacidad y tratamiento de datos</h1>
        <p className="mt-2 text-slate-700">
          ImGo es un comparador de instituciones y programas. <span className="font-semibold">ImGo no es una institución educativa</span>
          . Cuando envías un formulario de contacto (lead), autorizas el tratamiento de tus datos para que la institución pueda
          responder.
        </p>

        <section className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">1. Datos que recolectamos</h2>
          <ul className="list-disc pl-6 text-slate-700 space-y-1">
            <li>Datos de contacto: email (obligatorio), nombre y teléfono (opcionales).</li>
            <li>Preferencias: institución y/o programa consultado, y el mensaje que escribas.</li>
            <li>Analítica de uso (demo): páginas visitadas y eventos básicos para medir tracción y embudo.</li>
          </ul>

          <h2 className="text-lg font-semibold">2. Finalidad</h2>
          <ul className="list-disc pl-6 text-slate-700 space-y-1">
            <li>Conectarte con la institución para brindarte información, costos y requisitos.</li>
            <li>Medir tracción, retención y conversión del producto (analítica agregada).</li>
            <li>Mejorar filtros, comparaciones y relevancia del contenido.</li>
          </ul>

          <h2 className="text-lg font-semibold">3. Base legal y autorización</h2>
          <p className="text-slate-700">
            El tratamiento se realiza con tu autorización expresa al marcar la casilla de consentimiento en el formulario.
          </p>

          <h2 className="text-lg font-semibold">4. Compartición</h2>
          <p className="text-slate-700">
            El lead se comparte con la institución seleccionada únicamente para fines de contacto. No vendemos tus datos.
          </p>

          <h2 className="text-lg font-semibold">5. Derechos del titular</h2>
          <p className="text-slate-700">
            Puedes solicitar actualización, corrección o eliminación escribiendo a través de la página de contacto.
          </p>

          <h2 className="text-lg font-semibold">6. Retención</h2>
          <p className="text-slate-700">
            En esta versión demo, los datos se guardan localmente (archivo JSON). En producción se definirán periodos de retención
            y medidas de seguridad.
          </p>
        </section>
      </main>
    </div>
  );
}
