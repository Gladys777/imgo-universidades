import fs from "fs";
import path from "path";

const root = process.cwd();
const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || "http://localhost:5173").replace(/\/$/, "");

const dataPath = path.join(root, "public", "data", "universities.json");
let universities = [];
try {
  universities = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  if (!Array.isArray(universities)) universities = [];
} catch {
  universities = [];
}

const urls = [
  { loc: `${siteUrl}/`, changefreq: "daily", priority: "1.0" },
  { loc: `${siteUrl}/comparar`, changefreq: "weekly", priority: "0.6" },
  ...universities.map((u) => ({
    loc: `${siteUrl}/institucion/${u.id}`,
    changefreq: "weekly",
    priority: "0.7"
  }))
];

const now = new Date().toISOString();

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (u) =>
        `  <url>\n` +
        `    <loc>${u.loc}</loc>\n` +
        `    <lastmod>${now}</lastmod>\n` +
        `    <changefreq>${u.changefreq}</changefreq>\n` +
        `    <priority>${u.priority}</priority>\n` +
        `  </url>`
    )
    .join("\n") +
  `\n</urlset>\n`;

const outPath = path.join(root, "public", "sitemap.xml");
fs.writeFileSync(outPath, xml, "utf8");

const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;
fs.writeFileSync(path.join(root, "public", "robots.txt"), robots, "utf8");

console.log(`✅ sitemap.xml generado con ${urls.length} URLs`);
