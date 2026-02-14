import { useSQLiteContext } from "expo-sqlite";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CurrencyCode, LocaleCode } from "@/src/data/entities";
import { userRepository } from "@/src/data/repositories";
import { useI18n } from "@/src/i18n/useI18n";

type UserPreferencesContextValue = {
  currency: CurrencyCode;
  localeCode: LocaleCode;
  refreshPreferences: () => Promise<void>;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  setLocaleCode: (localeCode: LocaleCode) => Promise<void>;
};

const UserPreferencesContext = createContext<
  UserPreferencesContextValue | undefined
>(undefined);

function mapLocaleCodeToLocale(code: LocaleCode): "ar" | "en" {
  return code === "en-US" ? "en" : "ar";
}

export function UserPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const db = useSQLiteContext();
  const { locale, setLocale } = useI18n();
  const [currency, setCurrencyState] = useState<CurrencyCode>("EGP");
  const [localeCode, setLocaleCodeState] = useState<LocaleCode>("ar-EG");
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshPreferences = useCallback(async () => {
    const user = await userRepository.getOrCreateLocalUser(db);
    if (!mountedRef.current) return;
    setCurrencyState(user.currency);
    setLocaleCodeState(user.locale);
    const nextLocale = mapLocaleCodeToLocale(user.locale);
    if (nextLocale !== locale) {
      setLocale(nextLocale);
    }
  }, [db, locale, setLocale]);

  const setCurrency = useCallback(
    async (nextCurrency: CurrencyCode) => {
      const updated = await userRepository.updateCurrency(db, nextCurrency);
      if (!mountedRef.current) return;
      setCurrencyState(updated.currency);
    },
    [db],
  );

  const setLocaleCode = useCallback(
    async (nextLocaleCode: LocaleCode) => {
      const updated = await userRepository.updateLocale(db, nextLocaleCode);
      if (!mountedRef.current) return;
      setLocaleCodeState(updated.locale);
      const nextLocale = mapLocaleCodeToLocale(updated.locale);
      if (nextLocale !== locale) {
        setLocale(nextLocale);
      }
    },
    [db, locale, setLocale],
  );

  useEffect(() => {
    refreshPreferences().catch((error) => {
      console.error(error);
    });
  }, [refreshPreferences]);

  const value = useMemo<UserPreferencesContextValue>(
    () => ({
      currency,
      localeCode,
      refreshPreferences,
      setCurrency,
      setLocaleCode,
    }),
    [currency, localeCode, refreshPreferences, setCurrency, setLocaleCode],
  );

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error(
      "useUserPreferences must be used within UserPreferencesProvider",
    );
  }
  return context;
}
