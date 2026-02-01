import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import type { ReactNode } from "react";
import type { PressableProps } from "react-native";
import {
  Platform,
  Pressable,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useI18n } from "@/src/i18n/useI18n";
import { useThemeMode } from "@/src/theme/AppThemeProvider";
import { useAppTheme } from "@/src/theme/useAppTheme";

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

function FabTabButton({
  children,
  onPress,
  style,
  accessibilityRole,
  accessibilityState,
  accessibilityLabel,
  testID,
  backgroundColor,
  shadowColor,
}: {
  children: ReactNode;
  onPress: () => void;
  style?: PressableProps["style"];
  accessibilityRole?: PressableProps["accessibilityRole"];
  accessibilityState?: PressableProps["accessibilityState"];
  accessibilityLabel?: PressableProps["accessibilityLabel"];
  testID?: PressableProps["testID"];
  backgroundColor: string;
  shadowColor: string;
}) {
  return (
    <TouchableOpacity
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      style={{
        alignSelf: "center",
        width: 38,
        height: 38,
        borderRadius: 38,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor,
        ...Platform.select({
          ios: {
            shadowColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          },
          android: {
            elevation: 8,
          },
        }),
      }}
    >
      {children}
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const theme = useAppTheme();
  const { mode, setMode } = useThemeMode();
  const { locale, toggleLocale, t } = useI18n();

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTitleStyle: {
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: "700",
          letterSpacing: -0.3,
        },
        headerTintColor: theme.colors.text,
        headerRight: () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
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
                true: theme.colors.accent,
              }}
              thumbColor={theme.colors.card}
            />
          </View>
        ),
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.mutedText,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("dashboard.brand"),
          tabBarIcon: makeTabIcon("home"),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: t("tab.budgets"),
          tabBarIcon: makeTabIcon("pie-chart"),
        }}
      />

      <Tabs.Screen
        name="new-transaction"
        options={{
          title: t("screen.transaction.new"),
          tabBarIcon: ({ size }) => (
            <Ionicons name="add" size={size} color="#fff" />
          ),
          tabBarLabel: () => null,
          tabBarButton: (props) => (
            <FabTabButton
              onPress={() => router.push("/(features)/transactions/new")}
              style={props.style}
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              accessibilityLabel={props.accessibilityLabel}
              testID={props.testID}
              backgroundColor={theme.colors.primary}
              shadowColor={theme.colors.primary}
            >
              {props.children}
            </FabTabButton>
          ),
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{ title: t("tab.bills"), tabBarIcon: makeTabIcon("receipt") }}
      />
      <Tabs.Screen
        name="ameen"
        options={{
          title: "Ameen",
          tabBarIcon: makeTabIcon("sparkles"),
        }}
      />
    </Tabs>
  );
}
