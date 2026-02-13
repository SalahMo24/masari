import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";
import { useFocusEffect } from "@react-navigation/native";
import { endOfMonth, startOfMonth } from "date-fns";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
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
} from "react-native-safe-area-context";

import { AmountDisplay, Keypad, type KeypadKey } from "@/src/components/amount";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import Typography from "@/src/components/typography.component";
import type { Budget, Category, Transaction } from "@/src/data/entities";
import {
  budgetRepository,
  categoryRepository,
  transactionRepository,
} from "@/src/data/repositories";
import { useAmountInput } from "@/src/hooks/amount";
import {
  getCategoryIconName,
} from "@/src/hooks/budgets/budgetFormatting";
import { useI18n } from "@/src/i18n/useI18n";
import { palette } from "@/src/theme/theme";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { formatAmountForSummary } from "@/src/utils/amount";
import { getCategoryLabel } from "@/src/utils/categories/labels";

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

const RISK_THRESHOLDS = {
  atRisk: 85,
  caution: 70,
};

const isWithinRange = (date: Date, start: Date, end: Date) =>
  date >= start && date <= end;

type BudgetPreset = {
  id: "lower" | "keep" | "raise";
  amount: number;
  label: string;
  isPrimary?: boolean;
};

export default function EditBudgetScreen() {
  const theme = useAppTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { budgetId: rawBudgetId } = useLocalSearchParams<{
    budgetId?: string | string[];
  }>();

  const budgetId = Array.isArray(rawBudgetId)
    ? rawBudgetId[0]
    : (rawBudgetId ?? null);

  const [budget, setBudget] = useState<Budget | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seededAmount, setSeededAmount] = useState(false);

  const {
    parsedAmount,
    formattedAmount,
    integerDigitsEntered,
    decimalDigitsEntered,
    cursorPart,
    onPressDigit,
    onPressBackspace,
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
    if (!budgetId) {
      setBudget(null);
      setCategory(null);
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const budgetData = await budgetRepository.getById(db, budgetId);
      if (!budgetData) {
        setBudget(null);
        setCategory(null);
        setTransactions([]);
        return;
      }
      const [categoryData, transactionData] = await Promise.all([
        categoryRepository.getById(db, budgetData.category_id),
        transactionRepository.list(db),
      ]);
      setBudget(budgetData);
      setCategory(categoryData);
      setTransactions(transactionData);
    } finally {
      setLoading(false);
    }
  }, [budgetId, db]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
      return () => undefined;
    }, [refreshData]),
  );

  useEffect(() => {
    if (!budget) return;
    if (seededAmount) return;
    setAmount(Math.round(budget.monthly_limit));
    setSeededAmount(true);
  }, [budget, seededAmount, setAmount]);

  useEffect(() => {
    setSeededAmount(false);
    resetAmount();
  }, [budgetId, resetAmount]);

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

  const today = useMemo(() => new Date(), []);
  const monthStart = useMemo(() => startOfMonth(today), [today]);
  const monthEnd = useMemo(() => endOfMonth(today), [today]);

  const spentThisMonth = useMemo(() => {
    if (!budget?.category_id) return 0;
    return transactions.reduce((total, tx) => {
      if (tx.type !== "expense" || tx.category_id !== budget.category_id)
        return total;
      if (!isWithinRange(new Date(tx.occurred_at), monthStart, monthEnd))
        return total;
      return total + tx.amount;
    }, 0);
  }, [budget?.category_id, monthEnd, monthStart, transactions]);

  const currentLimit = budget?.monthly_limit ?? 0;
  const displayLimit = parsedAmount > 0 ? parsedAmount : currentLimit;
  const percentUsed =
    displayLimit > 0 ? (spentThisMonth / displayLimit) * 100 : 0;
  const statusLevel =
    percentUsed >= RISK_THRESHOLDS.atRisk
      ? "atRisk"
      : percentUsed >= RISK_THRESHOLDS.caution
        ? "caution"
        : "safe";

  const statusLabel =
    statusLevel === "atRisk"
      ? t("budget.tag.atRisk")
      : statusLevel === "caution"
        ? t("budget.tag.caution")
        : t("budget.tag.safe");
  const statusColor =
    statusLevel === "atRisk"
      ? colors.danger
      : statusLevel === "caution"
        ? colors.warning
        : colors.success;

  const currencyLabel = t("dashboard.currency");
  const categoryLabel = getCategoryLabel(category, locale, t);
  const categoryIcon = getCategoryIconName(
    category?.name ?? "category",
    category?.icon ?? null,
  );
  const headerTitle = category
    ? t("budget.edit.title").replace("{category}", categoryLabel)
    : t("screen.budget.edit");

  const spentCopy = useMemo(() => {
    if (!budget) return t("budget.loading");
    const spentLabel = `${currencyLabel} ${formatAmountForSummary(spentThisMonth)}`;
    const amountLabel = formatAmountForSummary(displayLimit);
    return t("budget.edit.spentCopy")
      .replace("{spent}", spentLabel)
      .replace("{amount}", amountLabel)
      .replace("{status}", statusLabel);
  }, [budget, currencyLabel, displayLimit, spentThisMonth, statusLabel, t]);

  const previewTitle = useMemo(() => {
    const amountLabel = formatAmountForSummary(displayLimit);
    return t("budget.edit.preview.title")
      .replace("{amount}", amountLabel)
      .replace("{status}", statusLabel);
  }, [displayLimit, statusLabel, t]);

  const presets = useMemo<BudgetPreset[]>(() => {
    if (!currentLimit || currentLimit <= 0) return [];
    const lower = Math.max(0, Math.round(currentLimit * 0.9));
    const keep = Math.round(currentLimit);
    const raise = Math.round(currentLimit * 1.25);
    const entries: BudgetPreset[] = [
      {
        id: "lower",
        amount: lower,
        label: t("budget.edit.chip.lower"),
      },
      {
        id: "keep",
        amount: keep,
        label: t("budget.edit.chip.keep"),
      },
      {
        id: "raise",
        amount: raise,
        label: t("budget.edit.chip.raise"),
        isPrimary: true,
      },
    ];
    const seen = new Set<number>();
    return entries.filter((entry) => {
      if (entry.amount <= 0 || seen.has(entry.amount)) return false;
      seen.add(entry.amount);
      return true;
    });
  }, [currentLimit, t]);

  const canSubmit =
    !!budget &&
    !loading &&
    !saving &&
    parsedAmount > 0 &&
    Math.round(parsedAmount) !== Math.round(currentLimit);

  const onClearAmount = useCallback(() => {
    resetAmount();
  }, [resetAmount]);

  const onApplyPreset = useCallback(
    (value: number) => {
      if (!value || value <= 0) return;
      setAmount(Math.round(value));
    },
    [setAmount],
  );

  const onSave = useCallback(async () => {
    if (!budget || !budgetId) return;
    if (!canSubmit) return;
    try {
      setSaving(true);
      await budgetRepository.updateLimit(db, {
        id: budget.id,
        monthly_limit: parsedAmount,
      });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.replace(`/(features)/budgets/${budget.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }, [budget, budgetId, canSubmit, db, parsedAmount, router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <ScreenHeader
          title={headerTitle}
          colors={{ text: colors.text }}
          left={
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <MaterialIcons
                name={I18nManager.isRTL ? "arrow-forward-ios" : "arrow-back-ios"}
                size={22}
                color={colors.text}
              />
            </Pressable>
          }
        />
      ),
    });
  }, [colors.text, headerTitle, navigation, router]);

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
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 28 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.currentCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.currentCardLeft}>
                <View
                  style={[
                    styles.currentIcon,
                    {
                      backgroundColor: `${colors.success}1A`,
                      borderColor: `${colors.success}33`,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={categoryIcon}
                    size={24}
                    color={colors.success}
                  />
                </View>
                <View>
                  <Typography
                    variant="overline"
                    style={[styles.currentLabel, { color: colors.muted }]}
                  >
                    {t("budget.edit.currentLabel")}
                  </Typography>
                  <Typography
                    variant="subtitle"
                    style={[styles.currentTitle, { color: colors.text }]}
                  >
                    {categoryLabel}
                  </Typography>
                </View>
              </View>
              <View style={styles.currentCardRight}>
                <Typography
                  variant="subtitle"
                  style={[styles.currentAmount, { color: colors.text }]}
                >
                  {formatAmountForSummary(currentLimit)}{" "}
                  <Typography
                    variant="caption"
                    style={[styles.currencyLabel, { color: colors.muted }]}
                  >
                    {currencyLabel}
                  </Typography>
                </Typography>
              </View>
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
                  { backgroundColor: `${colors.accent}33` },
                ]}
              />
              <Typography
                variant="small"
                style={[styles.guidanceText, { color: colors.muted }]}
              >
                {spentCopy}
              </Typography>
            </View>

            <View
              style={[
                styles.previewCard,
                { backgroundColor: palette.egyptianBlue.base },
              ]}
            >
              <View style={styles.previewLeft}>
                <View
                  style={[
                    styles.previewIcon,
                    { backgroundColor: "rgba(255,255,255,0.2)" },
                  ]}
                >
                  <MaterialIcons name="analytics" size={18} color="#fff" />
                </View>
                <View>
                  <Typography variant="caption" style={styles.previewTitle}>
                    {previewTitle}
                  </Typography>
                  <Typography variant="caption" style={styles.previewSubtitle}>
                    {t("budget.edit.preview.subtitle")}
                  </Typography>
                </View>
              </View>
              <View
                style={[styles.previewTag, { backgroundColor: statusColor }]}
              >
                <Typography variant="caption" style={styles.previewTagText}>
                  {statusLabel}
                </Typography>
              </View>
            </View>

            {presets.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetRow}
              >
                {presets.map((preset) => {
                  const amountLabel = `${formatAmountForSummary(preset.amount)} ${currencyLabel}`;
                  const label = preset.label.replace("{amount}", amountLabel);
                  return (
                    <Pressable
                      key={preset.id}
                      onPress={() => onApplyPreset(preset.amount)}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: preset.isPrimary
                            ? `${colors.success}12`
                            : colors.card,
                          borderColor: preset.isPrimary
                            ? `${colors.success}33`
                            : colors.border,
                        },
                      ]}
                    >
                      <Typography
                        variant="caption"
                        style={[
                          styles.presetText,
                          {
                            color: preset.isPrimary
                              ? colors.success
                              : colors.muted,
                          },
                        ]}
                      >
                        {label}
                      </Typography>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </ScrollView>

          <View>
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
            <View style={[styles.actionWrap]}>
              <Pressable
                onPress={onSave}
                disabled={!canSubmit}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: canSubmit ? colors.accent : colors.border,
                  },
                ]}
              >
                <Typography style={styles.actionText}>
                  {saving ? t("budget.edit.saving") : t("budget.edit.cta")}
                </Typography>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
    gap: 16,
  },
  currentCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  currentCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currentIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  currentLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  currentTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  currentCardRight: {
    alignItems: "flex-end",
  },
  currentAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  currencyLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  amountSection: {
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
    width: 56,
    height: 4,
    borderRadius: 999,
  },
  guidanceText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
  },
  previewCard: {
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
    paddingTop: 4,
    paddingBottom: 12,
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
  keypadPanel: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  keypad: {
    borderTopWidth: 1,
    paddingTop: 6,
    paddingHorizontal: 16,
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
  actionWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  actionButton: {
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    shadowColor: palette.egyptianBlue.deep,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  actionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
});
