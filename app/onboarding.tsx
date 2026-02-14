import { AmountDisplay, Keypad, type KeypadKey } from "@/src/components/amount";
import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";
import { userRepository, walletRepository } from "@/src/data/repositories";
import { useAmountInput } from "@/src/hooks/amount";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { formatAmountForSummary } from "@/src/utils/amount";
import { Stack, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Typography from "@/src/components/typography.component";

type OnboardingStep = 1 | 2 | 3 | 4;

const walletKeypadKeys: KeypadKey[] = [
  { type: "digit", value: "1" },
  { type: "digit", value: "2" },
  { type: "digit", value: "3" },
  { type: "digit", value: "4" },
  { type: "digit", value: "5" },
  { type: "digit", value: "6" },
  { type: "digit", value: "7" },
  { type: "digit", value: "8" },
  { type: "digit", value: "9" },
  { type: "dot" },
  { type: "zero" },
  { type: "backspace" },
];

export default function OnboardingScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { t } = useI18n();
  const theme = useAppTheme();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [activeWallet, setActiveWallet] = useState<"cash" | "bank">("cash");
  const [trackCashOnly, setTrackCashOnly] = useState(false);
  const [savingWallets, setSavingWallets] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [summary, setSummary] = useState({ cash: 0, bank: 0 });

  const cashInput = useAmountInput({
    allowOperators: false,
    allowEquals: false,
    maxIntegerDigits: 9,
  });
  const bankInput = useAmountInput({
    allowOperators: false,
    allowEquals: false,
    maxIntegerDigits: 9,
  });
  const setCashAmount = cashInput.setAmount;
  const setBankAmount = bankInput.setAmount;

  useEffect(() => {
    let active = true;

    const loadWalletDefaults = async () => {
      try {
        const cashWallet = await walletRepository.getByType(db, "cash");
        const bankWallet = await walletRepository.getByType(db, "bank");
        if (!active) {
          return;
        }
        if (cashWallet) {
          setCashAmount(cashWallet.balance);
        }
        if (bankWallet) {
          setBankAmount(bankWallet.balance);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadWalletDefaults();
    return () => {
      active = false;
    };
  }, [db, setBankAmount, setCashAmount]);

  const activeInput = useMemo(() => {
    if (activeWallet === "cash") {
      return cashInput;
    }
    return bankInput;
  }, [activeWallet, bankInput, cashInput]);

  const currencyLabel = t("dashboard.currency");

  const handleContinueFromWalletSetup = useCallback(async () => {
    if (savingWallets) {
      return;
    }

    try {
      setSavingWallets(true);
      const cashBalance = cashInput.parsedAmount;
      const bankBalance = trackCashOnly ? 0 : bankInput.parsedAmount;
      const initialized = await walletRepository.upsertInitialWallets(db, {
        cashBalance,
        bankBalance,
        trackCashOnly,
      });
      setSummary({
        cash: initialized.cash.balance,
        bank: initialized.bank?.balance ?? 0,
      });
      setStep(4);
    } catch (error) {
      console.error(error);
      Alert.alert(t("onboarding.error.title"), t("onboarding.error.walletSetup"));
    } finally {
      setSavingWallets(false);
    }
  }, [bankInput.parsedAmount, cashInput.parsedAmount, db, savingWallets, t, trackCashOnly]);

  const handleFinish = useCallback(async () => {
    if (finishing) {
      return;
    }
    try {
      setFinishing(true);
      await userRepository.setOnboardingCompleted(db, true);
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      console.error(error);
      Alert.alert(t("onboarding.error.title"), t("onboarding.error.finish"));
    } finally {
      setFinishing(false);
    }
  }, [db, finishing, router, t]);

  const nextLabel = savingWallets ? t("onboarding.common.saving") : t("onboarding.common.next");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {step === 1 ? (
        <View style={styles.slideContainer}>
          <View style={styles.topBlock}>
            <View style={[styles.brandIcon, { backgroundColor: theme.colors.accent }]}>
              <MaterialIcons name="verified-user" size={38} color="#fff" />
            </View>
            <Typography variant="h2" style={[styles.brandText, { color: theme.colors.accent }]}>
              {t("onboarding.brand")}
            </Typography>
          </View>

          <View style={styles.centerBlock}>
            <Typography variant="h1" style={styles.centerTitle}>
              {t("onboarding.step1.title")}
            </Typography>
            <Typography variant="subtitle" color={theme.colors.mutedText} style={styles.centerSubtitle}>
              {t("onboarding.step1.body")}
            </Typography>
            <View style={[styles.ghostIconWrap, { backgroundColor: theme.colors.card }]}>
              <MaterialIcons name="local-florist" size={54} color={theme.colors.mutedText} />
            </View>
          </View>

          <View style={styles.footerBlock}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => setStep(2)}
            >
              <Typography style={styles.primaryButtonText}>
                {t("onboarding.step1.cta")}
              </Typography>
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.slideContainer}>
          <View style={styles.headerActionArea} />
          <View style={styles.centerBlock}>
            <View style={[styles.plantCircle, { backgroundColor: `${theme.colors.success}22` }]}>
              <MaterialIcons name="energy-savings-leaf" size={72} color={theme.colors.success} />
            </View>
            <Typography variant="h2" style={styles.centerTitle}>
              {t("onboarding.step2.title")}
            </Typography>
            <Typography variant="subtitle" color={theme.colors.mutedText} style={styles.centerSubtitle}>
              {t("onboarding.step2.body")}
            </Typography>
          </View>
          <View style={styles.footerBlock}>
            <View style={styles.dotsRow}>
              <View style={[styles.dotWide, { backgroundColor: theme.colors.accent }]} />
              <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
              <View style={[styles.dot, { backgroundColor: theme.colors.border }]} />
            </View>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => setStep(3)}
            >
              <Typography style={styles.primaryButtonText}>
                {t("onboarding.step2.cta")}
              </Typography>
              <MaterialIcons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.walletSlide}>
          <View style={styles.walletHeader}>
            <Pressable onPress={() => setStep(2)} style={styles.backButton}>
              <MaterialIcons name="arrow-back-ios-new" size={18} color={theme.colors.text} />
            </Pressable>
            <Typography variant="h3" style={styles.walletTitle}>
              {t("onboarding.step3.title")}
            </Typography>
            <Typography variant="small" color={theme.colors.mutedText}>
              {t("onboarding.step3.body")}
            </Typography>
          </View>

          <View style={styles.walletContent}>
            <Pressable
              style={[
                styles.walletCard,
                {
                  borderColor:
                    activeWallet === "cash" ? theme.colors.accent : theme.colors.border,
                  backgroundColor: theme.colors.card,
                },
              ]}
              onPress={() => setActiveWallet("cash")}
            >
              <View style={styles.walletCardTitle}>
                <MaterialIcons name="payments" size={18} color={theme.colors.success} />
                <Typography variant="caption" color={theme.colors.mutedText}>
                  {t("onboarding.step3.cash")}
                </Typography>
              </View>
              <AmountDisplay
                currency={currencyLabel}
                formattedAmount={cashInput.formattedAmount}
                integerDigitsEntered={cashInput.integerDigitsEntered}
                decimalDigitsEntered={cashInput.decimalDigitsEntered}
                cursorPart={cashInput.cursorPart}
                currencyColor={theme.colors.mutedText}
                amountColor={theme.colors.text}
                showCaret={activeWallet === "cash"}
                styles={{
                  amountRow: styles.walletAmountRow,
                  amountContainer: styles.walletAmountContainer,
                  currency: styles.walletCurrency,
                  digit: styles.walletAmountText,
                  caret: styles.walletAmountText,
                }}
              />
            </Pressable>

            {!trackCashOnly ? (
              <Pressable
                style={[
                  styles.walletCard,
                  {
                    borderColor:
                      activeWallet === "bank" ? theme.colors.accent : theme.colors.border,
                    backgroundColor: theme.colors.card,
                  },
                ]}
                onPress={() => setActiveWallet("bank")}
              >
                <View style={styles.walletCardTitle}>
                  <MaterialIcons name="account-balance" size={18} color={theme.colors.accent} />
                  <Typography variant="caption" color={theme.colors.mutedText}>
                    {t("onboarding.step3.bank")}
                  </Typography>
                </View>
                <AmountDisplay
                  currency={currencyLabel}
                  formattedAmount={bankInput.formattedAmount}
                  integerDigitsEntered={bankInput.integerDigitsEntered}
                  decimalDigitsEntered={bankInput.decimalDigitsEntered}
                  cursorPart={bankInput.cursorPart}
                  currencyColor={theme.colors.mutedText}
                  amountColor={theme.colors.text}
                  showCaret={activeWallet === "bank"}
                  styles={{
                    amountRow: styles.walletAmountRow,
                    amountContainer: styles.walletAmountContainer,
                    currency: styles.walletCurrency,
                    digit: styles.walletAmountText,
                    caret: styles.walletAmountText,
                  }}
                />
              </Pressable>
            ) : null}

            <View style={styles.toggleRow}>
              <Typography variant="small" color={theme.colors.mutedText}>
                {t("onboarding.step3.cashOnly")}
              </Typography>
              <Switch
                value={trackCashOnly}
                onValueChange={(value) => {
                  setTrackCashOnly(value);
                  if (value) {
                    setActiveWallet("cash");
                  }
                }}
                thumbColor={theme.colors.card}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              />
            </View>
          </View>

          <View style={styles.walletFooter}>
            <Pressable
              style={[
                styles.primaryButton,
                { backgroundColor: theme.colors.accent },
                savingWallets && styles.disabledButton,
              ]}
              onPress={handleContinueFromWalletSetup}
              disabled={savingWallets}
            >
              <Typography style={styles.primaryButtonText}>{nextLabel}</Typography>
            </Pressable>
          </View>

          <View style={[styles.keypadWrap, { borderTopColor: theme.colors.border }]}>
            <Keypad
              keys={walletKeypadKeys}
              columns={3}
              onDigit={activeInput.onPressDigit}
              onBackspace={activeInput.onPressBackspace}
              onDotToggle={activeInput.onPressDotToggle}
              onLongPressClear={activeInput.onLongPressClear}
              border={theme.colors.border}
              background="transparent"
              pressedBackground={`${theme.colors.border}66`}
              text={theme.colors.text}
              accent={theme.colors.accent}
              showKeyBorders={false}
              styleOverrides={{
                keypad: styles.keypad,
                key: styles.keypadKey,
                keyText: styles.keypadText,
              }}
            />
          </View>
        </View>
      ) : null}

      {step === 4 ? (
        <View style={styles.slideContainer}>
          <View style={styles.confirmCenter}>
            <View style={[styles.sunWrap, { backgroundColor: `${theme.colors.success}22` }]}>
              <MaterialIcons name="wb-sunny" size={64} color={theme.colors.success} />
            </View>
            <Typography variant="h2" style={styles.centerTitle}>
              {t("onboarding.step4.title")}
            </Typography>
            <Typography variant="subtitle" color={theme.colors.mutedText} style={styles.centerSubtitle}>
              {t("onboarding.step4.body")}
            </Typography>

            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Typography variant="caption" color={theme.colors.mutedText}>
                  {t("onboarding.step3.cash")}
                </Typography>
                <Typography variant="subtitle">
                  {currencyLabel} {formatAmountForSummary(summary.cash)}
                </Typography>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Typography variant="caption" color={theme.colors.mutedText}>
                  {t("onboarding.step3.bank")}
                </Typography>
                <Typography variant="subtitle">
                  {currencyLabel} {formatAmountForSummary(summary.bank)}
                </Typography>
              </View>
            </View>
          </View>

          <View style={styles.footerBlock}>
            <Pressable
              style={[
                styles.primaryButton,
                { backgroundColor: theme.colors.accent },
                finishing && styles.disabledButton,
              ]}
              onPress={handleFinish}
              disabled={finishing}
            >
              <Typography style={styles.primaryButtonText}>
                {finishing ? t("onboarding.common.saving") : t("onboarding.step4.cta")}
              </Typography>
              <MaterialIcons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  topBlock: {
    alignItems: "center",
    marginTop: 52,
    gap: 14,
  },
  centerBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footerBlock: {
    gap: 14,
  },
  brandIcon: {
    width: 84,
    height: 84,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontWeight: "800",
  },
  centerTitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  centerSubtitle: {
    textAlign: "center",
    maxWidth: 290,
  },
  ghostIconWrap: {
    marginTop: 30,
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },
  headerActionArea: {
    height: 40,
    marginTop: 24,
  },
  plantCircle: {
    width: 188,
    height: 188,
    borderRadius: 94,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotWide: {
    width: 26,
    height: 8,
    borderRadius: 4,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
  },
  disabledButton: {
    opacity: 0.6,
  },
  walletSlide: {
    flex: 1,
  },
  walletHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  walletTitle: {
    marginBottom: 4,
  },
  walletContent: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 12,
  },
  walletCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  walletCardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  walletAmountRow: {
    paddingHorizontal: 0,
  },
  walletAmountContainer: {
    alignItems: "baseline",
  },
  walletCurrency: {
    fontSize: 16,
    fontWeight: "700",
  },
  walletAmountText: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  toggleRow: {
    marginTop: 2,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  walletFooter: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  keypadWrap: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: 8,
  },
  keypad: {
    borderTopWidth: 0,
    paddingHorizontal: 8,
  },
  keypadKey: {
    borderRadius: 12,
    height: 56,
  },
  keypadText: {
    fontSize: 28,
    fontWeight: "600",
  },
  confirmCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sunWrap: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },
  summaryGrid: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
});
