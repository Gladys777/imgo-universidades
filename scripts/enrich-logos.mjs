import fs from "fs";
import path from "path";

function domainFromUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function wikiThumbnail(name) {
  // Search in Spanish Wikipedia first; fallback to English if needed
  const q = encodeURIComponent(name);
  const searchUrl = `https://es.wikipedia.org/w/rest.php/v1/search/title?q=${q}&limit=1`;
  try {
    const s = await fetch(searchUrl, { headers: { "accept": "application/json" } });
    if (!s.ok) return "";
    const js = await s.json();
    const title = js?.pages?.[0]?.title;
    if (!title) return "";
    const sumUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const r = await fetch(sumUrl, { headers: { "accept": "application/json" } });
    if (!r.ok) return "";
    const sum = await r.json();
    const thumb = sum?.thumbnail?.source || "";
    return thumb;
  } catch {
    return "";
  }
}

async function main() {
  const root = process.cwd();
  const dataPath = path.join(root, "public", "data", "universities.json");
  const outPath = dataPath;

  let universities = [];
  try {
    universities = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    if (!Array.isArray(universities)) universities = [];
  } catch {
    universities = [];
  }

  let updatedLogo = 0;
  let updatedImage = 0;

  // Process sequentially to be polite to Wikipedia
  for (const u of universities) {
    if (!u) continue;

    // 1) Logo from domain (unavatar favicon) if missing and website exists
    if (!u.logo && u.website) {
      const d = domainFromUrl(u.website);
      if (d) {
        // unavatar supports /domain/<domain> and /<domain>. use /domain for clarity
        u.logo = `https://unavatar.io/domain/${d}?fallback=false`;
        updatedLogo++;
      }
    }

    // 2) Photo fallback (Wikipedia thumbnail) if still no logo or if you also want a hero image
    if (!u.image) {
      const thumb = await wikiThumbnail(u.name);
      if (thumb) {
        u.image = thumb;
        updatedImage++;
      }
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(universities, null, 0), "utf8");
  console.log(`✅ Logos asignados (unavatar): ${updatedLogo}`);
  console.log(`✅ Fotos asignadas (Wikipedia): ${updatedImage}`);
}

main();
