import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MoreHorizontal, Search, Heart, BarChart3, ShieldCheck, Settings } from "lucide-react";
import Brand from "./Brand";

const CATS: Array<{ label: string; value: string }> = [
  { label: "Nacional", value: "Nacional" },
  { label: "Internacional", value: "Internacional" },
  { label: "Plataformas Digitales", value: "Plataformas Digitales" },
  { label: "Idiomas e Inmersión", value: "Idiomas e Inmersión" }
];

function withCatHref(cat: string) {
  const u = new URL(window.location.href);
  u.pathname = "/";
  u.searchParams.set("cat", cat);
  u.hash = "search";
  return u.pathname + u.search + u.hash;
}

export default function TopBar({ activeCategory }: { activeCategory?: string }) {
  const location = useLocation();

  // Avoid window access during SSR (not used here, but keeps TS happy).
  const catHref = (cat: string) => {
    try {
      return withCatHref(cat);
    } catch {
      return `/?cat=${encodeURIComponent(cat)}#search`;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-b from-[#053b86] to-[#044AA9]">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="rounded-3xl bg-white/95 backdrop-blur ring-1 ring-white/40 shadow-sm">
          <div className="px-5 py-3 flex items-center gap-4">
            {/* Left: Brand */}
            <div className="flex items-center">
              <Link to="/" className="block">
                <img
                  src="/assets/imgo_logo.png"
                  alt="ImGo"
                  className="h-9 w-auto"
                  loading="eager"
                  decoding="async"
                />
              </Link>
            </div>

            {/* Center: Category Nav */}
            <nav className="flex-1 flex items-center justify-center gap-8">
              {CATS.map((c) => {
                const isActive = (activeCategory || "") === c.value;
                return (
                  <Link
                    key={c.value}
                    to={catHref(c.value)}
                    className={
                      "text-sm font-semibold transition-colors " +
                      (isActive ? "text-[#044AA9]" : "text-slate-700 hover:text-[#044AA9]")
                    }
                    aria-current={isActive ? "page" : undefined}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/favoritos"
                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100"
                title="Favoritos"
                aria-label="Favoritos"
              >
                <Heart size={20} />
              </Link>
              <Link
                to="/insights"
                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100"
                title="Insights"
                aria-label="Insights"
              >
                <BarChart3 size={20} />
              </Link>
              <Link
                to="/privacidad"
                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100"
                title="Privacidad"
                aria-label="Privacidad"
              >
                <ShieldCheck size={20} />
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100"
                title="Admin"
                aria-label="Admin"
              >
                <Settings size={20} />
              </Link>
              <Link
                to="/comparar"
                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100"
                title="Comparar"
                aria-label="Comparar"
              >
                <MoreHorizontal size={20} />
              </Link>
              <Link
                to={location.pathname === "/" ? "#search" : "/#search"}
                className="inline-flex items-center justify-center rounded-xl p-2 text-[#044AA9] hover:bg-slate-100"
                title="Buscar"
                aria-label="Buscar"
              >
                <Search size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
