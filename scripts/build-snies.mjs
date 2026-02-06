import path from "node:path";
import { pick, socrataFetchAll, slugify, writeJSON, normalizeText } from "./_helpers.mjs";

const OUT_FILE = path.resolve("src/data/universities.json");

// Datasets (Socrata / datos.gov.co)
const DATASET_IES = "n5yy-8nav";
const DATASET_PROGRAMS = "upr9-nkiz";

/**
 * FIX v4 (robusto a cambios de columnas):
 * - En tu salida: "IES con SNIES: 0 | IES con institutionCode: 0"
 *   => el dataset IES no trae esas keys como las esperábamos.
 *
 * Solución:
 * 1) Descarga PROGRAMAS y detecta el campo de institución (casi siempre "codigoinstitucion")
 * 2) Construye un Set con los códigos de institución existentes en PROGRAMAS (normalizados)
 * 3) Escanea las columnas del dataset IES y detecta automáticamente cuál key contiene códigos
 *    que aparecen en ese Set (por frecuencia).
 * 4) Indexa IES por esa key detectada y vincula.
 *
 * Resultado: Programas vinculados > 0 aunque cambien los nombres de campos del IES.
 */

function normCode(v) {
  if (v === undefined || v === null) return "";
  let s = String(v).trim();
  if (/^\d+\.\d+$/.test(s)) s = s.split(".")[0];
  s = s.replace(/\D+/g, "");
  s = s.replace(/^0+/, "");
  return s;
}

function detectKeyByMatches(rows, codeSet, sampleN = 4000) {
  const counts = new Map();
  const n = Math.min(sampleN, rows.length);

  for (let i = 0; i < n; i++) {
    const row = rows[i];
    if (!row || typeof row !== "object") continue;

    for (const k of Object.keys(row)) {
      const v = normCode(row[k]);
      if (!v) continue;
      if (codeSet.has(v)) counts.set(k, (counts.get(k) || 0) + 1);
    }
  }

  const ranking = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15);
  return { bestKey: ranking[0]?.[0], ranking };
}

function heuristicKey(rows, includeProgramPenalty = true) {
  const keys = Object.keys(rows[0] || {});
  const score = (k) => {
    const s = k.toLowerCase();
    let pts = 0;
    if (s.includes("snies")) pts += 6;
    if (s.includes("institucion") || s.includes("instit")) pts += 4;
    if (s.includes("ies")) pts += 3;
    if (s.includes("inst")) pts += 1;
    if (s.includes("codigo")) pts += 2;
    if (includeProgramPenalty && s.includes("program")) pts -= 4;
    if (s.includes("depart") || s.includes("municip") || s.includes("origen")) pts -= 2;
    return pts;
  };
  const ranked = keys.map(k => [k, score(k)]).sort((a,b)=>b[1]-a[1]);
  const best = ranked[0]?.[1] > 0 ? ranked[0][0] : undefined;
  return { best, ranked: ranked.slice(0, 12) };
}

function normalizeIES(row, { codeKey }) {
  const code = normCode(row?.[codeKey]);

  const name = pick(row, ["nombre_institucion", "nombre_ies", "institucion", "ies", "nombre", "nombreinstitucion"]);
  const dept = pick(row, ["departamento", "depto", "departamento_ies", "nombredepartinstitucion"]);
  const city = pick(row, ["municipio", "ciudad", "municipio_ies", "municipio_de_oferta", "nombremunicipioinstitucion"]);
  const type = pick(row, ["caracter_academico", "sector", "naturaleza", "tipo_institucion", "caracteracademico"]) || "";
  const website = pick(row, ["pagina_web", "sitio_web", "web", "url", "pagina"]);

  const idBase = code || Math.random().toString(16).slice(2);

  return {
    id: slugify(`${name ?? "ies"}-${idBase}`) || `ies-${idBase}`,
    // Guardamos el código detectado para auditoría:
    institutionCode: code,
    name: normalizeText(name),
    type: String(type || "").includes("Oficial")
      ? "Pública"
      : (String(type || "").includes("Privad") ? "Privada" : "Privada"),
    city: normalizeText(city) || "N/A",
    department: normalizeText(dept) || "N/A",
    website: normalizeText(website) || "",
    logo: "",
    programs: [],
    reviews: [],
    raw: row
  };
}

function mapLevel(level) {
  const lvl = String(level || "").toLowerCase();
  let uiLevel = "Pregrado";
  if (lvl.includes("tecno")) uiLevel = "Tecnológico";
  else if (lvl.includes("técn") || lvl.includes("tecnic")) uiLevel = "Técnico";
  else if (lvl.includes("espec")) uiLevel = "Especialización";
  else if (lvl.includes("maestr")) uiLevel = "Maestría";
  else if (lvl.includes("doctor")) uiLevel = "Doctorado";
  return uiLevel;
}

function mapModality(modality) {
  const mod = String(modality || "").toLowerCase();
  let uiMod = "Presencial";
  if (mod.includes("virtual") || mod.includes("distancia")) uiMod = "Virtual";
  else if (mod.includes("hibr") || (mod.includes("pres") && mod.includes("virt"))) uiMod = "Híbrida";
  return uiMod;
}

function parseDurationMonths(duration) {
  let durationMonths = 96;
  const raw = String(duration ?? "");
  const d = Number(raw.replace(",", "."));
  if (!Number.isNaN(d) && d > 0) {
    if (raw.toLowerCase().includes("sem") || (d <= 20 && d >= 1)) durationMonths = Math.round(d * 6);
    else durationMonths = Math.round(d);
  }
  return durationMonths;
}

