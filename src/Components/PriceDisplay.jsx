import React from "react";
import { formatEGP } from "../lib/currency";

function PriceDisplay({ price, comparePrice, size = "md" }) {
  const numPrice = Number(price);
  const numCompare = Number(comparePrice);
  const hasDiscount =
    comparePrice != null && comparePrice !== "" && numCompare > numPrice;

  const discountPct = hasDiscount
    ? Math.round((1 - numPrice / numCompare) * 100)
    : 0;

  const sizes = {
    sm: {
      sale: "text-[15px]",
      original: "text-[12px]",
      badge: "text-[10px] px-1.5 py-0.5",
    },
    md: {
      sale: "text-[18px]",
      original: "text-[13px]",
      badge: "text-[11px] px-2 py-0.5",
    },
    lg: {
      sale: "text-3xl",
      original: "text-base",
      badge: "text-xs px-2.5 py-1",
    },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`font-bold text-primary leading-none ${s.sale}`}>
          {formatEGP(numPrice)}
        </span>
        {hasDiscount && (
          <span
            className={`font-semibold bg-red-500 text-white rounded-full leading-none ${s.badge}`}
          >
            Save {discountPct}%
          </span>
        )}
      </div>
      {hasDiscount && (
        <span className={`text-gray-400 line-through leading-none ${s.original}`}>
          {formatEGP(numCompare)}
        </span>
      )}
    </div>
  );
}

export default PriceDisplay;
