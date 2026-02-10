import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DevSettings, I18nManager } from "react-native";

import { Locale, strings } from "./strings";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const DEFAULT_LOCALE = "ar";
type I18nProviderProps = {
  children: React.ReactNode;
};

const LOCALE_STORAGE_KEY = "masari.locale";

function isRtlLocale(locale: Locale) {
  return locale === "ar";
}

function syncLayoutDirection(locale: Locale) {
  const shouldBeRtl = isRtlLocale(locale);
  if (I18nManager.isRTL === shouldBeRtl) {
    return;
  }

  I18nManager.allowRTL(shouldBeRtl);
  I18nManager.forceRTL(shouldBeRtl);

  if (typeof DevSettings?.reload === "function") {
    DevSettings.reload();
  }
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);
  const previousLocaleRef = useRef<Locale | null>(null);

  useEffect(() => {
    let isActive = true;

    AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      .then((saved) => {
        if (!isActive || (saved !== "en" && saved !== "ar")) {
          return;
        }
        setLocale((current) => (current === saved ? current : saved));
      })
      .catch(() => null)
      .finally(() => {
        if (isActive) {
          setIsHydrated(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isActive = true;

    const persistAndSyncDirection = async () => {
      try {
        // Persist before triggering a potential app reload for RTL changes.
        await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
      } catch {
        // Best effort persistence; still sync direction so UI remains correct.
      }

      if (isActive) {
        const previousLocale = previousLocaleRef.current;
        const shouldSyncDirection =
          previousLocale !== null && previousLocale !== locale;

        if (shouldSyncDirection) {
          syncLayoutDirection(locale);
        }

        previousLocaleRef.current = locale;
      }
    };

    persistAndSyncDirection();

    return () => {
      isActive = false;
    };
  }, [isHydrated, locale]);

  const setLocaleAndPersist = useCallback((nextLocale: Locale) => {
    setLocale(nextLocale);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = strings[locale] ?? strings[DEFAULT_LOCALE];
    return {
      locale,
      setLocale: setLocaleAndPersist,
      toggleLocale: () => {
        setLocaleAndPersist(locale === "ar" ? "en" : "ar");
      },
      t: (key: string) => dictionary[key] ?? strings.en[key] ?? key,
    };
  }, [locale, setLocaleAndPersist]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
