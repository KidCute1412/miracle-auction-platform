export type OutfitTheme = "obsidian" | "champagne" | "sapphire";

export interface ThemeColors {
  suitColor: string;
  lapelColor: string;
  lapelStroke: string;
  broochFill: string;
  broochGlow: string;
  hairHighlightStart: string;
  hairHighlightEnd: string;
}

export const OUTFIT_THEMES: Record<OutfitTheme, ThemeColors> = {
  obsidian: {
    suitColor: "#1e293b",
    lapelColor: "#0f172a",
    lapelStroke: "#334155",
    broochFill: "#a78bfa", // Amethyst / purple
    broochGlow: "rgba(167, 139, 250, 0.7)",
    hairHighlightStart: "#a78bfa",
    hairHighlightEnd: "#f472b6"
  },
  champagne: {
    suitColor: "#451a03", // Rich mahogany
    lapelColor: "#270505",
    lapelStroke: "#fbbf24", // Gold rimmed
    broochFill: "#fbbf24", // Golden Amber
    broochGlow: "rgba(251, 191, 36, 0.8)",
    hairHighlightStart: "#fde047",
    hairHighlightEnd: "#f59e0b"
  },
  sapphire: {
    suitColor: "#0f172a",
    lapelColor: "#020617",
    lapelStroke: "#2563eb", // Royal blue rimmed
    broochFill: "#06b6d4", // Sapphire teal
    broochGlow: "rgba(6, 182, 212, 0.8)",
    hairHighlightStart: "#67e8f9",
    hairHighlightEnd: "#3b82f6"
  }
};
