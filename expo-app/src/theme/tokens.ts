// Design tokens — single source of truth, used by every screen + component.
// No web-only values here (no rgba strings inside CSS properties, etc.) —
// React Native accepts hex + rgba() strings as color values on iOS and Android
// equally, so we keep the rgba() format from the wireframe.

export const ink = "#0A0A0A";
export const ink70 = "rgba(10,10,10,0.70)";
export const ink55 = "rgba(10,10,10,0.55)";
export const ink40 = "rgba(10,10,10,0.40)";
export const ink25 = "rgba(10,10,10,0.25)";
export const ink12 = "rgba(10,10,10,0.12)";
export const ink06 = "rgba(10,10,10,0.06)";

export const paper = "#FFFFFF";
export const paperSoft = "#FAFAFA";
export const canvas = "#EFEDE8";

// Font families. Loaded by useAppFonts() in src/theme/fonts.ts; the names
// here MUST match the keys we register with expo-font.
export const FONT = {
  body: "HankenGrotesk_400Regular",
  bodyMedium: "HankenGrotesk_500Medium",
  bodySemi: "HankenGrotesk_600SemiBold",
  display: "SpaceGrotesk_500Medium",
  displaySemi: "SpaceGrotesk_600SemiBold",
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
} as const;

// Shared radii / spacing scale — kept small on purpose.
export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 20,
  pill: 999,
} as const;

export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;
