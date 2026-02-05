import { Pressable, StyleSheet, Text, View } from "react-native";

import type { BudgetPeriod } from "@/src/hooks/budgets/useBudgetOverview";

type PeriodToggleProps = {
  period: BudgetPeriod;
  onChange: (period: BudgetPeriod) => void;
  currentLabel: string;
  previousLabel: string;
  colors: {
    text: string;
    muted: string;
    border: string;
    card: string;
  };
};

export function PeriodToggle({
  period,
  onChange,
  currentLabel,
  previousLabel,
  colors,
}: PeriodToggleProps) {
  return (
    <View style={styles.periodRow}>
      <View style={[styles.periodPill, { backgroundColor: colors.border }]}>
        <Pressable
          onPress={() => onChange("current")}
          style={[
            styles.periodButton,
            period === "current" && {
              backgroundColor: colors.card,
              shadowColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.periodText,
              {
                color: period === "current" ? colors.text : colors.muted,
                fontWeight: period === "current" ? "600" : "500",
              },
            ]}
          >
            {currentLabel}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onChange("previous")}
          style={[
            styles.periodButton,
            period === "previous" && {
              backgroundColor: colors.card,
              shadowColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.periodText,
              {
                color: period === "previous" ? colors.text : colors.muted,
                fontWeight: period === "previous" ? "600" : "500",
              },
            ]}
          >
            {previousLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  periodRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: "center",
  },
  periodPill: {
    flexDirection: "row",
    borderRadius: 999,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
  },
  periodText: {
    fontSize: 12,
  },
});
