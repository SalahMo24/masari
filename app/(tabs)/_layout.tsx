import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, Switch, Text, View } from "react-native";

import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { useThemeMode } from "@/src/theme/AppThemeProvider";

type TabIconProps = {
  color: string;
  size: number;
};

function makeTabIcon(name: keyof typeof Ionicons.glyphMap) {
  const Icon = ({ color, size }: TabIconProps) => (
    <Ionicons name={name} size={size} color={color} />
  );
  Icon.displayName = `TabIcon(${name})`;
  return Icon;
}

export default function TabsLayout() {
  const theme = useAppTheme();
  const { mode, setMode } = useThemeMode();
  const { locale, toggleLocale, t } = useI18n();

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTitleStyle: { color: theme.colors.text },
        headerTintColor: theme.colors.text,
        headerRight: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              onPress={toggleLocale}
              style={({ pressed }) => ({
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: pressed
                  ? theme.colors.border
                  : theme.colors.card,
              })}
              hitSlop={8}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {t(locale === "ar" ? "language.ar" : "language.en")}
              </Text>
            </Pressable>
            <Switch
              value={mode === "dark"}
              onValueChange={(value) => setMode(value ? "dark" : "light")}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.card}
            />
          </View>
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedText,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: t("tab.dashboard"), tabBarIcon: makeTabIcon("home") }}
      />

      <Tabs.Screen
        name="budgets"
        options={{ title: t("tab.budgets"), tabBarIcon: makeTabIcon("pie-chart") }}
      />
      <Tabs.Screen
        name="bills"
        options={{ title: t("tab.bills"), tabBarIcon: makeTabIcon("receipt") }}
      />
    </Tabs>
  );
}
