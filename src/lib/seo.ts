export const SITE_NAME = "ImGo";

export function siteUrl(): string {
  // Set VITE_SITE_URL in .env for production (e.g., https://tusitio.com)
  const v = (import.meta as any).env?.VITE_SITE_URL as string | undefined;
  return (v && v.trim()) ? v.replace(/\/$/, "") : "http://localhost:5173";
}

export function pageTitle(title?: string): string {
  if (!title) return SITE_NAME;
  return `${title} | ${SITE_NAME}`;
}
