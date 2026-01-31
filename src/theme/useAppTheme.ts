import { useTheme } from "@react-navigation/native";

import type { AppTheme } from "./theme";

export function useAppTheme() {
  return useTheme() as AppTheme;
}
