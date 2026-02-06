import React from "react";
import { Star } from "lucide-react";

export default function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1" aria-label={`Calificación: ${full} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < full ? "fill-current text-amber-500" : "text-slate-300"}
        />
      ))}
    </div>
  );
}
