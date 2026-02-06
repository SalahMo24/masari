import { MaterialIcons } from "@expo/vector-icons";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import type { BudgetCardItem } from "@/src/hooks/budgets/budgetTypes";
import type { MaterialIconName } from "@/src/hooks/budgets/budgetTypes";
import {
  formatPercent,
  getCategoryIconName,
  normalizeCategoryLabel,
} from "@/src/hooks/budgets/budgetFormatting";
import { formatAmountForSummary } from "@/src/utils/amount";
import Typography from "@/src/components/typography.component";

type ProgressWidth = Animated.AnimatedInterpolation<string | number> | `${number}%`;

type BudgetCardProps = {
  item: BudgetCardItem;
  riskColor: string;
  riskLabel: string;
  hintIcon: MaterialIconName;
  hintText: string;
  hideAmounts: boolean;
  locale: string;
  hiddenAmountLabel: string;
  currencyLabel: string;
  isRtl: boolean;
  progressWidth: ProgressWidth;
  onPress: (budgetId: string) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  colors: {
    text: string;
    muted: string;
    border: string;
    card: string;
  };
};

export function BudgetCard({
  item,
  riskColor,
  riskLabel,
  hintIcon,
  hintText,
  hideAmounts,
  locale,
  hiddenAmountLabel,
  currencyLabel,
  isRtl,
  progressWidth,
  onPress,
  onLayout,
  colors,
}: BudgetCardProps) {
  const categoryLabel = normalizeCategoryLabel(item.name, locale);
  const iconName = getCategoryIconName(item.name, item.icon);
  const spentLabel = hideAmounts
    ? hiddenAmountLabel
    : formatAmountForSummary(item.spent);
  const limitLabel = hideAmounts
    ? hiddenAmountLabel
    : formatAmountForSummary(item.limit);
  const percentLabel = `${formatPercent(item.percentUsed)}%`;

  return (
    <Pressable
      onPress={() => onPress(item.budgetId)}
      onLayout={onLayout}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconBadge, { backgroundColor: `${riskColor}20` }]}>
            <MaterialIcons name={iconName} size={20} color={riskColor} />
          </View>
          <View>
            <Typography
              variant="subtitle"
              style={[styles.cardTitle, { color: colors.text }]}
            >
              {categoryLabel}
            </Typography>
            <View style={[styles.riskPill, { backgroundColor: `${riskColor}20` }]}>
              <Typography
                variant="overline"
                style={[styles.riskText, { color: riskColor }]}
              >
                {riskLabel}
              </Typography>
            </View>
          </View>
        </View>
        <MaterialIcons
          name={isRtl ? "chevron-left" : "chevron-right"}
          size={22}
          color={colors.border}
        />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Typography
            variant="caption"
            style={[styles.cardAmount, { color: colors.text }]}
          >
            {spentLabel}{" "}
            <Typography variant="caption" style={{ color: colors.muted }}>
              / {limitLabel} {currencyLabel}
            </Typography>
          </Typography>
          <Typography
            variant="caption"
            style={[styles.cardPercent, { color: riskColor }]}
          >
            {percentLabel}
          </Typography>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: riskColor, width: progressWidth },
            ]}
          />
        </View>
        <View style={styles.hintRow}>
          <MaterialIcons name={hintIcon} size={16} color={colors.muted} />
          <Typography
            variant="caption"
            style={[styles.hintText, { color: colors.muted }]}
          >
            {hintText}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  riskPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  riskText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  cardBody: {
    gap: 8,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  cardAmount: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardPercent: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hintText: {
    fontSize: 12,
    fontStyle: "italic",
    flex: 1,
  },
});
