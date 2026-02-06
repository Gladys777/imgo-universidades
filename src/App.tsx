import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ProgramHit, University } from "./lib/types";
import HomePage from "./pages/HomePage";
import InstitutionPage from "./pages/InstitutionPage";
import ComparePage from "./pages/ComparePage";
import ProgramPage from "./pages/ProgramPage";
import Footer from "./components/Footer";
import AboutPage from "./pages/AboutPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import AdminPage from "./pages/AdminPage";
import InsightsPage from "./pages/InsightsPage";
import FavoritesPage from "./pages/FavoritesPage";
import { track } from "./lib/analytics";
import { isSenaName } from "./lib/utils";

function flattenPrograms(unis: University[]): ProgramHit[] {
  const hits: ProgramHit[] = [];
  for (const u of unis) {
    const sena = isSenaName(u.name);
    for (const p of u.programs) {
      if (sena) {
        hits.push({
          id: `${u.id}::${p.id}`,
          university: u,
          program: {
            ...p,
            tuitionCOPYear: 0,
            tuitionCOPYearMin: 0,
            tuitionCOPYearMax: 0,
            tuitionNote: "Gratis"
          }
        });
      } else {
        hits.push({ id: `${u.id}::${p.id}`, university: u, program: p });
      }
    }
  }
  return hits;
}

export default function App() {
  const location = useLocation();
  const [universities, setUniversities] = useState<University[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("imgo_compare_ids");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("imgo_compare_ids", JSON.stringify(compareIds));
    } catch {}
  }, [compareIds]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setDataLoading(true);
        setDataError(null);
        const res = await fetch("/data/universities.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        // Remove institutions that have 0 programs (investor feedback)
        const cleaned = list.filter((u: any) => Array.isArray(u?.programs) && u.programs.length > 0);
        if (!cancelled) setUniversities(cleaned);
      } catch (e: any) {
        if (!cancelled) setDataError(e?.message || String(e));
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    track("page_view", { path: location.pathname, search: location.search });
  }, [location.pathname, location.search]);

  const allHits = useMemo(() => flattenPrograms(universities), [universities]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Routes>
      <Route
        path="/"
        element={
          <HomePage
            universities={universities}
            allHits={allHits}
            dataLoading={dataLoading}
            dataError={dataError}
            compareIds={compareIds}
            setCompareIds={setCompareIds}
          />
        }
      />
      <Route
        path="/institucion/:id"
        element={
          <InstitutionPage
            universities={universities}
            dataLoading={dataLoading}
            dataError={dataError}
            compareIds={compareIds}
            setCompareIds={setCompareIds}
          />
        }
      />
      <Route
        path="/programa/:id"
        element={
          <ProgramPage
            allHits={allHits}
            dataLoading={dataLoading}
            dataError={dataError}
            compareIds={compareIds}
            setCompareIds={setCompareIds}
          />
        }
      />
      <Route
        path="/comparar"
        element={
          <ComparePage
            allHits={allHits}
            compareIds={compareIds}
            setCompareIds={setCompareIds}
            dataLoading={dataLoading}
            dataError={dataError}
          />
        }
      />
      <Route path="/sobre" element={<AboutPage />} />
      <Route path="/terminos" element={<TermsPage />} />
      <Route path="/privacidad" element={<PrivacyPage />} />
      <Route path="/favoritos" element={<FavoritesPage universities={universities} allHits={allHits} />} />
      <Route path="/insights" element={<InsightsPage />} />
      <Route path="/admin" element={<AdminPage universities={universities} />} />
      <Route path="/contacto" element={<ContactPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
      </div>
      <Footer />
    </div>
  );
}
