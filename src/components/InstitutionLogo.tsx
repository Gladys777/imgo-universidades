import React, { useMemo, useState } from "react";
import { University } from "../lib/types";

function domainFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const a = parts[0]?.[0] || "I";
  const b = parts.length > 1 ? parts[1][0] : parts[0]?.[1] || "";
  return (a + b).toUpperCase();
}

export default function InstitutionLogo({
  u,
  size = 64,
  rounded = true
}: {
  u: University;
  size?: number;
  rounded?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  const src = useMemo(() => {
    const explicit = (u.logo || "").trim();
    if (explicit) return explicit;
    const d = domainFromUrl(u.website || "");
    if (!d) return "";
    // Clearbit logo: good enough for demo, avoids manual 400 logos.
    return `https://logo.clearbit.com/${d}`;
  }, [u.logo, u.website]);

  const cls = `${rounded ? "rounded-xl" : ""} bg-slate-100 border border-slate-200`;

  if (!src || failed) {
    return (
      <div
        className={`${cls} flex items-center justify-center text-slate-700 font-semibold`}
        style={{ width: size, height: size }}
        aria-label={`Logo de ${u.name}`}
      >
        {initials(u.name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Logo de ${u.name}`}
      className={cls}
      style={{ width: size, height: size, objectFit: "contain", padding: 8 }}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
