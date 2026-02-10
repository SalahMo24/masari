import { MaterialIcons } from "@expo/vector-icons";
import { I18nManager, Pressable, StyleSheet, View } from "react-native";

import Typography from "@/src/components/typography.component";
import type { MaterialIconName } from "@/src/hooks/budgets/budgetTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BudgetDetailHeaderProps = {
  title: string;
  iconName: MaterialIconName;
  onBack: () => void;
  onMore?: () => void;
  colors: {
    text: string;
    background: string;
    primary: string;
    border: string;
  };
};

export function BudgetDetailHeader({
  title,
  iconName,
  onBack,
  onMore,
  colors,
}: BudgetDetailHeaderProps) {
  const isRtl = I18nManager.isRTL;
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: top,
        },
      ]}
    >
      <Pressable onPress={onBack} style={styles.iconButton}>
        <MaterialIcons
          name={isRtl ? "arrow-forward-ios" : "arrow-back-ios"}
          size={20}
          color={colors.text}
        />
      </Pressable>
      <View style={[styles.titleRow, { paddingTop: top - 5 }]}>
        <MaterialIcons name={iconName} size={20} color={colors.primary} />
        <Typography
          variant="subtitle"
          style={[styles.title, { color: colors.text }]}
        >
          {title}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  titleRow: {
    position: "absolute",
    left: 0,
    right: 0,

    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
