import { useMemo } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
  I18nManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import ActivityCard from "@/src/components/dashboard/activity-card.component";
import BarChartCard from "@/src/components/dashboard/bar-chart-card.component";
import DonutChartCard from "@/src/components/dashboard/donut-chart-card.component";
import Typography from "@/src/components/typography.component";
import Wallet from "@/src/components/dashboard/wallet.component";
import {
  useCategoryBreakdown,
  useDashboardData,
  useSpendingTrend,
  useWeeklyActivity,
} from "@/src/hooks/dashboard";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { formatAmountForSummary } from "@/src/utils/amount";

const monoFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export default function DashboardScreen() {
  const theme = useAppTheme();
  const { t } = useI18n();
  const isRtl = I18nManager.isRTL;

  const colors = useMemo(
    () => ({
      primary: theme.colors.accent,
      nileGreen: theme.colors.success,
      gold: theme.colors.warning,
      text: theme.colors.text,
      muted: theme.colors.mutedText,
      background: theme.colors.background,
      card: theme.colors.card,
      border: theme.colors.border,
    }),
    [theme]
  );

  const { wallets, transactions, categories } = useDashboardData();
  const {
    barData,
    rangeLabel,
    todayValueLabel,
    averageValueLabel,
    trendLabel,
    trendDirection,
    canGoPrevWeek: canGoPrevTrendWeek,
    canGoNextWeek: canGoNextTrendWeek,
    handlePrevWeek: handlePrevTrendWeek,
    handleNextWeek: handleNextTrendWeek,
    totalExpenses,
    expenseTransactions,
  } = useSpendingTrend(transactions, t);
  const { categoryData, spendingSegments, totalAmountLabel } =
    useCategoryBreakdown(expenseTransactions, totalExpenses, categories, t, {
      primary: colors.primary,
      nileGreen: colors.nileGreen,
      gold: colors.gold,
      border: colors.border,
    });
  const {
    weekLabel,
    canGoPrevWeek,
    canGoNextWeek,
    handlePrevWeek,
    handleNextWeek,
    recentActivity,
  } = useWeeklyActivity(transactions, categories, wallets, t);

  const walletTotals = useMemo(() => {
    return wallets.reduce(
      (acc, wallet) => {
        if (wallet.type === "bank") acc.bank += wallet.balance;
        if (wallet.type === "cash") acc.cash += wallet.balance;
        return acc;
      },
      { bank: 0, cash: 0 }
    );
  }, [wallets]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: 160,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={[styles.sectionTitleRow]}>
            <Typography variant="overline" style={[styles.sectionTitle, { color: colors.muted }]}>
              {t("dashboard.walletSummary")}
            </Typography>
            <View
              style={[
                styles.sectionDivider,
                { backgroundColor: colors.border },
              ]}
            />
          </View>
          <View style={[styles.grid]}>
            <Wallet
              icon="account-balance"
              label={t("dashboard.bank")}
              subLabel={t("dashboard.totalBalance")}
              value={formatAmountForSummary(walletTotals.bank)}
            />
            <Wallet
              icon="payments"
              label={t("dashboard.cash")}
              subLabel={t("dashboard.onHand")}
              value={formatAmountForSummary(walletTotals.cash)}
            />
          </View>
        </View>

        <BarChartCard
          colors={colors}
          barData={barData}
          monoFont={monoFont}
          rangeLabel={rangeLabel}
          todayValue={todayValueLabel}
          averageValue={averageValueLabel}
          trendLabel={trendLabel}
          trendDirection={trendDirection}
          canGoPrevWeek={canGoPrevTrendWeek}
          canGoNextWeek={canGoNextTrendWeek}
          onPrevWeek={handlePrevTrendWeek}
          onNextWeek={handleNextTrendWeek}
        />

        <DonutChartCard
          colors={colors}
          categories={categoryData}
          spendingSegments={spendingSegments}
          monoFont={monoFont}
          totalAmount={totalAmountLabel}
        />

        <View style={styles.section}>
          <View style={[styles.sectionRow]}>
            <Typography variant="overline" style={[styles.sectionTitle, { color: colors.muted }]}>
              {t("dashboard.recentActivity")}
            </Typography>
            <View style={styles.sectionRowRight}>
              <Pressable
                style={styles.chevronButton}
                onPress={handlePrevWeek}
                disabled={!canGoPrevWeek}
              >
                <MaterialIcons
                  name={isRtl ? "chevron-right" : "chevron-left"}
                  size={18}
                  color={canGoPrevWeek ? colors.primary : colors.border}
                />
              </Pressable>
              <View style={[styles.rangePill, { backgroundColor: colors.border }]}>
                <Typography variant="overline" style={[styles.rangeText, { color: colors.text }]}>
                  {weekLabel}
                </Typography>
              </View>
              <Pressable
                style={styles.chevronButton}
                onPress={handleNextWeek}
                disabled={!canGoNextWeek}
              >
                <MaterialIcons
                  name={isRtl ? "chevron-left" : "chevron-right"}
                  size={18}
                  color={canGoNextWeek ? colors.primary : colors.border}
                />
              </Pressable>
            </View>
          </View>
          <View style={styles.activityList}>
            {recentActivity.map((activity) => (
              <ActivityCard
                key={activity.id}
                icon={activity.icon}
                transactionName={activity.transactionName}
                transactionCategory={activity.transactionCategory}
                transactionType={activity.transactionType}
                transactionDate={activity.transactionDate}
                amount={activity.amount}
                source={activity.source}
                monoFont={monoFont}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  alignStart: {
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "600",
  },
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
  sectionDivider: {
    flex: 1,
    height: 1,
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
  grid: {
    flexDirection: "row",
    gap: 12,
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
        elevation: 4,
      },
    }),
  },
  walletCard: {
    flex: 1,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  walletTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  walletLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  walletValue: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
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
  barChart: {
    height: 140,
    marginTop: 12,
  },
  chartGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  barsRow: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-end",
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  barFill: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 10,
  },
  categoryCard: {
    padding: 20,
    marginTop: 12,
  },
  donutWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  donutContainer: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
  },
  donutLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  donutValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  categoryList: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 12,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  categorySubtitle: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  categoryRight: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  categoryPercent: {
    fontSize: 10,
  },
  viewAll: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  activityList: {
    gap: 4,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginEnd: 12,
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  activityMeta: {
    fontSize: 10,
    marginTop: 2,
  },
  activityRight: {
    alignItems: "flex-end",
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  activitySource: {
    fontSize: 10,
    textTransform: "uppercase",
  },
});
