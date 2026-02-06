import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";

const palette = {
  // nileGreen: { deep: "#0A8554", base: "#10B981" },
  nileGreen: { deep: "#2e8b57", base: "#2e8b57" },
  pharaonicGold: { deep: "#D4AF37", base: "#F59E0B" },
  // egyptianBlue: { deep: "#1034A6", base: "#1E40AF" },
  egyptianBlue: { deep: "#1134a7", base: "#1134a7" },
  blackEarth: { deep: "#0F172A", base: "#1C1917" },
  linenWhite: { warm: "#F5F5DC", base: "#FAFAF9", light: "#f4f1ea" },
  desertRed: { deep: "#DC2626", base: "#EA580C" },
  stone: { light: "#E7E5E4", mid: "#57534E", dark: "#1F2937" },
};

export type AppTheme = Theme & {
  colors: Theme["colors"] & {
    accent: string;
    success: string;
    warning: string;
    danger: string;
    mutedText: string;
  };
};

export const lightTheme: AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.nileGreen.base,
    background: palette.linenWhite.light,
    card: palette.linenWhite.base,
    text: palette.blackEarth.base,
    border: palette.stone.light,
    notification: palette.pharaonicGold.base,
    accent: palette.egyptianBlue.base,
    success: palette.nileGreen.base,
    warning: palette.pharaonicGold.base,
    danger: palette.desertRed.base,
    mutedText: palette.stone.mid,
  },
};

export const darkTheme: AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: palette.nileGreen.deep,
    background: palette.blackEarth.deep,
    card: palette.blackEarth.base,
    text: palette.linenWhite.base,
    border: palette.stone.dark,
    notification: palette.pharaonicGold.deep,
    accent: palette.egyptianBlue.deep,
    success: palette.nileGreen.base,
    warning: palette.pharaonicGold.base,
    danger: palette.desertRed.deep,
    mutedText: "#CBD5E1",
  },
};

export { palette };
