import { useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Animated,
  I18nManager,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useBudgetOverview } from "@/src/hooks/budgets/useBudgetOverview";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { formatAmountForSummary } from "@/src/utils/amount";

const safePreviewCount = 2;

const categoryIconMap: Record<string, string> = {
  transportation: "directions-car",
  groceries: "shopping-basket",
  dining: "restaurant",
  bills: "receipt-long",
  loan: "payments",
};
type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

function normalizeCategoryLabel(name: string, locale: string) {
  if (locale === "ar") return name;
  const hasLatin = /[a-zA-Z]/.test(name);
  const cleaned = name.replace(/[-_]/g, " ");
  if (!hasLatin) return cleaned;
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPercent(value: number) {
  return Math.max(0, Math.round(value));
}

export default function BudgetsScreen() {
  const theme = useAppTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const isRtl = I18nManager.isRTL;
  const { createdBudgetId } = useLocalSearchParams<{
    createdBudgetId?: string | string[];
  }>();
  const pendingBudgetId = useMemo(() => {
    if (!createdBudgetId) return null;
    return Array.isArray(createdBudgetId) ? createdBudgetId[0] : createdBudgetId;
  }, [createdBudgetId]);

  const [period, setPeriod] = useState<"current" | "previous">("current");
  const [showAllSafe, setShowAllSafe] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [animatedBudgetId, setAnimatedBudgetId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const cardPositions = useRef<Record<string, number>>({});
  const scrolledIds = useRef(new Set<string>());
  const animatedIds = useRef(new Set<string>());
  const progressAnim = useRef(new Animated.Value(0)).current;

  const {
    totals,
    groupedByRisk,
    insight,
    hasBudgets,
    loading,
  } = useBudgetOverview(period);

  const colors = useMemo(
    () => ({
      primary: theme.colors.primary,
      accent: theme.colors.accent,
      success: theme.colors.success,
      warning: theme.colors.warning,
      danger: theme.colors.danger,
      text: theme.colors.text,
      muted: theme.colors.mutedText,
      background: theme.colors.background,
      card: theme.colors.card,
      border: theme.colors.border,
    }),
    [theme]
  );

  const spentPercent = formatPercent(totals.percentUsed);
  const remainingPercent = Math.max(0, 100 - spentPercent);
  const statusText =
    locale === "ar"
      ? `${spentPercent}% ${t("budget.health.spent")} · ${remainingPercent}% ${t(
          "budget.health.remaining"
        )}`
      : `${spentPercent}% ${t("budget.health.spent")} · ${remainingPercent}% ${t(
          "budget.health.remaining"
        )}`;
  const reassuranceText =
    spentPercent >= 85
      ? t("budget.health.reassure.atRisk")
      : spentPercent >= 70
        ? t("budget.health.reassure.caution")
        : t("budget.health.reassure.safe");

  const visibleSafe =
    showAllSafe ||
    groupedByRisk.safe.length <= safePreviewCount ||
    (pendingBudgetId &&
      groupedByRisk.safe.some((item) => item.budgetId === pendingBudgetId))
      ? groupedByRisk.safe
      : groupedByRisk.safe.slice(0, safePreviewCount);

  const allBudgets = useMemo(
    () => [...groupedByRisk.atRisk, ...groupedByRisk.caution, ...groupedByRisk.safe],
    [groupedByRisk.atRisk, groupedByRisk.caution, groupedByRisk.safe]
  );

  const pendingBudget = useMemo(
    () => allBudgets.find((item) => item.budgetId === pendingBudgetId) ?? null,
    [allBudgets, pendingBudgetId]
  );

  useEffect(() => {
    if (!pendingBudgetId) return;

    const y = cardPositions.current[pendingBudgetId];
    if (typeof y === "number" && !scrolledIds.current.has(pendingBudgetId)) {
      scrolledIds.current.add(pendingBudgetId);
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
    }

    if (pendingBudget && !animatedIds.current.has(pendingBudgetId)) {
      animatedIds.current.add(pendingBudgetId);
      setAnimatedBudgetId(pendingBudgetId);
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: pendingBudget.progressPercent,
        duration: 700,
        useNativeDriver: false,
      }).start();
    }
  }, [pendingBudget, pendingBudgetId, progressAnim]);

  const insightText = useMemo(() => {
    if (insight.type === "aboveAverage") {
      const categoryLabel = normalizeCategoryLabel(insight.categoryName, locale);
      if (locale === "ar") {
        return `${t("budget.insight.aboveAveragePrefix")} ${categoryLabel} ${t(
          "budget.insight.aboveAverageMiddle"
        )} ${Math.abs(insight.deltaPercent)}%`;
      }
      return `${t("budget.insight.aboveAveragePrefix")} ${Math.abs(
        insight.deltaPercent
      )}% ${t("budget.insight.aboveAverageMiddle")} ${categoryLabel} ${t(
        "budget.insight.aboveAverageSuffix"
      )}`;
    }
    if (insight.type === "onTrack") {
      return t("budget.insight.onTrack");
    }
    return t("budget.insight.empty");
  }, [insight, locale, t]);

  const handleInsightPress = () => {
    if (insight.budgetId) {
      router.push(`/(features)/budgets/${insight.budgetId}`);
      return;
    }
    router.push("/(features)/budgets/new");
  };

  const renderBudgetCard = (
    item: (typeof groupedByRisk.atRisk)[number],
    riskColor: string,
    riskLabel: string,
    hintIcon: MaterialIconName,
    hintText: string
  ) => {
    const categoryLabel = normalizeCategoryLabel(item.name, locale);
    const iconName = (item.icon ??
      categoryIconMap[item.name] ??
      "category") as MaterialIconName;
    const spentLabel = hideAmounts
      ? t("budget.amount.hidden")
      : formatAmountForSummary(item.spent);
    const limitLabel = hideAmounts
      ? t("budget.amount.hidden")
      : formatAmountForSummary(item.limit);
    const currencyLabel = t("dashboard.currency");
    const percentLabel = `${formatPercent(item.percentUsed)}%`;

    const isAnimating = animatedBudgetId === item.budgetId;
    const progressWidth = isAnimating
      ? progressAnim.interpolate({
          inputRange: [0, 100],
          outputRange: ["0%", "100%"],
        })
      : (`${item.progressPercent}%` as `${number}%`);

    const handleCardLayout = (event: LayoutChangeEvent) => {
      const yPos = event.nativeEvent.layout.y;
      cardPositions.current[item.budgetId] = yPos;
      if (
        pendingBudgetId &&
        item.budgetId === pendingBudgetId &&
        !scrolledIds.current.has(pendingBudgetId)
      ) {
        scrolledIds.current.add(pendingBudgetId);
        scrollRef.current?.scrollTo({ y: Math.max(0, yPos - 16), animated: true });
      }
    };

    return (
      <Pressable
        key={item.budgetId}
        onPress={() => router.push(`/(features)/budgets/${item.budgetId}`)}
        onLayout={handleCardLayout}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: `${riskColor}20` },
              ]}
            >
              <MaterialIcons name={iconName} size={20} color={riskColor} />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {categoryLabel}
              </Text>
              <View style={[styles.riskPill, { backgroundColor: `${riskColor}20` }]}>
                <Text style={[styles.riskText, { color: riskColor }]}>
                  {riskLabel}
                </Text>
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
            <Text style={[styles.cardAmount, { color: colors.text }]}>
              {spentLabel}{" "}
              <Text style={{ color: colors.muted }}>
                / {limitLabel} {currencyLabel}
              </Text>
            </Text>
            <Text style={[styles.cardPercent, { color: riskColor }]}>
              {percentLabel}
            </Text>
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
            <Text style={[styles.hintText, { color: colors.muted }]}>
              {hintText}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const buildHint = (item: (typeof groupedByRisk.atRisk)[number]) => {
    const currencyLabel = t("dashboard.currency");
    const projectedLabel = hideAmounts
      ? t("budget.amount.hidden")
      : formatAmountForSummary(item.projectedOverage);

    if (item.percentUsed >= 100) {
      if (locale === "ar") {
      return {
        icon: "warning" as MaterialIconName,
          text: `${t("budget.hint.overLimitPrefix")} ${projectedLabel} ${currencyLabel}`,
        };
      }
      return {
        icon: "warning" as MaterialIconName,
        text: `${t("budget.hint.overLimitPrefix")} ${projectedLabel} ${currencyLabel}.`,
      };
    }

    if (item.riskLevel === "atRisk") {
      if (item.projectedOverage > 0) {
        if (locale === "ar") {
          return {
            icon: "warning" as MaterialIconName,
            text: `${t("budget.hint.atRiskPrefix")} ${projectedLabel} ${currencyLabel}`,
          };
        }
        return {
          icon: "warning" as MaterialIconName,
          text: `${t("budget.hint.atRiskPrefix")} ${projectedLabel} ${currencyLabel}.`,
        };
      }
      return {
        icon: "warning" as MaterialIconName,
        text: t("budget.hint.nearLimit"),
      };
    }

    if (item.riskLevel === "caution") {
      return {
        icon: "info" as MaterialIconName,
        text: t("budget.hint.caution"),
      };
    }

    return {
      icon: "check-circle" as MaterialIconName,
      text: t("budget.hint.safe"),
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerIcon}>
            <MaterialIcons name="shield" size={20} color={colors.success} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("budget.overview.title")}
          </Text>
          <Pressable
            style={styles.headerButton}
            onPress={() => setHideAmounts((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={t("budget.toggle.visibility")}
          >
            <MaterialIcons
              name={hideAmounts ? "visibility-off" : "visibility"}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        </View>

        <View style={styles.periodRow}>
          <View style={[styles.periodPill, { backgroundColor: colors.border }]}>
            <Pressable
              onPress={() => setPeriod("current")}
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
                    color:
                      period === "current" ? colors.text : colors.muted,
                    fontWeight: period === "current" ? "600" : "500",
                  },
                ]}
              >
                {t("budget.period.thisMonth")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPeriod("previous")}
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
                    color:
                      period === "previous" ? colors.text : colors.muted,
                    fontWeight: period === "previous" ? "600" : "500",
                  },
                ]}
              >
                {t("budget.period.lastMonth")}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View
            style={[
              styles.healthCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.healthHeader}>
              <Text style={[styles.healthLabel, { color: colors.muted }]}>
                {t("budget.health.title")}
              </Text>
              <MaterialIcons
                name="auto-awesome"
                size={16}
                color={colors.success}
              />
            </View>
            <View style={styles.healthBody}>
              <Text style={[styles.healthValue, { color: colors.text }]}>
                {statusText}
              </Text>
              <Text style={[styles.healthReassurance, { color: colors.muted }]}>
                {loading ? t("budget.loading") : reassuranceText}
              </Text>
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

        <View style={styles.section}>
          <View
            style={[
              styles.insightCard,
              {
                backgroundColor: `${colors.success}12`,
                borderColor: `${colors.success}33`,
              },
            ]}
          >
            <View
              style={[
                styles.insightIcon,
                { backgroundColor: `${colors.success}33` },
              ]}
            >
              <MaterialIcons name="insights" size={20} color={colors.success} />
            </View>
            <View style={styles.insightBody}>
              <Text style={[styles.insightText, { color: colors.text }]}>
                {insightText}
              </Text>
              <Pressable onPress={handleInsightPress} style={styles.insightLink}>
                <Text style={[styles.insightLinkText, { color: colors.success }]}>
                  {t("budget.insight.cta")}
                </Text>
                <MaterialIcons
                  name={isRtl ? "arrow-back-ios" : "arrow-forward-ios"}
                  size={12}
                  color={colors.success}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {!hasBudgets ? (
          <View style={styles.section}>
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t("budget.empty.title")}
              </Text>
              <Text style={[styles.emptyBody, { color: colors.muted }]}>
                {t("budget.empty.description")}
              </Text>
              <Pressable
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(features)/budgets/new")}
              >
                <Text style={styles.emptyButtonText}>
                  {t("budget.empty.cta")}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {groupedByRisk.atRisk.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionDot,
                      { backgroundColor: colors.warning },
                    ]}
                  />
                  <Text style={[styles.sectionTitle, { color: colors.warning }]}>
                    {t("budget.section.atRisk")}
                  </Text>
                </View>
                <View style={styles.section}>
                  {groupedByRisk.atRisk.map((item) => {
                    const hint = buildHint(item);
                    return renderBudgetCard(
                      item,
                      colors.warning,
                      t("budget.tag.atRisk"),
                      hint.icon,
                      hint.text
                    );
                  })}
                </View>
              </>
            )}

            {groupedByRisk.caution.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionDot,
                      { backgroundColor: colors.accent },
                    ]}
                  />
                  <Text style={[styles.sectionTitle, { color: colors.accent }]}>
                    {t("budget.section.caution")}
                  </Text>
                </View>
                <View style={styles.section}>
                  {groupedByRisk.caution.map((item) => {
                    const hint = buildHint(item);
                    return renderBudgetCard(
                      item,
                      colors.accent,
                      t("budget.tag.caution"),
                      hint.icon,
                      hint.text
                    );
                  })}
                </View>
              </>
            )}

            {groupedByRisk.safe.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionDot,
                      { backgroundColor: colors.success },
                    ]}
                  />
                  <Text style={[styles.sectionTitle, { color: colors.success }]}>
                    {t("budget.section.safe")}
                  </Text>
                </View>
                <View style={styles.section}>
                  {visibleSafe.map((item) => {
                    const hint = buildHint(item);
                    return renderBudgetCard(
                      item,
                      colors.success,
                      t("budget.tag.safe"),
                      hint.icon,
                      hint.text
                    );
                  })}
                  {groupedByRisk.safe.length > safePreviewCount && (
                    <Pressable
                      onPress={() => setShowAllSafe((current) => !current)}
                      style={styles.viewAllButton}
                    >
                      <Text style={[styles.viewAllText, { color: colors.success }]}>
                        {showAllSafe
                          ? t("budget.safe.viewLess")
                          : t("budget.safe.viewAll")}
                      </Text>
                      <MaterialIcons
                        name={showAllSafe ? "expand-less" : "expand-more"}
                        size={18}
                        color={colors.success}
                      />
                    </Pressable>
                  )}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/(features)/budgets/new")}
        style={[styles.fab, { backgroundColor: colors.success }]}
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
  scrollContent: {
    paddingBottom: 160,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 40,
    alignItems: "flex-start",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  headerButton: {
    width: 40,
    alignItems: "flex-end",
  },
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
  insightCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  insightBody: {
    flex: 1,
    gap: 8,
  },
  insightText: {
    fontSize: 13,
    fontWeight: "600",
  },
  insightLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  insightLinkText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
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
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 96,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptyBody: {
    fontSize: 13,
    textAlign: "center",
  },
  emptyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
