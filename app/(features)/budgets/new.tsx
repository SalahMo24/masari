import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  I18nManager,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AmountDisplay, Keypad, type KeypadKey } from "@/src/components/amount";
import {
  SAVE_BUTTON_BASE_HEIGHT,
  SaveButton,
} from "@/src/components/SaveButton";
import Typography from "@/src/components/typography.component";
import { useUserPreferences } from "@/src/context/UserPreferencesProvider";
import type { Budget, Category, Transaction } from "@/src/data/entities";
import {
  budgetRepository,
  categoryRepository,
  transactionRepository,
} from "@/src/data/repositories";
import { useAmountInput } from "@/src/hooks/amount";
import { useI18n } from "@/src/i18n/useI18n";
import { palette } from "@/src/theme/theme";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { formatAmountForSummary } from "@/src/utils/amount";
import { getCategoryLabel } from "@/src/utils/categories/labels";
import { useSQLiteContext } from "expo-sqlite";

const categoryIconMap: Record<string, string> = {
  transportation: "directions-car",
  groceries: "shopping-basket",
  dining: "restaurant",
  bills: "receipt-long",
  loan: "payments",
};
type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

const budgetKeypadKeys: KeypadKey[] = [
  { type: "digit", value: "1" },
  { type: "digit", value: "2" },
  { type: "digit", value: "3" },
  { type: "digit", value: "4" },
  { type: "digit", value: "5" },
  { type: "digit", value: "6" },
  { type: "digit", value: "7" },
  { type: "digit", value: "8" },
  { type: "digit", value: "9" },
  { type: "spacer" },
  { type: "zero" },
  { type: "backspace" },
] as const;

function isWithinRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

