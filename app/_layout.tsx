import { Stack } from "expo-router";

import { I18nProvider } from "@/src/i18n/I18nProvider";
import { useI18n } from "@/src/i18n/useI18n";
import { AppThemeProvider } from "@/src/theme/AppThemeProvider";
import { useAppTheme } from "@/src/theme/useAppTheme";

export default function RootLayout() {
  return (
    <I18nProvider>
      <AppThemeProvider>
        <RootStack />
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
        options={{ title: t("screen.transaction.new") }}
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
