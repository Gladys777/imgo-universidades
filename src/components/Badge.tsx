import React from "react";
import clsx from "clsx";

export default function Badge({
  children,
  tone = "slate"
}: {
  children: React.ReactNode;
  tone?: "slate" | "emerald" | "amber" | "sky" | "rose";
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200"
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