export default function NewBudgetScreen() {
  const theme = useAppTheme();
  const { t, locale } = useI18n();
  const { currency: currencyLabel } = useUserPreferences();
  const router = useRouter();
  const db = useSQLiteContext();
  const isRtl = I18nManager.isRTL;
  const insets = useSafeAreaInsets();
  const saveButtonOffset = SAVE_BUTTON_BASE_HEIGHT + insets.bottom;

  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const {
    parsedAmount,
    formattedAmount,
    integerDigitsEntered,
    decimalDigitsEntered,
    cursorPart,
    onPressDigit,
    onPressBackspace,
    onLongPressClear,
    setAmount,
    reset: resetAmount,
  } = useAmountInput({
    allowDecimal: false,
    allowOperators: false,
    allowEquals: false,
    maxDecimalDigits: 0,
    maxIntegerDigits: 9,
  });

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const categoryData = await categoryRepository.list(db);
      const budgetData = await budgetRepository.list(db);
      const transactionData = await transactionRepository.list(db);
      setCategories(categoryData);
      setBudgets(budgetData);
      setTransactions(transactionData);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const existingBudget = useMemo(
    () =>
      selectedCategoryId
        ? (budgets.find(
            (budget) => budget.category_id === selectedCategoryId,
          ) ?? null)
        : null,
    [budgets, selectedCategoryId],
  );

  const today = useMemo(() => new Date(), []);
  const avgWindowStart = useMemo(
    () => startOfMonth(subMonths(today, 2)),
    [today],
  );
  const avgWindowEnd = useMemo(() => endOfMonth(today), [today]);
  const lastMonthStart = useMemo(
    () => startOfMonth(subMonths(today, 1)),
    [today],
  );
  const lastMonthEnd = useMemo(() => endOfMonth(subMonths(today, 1)), [today]);

  const averageByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== "expense" || !tx.category_id) continue;
      const occurred = new Date(tx.occurred_at);
      if (!isWithinRange(occurred, avgWindowStart, avgWindowEnd)) continue;
      totals.set(tx.category_id, (totals.get(tx.category_id) ?? 0) + tx.amount);
    }
    return totals;
  }, [avgWindowEnd, avgWindowStart, transactions]);

  const lastMonthByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== "expense" || !tx.category_id) continue;
      const occurred = new Date(tx.occurred_at);
      if (!isWithinRange(occurred, lastMonthStart, lastMonthEnd)) continue;
      totals.set(tx.category_id, (totals.get(tx.category_id) ?? 0) + tx.amount);
    }
    return totals;
  }, [lastMonthEnd, lastMonthStart, transactions]);

  const selectedAverage = useMemo(() => {
    if (!selectedCategoryId) return 0;
    const total = averageByCategory.get(selectedCategoryId) ?? 0;
    return total / 3;
  }, [averageByCategory, selectedCategoryId]);

  const selectedLastMonth = useMemo(() => {
    if (!selectedCategoryId) return 0;
    return lastMonthByCategory.get(selectedCategoryId) ?? 0;
  }, [lastMonthByCategory, selectedCategoryId]);

  const safeSuggestion = useMemo(() => {
    if (!selectedAverage) return 0;
    return Math.max(0, Math.round(selectedAverage * 0.9));
  }, [selectedAverage]);

  const showLowWarning =
    !!selectedCategoryId &&
    selectedAverage > 0 &&
    parsedAmount > 0 &&
    parsedAmount < selectedAverage;

  const canSubmit =
    !!selectedCategoryId &&
    parsedAmount > 0 &&
    !saving &&
    !loading &&
    !existingBudget;

  const onClearAmount = useCallback(() => {
    resetAmount();
  }, [resetAmount]);

  const onSelectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const onApplyPreset = useCallback(
    (value: number) => {
      if (!value || value <= 0) return;
      setAmount(Math.round(value));
    },
    [setAmount],
  );

  const onSave = useCallback(async () => {
    if (saving) return;
    if (loading) return;
    if (!selectedCategoryId || parsedAmount <= 0) return;
    if (existingBudget) return;

    try {
      setSaving(true);
      const created = await budgetRepository.create(db, {
        category_id: selectedCategoryId,
        monthly_limit: parsedAmount,
      });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.replace({
        pathname: "/(tabs)/budgets",
        params: { createdBudgetId: created.id },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }, [db, existingBudget, parsedAmount, router, saving, selectedCategoryId]);

  const onEditExisting = useCallback(() => {
    if (!existingBudget) return;
    router.push(`/(features)/budgets/${existingBudget.id}`);
  }, [existingBudget, router]);

  const onCancelExisting = useCallback(() => {
    setSelectedCategoryId(null);
  }, []);

  const selectedLabel = selectedCategory
    ? getCategoryLabel(selectedCategory, locale, t)
    : t("transaction.category.none");

  const guidanceText = useMemo(() => {
    if (!selectedCategoryId || selectedAverage <= 0 || safeSuggestion <= 0)
      return null;
    const avgLabel = `${formatAmountForSummary(selectedAverage)} ${currencyLabel}`;
    const safeLabel = `${formatAmountForSummary(safeSuggestion)} ${currencyLabel}`;
    return t("budget.create.guidance")
      .replace("{average}", avgLabel)
      .replace("{suggested}", safeLabel);
  }, [currencyLabel, safeSuggestion, selectedAverage, selectedCategoryId, t]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingBottom: saveButtonOffset }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <MaterialIcons
              name={isRtl ? "arrow-forward-ios" : "arrow-back-ios"}
              size={22}
              color={colors.text}
            />
          </Pressable>
          <Typography
            variant="h6"
            style={[styles.headerTitle, { color: colors.text }]}
          >
            {t("screen.budget.new")}
          </Typography>
          <View style={styles.headerButton} />
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.primary} />
            <Typography
              variant="caption"
              style={[styles.loadingText, { color: colors.muted }]}
            >
              {t("budget.loading")}
            </Typography>
          </View>
        ) : (
          <>
            <View style={styles.categoryRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {categories.map((category) => {
                  const isSelected = category.id === selectedCategoryId;
                  const iconName = (category.icon ??
                    categoryIconMap[category.name] ??
                    "category") as MaterialIconName;
                  const label = getCategoryLabel(category, locale, t);
                  const iconColor = isSelected ? colors.success : colors.muted;
                  const background = isSelected
                    ? `${colors.success}22`
                    : colors.card;
                  const border = isSelected ? colors.success : colors.border;
                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => onSelectCategory(category.id)}
                      style={styles.categoryItem}
                    >
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: background, borderColor: border },
                        ]}
                      >
                        <MaterialIcons
                          name={iconName}
                          size={22}
                          color={iconColor}
                        />
                      </View>
                      <Typography
                        variant="caption"
                        style={[
                          styles.categoryLabel,
                          { color: isSelected ? colors.success : colors.text },
                        ]}
                      >
                        {label}
                      </Typography>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.amountSection}>
              <AmountDisplay
                currency={currencyLabel}
                formattedAmount={formattedAmount}
                integerDigitsEntered={integerDigitsEntered}
                decimalDigitsEntered={decimalDigitsEntered}
                cursorPart={cursorPart}
                currencyColor={colors.muted}
                amountColor={colors.text}
                showCaret={false}
                currencyPosition="suffix"
                styles={{
                  amountBlock: styles.amountBlock,
                  amountRow: styles.amountRow,
                  amountContainer: styles.amountContainer,
                  currency: styles.amountCurrency,
                  digit: styles.amountText,
                }}
              />
              <View
                style={[
                  styles.amountIndicator,
                  { backgroundColor: `${colors.success}33` },
                ]}
              />
              {guidanceText ? (
                <Typography
                  variant="small"
                  style={[styles.guidanceText, { color: colors.muted }]}
                >
                  {guidanceText}
                </Typography>
              ) : (
                <Typography
                  variant="small"
                  style={[styles.guidanceText, { color: colors.muted }]}
                >
                  {t("budget.insight.empty")}
                </Typography>
              )}
            </View>

            {showLowWarning && (
              <View
                style={[
                  styles.warningBanner,
                  { borderColor: `${colors.warning}66` },
                ]}
              >
                <MaterialIcons
                  name="warning-amber"
                  size={18}
                  color={colors.warning}
                />
                <Typography
                  variant="caption"
                  style={[styles.warningText, { color: colors.text }]}
                >
                  {t("budget.create.warning.low")}
                </Typography>
              </View>
            )}

            {existingBudget && (
              <View
                style={[
                  styles.duplicateBanner,
                  { borderColor: `${colors.warning}66` },
                ]}
              >
                <Typography
                  variant="small"
                  style={[styles.duplicateText, { color: colors.text }]}
                >
                  {t("budget.create.duplicate").replace(
                    "{category}",
                    selectedLabel,
                  )}
                </Typography>
                <View style={styles.duplicateActions}>
                  <Pressable
                    onPress={onEditExisting}
                    style={styles.inlineButton}
                  >
                    <Typography
                      variant="caption"
                      style={[
                        styles.inlineButtonText,
                        { color: colors.primary },
                      ]}
                    >
                      {t("budget.create.duplicate.edit")}
                    </Typography>
                  </Pressable>
                  <Pressable
                    onPress={onCancelExisting}
                    style={styles.inlineButton}
                  >
                    <Typography
                      variant="caption"
                      style={[styles.inlineButtonText, { color: colors.muted }]}
                    >
                      {t("budget.create.duplicate.cancel")}
                    </Typography>
                  </Pressable>
                </View>
              </View>
            )}

            <View
              style={[styles.previewCard, { backgroundColor: colors.accent }]}
            >
              <View style={styles.previewLeft}>
                <View
                  style={[
                    styles.previewIcon,
                    { backgroundColor: "rgba(255,255,255,0.2)" },
                  ]}
                >
                  <MaterialIcons
                    name={
                      (selectedCategory?.icon ??
                        categoryIconMap[selectedCategory?.name ?? ""] ??
                        "category") as MaterialIconName
                    }
                    size={18}
                    color="#fff"
                  />
                </View>
                <View>
                  <Typography variant="caption" style={styles.previewTitle}>
                    {selectedLabel} • {formattedAmount} {currencyLabel}/mo
                  </Typography>
                  <Typography variant="caption" style={styles.previewSubtitle}>
                    {t("budget.create.preview.safe")}
                  </Typography>
                </View>
              </View>
              <View
                style={[
                  styles.previewTag,
                  { backgroundColor: palette.nileGreen.deep },
                ]}
              >
                <Typography variant="caption" style={styles.previewTagText}>
                  {t("budget.tag.safe")}
                </Typography>
              </View>
            </View>

            <View style={styles.presetRow}>
              {selectedLastMonth > 0 && (
                <Pressable
                  onPress={() => onApplyPreset(selectedLastMonth)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Typography
                    variant="caption"
                    style={[styles.presetText, { color: colors.muted }]}
                  >
                    {t("budget.create.chip.lastMonth").replace(
                      "{amount}",
                      formatAmountForSummary(selectedLastMonth),
                    )}
                  </Typography>
                </Pressable>
              )}
              {selectedAverage > 0 && (
                <Pressable
                  onPress={() => onApplyPreset(selectedAverage)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Typography
                    variant="caption"
                    style={[styles.presetText, { color: colors.muted }]}
                  >
                    {t("budget.create.chip.average").replace(
                      "{amount}",
                      formatAmountForSummary(selectedAverage),
                    )}
                  </Typography>
                </Pressable>
              )}
              {safeSuggestion > 0 && (
                <Pressable
                  onPress={() => onApplyPreset(safeSuggestion)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: `${colors.success}12`,
                      borderColor: `${colors.success}33`,
                    },
                  ]}
                >
                  <Typography
                    variant="caption"
                    style={[styles.presetText, { color: colors.success }]}
                  >
                    {t("budget.create.chip.safe").replace(
                      "{amount}",
                      formatAmountForSummary(safeSuggestion),
                    )}
                  </Typography>
                </Pressable>
              )}
            </View>

            <Keypad
              keys={budgetKeypadKeys}
              columns={3}
              onDigit={onPressDigit}
              onBackspace={onPressBackspace}
              onLongPressClear={onClearAmount}
              border={colors.border}
              background="transparent"
              pressedBackground={`${colors.border}66`}
              text={colors.text}
              accent={colors.primary}
              showKeyBorders={false}
              styleOverrides={{
                keypad: [styles.keypad, { borderTopColor: colors.border }],
                key: styles.keypadKey,
                keyText: styles.keypadText,
              }}
            />

            <SaveButton
              label={t("budget.create.cta")}
              savingLabel={t("budget.create.saving")}
              saving={saving}
              onSave={onSave}
              accentColor={colors.accent}
              cardColor={colors.card}
              borderColor={colors.border}
              disabled={!canSubmit}
              disabledColor={colors.border}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  categoryRow: {
    paddingTop: 6,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  categoryItem: {
    alignItems: "center",
    gap: 6,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  amountSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  amountBlock: {
    paddingVertical: 0,
  },
  amountRow: {
    paddingHorizontal: 0,
  },
  amountContainer: {
    alignItems: "baseline",
  },
  amountText: {
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -1,
  },
  amountCurrency: {
    fontSize: 18,
    fontWeight: "600",
  },
  amountIndicator: {
    width: 48,
    height: 4,
    borderRadius: 999,
  },
  guidanceText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(255,196,0,0.08)",
  },
  warningText: {
    flex: 1,
    fontSize: 12,
  },
  duplicateBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(255,196,0,0.08)",
  },
  duplicateText: {
    fontSize: 13,
    fontWeight: "600",
  },
  duplicateActions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },
  inlineButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  inlineButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  previewCard: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  previewIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  previewTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  previewSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    marginTop: 2,
  },
  previewTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  previewTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  presetRow: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  presetChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 11,
    fontWeight: "600",
  },
  keypad: {
    marginTop: 4,
    borderTopWidth: 1,
    paddingTop: 6,
    paddingHorizontal: 8,
  },
  keypadRow: {
    flexDirection: "row",
  },
  keypadKey: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  keypadText: {
    fontSize: 26,
    fontWeight: "600",
  },
});
