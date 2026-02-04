import { useI18n } from "@/src/i18n/useI18n";
import { MaterialIcons } from "@expo/vector-icons";
import {
  I18nManager,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BarChart from "./bar-chart.component";
type BarDatum = { label: string; value: number; highlight?: boolean };

const BarChartCard = ({
  colors,
  barData,
  monoFont,
  rangeLabel,
  averageValue,
  trendLabel,
  trendDirection,
}: {
  colors: {
    primary: string;
    muted: string;
    border: string;
    card: string;
    text: string;
    background: string;
  };
  barData: BarDatum[];

  monoFont: string;
  rangeLabel?: string;
  averageValue?: string;
  trendLabel?: string;
  trendDirection?: "up" | "down" | "flat";
}) => {
  const { t } = useI18n();
  const isRtl = I18nManager.isRTL;
  const resolvedRangeLabel = rangeLabel ?? t("dashboard.dateRange");
  const resolvedAverageValue = averageValue ?? `${t("dashboard.currency")} 0`;
  const resolvedTrendLabel = trendLabel ?? t("dashboard.trendUp");
  const resolvedTrendDirection = trendDirection ?? "flat";
  const trendIcon =
    resolvedTrendDirection === "down"
      ? "trending-down"
      : resolvedTrendDirection === "flat"
        ? "trending-flat"
        : "trending-up";

  return (
    <View style={styles.section}>
      <View style={[styles.sectionRow]}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          {t("dashboard.spendingTrend")}
        </Text>
        <View style={[styles.sectionRowRight]}>
          <Pressable style={styles.chevronButton}>
            <MaterialIcons
              name={isRtl ? "chevron-right" : "chevron-left"}
              size={18}
              color={colors.primary}
            />
          </Pressable>
          <View style={[styles.rangePill, { backgroundColor: colors.border }]}>
            <Text style={[styles.rangeText, { color: colors.text }]}>
              {resolvedRangeLabel}
            </Text>
          </View>
          <Pressable style={styles.chevronButton}>
            <MaterialIcons
              name={isRtl ? "chevron-left" : "chevron-right"}
              size={18}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </View>
      <View
        style={[
          styles.card,
          styles.spendingCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.spendingHeader]}>
          <View>
            <Text
              style={[
                styles.spendingValue,
                {
                  color: colors.text,
                  fontFamily: monoFont,
                },
              ]}
            >
              {resolvedAverageValue}
            </Text>
            <Text
              style={[
                styles.spendingLabel,
                {
                  color: colors.muted,
                },
              ]}
            >
              {t("dashboard.avgPerDay")}
            </Text>
          </View>
          <View style={[styles.trendBadge, { backgroundColor: colors.border }]}>
            <MaterialIcons name={trendIcon} size={14} color={colors.muted} />
            <Text style={[styles.trendText, { color: colors.muted }]}>
              {resolvedTrendLabel}
            </Text>
          </View>
        </View>
        <BarChart barData={barData} colors={colors} />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  chevronButton: {
    padding: 4,
    borderRadius: 999,
  },
  rangePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rangeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  spendingCard: {
    padding: 20,
  },
  spendingHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  spendingValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  spendingLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default BarChartCard;
