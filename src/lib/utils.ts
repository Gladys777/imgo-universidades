export function formatCOP(value: number): string {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return `$ ${Math.round(value).toLocaleString("es-CO")}`;
  }
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}


export function normalizeUrl(url?: string) {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

export function isSenaName(name?: string) {
  if (!name) return false;
  return name.toLowerCase().includes("sena");
}

// Best-effort accent fixes for common Spanish words that often come without tildes in raw datasets.
// This is only for display; search/filtering already normalizes accents.
export function fixAccents(text?: string) {
  if (!text) return "";
  let s = String(text);
  const reps: Array<[RegExp, string]> = [
    [/\bEspecializacion\b/g, "Especialización"],
    [/\bespecializacion\b/g, "especialización"],
    [/\bMaestria\b/g, "Maestría"],
    [/\bmaestria\b/g, "maestría"],
    [/\bDoctorado\b/g, "Doctorado"],
    [/\bAdministracion\b/g, "Administración"],
    [/\badministracion\b/g, "administración"],
    [/\bTecnologia\b/g, "Tecnología"],
    [/\btecnologia\b/g, "tecnología"],
    [/\bIngenieria\b/g, "Ingeniería"],
    [/\bingenieria\b/g, "ingeniería"],
    [/\bEducacion\b/g, "Educación"],
    [/\beducacion\b/g, "educación"],
    [/\bGestion\b/g, "Gestión"],
    [/\bgestion\b/g, "gestión"],
    [/\bComunicacion\b/g, "Comunicación"],
    [/\bcomunicacion\b/g, "comunicación"],
    [/\bPsicologia\b/g, "Psicología"],
    [/\bpsicologia\b/g, "psicología"],
    [/\bSociologia\b/g, "Sociología"],
    [/\bsociologia\b/g, "sociología"],
    [/\bEconomia\b/g, "Economía"],
    [/\beconomia\b/g, "economía"],
    [/\bPolitica\b/g, "Política"],
    [/\bpolitica\b/g, "política"],
    [/\bBogota\b/g, "Bogotá"],
    [/\bbogota\b/g, "bogotá"],
    [/\bMedellin\b/g, "Medellín"],
    [/\bmedellin\b/g, "medellín"],
    [/\bCucuta\b/g, "Cúcuta"],
    [/\bcucuta\b/g, "cúcuta"],
    [/\bIbague\b/g, "Ibagué"],
    [/\bibague\b/g, "ibagué"],
  ];
  for (const [re, out] of reps) s = s.replace(re, out);
  return s;
}
