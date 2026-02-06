import { Stack } from "expo-router";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

import { initializeDatabase } from "@/src/db";
import { I18nProvider } from "@/src/i18n/I18nProvider";
import { useI18n } from "@/src/i18n/useI18n";
import { AppThemeProvider } from "@/src/theme/AppThemeProvider";
import { useAppTheme } from "@/src/theme/useAppTheme";

export default function RootLayout() {
  return (
    <I18nProvider>
      <AppThemeProvider>
        <SQLiteProvider databaseName="masari.db" onInit={initializeSqlite}>
          <RootStack />
        </SQLiteProvider>
      </AppThemeProvider>
    </I18nProvider>
  );
}

function RootStack() {
  const theme = useAppTheme();
  const { t } = useI18n();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { color: theme.colors.text },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(features)/transactions/new"
        options={{
          title: t("screen.transaction.new"),
          presentation: Platform.OS === "ios" ? "modal" : "card",
          animation: Platform.OS === "ios" ? "fade" : "slide_from_bottom",
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <Stack.Screen
        name="(features)/transactions/[id]"
        options={{ title: t("screen.transaction.details") }}
      />

      <Stack.Screen
        name="(features)/budgets/new"
        options={{ title: t("screen.budget.new") }}
      />
      <Stack.Screen
        name="(features)/budgets/[id]"
        options={{ title: t("screen.budget.details") }}
      />
      <Stack.Screen
        name="(features)/bills/new"
        options={{ title: t("screen.bill.new") }}
      />
      <Stack.Screen
        name="(features)/bills/[id]"
        options={{ title: t("screen.bill.details") }}
      />
    </Stack>
  );
}

async function initializeSqlite(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA foreign_keys = ON;");
  await db.execAsync("PRAGMA busy_timeout = 5000;");
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await initializeDatabase(db);
}
