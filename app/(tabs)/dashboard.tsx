import { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ActivityCard from "@/src/components/activity-card.component";
import BarChartCard from "@/src/components/bar-chart-card.component";
import DonutChartCard from "@/src/components/donut-chart-card.component";
import Wallet from "@/src/components/wallet.component";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";

type BarDatum = { label: string; value: number; highlight?: boolean };
type CategoryDatum = {
  label: string;
  subtitle: string;
  amount: string;
  percent: string;
  color: string;
};

const monoFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export default function DashboardScreen() {
  const theme = useAppTheme();
  const { t } = useI18n();

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

  const barData: BarDatum[] = [
    { label: t("dashboard.dayShort.sat"), value: 0.45 },
    { label: t("dashboard.dayShort.sun"), value: 0.3 },
    { label: t("dashboard.dayShort.mon"), value: 0.6 },
    { label: t("dashboard.dayShort.tue"), value: 0.25 },
    { label: t("dashboard.dayShort.wed"), value: 0.95, highlight: true },
    { label: t("dashboard.dayShort.thu"), value: 0.5 },
    { label: t("dashboard.dayShort.fri"), value: 0.4 },
  ];

  const categories: CategoryDatum[] = [
    {
      label: t("dashboard.category.housing"),
      subtitle: t("dashboard.category.housingSubtitle"),
      amount: `${t("dashboard.currency")} 5,600`,
      percent: "45%",
      color: colors.primary,
    },
    {
      label: t("dashboard.category.groceries"),
      subtitle: t("dashboard.category.groceriesSubtitle"),
      amount: `${t("dashboard.currency")} 3,486`,
      percent: "28%",
      color: colors.nileGreen,
    },
    {
      label: t("dashboard.category.dining"),
      subtitle: t("dashboard.category.diningSubtitle"),
      amount: `${t("dashboard.currency")} 1,867`,
      percent: "15%",
      color: colors.gold,
    },
  ];

  const spendingSegments = [
    { percent: 0.45, color: colors.primary },
    { percent: 0.28, color: colors.nileGreen },
    { percent: 0.15, color: colors.gold },
  ];

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
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>
              {t("dashboard.walletSummary")}
            </Text>
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
              value="84,250"
            />
            <Wallet
              icon="payments"
              label={t("dashboard.cash")}
              subLabel={t("dashboard.onHand")}
              value="3,400"
            />
          </View>
        </View>

        <BarChartCard colors={colors} barData={barData} monoFont={monoFont} />

        <DonutChartCard
          colors={colors}
          categories={categories}
          spendingSegments={spendingSegments}
          monoFont={monoFont}
        />

        <View style={styles.section}>
          <View style={[styles.sectionRow]}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>
              {t("dashboard.recentActivity")}
            </Text>
            <TouchableOpacity
              style={[
                styles.viewAll,
                { backgroundColor: `${colors.primary}14` },
              ]}
            >
              <Text
                style={[
                  styles.viewAllText,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                {t("dashboard.viewAll")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            <ActivityCard
              icon="shopping-cart"
              transactionName={t("dashboard.activity.groceriesTitle")}
              transactionCategory={t("dashboard.activity.groceriesMeta")}
              transactionType="expense"
              transactionDate={t("dashboard.activity.groceriesMeta")}
              amount={"-1,240.00"}
              source={t("dashboard.activity.groceriesMeta")}
              monoFont={monoFont}
            />
            <ActivityCard
              icon="work"
              transactionName={t("dashboard.activity.salaryTitle")}
              transactionCategory={t("dashboard.activity.salaryMeta")}
              transactionType="income"
              transactionDate={t("dashboard.activity.salaryMeta")}
              amount={"+1,240.00"}
              source={t("dashboard.activity.salaryMeta")}
              monoFont={monoFont}
            />
            <ActivityCard
              icon="commute"
              transactionName={t("dashboard.activity.transportTitle")}
              transactionCategory={t("dashboard.activity.transportMeta")}
              transactionType="expense"
              transactionDate={t("dashboard.activity.transportMeta")}
              amount={"-1,240.00"}
              source={t("dashboard.activity.transportMeta")}
              monoFont={monoFont}
            />
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
    fontSize: 11,
    fontWeight: "700",
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
