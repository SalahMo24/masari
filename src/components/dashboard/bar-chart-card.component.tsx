import { useI18n } from "@/src/i18n/useI18n";
import { MaterialIcons } from "@expo/vector-icons";
import {
  I18nManager,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import BarChart from "./bar-chart.component";
import Typography from "@/src/components/typography.component";
export type BarDatum = {
  label: string;
  value: number;
  amountLabel: string;
  highlight?: boolean;
};

const BarChartCard = ({
  colors,
  barData,
  monoFont,
  rangeLabel,
  todayValue,
  averageValue,
  trendLabel,
  trendDirection,
  canGoPrevWeek,
  canGoNextWeek,
  onPrevWeek,
  onNextWeek,
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
  todayValue?: string;
  averageValue?: string;
  trendLabel?: string;
  trendDirection?: "up" | "down" | "flat";
  canGoPrevWeek?: boolean;
  canGoNextWeek?: boolean;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}) => {
  const { t } = useI18n();
  const isRtl = I18nManager.isRTL;
  const resolvedRangeLabel = rangeLabel ?? t("dashboard.dateRange");
  const resolvedTodayValue = todayValue ?? `${t("dashboard.currency")} 0`;
  const resolvedAverageValue = averageValue ?? `${t("dashboard.currency")} 0`;
  const resolvedTrendLabel = trendLabel ?? t("dashboard.trendUp");
  const resolvedTrendDirection = trendDirection ?? "flat";
  const canGoPrev = canGoPrevWeek ?? false;
  const canGoNext = canGoNextWeek ?? false;
  const trendIcon =
    resolvedTrendDirection === "down"
      ? "trending-down"
      : resolvedTrendDirection === "up"
      ? "trending-up"
      : null;

  return (
    <View style={styles.section}>
      <View style={[styles.sectionRow]}>
        <Typography variant="overline" style={[styles.sectionTitle, { color: colors.muted }]}>
          {t("dashboard.spendingTrend")}
        </Typography>
        <View style={[styles.sectionRowRight]}>
          <Pressable
            style={styles.chevronButton}
            onPress={onPrevWeek}
            disabled={!canGoPrev}
          >
            <MaterialIcons
              name={isRtl ? "chevron-right" : "chevron-left"}
              size={18}
              color={canGoPrev ? colors.primary : colors.border}
            />
          </Pressable>
          <View style={[styles.rangePill, { backgroundColor: colors.border }]}>
            <Typography variant="overline" style={[styles.rangeText, { color: colors.text }]}>
              {resolvedRangeLabel}
            </Typography>
          </View>
          <Pressable
            style={styles.chevronButton}
            onPress={onNextWeek}
            disabled={!canGoNext}
          >
            <MaterialIcons
              name={isRtl ? "chevron-left" : "chevron-right"}
              size={18}
              color={canGoNext ? colors.primary : colors.border}
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
          <View style={styles.todayBlock}>
            <Typography
              variant="overline"
              style={[
                styles.spendingLabel,
                {
                  color: colors.muted,
                },
              ]}
            >
              {t("dashboard.today")}
            </Typography>
            <Typography
              variant="h3"
              weight="700"
              style={[
                styles.spendingValue,
                {
                  color: colors.text,
                  fontFamily: monoFont,
                },
              ]}
            >
              {resolvedTodayValue}
            </Typography>
          </View>
          <View style={styles.averageSection}>
            <View style={styles.averageRow}>
              <Typography variant="caption" style={[styles.averageValue, { color: colors.muted }]}>
                {t("dashboard.avgPerDay")}
              </Typography>
              <Typography
                variant="small"
                weight="600"
                style={[
                  styles.averageAmount,
                  {
                    color: colors.muted,
                    fontFamily: monoFont,
                  },
                ]}
              >
                {resolvedAverageValue}
              </Typography>
            </View>
            <View style={styles.trendRow}>
              {trendIcon && (
                <MaterialIcons
                  name={trendIcon}
                  size={14}
                  color={colors.muted}
                />
              )}
              <Typography variant="caption" style={[styles.trendText, { color: colors.muted }]}>
                {resolvedTrendLabel} {t("dashboard.vsLastWeek")}
              </Typography>
            </View>
          </View>
        </View>
        <BarChart barData={barData} colors={colors} />
        <Typography
          variant="caption"
          weight="600"
          style={[styles.tapHint, { color: colors.muted }]}
        >
          {t("dashboard.tapBar")}
        </Typography>
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
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  spendingCard: {
    padding: 20,
  },
  spendingHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  todayBlock: {
    gap: 4,
  },
  spendingValue: {
  },
  averageSection: {
    alignItems: "flex-end",
    gap: 6,
  },
  averageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  averageValue: {
    textAlign: "right",
  },
  averageAmount: {
    textAlign: "right",
  },
  spendingLabel: {
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    textAlign: "right",
  },
  tapHint: {
    marginTop: 8,
    textAlign: "center",
  },
});

export default BarChartCard;
