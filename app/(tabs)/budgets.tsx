import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  BudgetCard,
  BudgetEmptyState,
  BudgetHealthCard,
  BudgetInsightCard,
  BudgetSection,
  PeriodToggle,
} from "@/src/components/budgets";
import Typography from "@/src/components/typography.component";
import {
  useBudgetCardAnimation,
  useBudgetHints,
  useBudgetInsight,
  useBudgetScreenState,
} from "@/src/hooks/budgets";
import { formatPercent } from "@/src/hooks/budgets/budgetFormatting";
import { SAFE_PREVIEW_COUNT } from "@/src/hooks/budgets/useBudgetScreenState";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";

export default function BudgetsScreen() {
  const theme = useAppTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const navigation = useNavigation();
  const isRtl = I18nManager.isRTL;
  const { createdBudgetId } = useLocalSearchParams<{
    createdBudgetId?: string | string[];
  }>();
  const pendingBudgetId = useMemo(() => {
    if (!createdBudgetId) return null;
    return Array.isArray(createdBudgetId)
      ? createdBudgetId[0]
      : createdBudgetId;
  }, [createdBudgetId]);

  const {
    period,
    setPeriod,
    showAllSafe,
    setShowAllSafe,
    hideAmounts,
    setHideAmounts,
    totals,
    groupedByRisk,
    insight,
    hasBudgets,
    loading,
    visibleSafe,
    pendingBudget,
  } = useBudgetScreenState({ pendingBudgetId });

  const { scrollRef, getCardLayoutHandler, getProgressWidth } =
    useBudgetCardAnimation({
      pendingBudgetId,
      pendingBudget,
    });

  const { insightText, handleInsightPress } = useBudgetInsight({
    insight,
    locale,
    t,
  });

  const buildHint = useBudgetHints({ locale, hideAmounts, t });

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
    [theme],
  );

  const spentPercent = formatPercent(totals.percentUsed);
  const remainingPercent = Math.max(0, 100 - spentPercent);
  const statusText =
    locale === "ar"
      ? `${spentPercent}% ${t("budget.health.spent")} · ${remainingPercent}% ${t(
          "budget.health.remaining",
        )}`
      : `${spentPercent}% ${t("budget.health.spent")} · ${remainingPercent}% ${t(
          "budget.health.remaining",
        )}`;
  const reassuranceText =
    spentPercent >= 85
      ? t("budget.health.reassure.atRisk")
      : spentPercent >= 70
        ? t("budget.health.reassure.caution")
        : t("budget.health.reassure.safe");
  const currencyLabel = t("dashboard.currency");
  const hiddenAmountLabel = t("budget.amount.hidden");
  const showSafeToggle = groupedByRisk.safe.length > SAFE_PREVIEW_COUNT;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PeriodToggle
          period={period}
          onChange={setPeriod}
          currentLabel={t("budget.period.thisMonth")}
          previousLabel={t("budget.period.lastMonth")}
          colors={{
            text: colors.text,
            muted: colors.muted,
            border: colors.border,
            card: colors.card,
          }}
        />

        <BudgetHealthCard
          title={t("budget.health.title")}
          statusText={statusText}
          reassuranceText={reassuranceText}
          loadingLabel={t("budget.loading")}
          loading={loading}
          spentPercent={spentPercent}
          colors={{
            text: colors.text,
            muted: colors.muted,
            border: colors.border,
            success: colors.success,
            card: colors.card,
          }}
        />

        <BudgetInsightCard
          insightText={insightText}
          ctaLabel={t("budget.insight.cta")}
          onPress={handleInsightPress}
          isRtl={isRtl}
          colors={{ text: colors.text, success: colors.success }}
        />

        {!hasBudgets ? (
          <BudgetEmptyState
            title={t("budget.empty.title")}
            description={t("budget.empty.description")}
            ctaLabel={t("budget.empty.cta")}
            onPress={() => router.push("/(features)/budgets/new")}
            colors={{
              text: colors.text,
              muted: colors.muted,
              border: colors.border,
              card: colors.card,
              primary: colors.primary,
            }}
          />
        ) : (
          <>
            {groupedByRisk.atRisk.length > 0 && (
              <BudgetSection
                title={t("budget.section.atRisk")}
                color={colors.warning}
              >
                {groupedByRisk.atRisk.map((item) => {
                  const hint = buildHint(item);
                  return (
                    <BudgetCard
                      key={item.budgetId}
                      item={item}
                      riskColor={colors.warning}
                      riskLabel={t("budget.tag.atRisk")}
                      hintIcon={hint.icon}
                      hintText={hint.text}
                      hideAmounts={hideAmounts}
                      locale={locale}
                      t={t}
                      hiddenAmountLabel={hiddenAmountLabel}
                      currencyLabel={currencyLabel}
                      isRtl={isRtl}
                      progressWidth={getProgressWidth(
                        item.budgetId,
                        item.progressPercent,
                      )}
                      onPress={(budgetId) =>
                        router.push(`/(features)/budgets/${budgetId}`)
                      }
                      onLayout={getCardLayoutHandler(item.budgetId)}
                      colors={{
                        text: colors.text,
                        muted: colors.muted,
                        border: colors.border,
                        card: colors.card,
                      }}
                    />
                  );
                })}
              </BudgetSection>
            )}

            {groupedByRisk.caution.length > 0 && (
              <BudgetSection
                title={t("budget.section.caution")}
                color={colors.accent}
              >
                {groupedByRisk.caution.map((item) => {
                  const hint = buildHint(item);
                  return (
                    <BudgetCard
                      key={item.budgetId}
                      item={item}
                      riskColor={colors.accent}
                      riskLabel={t("budget.tag.caution")}
                      hintIcon={hint.icon}
                      hintText={hint.text}
                      hideAmounts={hideAmounts}
                      locale={locale}
                      t={t}
                      hiddenAmountLabel={hiddenAmountLabel}
                      currencyLabel={currencyLabel}
                      isRtl={isRtl}
                      progressWidth={getProgressWidth(
                        item.budgetId,
                        item.progressPercent,
                      )}
                      onPress={(budgetId) =>
                        router.push(`/(features)/budgets/${budgetId}`)
                      }
                      onLayout={getCardLayoutHandler(item.budgetId)}
                      colors={{
                        text: colors.text,
                        muted: colors.muted,
                        border: colors.border,
                        card: colors.card,
                      }}
                    />
                  );
                })}
              </BudgetSection>
            )}

            {groupedByRisk.safe.length > 0 && (
              <BudgetSection
                title={t("budget.section.safe")}
                color={colors.success}
              >
                {visibleSafe.map((item) => {
                  const hint = buildHint(item);
                  return (
                    <BudgetCard
                      key={item.budgetId}
                      item={item}
                      riskColor={colors.success}
                      riskLabel={t("budget.tag.safe")}
                      hintIcon={hint.icon}
                      hintText={hint.text}
                      hideAmounts={hideAmounts}
                      locale={locale}
                      t={t}
                      hiddenAmountLabel={hiddenAmountLabel}
                      currencyLabel={currencyLabel}
                      isRtl={isRtl}
                      progressWidth={getProgressWidth(
                        item.budgetId,
                        item.progressPercent,
                      )}
                      onPress={(budgetId) =>
                        router.push(`/(features)/budgets/${budgetId}`)
                      }
                      onLayout={getCardLayoutHandler(item.budgetId)}
                      colors={{
                        text: colors.text,
                        muted: colors.muted,
                        border: colors.border,
                        card: colors.card,
                      }}
                    />
                  );
                })}
                {showSafeToggle && (
                  <Pressable
                    onPress={() => setShowAllSafe((current) => !current)}
                    style={styles.viewAllButton}
                  >
                    <Typography
                      variant="small"
                      style={[styles.viewAllText, { color: colors.success }]}
                    >
                      {showAllSafe
                        ? t("budget.safe.viewLess")
                        : t("budget.safe.viewAll")}
                    </Typography>
                    <MaterialIcons
                      name={showAllSafe ? "expand-less" : "expand-more"}
                      size={18}
                      color={colors.success}
                    />
                  </Pressable>
                )}
              </BudgetSection>
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
  headerIcon: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonPressed: {
    opacity: 0.7,
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
});
