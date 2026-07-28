import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

export function formatNumberWithCommas(value: string | number): string {
  if (value === "" || value === null || value === undefined) return "";
  const numStr = String(value).replace(/[^0-9.]/g, "");
  if (!numStr) return "";
  const parts = numStr.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export function parseFormattedNumber(value: string): string {
  return value.replace(/,/g, "");
}

type FormattedPriceInputProps = {
  minPrice: string;
  maxPrice: string;
  onApplyPrice: (min: string, max: string) => void;
};

export const FormattedPriceInput: React.FC<FormattedPriceInputProps> = ({
  minPrice,
  maxPrice,
  onApplyPrice,
}) => {
  const [formattedMin, setFormattedMin] = useState(formatNumberWithCommas(minPrice));
  const [formattedMax, setFormattedMax] = useState(formatNumberWithCommas(maxPrice));

  useEffect(() => {
    setFormattedMin(formatNumberWithCommas(minPrice));
    setFormattedMax(formatNumberWithCommas(maxPrice));
  }, [minPrice, maxPrice]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFormattedNumber(e.target.value);
    if (rawVal === "" || /^\d*\.?\d*$/.test(rawVal)) {
      setFormattedMin(formatNumberWithCommas(rawVal));
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFormattedNumber(e.target.value);
    if (rawVal === "" || /^\d*\.?\d*$/.test(rawVal)) {
      setFormattedMax(formatNumberWithCommas(rawVal));
    }
  };

  const handleApply = () => {
    onApplyPrice(parseFormattedNumber(formattedMin), parseFormattedNumber(formattedMax));
  };

  const pricePresets = [
    { label: "< 1M ₫", min: "", max: "1000000" },
    { label: "1M - 5M ₫", min: "1000000", max: "5000000" },
    { label: "5M - 20M ₫", min: "5000000", max: "20000000" },
    { label: "> 20M ₫", min: "20000000", max: "" },
  ];

  return (
    <div className="space-y-4.5 p-2 w-full">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <span className="text-xs font-bold text-foreground tracking-wide uppercase">
          Price Filter (VND)
        </span>
        <span className="text-[11px] text-muted-foreground font-semibold">
          Currency: <span className="text-accent font-bold">VND (₫)</span>
        </span>
      </div>

      {/* Min & Max Inputs */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent font-bold text-xs">₫</span>
          <input
            type="text"
            placeholder="Min (e.g. 1,000,000)"
            value={formattedMin}
            onChange={handleMinChange}
            className="w-full pl-8 pr-3 py-2 bg-muted/40 border border-border rounded-xl text-xs outline-none focus:border-accent text-foreground transition-all font-medium"
          />
        </div>
        <span className="text-muted-foreground text-xs font-bold">-</span>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent font-bold text-xs">₫</span>
          <input
            type="text"
            placeholder="Max (e.g. 5,000,000)"
            value={formattedMax}
            onChange={handleMaxChange}
            className="w-full pl-8 pr-3 py-2 bg-muted/40 border border-border rounded-xl text-xs outline-none focus:border-accent text-foreground transition-all font-medium"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          className="bg-accent text-accent-foreground hover:opacity-90 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Check className="w-3.5 h-3.5" />
          Apply
        </button>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1">
        {pricePresets.map((preset) => {
          const isActive = minPrice === preset.min && maxPrice === preset.max;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onApplyPrice(preset.min, preset.max)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-accent/20 border-accent text-accent shadow-xs"
                  : "bg-muted/30 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
