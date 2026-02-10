import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import type { ReactNode } from "react";
import type { PressableProps } from "react-native";
import { Platform, Pressable, TouchableOpacity } from "react-native";

import { useI18n } from "@/src/i18n/useI18n";
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

function SettingsHeaderButton({
  label,
  textColor,
  borderColor,
}: {
  label: string;
  textColor: string;
  borderColor: string;
}) {
  return (
    <Pressable
      onPress={() =>
        router.push("/(features)/profile" as Parameters<typeof router.push>[0])
      }
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: pressed ? borderColor : "transparent",
      })}
      hitSlop={8}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <Ionicons name="settings" size={22} color={textColor} />
    </Pressable>
  );
}

export default function TabsLayout() {
  const theme = useAppTheme();
  const { t } = useI18n();

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
          headerRight: () => (
            <SettingsHeaderButton
              label={t("profile.title")}
              textColor={theme.colors.text}
              borderColor={theme.colors.border}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: t("tab.budgets"),
          tabBarIcon: makeTabIcon("pie-chart"),
          headerRight: () => (
            <SettingsHeaderButton
              label={t("profile.title")}
              textColor={theme.colors.text}
              borderColor={theme.colors.border}
            />
          ),
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
        options={{
          title: t("tab.bills"),
          tabBarIcon: makeTabIcon("receipt"),
          headerRight: () => (
            <SettingsHeaderButton
              label={t("profile.title")}
              textColor={theme.colors.text}
              borderColor={theme.colors.border}
            />
          ),
        }}
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
