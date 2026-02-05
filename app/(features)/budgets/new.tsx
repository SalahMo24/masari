import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, I18nManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import type { Budget, Category, Transaction } from "@/src/data/entities";
import {
  budgetRepository,
  categoryRepository,
  transactionRepository,
} from "@/src/data/repositories";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { appendDigit, formatAmountForSummary, parseAmount } from "@/src/utils/amount";

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

function isWithinRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

export default function NewBudgetScreen() {
  const theme = useAppTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const isRtl = I18nManager.isRTL;

  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState<string>("");

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const categoryData = await categoryRepository.list();
      const budgetData = await budgetRepository.list();
      const transactionData = await transactionRepository.list();
      setCategories(categoryData);
      setBudgets(budgetData);
      setTransactions(transactionData);
    } finally {
      setLoading(false);
    }
  }, []);

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
    [theme]
  );

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const existingBudget = useMemo(
    () =>
      selectedCategoryId
        ? budgets.find((budget) => budget.category_id === selectedCategoryId) ?? null
        : null,
    [budgets, selectedCategoryId]
  );

  const parsedAmount = useMemo(() => parseAmount(amountInput), [amountInput]);
  const formattedAmount = useMemo(
    () => formatAmountForSummary(parsedAmount),
    [parsedAmount]
  );
  const currencyLabel = t("dashboard.currency");

  const today = useMemo(() => new Date(), []);
  const avgWindowStart = useMemo(
    () => startOfMonth(subMonths(today, 2)),
    [today]
  );
  const avgWindowEnd = useMemo(() => endOfMonth(today), [today]);
  const lastMonthStart = useMemo(
    () => startOfMonth(subMonths(today, 1)),
    [today]
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
    !!selectedCategoryId && selectedAverage > 0 && parsedAmount > 0 && parsedAmount < selectedAverage;

  const canSubmit =
    !!selectedCategoryId &&
    parsedAmount > 0 &&
    !saving &&
    !loading &&
    !existingBudget;

  const onPressDigit = useCallback((digit: string) => {
    setAmountInput((current) => appendDigit(current, digit));
  }, []);

  const onBackspace = useCallback(() => {
    setAmountInput((current) => (current.length ? current.slice(0, -1) : ""));
  }, []);

  const onClearAmount = useCallback(() => {
    setAmountInput("");
  }, []);

  const onSelectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const onApplyPreset = useCallback((value: number) => {
    if (!value || value <= 0) return;
    setAmountInput(String(Math.round(value)));
  }, []);

  const onSave = useCallback(async () => {
    if (saving) return;
    if (loading) return;
    if (!selectedCategoryId || parsedAmount <= 0) return;
    if (existingBudget) return;

    try {
      setSaving(true);
      const created = await budgetRepository.create({
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
  }, [existingBudget, parsedAmount, router, saving, selectedCategoryId]);

  const onEditExisting = useCallback(() => {
    if (!existingBudget) return;
    router.push(`/(features)/budgets/${existingBudget.id}`);
  }, [existingBudget, router]);

  const onCancelExisting = useCallback(() => {
    setSelectedCategoryId(null);
  }, []);

  const selectedLabel = selectedCategory
    ? normalizeCategoryLabel(selectedCategory.name, locale)
    : t("transaction.category.none");

  const guidanceText = useMemo(() => {
    if (!selectedCategoryId || selectedAverage <= 0 || safeSuggestion <= 0) return null;
    const avgLabel = `${formatAmountForSummary(selectedAverage)} ${currencyLabel}`;
    const safeLabel = `${formatAmountForSummary(safeSuggestion)} ${currencyLabel}`;
    return t("budget.create.guidance")
      .replace("{average}", avgLabel)
      .replace("{suggested}", safeLabel);
  }, [currencyLabel, safeSuggestion, selectedAverage, selectedCategoryId, t]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <MaterialIcons
              name={isRtl ? "arrow-forward-ios" : "arrow-back-ios"}
              size={22}
              color={colors.text}
            />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("screen.budget.new")}
          </Text>
          <View style={styles.headerButton} />
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>
              {t("budget.loading")}
            </Text>
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
                  const label = normalizeCategoryLabel(category.name, locale);
                  const iconColor = isSelected ? colors.success : colors.muted;
                  const background = isSelected ? `${colors.success}22` : colors.card;
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
                        <MaterialIcons name={iconName} size={22} color={iconColor} />
                      </View>
                      <Text
                        style={[
                          styles.categoryLabel,
                          { color: isSelected ? colors.success : colors.text },
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.amountSection}>
              <Text style={[styles.amountText, { color: colors.text }]}>
                {formattedAmount}{" "}
                <Text style={[styles.amountCurrency, { color: colors.muted }]}>
                  {currencyLabel}
                </Text>
              </Text>
              <View style={[styles.amountIndicator, { backgroundColor: `${colors.success}33` }]} />
              {guidanceText ? (
                <Text style={[styles.guidanceText, { color: colors.muted }]}>
                  {guidanceText}
                </Text>
              ) : (
                <Text style={[styles.guidanceText, { color: colors.muted }]}>
                  {t("budget.insight.empty")}
                </Text>
              )}
            </View>

            {showLowWarning && (
              <View style={[styles.warningBanner, { borderColor: `${colors.warning}66` }]}>
                <MaterialIcons name="warning-amber" size={18} color={colors.warning} />
                <Text style={[styles.warningText, { color: colors.text }]}>
                  {t("budget.create.warning.low")}
                </Text>
              </View>
            )}

            {existingBudget && (
              <View style={[styles.duplicateBanner, { borderColor: `${colors.warning}66` }]}>
                <Text style={[styles.duplicateText, { color: colors.text }]}>
                  {t("budget.create.duplicate").replace("{category}", selectedLabel)}
                </Text>
                <View style={styles.duplicateActions}>
                  <Pressable onPress={onEditExisting} style={styles.inlineButton}>
                    <Text style={[styles.inlineButtonText, { color: colors.primary }]}>
                      {t("budget.create.duplicate.edit")}
                    </Text>
                  </Pressable>
                  <Pressable onPress={onCancelExisting} style={styles.inlineButton}>
                    <Text style={[styles.inlineButtonText, { color: colors.muted }]}>
                      {t("budget.create.duplicate.cancel")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            <View style={[styles.previewCard, { backgroundColor: colors.primary }]}>
              <View style={styles.previewLeft}>
                <View style={[styles.previewIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                  <MaterialIcons
                    name={(selectedCategory?.icon ??
                      categoryIconMap[selectedCategory?.name ?? ""] ??
                      "category") as MaterialIconName}
                    size={18}
                    color="#fff"
                  />
                </View>
                <View>
                  <Text style={styles.previewTitle}>
                    {selectedLabel} • {formattedAmount} {currencyLabel}/mo
                  </Text>
                  <Text style={styles.previewSubtitle}>
                    {t("budget.create.preview.safe")}
                  </Text>
                </View>
              </View>
              <View style={[styles.previewTag, { backgroundColor: colors.success }]}>
                <Text style={styles.previewTagText}>{t("budget.tag.safe")}</Text>
              </View>
            </View>

            <View style={styles.presetRow}>
              {selectedLastMonth > 0 && (
                <Pressable
                  onPress={() => onApplyPreset(selectedLastMonth)}
                  style={[styles.presetChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Text style={[styles.presetText, { color: colors.muted }]}>
                    {t("budget.create.chip.lastMonth").replace(
                      "{amount}",
                      formatAmountForSummary(selectedLastMonth)
                    )}
                  </Text>
                </Pressable>
              )}
              {selectedAverage > 0 && (
                <Pressable
                  onPress={() => onApplyPreset(selectedAverage)}
                  style={[styles.presetChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Text style={[styles.presetText, { color: colors.muted }]}>
                    {t("budget.create.chip.average").replace(
                      "{amount}",
                      formatAmountForSummary(selectedAverage)
                    )}
                  </Text>
                </Pressable>
              )}
              {safeSuggestion > 0 && (
                <Pressable
                  onPress={() => onApplyPreset(safeSuggestion)}
                  style={[
                    styles.presetChip,
                    { backgroundColor: `${colors.success}12`, borderColor: `${colors.success}33` },
                  ]}
                >
                  <Text style={[styles.presetText, { color: colors.success }]}>
                    {t("budget.create.chip.safe").replace(
                      "{amount}",
                      formatAmountForSummary(safeSuggestion)
                    )}
                  </Text>
                </Pressable>
              )}
            </View>

            <View style={[styles.keypad, { borderTopColor: colors.border }]}>
              {[
                ["1", "2", "3"],
                ["4", "5", "6"],
                ["7", "8", "9"],
                ["", "0", "backspace"],
              ].map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.keypadRow}>
                  {row.map((key) => {
                    if (key === "") {
                      return <View key="spacer" style={styles.keypadKey} />;
                    }
                    if (key === "backspace") {
                      return (
                        <Pressable
                          key="backspace"
                          onPress={onBackspace}
                          onLongPress={onClearAmount}
                          delayLongPress={450}
                          style={({ pressed }) => [
                            styles.keypadKey,
                            { backgroundColor: pressed ? `${colors.border}66` : "transparent" },
                          ]}
                        >
                          <MaterialIcons name="backspace" size={22} color={colors.text} />
                        </Pressable>
                      );
                    }
                    return (
                      <Pressable
                        key={key}
                        onPress={() => onPressDigit(key)}
                        style={({ pressed }) => [
                          styles.keypadKey,
                          { backgroundColor: pressed ? `${colors.border}66` : "transparent" },
                        ]}
                      >
                        <Text style={[styles.keypadText, { color: colors.text }]}>{key}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.ctaRow}>
              <Pressable
                onPress={onSave}
                disabled={!canSubmit}
                style={[
                  styles.ctaButton,
                  { backgroundColor: canSubmit ? colors.primary : colors.border },
                ]}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.ctaText}>{t("budget.create.cta")}</Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 16,
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
    flex: 1,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  keypadText: {
    fontSize: 26,
    fontWeight: "600",
  },
  ctaRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  ctaButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
