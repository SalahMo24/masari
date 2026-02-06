import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import Typography from "@/src/components/typography.component";

type BudgetHealthCardProps = {
  title: string;
  statusText: string;
  reassuranceText: string;
  loadingLabel: string;
  loading: boolean;
  spentPercent: number;
  colors: {
    text: string;
    muted: string;
    border: string;
    success: string;
    card: string;
  };
};

export function BudgetHealthCard({
  title,
  statusText,
  reassuranceText,
  loadingLabel,
  loading,
  spentPercent,
  colors,
}: BudgetHealthCardProps) {
  return (
    <View style={styles.section}>
      <View
        style={[
          styles.healthCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.healthHeader}>
          <Typography
            variant="overline"
            style={[styles.healthLabel, { color: colors.muted }]}
          >
            {title}
          </Typography>
          <MaterialIcons name="auto-awesome" size={16} color={colors.success} />
        </View>
        <View style={styles.healthBody}>
          <Typography
            variant="h5"
            style={[styles.healthValue, { color: colors.text }]}
          >
            {statusText}
          </Typography>
          <Typography
            variant="small"
            style={[styles.healthReassurance, { color: colors.muted }]}
          >
            {loading ? loadingLabel : reassuranceText}
          </Typography>
        </View>
        <View style={[styles.healthTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.healthFill,
              { backgroundColor: colors.success, width: `${spentPercent}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  healthCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  healthLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  healthBody: {
    gap: 6,
  },
  healthValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  healthReassurance: {
    fontSize: 13,
    fontStyle: "italic",
  },
  healthTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  healthFill: {
    height: "100%",
    borderRadius: 999,
  },
});
