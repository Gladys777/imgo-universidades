import React from "react";
import { Link } from "react-router-dom";

export default function Brand({ subtitle }: { subtitle?: string }) {
  return (
    <Link to="/" className="flex flex-col items-center justify-center select-none">
      <img
        src="/assets/imgo_logo.png"
        alt="ImGo"
        className="h-10 w-auto"
        loading="eager"
        decoding="async"
      />
      {subtitle ? (
        <span className="mt-0.5 text-[11px] text-slate-500 text-center">{subtitle}</span>
      ) : null}
    </Link>
  );
}
