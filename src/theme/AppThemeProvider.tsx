import { ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import React, { createContext, useContext, useMemo, useState } from "react";

import { AppTheme, darkTheme, lightTheme } from "./theme";

type ThemeMode = "light" | "dark";

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  theme: AppTheme;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined,
);

type AppThemeProviderProps = {
  children: React.ReactNode;
};

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    systemScheme === "dark" ? "dark" : "light",
  );

  const theme = mode === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode: () => {
        setMode((current) => (current === "dark" ? "light" : "dark"));
      },
      theme,
    }),
    [mode, theme],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider value={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within AppThemeProvider");
  }
  return context;
}
