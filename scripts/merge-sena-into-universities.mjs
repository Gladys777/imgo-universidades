import fs from "node:fs";
import path from "node:path";
import { slugify, normalizeText, writeJSON } from "./_helpers.mjs";

const UNIS = path.resolve("src/data/universities.json");
const SENA = path.resolve("scripts/out/sena_programs.json");

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function modalityFromCode(code) {
  const c = String(code || "").toUpperCase();
  if (c === "V") return "Virtual";
  if (c === "P") return "Presencial";
  if (c === "H") return "Híbrida";
  return "Presencial";
}

function guessLevel(title) {
  const t = String(title || "").toLowerCase();
  if (t.includes("tecnólogo") || t.includes("tecnologo")) return "Tecnológico";
  if (t.includes("técnico") || t.includes("tecnico")) return "Técnico";
  return "Técnico";
}

function guessArea(title) {
  const t = String(title || "").toLowerCase();
  if (t.includes("salud") || t.includes("enfer") || t.includes("medic")) return "Salud";
  if (t.includes("software") || t.includes("sistemas") || t.includes("datos") || t.includes("program")) return "Ingeniería y Tecnología";
  if (t.includes("negocio") || t.includes("admin") || t.includes("contab") || t.includes("finan")) return "Negocios";
  if (t.includes("cocina") || t.includes("gastr") || t.includes("arte")) return "Artes y Humanidades";
  if (t.includes("educ")) return "Educación";
  if (t.includes("derech") || t.includes("jur")) return "Derecho";
  return "Otros";
}

async function main() {
  if (!fs.existsSync(UNIS)) throw new Error(`No existe ${UNIS}. Primero corre: npm run data:snies`);
  if (!fs.existsSync(SENA)) throw new Error(`No existe ${SENA}. Primero corre: npm run data:sena`);

  const universities = readJSON(UNIS);
  const senaPrograms = readJSON(SENA);

  const filtered = Array.isArray(universities) ? universities.filter(u => u?.id !== "sena") : [];

  const sena = {
    id: "sena",
    name: "SENA (Servicio Nacional de Aprendizaje)",
    type: "Pública",
    city: "Nacional",
    department: "Colombia",
    website: "https://www.sena.edu.co/",
    logo: "https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png",
    programs: [],
    reviews: [
      { name: "Estudiante", rating: 5, text: "Oferta amplia y gratuita; buena conexión con empleabilidad." }
    ]
  };

  for (const sp of senaPrograms) {
    const title = normalizeText(sp.title);
    const modality = modalityFromCode(sp.modality);

    sena.programs.push({
      id: slugify(`sena-${sp.programId}-${title}`) || `sena-${sp.programId}`,
      title,
      level: guessLevel(title),
      area: guessArea(title),
      durationMonths: 12,
      modality,
      tuitionCOPYear: 0,
      requirements: ["Inscripción SENA / convocatoria vigente"]
    });
  }

  if (sena.programs.length === 0) {
    console.warn("SENA no trajo programas; no se anexó.");
    writeJSON(UNIS, filtered);
    return;
  }

  filtered.push(sena);
  filtered.sort((a, b) => String(a.name).localeCompare(String(b.name), "es"));

  writeJSON(UNIS, filtered);
  console.log(`✅ SENA integrado en ${UNIS} (programas: ${sena.programs.length})`);
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
