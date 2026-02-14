import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useLayoutEffect, useMemo, useState } from "react";
import { I18nManager, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BudgetDetailHeader,
  BudgetDetailInsightCard,
  BudgetGuidanceSheet,
  BudgetPaceSection,
  BudgetStatusCard,
  BudgetTransactionsList,
} from "@/src/components/budgets";
import Typography from "@/src/components/typography.component";
import { useUserPreferences } from "@/src/context/UserPreferencesProvider";
import { useBudgetDetail } from "@/src/hooks/budgets";
import { getCategoryIconName } from "@/src/hooks/budgets/budgetFormatting";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { getCategoryLabel } from "@/src/utils/categories/labels";

export default function BudgetDetailScreen() {
  const theme = useAppTheme();
  const { t, locale } = useI18n();
  const { currency: currencyLabel } = useUserPreferences();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isRtl = I18nManager.isRTL;
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const budgetId = Array.isArray(id) ? id[0] : (id ?? null);

  const {
    loading,
    budget,
    category,
    statusLevel,
    summaryText,
    percentLabel,
    progressPercent,
    paceText,
    insightText,
    spent,
    limit,
    dailyTarget,
    weeklyTarget,
    projectedTotal,
    projectedDelta,
    projectedPercent,
    isAdjustmentNeeded,
    transactions,
  } = useBudgetDetail({ budgetId, locale, t });

  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [isGuidanceVisible, setGuidanceVisible] = useState(false);
  const shouldToggleTransactions = transactions.length > 4;
  const visibleTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 4);

  const colors = useMemo(
    () => ({
      primary: theme.colors.primary,
      accent: theme.colors.warning,
      success: theme.colors.success,
      danger: theme.colors.danger,
      text: theme.colors.text,
      muted: theme.colors.mutedText,
      background: theme.colors.background,
      card: theme.colors.card,
      border: theme.colors.border,
    }),
    [theme],
  );
  const guidanceLabels = useMemo(
    () => ({
      title: t("budget.detail.guidance.title"),
      subtitleOnTrack: t("budget.detail.guidance.subtitle.onTrack"),
      subtitleAdjustment: t("budget.detail.guidance.subtitle.adjust"),
      currentStatus: t("budget.detail.guidance.currentStatus"),
      spent: t("budget.detail.guidance.spent"),
      remaining: t("budget.detail.guidance.remaining"),
      targetsTitle: t("budget.detail.guidance.targetsTitle"),
      dailyLimit: t("budget.detail.guidance.dailyLimit"),
      weeklyLimit: t("budget.detail.guidance.weeklyLimit"),
      targetsHintOnTrack: t("budget.detail.guidance.targetsHint.onTrack"),
      targetsHintAdjustment: t("budget.detail.guidance.targetsHint.adjust"),
      forecastTitle: t("budget.detail.guidance.forecast.title"),
      forecastCaption: t("budget.detail.guidance.forecast.caption"),
      projectedEnd: t("budget.detail.guidance.forecast.projectedEnd"),
      forecastUnder: t("budget.detail.guidance.forecast.under"),
      forecastOver: t("budget.detail.guidance.forecast.over"),
      projectedSpend: t("budget.detail.guidance.forecast.projectedSpend"),
      projectedSavings: t("budget.detail.guidance.forecast.projectedSavings"),
      projectedOverspend: t("budget.detail.guidance.forecast.projectedOverspend"),
      ctaGotIt: t("budget.detail.guidance.cta.gotIt"),
      footerOnTrack: t("budget.detail.guidance.footer.onTrack"),
      footerAdjustment: t("budget.detail.guidance.footer.adjust"),
    }),
    [t],
  );

  const headerTitle = category
    ? getCategoryLabel(category, locale, t)
    : t("budget.detail.title");
  const headerIcon = getCategoryIconName(
    category?.name ?? "category",
    category?.icon ?? null,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <BudgetDetailHeader
          title={headerTitle}
          iconName={headerIcon}
          onBack={() => router.back()}
          onMore={() => null}
          colors={colors}
        />
      ),
    });
  }, [colors, headerIcon, headerTitle, navigation, router]);

  const statusLabel = t("budget.detail.status");
  const statusValue =
    statusLevel === "atRisk"
      ? t("budget.tag.atRisk")
      : statusLevel === "caution"
        ? t("budget.tag.caution")
        : t("budget.tag.safe");
  const statusIcon =
    statusLevel === "atRisk"
      ? "report-problem"
      : statusLevel === "caution"
        ? "error-outline"
        : "check-circle";
  const statusColor =
    statusLevel === "atRisk"
      ? colors.accent
      : statusLevel === "caution"
        ? colors.accent
        : colors.success;

  if (!loading && !budget) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.emptyState}>
          <Typography
            variant="body"
            style={[styles.emptyText, { color: colors.muted }]}
          >
            {t("budget.detail.notFound")}
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <BudgetStatusCard
            statusLabel={statusLabel}
            statusValue={statusValue}
            statusIcon={statusIcon}
            statusColor={statusColor}
            summaryText={loading ? t("budget.loading") : summaryText}
            percentLabel={percentLabel}
            progressPercent={progressPercent}
          />
        </View>

        <BudgetPaceSection
          paceText={loading ? t("budget.loading") : paceText}
          actionLabel={t("budget.detail.adjust")}
          onPress={() =>
            budget
              ? router.push({
                  pathname: "/(features)/budgets/edit",
                  params: { budgetId: budget.id },
                } as any)
              : null
          }
          colors={colors}
        />

        <BudgetDetailInsightCard
          title={t("budget.detail.guidance.title")}
          insightText={loading ? t("budget.loading") : insightText}
          ctaLabel={t("budget.detail.guidance.openCta")}
          onPress={() => setGuidanceVisible(true)}
          isRtl={isRtl}
          colors={{
            text: colors.text,
            muted: colors.muted,
            accent: colors.accent,
          }}
        />

        <BudgetTransactionsList
          title={t("budget.detail.transactions.title")}
          actionLabel={
            shouldToggleTransactions
              ? showAllTransactions
                ? t("budget.detail.transactions.showLess")
                : t("budget.detail.transactions.seeAll")
              : undefined
          }
          onAction={
            shouldToggleTransactions
              ? () => setShowAllTransactions((current) => !current)
              : undefined
          }
          items={visibleTransactions}
          emptyLabel={
            loading
              ? t("budget.loading")
              : t("budget.detail.transactions.empty")
          }
          colors={{
            text: colors.text,
            muted: colors.muted,
            card: colors.card,
            border: colors.border,
            accent: colors.primary,
          }}
        />
      </ScrollView>

      <BudgetGuidanceSheet
        visible={isGuidanceVisible}
        insetsBottom={insets.bottom}
        isAdjustmentNeeded={isAdjustmentNeeded || statusLevel === "caution"}
        spent={spent}
        limit={limit}
        dailyTarget={dailyTarget}
        weeklyTarget={weeklyTarget}
        projectedTotal={projectedTotal}
        projectedDelta={projectedDelta}
        projectedPercent={projectedPercent}
        currencyLabel={currencyLabel}
        labels={guidanceLabels}
        colors={{
          text: colors.text,
          muted: colors.muted,
          background: colors.background,
          card: colors.card,
          border: colors.border,
          accent: colors.accent,
          success: colors.success,
          warning: colors.accent,
          primary: theme.colors.accent,
        }}
        onClose={() => setGuidanceVisible(false)}
      />
    </SafeAreaView>
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
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    textAlign: "center",
  },
});
