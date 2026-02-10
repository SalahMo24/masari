import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import Typography from "@/src/components/typography.component";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ScreenHeaderColors = {
  text: string;
  border?: string;
};

type ScreenHeaderProps = {
  title: string;
  colors: ScreenHeaderColors;
  left?: ReactNode;
  right?: ReactNode;
  /** When true, renders a bottom border (e.g. for Budgets). */
  showBorder?: boolean;
};

export function ScreenHeader({
  title,
  colors,
  left,
  right,
  showBorder = false,
}: ScreenHeaderProps) {
  const { top } = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.header,
        showBorder &&
          colors.border !== undefined && {
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
        { paddingTop: top },
      ]}
    >
      <View style={styles.leftSlot}>{left ?? null}</View>
      <Typography
        variant="h5"
        weight="700"
        color={colors.text}
        style={styles.title}
        numberOfLines={1}
      >
        {title}
      </Typography>
      <View style={styles.rightSlot}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  leftSlot: {
    width: 40,
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  rightSlot: {
    minWidth: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
});
