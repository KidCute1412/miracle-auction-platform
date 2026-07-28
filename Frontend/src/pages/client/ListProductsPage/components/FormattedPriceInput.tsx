import React, { useState, useEffect } from "react";
import { DollarSign, Check } from "lucide-react";

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
    { label: "< 1Mđ", min: "", max: "1000000" },
    { label: "1M - 5Mđ", min: "1000000", max: "5000000" },
    { label: "5M - 20Mđ", min: "5000000", max: "20000000" },
    { label: "> 20Mđ", min: "20000000", max: "" },
  ];

  return (
    <div className="space-y-3 p-1">
      {/* Min & Max Inputs */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Min đ (e.g. 1,000,000)"
            value={formattedMin}
            onChange={handleMinChange}
            className="w-full pl-8 pr-3 py-1.5 bg-muted/40 border border-border rounded-xl text-xs outline-none focus:border-accent text-foreground transition-all"
          />
        </div>
        <span className="text-muted-foreground text-xs font-semibold">-</span>
        <div className="relative flex-1">
          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Max đ (e.g. 5,000,000)"
            value={formattedMax}
            onChange={handleMaxChange}
            className="w-full pl-8 pr-3 py-1.5 bg-muted/40 border border-border rounded-xl text-xs outline-none focus:border-accent text-foreground transition-all"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          className="bg-accent text-accent-foreground hover:opacity-90 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Check className="w-3.5 h-3.5" />
          Apply
        </button>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
        {pricePresets.map((preset) => {
          const isActive = minPrice === preset.min && maxPrice === preset.max;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onApplyPrice(preset.min, preset.max)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-accent/20 border-accent text-accent font-bold"
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