function normalizeProgram(row) {
  const programId = pick(row, [
    "codigo_snies_del_programa",
    "codigo_snies_programa",
    "cod_programa",
    "snies_programa",
    "codigo_del_programa"
  ]);

  const title = pick(row, ["programa_academico", "nombre_programa", "programa", "denominacion", "nombre_del_programa"]);
  const level = pick(row, ["nivel_de_formacion", "nivel_formacion", "nivel", "ciclo"]);
  const modality = pick(row, ["metodologia", "modalidad", "metodologia_programa"]);
  const area = pick(row, ["area_de_conocimiento", "nucleo_basico_del_conocimiento", "nbc", "area"]);
  const duration = pick(row, ["duracion_estimada", "duracion", "numero_de_semestres", "semestres"]);
  const city = pick(row, ["municipio_de_oferta", "municipio", "ciudad"]);
  const dept = pick(row, ["departamento_de_oferta", "departamento", "depto"]);
  const url = pick(row, ["enlace", "url", "pagina_web", "sitio_web"]);

  return {
    id: slugify(`${title ?? "programa"}-${programId ?? ""}`) || `prog-${Math.random().toString(16).slice(2)}`,
    sniesProgram: normalizeText(programId),
    title: normalizeText(title),
    level: mapLevel(level),
    area: normalizeText(area) || "Otros",
    durationMonths: parseDurationMonths(duration),
    modality: mapModality(modality),
    tuitionCOPYear: 0,
    requirements: [],
    city: normalizeText(city),
    department: normalizeText(dept),
    website: normalizeText(url) || "",
    raw: row
  };
}

async function main() {
  console.log("Descargando instituciones (IES)...");
  const iesRows = await socrataFetchAll(DATASET_IES);

  console.log("Descargando programas...");
  const programRows = await socrataFetchAll(DATASET_PROGRAMS);

  console.log(`IES: ${iesRows.length} | Programas: ${programRows.length}`);

  if (!programRows.length || !iesRows.length) {
    console.log("❌ Dataset vacío. Revisa conexión/red o el dataset.");
    writeJSON(OUT_FILE, []);
    return;
  }

  // 1) Detectar key de institución en PROGRAMAS
  const progKeyDet = detectKeyByMatches(programRows, new Set(), 1); // trivial
  // mejor: heurística en PROGRAMAS
  const hProg = heuristicKey(programRows);
  const programInstitutionKey = hProg.best || "codigoinstitucion";
  console.log(`✅ Key candidata en PROGRAMAS para institución: "${programInstitutionKey}"`);
  console.log("Heurística PROGRAMAS (key:score):", hProg.ranked);

  // 2) Construir set de códigos de institución desde PROGRAMAS
  const programInstSet = new Set();
  for (let i = 0; i < programRows.length; i++) {
    const v = normCode(programRows[i]?.[programInstitutionKey]);
    if (v) programInstSet.add(v);
  }
  console.log(`Códigos institución únicos en PROGRAMAS (aprox): ${programInstSet.size}`);

  // 3) Detectar key de código en IES por matches contra PROGRAMAS
  const detIES = detectKeyByMatches(iesRows, programInstSet);
  let iesCodeKey = detIES.bestKey;
  console.log("Top candidatos IES por matches (key:matches):", detIES.ranking);

  if (!iesCodeKey) {
    // fallback: heurística de nombre en IES
    const hIES = heuristicKey(iesRows, false);
    iesCodeKey = hIES.best;
    console.log("Heurística IES (key:score):", hIES.ranked);
  }

  if (!iesCodeKey) {
    console.log("❌ No se pudo detectar el campo de código institución en IES.");
    console.log("Keys disponibles en IES:", Object.keys(iesRows[0] || {}));
    writeJSON(OUT_FILE, []);
    return;
  }

  console.log(`✅ Campo detectado en IES para vincular: "${iesCodeKey}"`);
  console.log("Ejemplo IES fila0 valor:", iesRows[0]?.[iesCodeKey]);

  // 4) Normalizar IES y crear índice por el código detectado
  const iesByCode = new Map();
  const universities = [];

  for (const row of iesRows) {
    const u = normalizeIES(row, { codeKey: iesCodeKey });
    if (!u.name || !u.institutionCode) continue;
    iesByCode.set(u.institutionCode, u);
    universities.push(u);
  }

  console.log(`IES indexadas por código detectado: ${iesByCode.size}`);

  // 5) Vincular programas
  let attached = 0;

  for (const row of programRows) {
    const code = normCode(row?.[programInstitutionKey]);
    const ies = iesByCode.get(code);
    if (!ies) continue;

    const p = normalizeProgram(row);
    if (!p.title) continue;

    ies.programs.push({
      id: p.id,
      title: p.title,
      level: p.level,
      area: p.area,
      durationMonths: p.durationMonths,
      modality: p.modality,
      tuitionCOPYear: 0,
      requirements: []
    });

    if (!ies.website && p.website) ies.website = p.website;
    if ((ies.city === "N/A" || !ies.city) && p.city) ies.city = p.city;
    if ((ies.department === "N/A" || !ies.department) && p.department) ies.department = p.department;

    attached++;
  }

  console.log(`Programas vinculados: ${attached}`);

  const SNIES_FALLBACK = "https://snies.mineducacion.gov.co/portal/consultas/";
  const filtered = universities
    .filter((u) => u.programs.length > 0)
    .map((u) => ({ ...u, website: u.website || SNIES_FALLBACK }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  console.log(`IES con programas: ${filtered.length}`);

  writeJSON(OUT_FILE, filtered);
  console.log(`✅ Listo: ${OUT_FILE}`);
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
