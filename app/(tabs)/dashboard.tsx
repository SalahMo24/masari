import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  I18nManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Line, Pattern, Rect } from "react-native-svg";

import WalletComponent from "@/src/components/wallet.component";
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

function LotusPattern({ color }: { color: string }) {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      pointerEvents="none"
    >
      <Defs>
        <Pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <Rect x="2" y="2" width="2" height="2" fill={color} opacity={0.08} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dots)" />
    </Svg>
  );
}

function GridOverlay({ color }: { color: string }) {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <Line x1="0" y1="0" x2="100" y2="0" stroke={color} strokeWidth="1" />
      <Line x1="0" y1="25" x2="100" y2="25" stroke={color} strokeWidth="1" />
      <Line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth="1" />
      <Line x1="0" y1="75" x2="100" y2="75" stroke={color} strokeWidth="1" />
      <Line x1="0" y1="100" x2="100" y2="100" stroke={color} strokeWidth="1" />
    </Svg>
  );
}

function DonutChart({
  size,
  strokeWidth,
  segments,
  trackColor,
}: {
  size: number;
  strokeWidth: number;
  segments: { percent: number; color: string }[];
  trackColor: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedSegments = segments.map((segment) => ({
    ...segment,
    length: circumference * segment.percent,
  }));
  let cumulativeOffset = 0;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {normalizedSegments.map((segment, index) => {
        const dasharray = `${segment.length} ${circumference - segment.length}`;
        const dashoffset = -cumulativeOffset;
        cumulativeOffset += segment.length;
        return (
          <Circle
            key={`segment-${index}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </Svg>
  );
}

export default function DashboardScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
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

  const fabBottom = insets.bottom + 88;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LotusPattern color={colors.primary} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: 160,
        }}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
              paddingTop: insets.top + 8,
            },
          ]}
        >
          <View style={[styles.headerLeft]}>
            <MaterialIcons name="security" size={28} color={colors.primary} />
            <Text
              style={[
                styles.headerTitle,
                { color: colors.text, textAlign: isRtl ? "right" : "left" },
              ]}
            >
              {t("dashboard.brand")}
            </Text>
          </View>
          <View style={[styles.headerRight]}>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: pressed ? colors.border : "transparent",
                },
              ]}
            >
              <MaterialIcons
                name="visibility"
                size={22}
                color={colors.primary}
              />
            </Pressable>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>KA</Text>
            </View>
          </View>
        </View>

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
            <WalletComponent
              icon="account-balance"
              label={t("dashboard.bank")}
              subLabel={t("dashboard.totalBalance")}
              value="84,250"
            />
            <WalletComponent
              icon="payments"
              label={t("dashboard.cash")}
              subLabel={t("dashboard.onHand")}
              value="3,400"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionRow, isRtl && styles.rowReverse]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.muted, textAlign: isRtl ? "right" : "left" },
              ]}
            >
              {t("dashboard.spendingTrend")}
            </Text>
            <View style={[styles.sectionRowRight, isRtl && styles.rowReverse]}>
              <Pressable style={styles.chevronButton}>
                <MaterialIcons
                  name="chevron-left"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
              <View
                style={[styles.rangePill, { backgroundColor: colors.border }]}
              >
                <Text
                  style={[
                    styles.rangeText,
                    { color: colors.text, textAlign: isRtl ? "right" : "left" },
                  ]}
                >
                  {t("dashboard.dateRange")}
                </Text>
              </View>
              <Pressable style={styles.chevronButton}>
                <MaterialIcons
                  name="chevron-right"
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
            <View style={[styles.spendingHeader, isRtl && styles.rowReverse]}>
              <View>
                <Text
                  style={[
                    styles.spendingValue,
                    {
                      color: colors.text,
                      fontFamily: monoFont,
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("dashboard.currency")} 4,120.50
                </Text>
                <Text
                  style={[
                    styles.spendingLabel,
                    {
                      color: colors.muted,
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("dashboard.avgPerDay")}
                </Text>
              </View>
              <View
                style={[styles.trendBadge, { backgroundColor: colors.border }]}
              >
                <MaterialIcons
                  name="trending-up"
                  size={14}
                  color={colors.muted}
                />
                <Text style={[styles.trendText, { color: colors.muted }]}>
                  {t("dashboard.trendUp")}
                </Text>
              </View>
            </View>
            <View style={styles.barChart}>
              <View style={styles.chartGrid}>
                <GridOverlay color={colors.border} />
              </View>
              <View style={styles.barsRow}>
                {barData.map((bar) => (
                  <View key={bar.label} style={styles.barItem}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          backgroundColor: bar.highlight
                            ? colors.primary
                            : `${colors.primary}1A`,
                          height: `${Math.round(bar.value * 100)}%`,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.barLabel,
                        {
                          color: bar.highlight ? colors.primary : colors.muted,
                          fontWeight: bar.highlight ? "700" : "500",
                        },
                      ]}
                    >
                      {bar.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.muted, textAlign: isRtl ? "right" : "left" },
            ]}
          >
            {t("dashboard.categoryBreakdown")}
          </Text>
          <View
            style={[
              styles.card,
              styles.categoryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.donutWrapper}>
              <View style={styles.donutContainer}>
                <DonutChart
                  size={160}
                  strokeWidth={12}
                  segments={spendingSegments}
                  trackColor={colors.border}
                />
                <View style={styles.donutCenter}>
                  <Text
                    style={[
                      styles.donutLabel,
                      {
                        color: colors.muted,
                        textAlign: isRtl ? "right" : "left",
                      },
                    ]}
                  >
                    {t("dashboard.monthly")}
                  </Text>
                  <Text
                    style={[
                      styles.donutValue,
                      {
                        color: colors.text,
                        fontFamily: monoFont,
                        textAlign: isRtl ? "right" : "left",
                      },
                    ]}
                  >
                    12,450
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={[styles.categoryList, { borderTopColor: colors.border }]}
            >
              {categories.map((category) => (
                <View
                  key={category.label}
                  style={[styles.categoryRow, isRtl && styles.rowReverse]}
                >
                  <View
                    style={[styles.categoryLeft, isRtl && styles.rowReverse]}
                  >
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: category.color },
                      ]}
                    />
                    <View>
                      <Text
                        style={[
                          styles.categoryLabel,
                          {
                            color: colors.text,
                            textAlign: isRtl ? "right" : "left",
                          },
                        ]}
                      >
                        {category.label}
                      </Text>
                      <Text
                        style={[
                          styles.categorySubtitle,
                          {
                            color: colors.muted,
                            textAlign: isRtl ? "right" : "left",
                          },
                        ]}
                      >
                        {category.subtitle}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[styles.categoryRight, isRtl && styles.alignStart]}
                  >
                    <Text
                      style={[
                        styles.categoryAmount,
                        {
                          color: colors.text,
                          fontFamily: monoFont,
                          textAlign: isRtl ? "right" : "left",
                        },
                      ]}
                    >
                      {category.amount}
                    </Text>
                    <Text
                      style={[
                        styles.categoryPercent,
                        {
                          color: colors.muted,
                          textAlign: isRtl ? "right" : "left",
                        },
                      ]}
                    >
                      {category.percent}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionRow, isRtl && styles.rowReverse]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.muted, textAlign: isRtl ? "right" : "left" },
              ]}
            >
              {t("dashboard.recentActivity")}
            </Text>
            <Pressable
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
                    textAlign: isRtl ? "right" : "left",
                  },
                ]}
              >
                {t("dashboard.viewAll")}
              </Text>
            </Pressable>
          </View>
          <View style={styles.activityList}>
            <View
              style={[
                styles.activityRow,
                {
                  backgroundColor: `${colors.card}CC`,
                  borderBottomColor: colors.border,
                },
                isRtl && styles.rowReverse,
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: colors.border },
                ]}
              >
                <MaterialIcons
                  name="shopping-cart"
                  size={22}
                  color={colors.muted}
                />
              </View>
              <View style={styles.activityBody}>
                <Text
                  style={[
                    styles.activityTitle,
                    { color: colors.text, textAlign: isRtl ? "right" : "left" },
                  ]}
                >
                  {t("dashboard.activity.groceriesTitle")}
                </Text>
                <Text
                  style={[
                    styles.activityMeta,
                    {
                      color: colors.muted,
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("dashboard.activity.groceriesMeta")}
                </Text>
              </View>
              <View style={[styles.activityRight, isRtl && styles.alignStart]}>
                <Text
                  style={[
                    styles.activityAmount,
                    {
                      color: colors.text,
                      fontFamily: monoFont,
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  -1,240.00
                </Text>
                <Text
                  style={[
                    styles.activitySource,
                    {
                      color: colors.muted,
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("dashboard.activity.groceriesSource")}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.activityRow,
                {
                  backgroundColor: `${colors.card}CC`,
                  borderBottomColor: colors.border,
                },
                isRtl && styles.rowReverse,
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: `${colors.primary}14` },
                ]}
              >
                <MaterialIcons name="work" size={22} color={colors.primary} />
              </View>
              <View style={styles.activityBody}>
                <Text
                  style={[
                    styles.activityTitle,
                    { color: colors.text, textAlign: isRtl ? "right" : "left" },
                  ]}
                >
                  {t("dashboard.activity.salaryTitle")}
                </Text>
                <Text
                  style={[
                    styles.activityMeta,
                    {
                      color: colors.muted,
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("dashboard.activity.salaryMeta")}
                </Text>
              </View>
              <View style={[styles.activityRight, isRtl && styles.alignStart]}>
                <Text
                  style={[
                    styles.activityAmount,
                    {
                      color: colors.nileGreen,
                      fontFamily: monoFont,
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  +32,000.00
                </Text>
                <Text
                  style={[
                    styles.activitySource,
                    {
                      color: colors.muted,
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("dashboard.activity.salarySource")}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.activityRow,
                {
                  backgroundColor: `${colors.card}CC`,
                  borderBottomColor: colors.border,
                },
                isRtl && styles.rowReverse,
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: colors.border },
                ]}
              >
                <MaterialIcons name="commute" size={22} color={colors.muted} />
              </View>
              <View style={styles.activityBody}>
                <Text
                  style={[
                    styles.activityTitle,
                    { color: colors.text, textAlign: isRtl ? "right" : "left" },
                  ]}
                >
                  {t("dashboard.activity.transportTitle")}
                </Text>
                <Text
                  style={[
                    styles.activityMeta,
                    {
                      color: colors.muted,
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("dashboard.activity.transportMeta")}
                </Text>
              </View>
              <View style={[styles.activityRight, isRtl && styles.alignStart]}>
                <Text
                  style={[
                    styles.activityAmount,
                    {
                      color: colors.text,
                      fontFamily: monoFont,
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  -145.50
                </Text>
                <Text
                  style={[
                    styles.activitySource,
                    {
                      color: colors.muted,
                      textAlign: isRtl ? "right" : "left",
                    },
                  ]}
                >
                  {t("dashboard.activity.transportSource")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Pressable
        style={[
          styles.fab,
          {
            bottom: fabBottom,
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </Pressable>
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
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
