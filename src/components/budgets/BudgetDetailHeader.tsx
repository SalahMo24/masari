import { MaterialIcons } from "@expo/vector-icons";
import { I18nManager, Pressable, StyleSheet, View } from "react-native";

import type { MaterialIconName } from "@/src/hooks/budgets/budgetTypes";
import Typography from "@/src/components/typography.component";

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

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.background, borderBottomColor: colors.border },
      ]}
    >
      <Pressable onPress={onBack} style={styles.iconButton}>
        <MaterialIcons
          name={isRtl ? "arrow-forward-ios" : "arrow-back-ios"}
          size={20}
          color={colors.text}
        />
      </Pressable>
      <View style={styles.titleRow}>
        <MaterialIcons name={iconName} size={20} color={colors.primary} />
        <Typography
          variant="subtitle"
          style={[styles.title, { color: colors.text }]}
        >
          {title}
        </Typography>
      </View>
      <Pressable onPress={onMore} style={styles.iconButton}>
        <MaterialIcons name="more-vert" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
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
