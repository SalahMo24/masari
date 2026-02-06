import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import Typography from "@/src/components/typography.component";
import type { MaterialIconName } from "@/src/hooks/budgets/budgetTypes";

type BudgetStatusCardProps = {
  statusLabel: string;
  statusValue: string;
  statusIcon: MaterialIconName;
  statusColor: string;
  summaryText: string;
  percentLabel: string;
  progressPercent: number;
};

export function BudgetStatusCard({
  statusLabel,
  statusValue,
  statusIcon,
  statusColor,
  summaryText,
  percentLabel,
  progressPercent,
}: BudgetStatusCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: statusColor }]}>
      <View style={styles.headerRow}>
        <View>
          <Typography
            variant="overline"
            style={[styles.statusLabel, { color: "rgba(255,255,255,0.75)" }]}
          >
            {statusLabel}
          </Typography>
          <Typography
            variant="h4"
            style={[styles.statusValue, { color: "#fff" }]}
          >
            {statusValue}
          </Typography>
        </View>
        <MaterialIcons name={statusIcon} size={28} color="#fff" />
      </View>
      <View style={styles.summaryBlock}>
        <View style={styles.summaryRow}>
          <Typography variant="caption" style={[styles.summaryText, { color: "#fff" }]}>
            {summaryText}
          </Typography>
          <Typography variant="caption" style={[styles.percentText, { color: "#fff" }]}>
            {percentLabel}
          </Typography>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${progressPercent}%`, backgroundColor: "#fff" },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  statusLabel: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statusValue: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },
  summaryBlock: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  percentText: {
    fontSize: 12,
    fontWeight: "700",
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
