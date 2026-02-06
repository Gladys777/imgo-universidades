import path from "node:path";
import { writeJSON, sleep } from "./_helpers.mjs";

const OUT_FILE = path.resolve("scripts/out/sena_programs.json");
const BASE = "https://betowa.sena.edu.co/oferta";

function extractLinks(html) {
  const linkRe = /href="(\/oferta\/[^"]+\?[^"]*programId=\d+)"/g;
  const links = [];
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    links.push("https://betowa.sena.edu.co" + m[1].replace(/&amp;/g, "&"));
  }
  return Array.from(new Set(links));
}

async function fetchPage(page) {
  const url = `${BASE}?page=${page}`;
  const res = await fetch(url, { headers: { "Accept": "text/html" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  return await res.text();
}

async function main() {
  const html1 = await fetchPage(1);
  const pagesMatch = html1.match(/página\s+\d+\s+de\s+(\d+)/i);
  const totalPages = pagesMatch ? Number(pagesMatch[1]) : 63;

  const map = new Map();

  for (let p = 1; p <= totalPages; p++) {
    const html = p === 1 ? html1 : await fetchPage(p);
    const links = extractLinks(html);

    for (const url of links) {
      const u = new URL(url);
      const programId = u.searchParams.get("programId") || "";
      const modality = u.searchParams.get("modality") || "";
      const slug = u.pathname.split("/").pop() || "";
      const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      if (programId) map.set(programId, { programId, modality, title, url });
    }

    await sleep(250);
  }

  const out = Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title, "es"));
  writeJSON(OUT_FILE, out);
  console.log(`✅ Listo: ${OUT_FILE} (${out.length} programas)`);
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
