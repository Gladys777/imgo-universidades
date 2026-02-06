import React from "react";
import { Link } from "react-router-dom";
import { Linkedin, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-6 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">ImGo</p>
            <p className="mt-1 text-xs text-slate-500">vire2025</p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link to="/sobre" className="text-slate-600 hover:text-slate-900">Sobre ImGo</Link>
            <Link to="/terminos" className="text-slate-600 hover:text-slate-900">Términos</Link>
            <Link to="/privacidad" className="text-slate-600 hover:text-slate-900">Privacidad</Link>
            <Link to="/contacto" className="text-slate-600 hover:text-slate-900">Contacto</Link>
          </nav>

          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-600">
              <Linkedin size={18} />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-pink-600">
              <Instagram size={18} />
            </a>
            <a href="https://wa.me/573000000000" target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600">
              <MessageCircle size={14} />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} ImGo. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-slate-500">
            ImGo no es una institución educativa: es un comparador. Datos: SNIES / fuentes públicas y aportes de instituciones.
            Información orientativa; verifica siempre con la institución.
          </p>
        </div>
      </div>
    </footer>
  );
}
