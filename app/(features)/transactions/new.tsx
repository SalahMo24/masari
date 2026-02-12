import { AmountDisplay, Keypad } from "@/src/components/amount";
import {
  NoteSection,
  SAVE_BUTTON_BASE_HEIGHT,
  SaveButton,
  SegmentedControl,
  TransactionCategoryPicker,
  TransactionDatePicker,
  TransactionHeader,
  TransactionSummary,
  WalletSection,
} from "@/src/components/transactions";
import Typography from "@/src/components/typography.component";
import type { TransactionType } from "@/src/data/entities";
import { transactionRepository } from "@/src/data/repositories";
import { useAmountInput } from "@/src/hooks/amount";
import {
  useCategorySelection,
  useTransactionData,
  useTransactionDatePicker,
  useWalletSelection,
} from "@/src/hooks/transactions";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { formatAmountForSummary } from "@/src/utils/amount";
import { Stack, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function NewTransactionScreen() {
  const theme = useAppTheme();
  const { t, locale } = useI18n();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const saveButtonOffset = SAVE_BUTTON_BASE_HEIGHT + insets.bottom - 30;
  const isRtl = I18nManager.isRTL;

  // Data fetching
  const { wallets, categories, loading, refreshData } = useTransactionData();

  // Form state
  const [mode, setMode] = useState<TransactionType>("expense");
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const {
    isDatePickerVisible,
    selectedDateLabel,
    monthLabel,
    weekdayLabels,
    monthCells,
    quickDates,
    disableNextMonth,
    occurredAt,
    isFutureDateSelected,
    openDatePicker,
    closeDatePicker,
    confirmDate,
    onSelectQuickDate,
    onPrevMonth,
    onNextMonth,
    onSelectDraftDate,
  } = useTransactionDatePicker({
    locale,
    labels: {
      today: t("transaction.date.today"),
      yesterday: t("transaction.date.yesterday"),
    },
  });

  // Amount input
  const {
    parsedAmount,
    formattedAmount,
    integerDigitsEntered,
    decimalDigitsEntered,
    cursorPart,
    operator,
    arithmeticTag,
    onPressDigit,
    onPressDotToggle,
    onPressBackspace,
    onLongPressClear,
    onPressOperator,
    onPressEquals,
  } = useAmountInput();

  // Wallet selection
  const {
    walletId,
    fromWalletId,
    toWalletId,
    activeWallet,
    fromWallet,
    toWallet,
    setWalletId,
    setFromWalletId,
    setToWalletId,
  } = useWalletSelection(wallets, mode);

  // Category selection
  const {
    selectedCategoryId,
    selectedCategory,
    expenseCategories,
    incomeQuickCategories,
    createCategoryCandidate,
    setSelectedCategoryId,
    onCreateCategory,
  } = useCategorySelection(categories, mode, note);

  // Derived values
  const accent = useMemo(() => {
    if (mode === "income") return theme.colors.success;
    return theme.colors.accent;
  }, [mode, theme.colors.accent, theme.colors.success]);

  const screenTitle = useMemo(() => {
    if (mode === "income") return t("transaction.title.income");
    if (mode === "transfer") return t("transaction.title.transfer");
    return t("transaction.title.expense");
  }, [mode, t]);

  const currency = t("dashboard.currency");

  const summary = useMemo(() => {
    const amountText = `${currency} ${formatAmountForSummary(parsedAmount)}`;
    if (mode === "transfer") {
      const fromName = fromWallet?.name ?? t("transaction.wallet.unknown");
      const toName = toWallet?.name ?? t("transaction.wallet.unknown");
      return `${fromName} ${isRtl ? "⬅" : "➔"} ${toName} • ${amountText} • ${selectedDateLabel}`;
    }
    const sign = mode === "expense" ? "-" : "+";
    const cat = selectedCategory?.name ?? t("transaction.category.none");
    const wName = activeWallet?.name ?? t("transaction.wallet.unknown");
    return `${sign} ${amountText} • ${cat} • ${wName} • ${selectedDateLabel}`;
  }, [
    activeWallet?.name,
    currency,
    fromWallet?.name,
    isRtl,
    mode,
    parsedAmount,
    selectedCategory?.name,
    selectedDateLabel,
    t,
    toWallet?.name,
  ]);

  const categoryPickerCategories = useMemo(() => {
    if (mode === "expense") {
      return expenseCategories;
    }
    if (mode === "income") {
      const seen = new Set<string>();
      const merged = [...incomeQuickCategories, ...expenseCategories];
      return merged.filter((category) => {
        if (seen.has(category.id)) return false;
        seen.add(category.id);
        return true;
      });
    }
    return [];
  }, [expenseCategories, incomeQuickCategories, mode]);

  const saveLabel = useMemo(() => {
    if (mode === "transfer") return t("transaction.cta.transfer");
    if (mode === "income") return t("transaction.cta.income");
    return t("transaction.cta.expense");
  }, [mode, t]);

  // Handlers
  const onClose = useCallback(() => {
    router.back();
  }, []);

  const onHelp = useCallback(() => {
    Alert.alert(t("transaction.help"), t("transaction.help.body"));
  }, [t]);

  const ensureWalletsReady = useCallback((): boolean => {
    if (wallets.length === 0) {
      Alert.alert(t("transaction.error"), t("transaction.error.noWallets"));
      return false;
    }
    return true;
  }, [t, wallets.length]);

  const onSave = useCallback(async () => {
    if (saving) return;
    if (!ensureWalletsReady()) return;

    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert(t("transaction.error"), t("transaction.error.amount"));
      return;
    }

    if (isFutureDateSelected) {
      Alert.alert(t("transaction.error"), t("transaction.error.futureDate"));
      return;
    }

    try {
      setSaving(true);

      if (mode === "expense") {
        if (!walletId) {
          Alert.alert(t("transaction.error"), t("transaction.error.wallet"));
          return;
        }
        if (!selectedCategoryId) {
          Alert.alert(t("transaction.error"), t("transaction.error.category"));
          return;
        }
        await transactionRepository.createAndApply(db, {
          amount: parsedAmount,
          type: "expense",
          category_id: selectedCategoryId,
          wallet_id: walletId,
          target_wallet_id: null,
          note: note.trim() ? note.trim() : null,
          occurred_at: occurredAt,
        });
      } else if (mode === "income") {
        if (!walletId) {
          Alert.alert(t("transaction.error"), t("transaction.error.wallet"));
          return;
        }
        await transactionRepository.createAndApply(db, {
          amount: parsedAmount,
          type: "income",
          category_id: selectedCategoryId,
          wallet_id: walletId,
          target_wallet_id: null,
          note: note.trim() ? note.trim() : null,
          occurred_at: occurredAt,
        });
      } else {
        if (!fromWalletId || !toWalletId) {
          Alert.alert(
            t("transaction.error"),
            t("transaction.error.walletsTransfer"),
          );
          return;
        }
        if (fromWalletId === toWalletId) {
          Alert.alert(
            t("transaction.error"),
            t("transaction.error.walletsDifferent"),
          );
          return;
        }
        await transactionRepository.createAndApply(db, {
          amount: parsedAmount,
          type: "transfer",
          category_id: null,
          wallet_id: fromWalletId,
          target_wallet_id: toWalletId,
          note: null,
          occurred_at: occurredAt,
        });
      }

      await refreshData();
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert(t("transaction.error"), t("transaction.error.save"));
    } finally {
      setSaving(false);
    }
  }, [
    db,
    ensureWalletsReady,
    fromWalletId,
    mode,
    note,
    occurredAt,
    parsedAmount,
    refreshData,
    saving,
    isFutureDateSelected,
    selectedCategoryId,
    t,
    toWalletId,
    walletId,
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1 }}>
          <TransactionHeader
            title={screenTitle}
            onClose={onClose}
            onHelp={onHelp}
            helpLabel={t("transaction.help")}
            closeLabel={t("transaction.close")}
            backgroundColor={theme.colors.background}
            textColor={theme.colors.text}
            accentColor={accent}
          />

          <View
            style={{
              flex: 1,
              paddingBottom: saveButtonOffset,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <SegmentedControl
              value={mode}
              onChange={setMode}
              accent={accent}
              background={theme.colors.border}
              text={theme.colors.mutedText}
              activeText="#fff"
              labels={{
                expense: t("transaction.type.expense"),
                income: t("transaction.type.income"),
                transfer: t("transaction.type.transfer"),
              }}
            />

            <AmountDisplay
              currency={currency}
              formattedAmount={formattedAmount}
              integerDigitsEntered={integerDigitsEntered}
              decimalDigitsEntered={decimalDigitsEntered}
              cursorPart={cursorPart}
              arithmeticTag={arithmeticTag}
              currencyColor={theme.colors.mutedText}
              amountColor={
                mode === "income" ? theme.colors.success : theme.colors.text
              }
            />

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {loading ? (
                <Typography
                  variant="small"
                  style={{ color: theme.colors.mutedText, textAlign: "center" }}
                >
                  {t("transaction.loading")}
                </Typography>
              ) : null}

              <WalletSection
                mode={mode}
                wallets={wallets}
                walletId={walletId}
                onWalletSelect={setWalletId}
                fromWalletId={fromWalletId}
                toWalletId={toWalletId}
                onFromWalletSelect={setFromWalletId}
                onToWalletSelect={setToWalletId}
                paidFromLabel={t("transaction.paidFrom")}
                receivedIntoLabel={t("transaction.receivedInto")}
                fromLabel={t("transaction.from")}
                toLabel={t("transaction.to")}
                transferHint={t("transaction.transfer.hint")}
                borderColor={theme.colors.border}
                cardColor={theme.colors.card}
                textColor={theme.colors.text}
                mutedTextColor={theme.colors.mutedText}
                successColor={theme.colors.success}
              />

              {mode !== "transfer" ? (
                <TransactionCategoryPicker
                  selectedId={selectedCategoryId}
                  categories={categoryPickerCategories}
                  onSelect={setSelectedCategoryId}
                  colors={{
                    text: theme.colors.text,
                    mutedText: theme.colors.mutedText,
                    border: theme.colors.border,
                    card: theme.colors.card,
                    background: theme.colors.background,
                    accent: theme.colors.accent,
                  }}
                  labels={{
                    triggerPlaceholder: t("transaction.category.none"),
                    pickTitle: t("transaction.category.pickTitle"),
                    close: t("transaction.close"),
                    empty: t("transaction.category.empty"),
                  }}
                />
              ) : null}

              <NoteSection
                mode={mode}
                note={note}
                onNoteChange={setNote}
                createCategoryCandidate={createCategoryCandidate}
                onCreateCategory={onCreateCategory}
                whatForLabel={t("transaction.whatFor")}
                placeholder={t("transaction.note.placeholder")}
                createCategoryLabel={t("transaction.createCategory")}
                textColor={theme.colors.text}
                mutedTextColor={theme.colors.mutedText}
                borderColor={theme.colors.border}
                cardColor={theme.colors.card}
                accentColor={accent}
              />
            </ScrollView>

            <TransactionSummary
              summary={summary}
              mode={mode}
              dangerColor={theme.colors.danger}
              accentColor={accent}
            />

            <TransactionDatePicker
              insetsBottom={insets.bottom}
              isVisible={isDatePickerVisible}
              selectedDateLabel={selectedDateLabel}
              monthLabel={monthLabel}
              weekdayLabels={weekdayLabels}
              monthCells={monthCells}
              quickDates={quickDates}
              disableNextMonth={disableNextMonth}
              onOpen={openDatePicker}
              onClose={closeDatePicker}
              onConfirm={confirmDate}
              onSelectQuickDate={onSelectQuickDate}
              onPrevMonth={onPrevMonth}
              onNextMonth={onNextMonth}
              onSelectDate={onSelectDraftDate}
              colors={{
                text: theme.colors.text,
                mutedText: theme.colors.mutedText,
                border: theme.colors.border,
                card: theme.colors.card,
                background: theme.colors.background,
                accent: theme.colors.accent,
              }}
              labels={{
                pickTitle: t("transaction.date.pickTitle"),
                previousMonth: t("transaction.date.previousMonth"),
                nextMonth: t("transaction.date.nextMonth"),
                cancel: t("transaction.date.cancel"),
                confirm: t("transaction.date.confirm"),
                openCalendar: t("transaction.date.openCalendar"),
              }}
            />

            <Keypad
              onDigit={onPressDigit}
              onBackspace={onPressBackspace}
              onDotToggle={onPressDotToggle}
              onLongPressClear={onLongPressClear}
              onOperator={onPressOperator}
              onEquals={onPressEquals}
              operator={operator}
              cursorPart={cursorPart}
              border={theme.colors.border}
              background={theme.colors.card}
              text={theme.colors.text}
              accent={accent}
            />

            <SaveButton
              label={saveLabel}
              savingLabel={t("transaction.saving")}
              saving={saving}
              onSave={onSave}
              accentColor={accent}
              cardColor={theme.colors.card}
              borderColor={theme.colors.border}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
