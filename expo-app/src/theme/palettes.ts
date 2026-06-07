// Accent palettes. Same keys we used on the web wireframe so screenshots
// match across both surfaces.

export type AccentKey = "crimson" | "navy" | "olive" | "ink";

export const PK_PALETTES: Record<AccentKey, { accent: string; label: string }> = {
  crimson: { accent: "#C8102E", label: "Crimson" },
  navy:    { accent: "#0C2D5A", label: "Navy" },
  olive:   { accent: "#3F4A1F", label: "Olive" },
  ink:     { accent: "#0A0A0A", label: "Ink" },
};
