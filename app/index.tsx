import { Redirect, type Href } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { userRepository } from "@/src/data/repositories";
import { useAppTheme } from "@/src/theme/useAppTheme";

const ONBOARDING_ROUTE = "/onboarding" as unknown as Href;
const DASHBOARD_ROUTE = "/(tabs)/dashboard" as unknown as Href;

export default function Index() {
  const db = useSQLiteContext();
  const theme = useAppTheme();
  const [targetRoute, setTargetRoute] = useState<
    "/onboarding" | "/(tabs)/dashboard" | null
  >(null);

  useEffect(() => {
    let active = true;

    const resolveRoute = async () => {
      try {
        const user = await userRepository.getOrCreateLocalUser(db);
        if (!active) {
          return;
        }
        setTargetRoute(
          user.onboarding_completed ? "/(tabs)/dashboard" : "/onboarding",
        );
      } catch (error) {
        console.error(error);
        if (active) {
          setTargetRoute("/onboarding");
        }
      }
    };

    resolveRoute();
    return () => {
      active = false;
    };
  }, [db]);

  if (!targetRoute) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  return targetRoute === "/onboarding" ? (
    <Redirect href={ONBOARDING_ROUTE} />
  ) : (
    <Redirect href={DASHBOARD_ROUTE} />
  );
}
