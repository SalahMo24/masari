import {
  AmountDisplay,
  CategoryChips,
  Keypad,
  NoteSection,
  SaveButton,
  SegmentedControl,
  TransactionHeader,
  TransactionSummary,
  WalletSection,
} from "@/src/components/transactions";
import type { TransactionType } from "@/src/data/entities";
import { transactionRepository } from "@/src/data/repositories";
import {
  useAmountInput,
  useCategorySelection,
  useTransactionData,
  useWalletSelection,
} from "@/src/hooks/transactions";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { formatAmountForSummary } from "@/src/utils/amount";
import { Stack, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewTransactionScreen() {
  const theme = useAppTheme();
  const { t } = useI18n();
  const isRtl = I18nManager.isRTL;

  // Data fetching
  const { wallets, categories, loading, refreshData } = useTransactionData();

  // Form state
  const [mode, setMode] = useState<TransactionType>("expense");
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Amount input
  const {
    parsedAmount,
    formattedAmount,
    integerDigitsEntered,
    decimalDigitsEntered,
    cursorPart,
    operator,
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
      return `${fromName} ${isRtl ? "⬅" : "➔"} ${toName} • ${amountText}`;
    }
    const sign = mode === "expense" ? "-" : "+";
    const cat = selectedCategory?.name ?? t("transaction.category.none");
    const wName = activeWallet?.name ?? t("transaction.wallet.unknown");
    return `${sign} ${amountText} • ${cat} • ${wName}`;
  }, [
    activeWallet?.name,
    currency,
    fromWallet?.name,
    isRtl,
    mode,
    parsedAmount,
    selectedCategory?.name,
    t,
    toWallet?.name,
  ]);

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

    const now = new Date().toISOString();

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
        await transactionRepository.createAndApply({
          amount: parsedAmount,
          type: "expense",
          category_id: selectedCategoryId,
          wallet_id: walletId,
          target_wallet_id: null,
          note: note.trim() ? note.trim() : null,
          occurred_at: now,
        });
      } else if (mode === "income") {
        if (!walletId) {
          Alert.alert(t("transaction.error"), t("transaction.error.wallet"));
          return;
        }
        await transactionRepository.createAndApply({
          amount: parsedAmount,
          type: "income",
          category_id: selectedCategoryId,
          wallet_id: walletId,
          target_wallet_id: null,
          note: note.trim() ? note.trim() : null,
          occurred_at: now,
        });
      } else {
        if (!fromWalletId || !toWalletId) {
          Alert.alert(
            t("transaction.error"),
            t("transaction.error.walletsTransfer")
          );
          return;
        }
        if (fromWalletId === toWalletId) {
          Alert.alert(
            t("transaction.error"),
            t("transaction.error.walletsDifferent")
          );
          return;
        }
        await transactionRepository.createAndApply({
          amount: parsedAmount,
          type: "transfer",
          category_id: null,
          wallet_id: fromWalletId,
          target_wallet_id: toWalletId,
          note: null,
          occurred_at: now,
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
    ensureWalletsReady,
    fromWalletId,
    mode,
    note,
    parsedAmount,
    refreshData,
    saving,
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

          <View style={{ flex: 1 }}>
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
                <Text
                  style={{ color: theme.colors.mutedText, textAlign: "center" }}
                >
                  {t("transaction.loading")}
                </Text>
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

              {mode === "expense" ? (
                <CategoryChips
                  categories={expenseCategories}
                  selectedId={selectedCategoryId}
                  onSelect={setSelectedCategoryId}
                  accent={theme.colors.success}
                  border={theme.colors.border}
                  text={theme.colors.text}
                  muted={theme.colors.mutedText}
                  card={theme.colors.card}
                />
              ) : null}

              {mode === "income" ? (
                <View style={{ paddingTop: 6 }}>
                  <CategoryChips
                    categories={incomeQuickCategories}
                    selectedId={selectedCategoryId}
                    onSelect={setSelectedCategoryId}
                    accent={theme.colors.success}
                    border={theme.colors.border}
                    text={theme.colors.text}
                    muted={theme.colors.mutedText}
                    card={theme.colors.card}
                    wrap
                  />
                </View>
              ) : null}
            </ScrollView>

            <TransactionSummary
              summary={summary}
              mode={mode}
              dangerColor={theme.colors.danger}
              accentColor={accent}
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
