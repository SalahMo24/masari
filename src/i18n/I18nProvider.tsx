import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DevSettings, I18nManager } from "react-native";

import { Locale, strings } from "./strings";

type I18nContextValue = {
  locale: Locale;
  isRtl: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const DEFAULT_LOCALE: Locale = "ar";
type I18nProviderProps = {
  children: React.ReactNode;
};

const LOCALE_STORAGE_KEY = "masari.locale";
/**
 * Persisted direction key — survives JS bundle reloads (unlike a module-level
 * variable). Stores the direction ("rtl" | "ltr") we last triggered a reload
 * for so we never reload twice for the same direction.
 */
const APPLIED_DIRECTION_KEY = "masari.appliedDirection";

function isRtlLocale(locale: Locale): boolean {
  return locale === "ar";
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  // ── Hydrate saved locale ──────────────────────────────────────────
  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      .then((saved) => {
        if (!active || (saved !== "en" && saved !== "ar")) return;
        setLocale((prev) => (prev === saved ? prev : saved));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // ── Persist locale & sync native layout direction ─────────────────
  useEffect(() => {
    if (!isHydrated) return;

    let active = true;

    (async () => {
      const shouldBeRtl = isRtlLocale(locale);
      const targetDir = shouldBeRtl ? "rtl" : "ltr";

      // 1. Persist locale first (survives a potential reload).
      try {
        await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
      } catch {
        // Best-effort; continue to sync direction.
      }

      // 2. Always tell the native side what direction we want.
      I18nManager.allowRTL(shouldBeRtl);
      I18nManager.forceRTL(shouldBeRtl);

      if (!active) return;

      // 3. Native direction already matches — record it and we're done.
      if (I18nManager.isRTL === shouldBeRtl) {
        try {
          await AsyncStorage.setItem(APPLIED_DIRECTION_KEY, targetDir);
        } catch {}
        return;
      }

      // 4. We already reloaded for this exact direction once.
      //    In Expo Go the native flag may not persist across reloads;
      //    reloading again would cause an infinite loop, so bail out.
      try {
        const appliedDir = await AsyncStorage.getItem(APPLIED_DIRECTION_KEY);
        if (appliedDir === targetDir) return;
      } catch {}

      // 5. First time we need this direction — record it, then reload once.
      try {
        await AsyncStorage.setItem(APPLIED_DIRECTION_KEY, targetDir);
      } catch {}

      if (active && typeof DevSettings?.reload === "function") {
        DevSettings.reload();
      }
    })();

    return () => {
      active = false;
    };
  }, [isHydrated, locale]);

  // ── Context value ─────────────────────────────────────────────────
  const setLocaleAndPersist = useCallback((nextLocale: Locale) => {
    setLocale(nextLocale);
  }, []);

  const isRtl = isRtlLocale(locale);

  const value = useMemo<I18nContextValue>(
    () => {
      const dictionary = strings[locale] ?? strings[DEFAULT_LOCALE];
      return {
        locale,
        isRtl,
        setLocale: setLocaleAndPersist,
        toggleLocale: () =>
          setLocaleAndPersist(locale === "ar" ? "en" : "ar"),
        t: (key: string) => dictionary[key] ?? strings.en[key] ?? key,
      };
    },
    [locale, isRtl, setLocaleAndPersist],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
