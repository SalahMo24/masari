import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";
import { addMonths } from "date-fns";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  I18nManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Keypad, type KeypadKey } from "@/src/components/amount/Keypad";
import Typography from "@/src/components/typography.component";
import { useUserPreferences } from "@/src/context/UserPreferencesProvider";
import type {
  Bill,
  BillFrequency,
  BillPayment,
  Wallet,
} from "@/src/data/entities";
import {
  billPaymentRepository,
  billRepository,
  walletRepository,
} from "@/src/data/repositories";
import { useAmountInput } from "@/src/hooks/amount";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { formatAmountForSummary } from "@/src/utils/amount";

const adjustKeys: KeypadKey[] = [
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

const normalizeBill = (bill: Bill): Bill => ({
  ...bill,
  active: Boolean(bill.active),
  paid: Boolean(bill.paid),
});

const formatFrequency = (
  frequency: BillFrequency,
  t: (key: string) => string,
) => {
  if (frequency === "quarterly") return t("bill.new.frequency.quarterly");
  if (frequency === "yearly") return t("bill.new.frequency.yearly");
  return t("bill.new.frequency.monthly");
};

export default function BillDetailScreen() {
  const theme = useAppTheme();
  const { t, locale } = useI18n();
  const { currency } = useUserPreferences();
  const router = useRouter();
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isRtl = I18nManager.isRTL;

  const [bill, setBill] = useState<Bill | null>(null);
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [savingAmount, setSavingAmount] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  const {
    formattedAmount,
    parsedAmount,
    cursorPart,
    onPressDigit,
    onPressBackspace,
    onPressDotToggle,
    onLongPressClear,
    setAmount,
  } = useAmountInput({
    allowOperators: false,
    allowEquals: false,
    maxIntegerDigits: 9,
  });

  const colors = useMemo(
    () => ({
      primary: theme.colors.accent,
      text: theme.colors.text,
      muted: theme.colors.mutedText,
      background: theme.colors.background,
      card: theme.colors.card,
      border: theme.colors.border,
      success: theme.colors.success,
      warning: theme.colors.warning,
    }),
    [theme],
  );

  const resolvedId = useMemo(() => {
    if (!id) return null;
    return Array.isArray(id) ? id[0] : id;
  }, [id]);

  const refresh = useCallback(async () => {
    if (!resolvedId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [billRow, paymentRows, walletRows] = await Promise.all([
        billRepository.getById(db, resolvedId),
        billPaymentRepository.listByBillId(db, resolvedId),
        walletRepository.list(db),
      ]);
      setBill(billRow ? normalizeBill(billRow) : null);
      setPayments(paymentRows);
      setWallets(walletRows);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [db, resolvedId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      return () => undefined;
    }, [refresh]),
  );

  useEffect(() => {
    if (bill && adjustOpen) {
      setAmount(bill.amount);
    }
  }, [adjustOpen, bill, setAmount]);

  const totalPaid = useMemo(
    () => payments.reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  );

  const cutoffDate = useMemo(() => addMonths(new Date(), -12), []);
  const recentPayments = useMemo(
    () => payments.filter((payment) => new Date(payment.paid_at) >= cutoffDate),
    [cutoffDate, payments],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [locale],
  );

  const frequencyLabel = useMemo(
    () => (bill ? formatFrequency(bill.frequency, t) : ""),
    [bill, t],
  );

  const amountLabel = useMemo(() => {
    if (!bill) return "";
    return `${currency} ${formatAmountForSummary(bill.amount)}`;
  }, [bill, currency]);

  const statusLabel = useMemo(() => {
    if (!bill) return "";
    return bill.active
      ? t("bill.detail.status.active")
      : t("bill.detail.status.inactive");
  }, [bill, t]);

  const onToggleActive = useCallback(() => {
    if (!bill || togglingActive) return;
    const nextActive = !bill.active;
    const title = nextActive
      ? t("bill.detail.activate.title")
      : t("bill.detail.deactivate.title");
    const message = nextActive
      ? t("bill.detail.activate.body")
      : t("bill.detail.deactivate.body");
    Alert.alert(title, message, [
      { text: t("bill.detail.alert.cancel"), style: "cancel" },
      {
        text: t("bill.detail.alert.confirm"),
        style: "destructive",
        onPress: async () => {
          try {
            setTogglingActive(true);
            await billRepository.setActive(db, {
              id: bill.id,
              active: nextActive,
            });
            await refresh();
          } catch (error) {
            console.error(error);
          } finally {
            setTogglingActive(false);
          }
        },
      },
    ]);
  }, [bill, db, refresh, t, togglingActive]);

  const onSaveAmount = useCallback(async () => {
    if (!bill || savingAmount) return;
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert(t("bill.new.error.title"), t("bill.new.error.amount"));
      return;
    }
    try {
      setSavingAmount(true);
      await billRepository.updateAmount(db, {
        id: bill.id,
        amount: parsedAmount,
      });
      setAdjustOpen(false);
      await refresh();
    } catch (error) {
      console.error(error);
      Alert.alert(
        t("bill.detail.adjust.error.title"),
        t("bill.detail.adjust.error.body"),
      );
    } finally {
      setSavingAmount(false);
    }
  }, [bill, db, parsedAmount, refresh, savingAmount, t]);

  const paymentMethodLabel = useCallback(
    (payment: BillPayment) => {
      if (!payment.wallet_id) return t("bill.detail.method.unknown");
      const wallet = wallets.find((item) => item.id === payment.wallet_id);
      if (!wallet) return t("bill.detail.method.unknown");
      return wallet.type === "bank"
        ? t("bill.detail.method.bank")
        : t("bill.detail.method.cash");
    },
    [t, wallets],
  );

  const paymentIconName = useCallback(
    (payment: BillPayment) => {
      if (!payment.wallet_id) return "account-balance";
      const wallet = wallets.find((item) => item.id === payment.wallet_id);
      if (!wallet) return "account-balance";
      return wallet.type === "bank" ? "account-balance" : "payments";
    },
    [wallets],
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingState}>
          <Typography variant="caption" color={colors.muted}>
            {t("bill.new.loading")}
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (!bill) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingState}>
          <Typography variant="subtitle" color={colors.text}>
            {t("bill.detail.notFound")}
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            style={[styles.headerButton]}
          >
            <MaterialIcons
              name={isRtl ? "chevron-right" : "chevron-left"}
              size={22}
              color={colors.primary}
            />
            <Typography variant="subtitle" color={colors.primary}>
              {t("tab.bills")}
            </Typography>
          </Pressable>
          <View style={styles.headerTitle}>
            <Typography
              style={{ textAlign: "center" }}
              variant="subtitle"
              weight="700"
              color={colors.text}
            >
              {t("screen.bill.details")}
            </Typography>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: `${colors.primary}14` },
              ]}
            >
              <MaterialIcons name="bolt" size={28} color={colors.primary} />
            </View>
            <Typography variant="h4" weight="700" color={colors.text}>
              {bill.name}
            </Typography>
            <Typography
              variant="overline"
              color={colors.muted}
              style={styles.upper}
            >
              {t("bill.detail.totalPaid")}
            </Typography>
            <Typography
              variant="h2"
              weight="700"
              color={colors.text}
              style={styles.amount}
            >
              {currency} {formatAmountForSummary(totalPaid)}
            </Typography>
          </View>

          <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
            <View style={styles.statusBlock}>
              <Typography variant="overline" color={colors.muted}>
                {t("bill.detail.status.label")}
              </Typography>
              <View style={[styles.statusRow, { flexDirection: "row" }]}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: bill.active
                        ? colors.success
                        : colors.muted,
                    },
                  ]}
                />
                <Typography
                  variant="subtitle"
                  weight="700"
                  color={bill.active ? colors.success : colors.muted}
                >
                  {statusLabel}
                </Typography>
              </View>
            </View>
            <View style={styles.statusBlock}>
              <Typography variant="overline" color={colors.muted}>
                {t("bill.detail.frequency.label")}
              </Typography>
              <Typography variant="subtitle" weight="700" color={colors.text}>
                {amountLabel}/{frequencyLabel}
              </Typography>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => setAdjustOpen(true)}
              style={[
                styles.actionButton,
                { borderColor: `${colors.primary}33` },
              ]}
            >
              <MaterialIcons
                name="edit-note"
                size={20}
                color={colors.primary}
              />
              <Typography
                variant="subtitle"
                weight="700"
                color={colors.primary}
              >
                {t("bill.detail.action.adjust")}
              </Typography>
            </Pressable>
            <Pressable
              onPress={onToggleActive}
              style={[styles.actionButton, { borderColor: colors.border }]}
            >
              <MaterialIcons
                name="power-settings-new"
                size={20}
                color={colors.muted}
              />
              <Typography variant="subtitle" weight="700" color={colors.muted}>
                {bill.active
                  ? t("bill.detail.action.deactivate")
                  : t("bill.detail.action.activate")}
              </Typography>
            </Pressable>
          </View>

          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Typography variant="overline" color={colors.muted}>
                {t("bill.detail.history.title")}
              </Typography>
              <Typography variant="caption" color={colors.muted}>
                {t("bill.detail.history.range")}
              </Typography>
            </View>

            {recentPayments.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Typography variant="caption" color={colors.muted}>
                  {t("bill.detail.history.empty")}
                </Typography>
              </View>
            ) : (
              recentPayments.map((payment) => {
                const dateLabel = dateFormatter.format(
                  new Date(payment.paid_at),
                );
                const methodLabel = paymentMethodLabel(payment);
                const statusLabelText =
                  payment.status === "pending"
                    ? t("bill.detail.status.pending")
                    : t("bill.detail.status.cleared");
                return (
                  <View
                    key={payment.id}
                    style={[
                      styles.historyCard,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <View style={styles.historyContent}>
                      <Typography
                        variant="subtitle"
                        weight="700"
                        color={colors.text}
                      >
                        {dateLabel}
                      </Typography>
                      <View
                        style={[styles.historyMeta, { flexDirection: "row" }]}
                      >
                        <MaterialIcons
                          name={paymentIconName(payment)}
                          size={14}
                          color={colors.muted}
                        />
                        <Typography variant="caption" color={colors.muted}>
                          {methodLabel}
                        </Typography>
                      </View>
                    </View>
                    <View style={styles.historyAmount}>
                      <Typography
                        variant="subtitle"
                        weight="700"
                        color={colors.text}
                      >
                        {currency} {formatAmountForSummary(payment.amount)}
                      </Typography>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: `${colors.success}1A` },
                        ]}
                      >
                        <Typography
                          variant="caption"
                          color={colors.success}
                          weight="700"
                        >
                          {statusLabelText}
                        </Typography>
                      </View>
                    </View>
                  </View>
                );
              })
            )}

            <Pressable style={styles.historyButton}>
              <Typography
                variant="subtitle"
                weight="700"
                color={colors.primary}
              >
                {t("bill.detail.history.viewOlder")}
              </Typography>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={adjustOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAdjustOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setAdjustOpen(false)}
          />
          <View
            style={[styles.modalSheet, { backgroundColor: colors.background }]}
          >
            <View style={styles.modalHeader}>
              <Typography variant="overline" color={colors.muted}>
                {t("bill.detail.adjust.title")}
              </Typography>
              <Typography variant="h3" weight="700" color={colors.text}>
                {currency} {formattedAmount}
              </Typography>
            </View>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setAdjustOpen(false)}
                style={[styles.modalButton, { borderColor: colors.border }]}
              >
                <Typography
                  variant="subtitle"
                  weight="700"
                  color={colors.muted}
                >
                  {t("bill.detail.adjust.cancel")}
                </Typography>
              </Pressable>
              <Pressable
                onPress={onSaveAmount}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                    opacity: savingAmount ? 0.6 : 1,
                  },
                ]}
                disabled={savingAmount}
              >
                <Typography
                  variant="subtitle"
                  weight="700"
                  color={colors.background}
                >
                  {t("bill.detail.adjust.save")}
                </Typography>
              </Pressable>
            </View>
            <Keypad
              onDigit={onPressDigit}
              onBackspace={onPressBackspace}
              onDotToggle={onPressDotToggle}
              onLongPressClear={onLongPressClear}
              border={colors.border}
              background={colors.background}
              text={colors.text}
              accent={colors.primary}
              cursorPart={cursorPart}
              keys={adjustKeys}
              columns={3}
              showKeyBorders={false}
              styleOverrides={{
                keypad: styles.keypad,
                key: styles.key,
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 72,
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
  },
  headerSpacer: {
    minWidth: 72,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 24,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  upper: {
    letterSpacing: 1.4,
  },
  amount: {
    marginTop: 4,
  },
  statusCard: {
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statusBlock: {
    flex: 1,
    gap: 6,
  },
  statusRow: {
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  historySection: {
    gap: 12,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  historyCard: {
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  historyContent: {
    gap: 6,
    flex: 1,
  },
  historyMeta: {
    alignItems: "center",
    gap: 6,
  },
  historyAmount: {
    alignItems: "flex-end",
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  historyButton: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  emptyHistory: {
    paddingVertical: 12,
    alignItems: "center",
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  modalHeader: {
    alignItems: "center",
    gap: 8,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  keypad: {
    borderTopWidth: 0,
  },
  key: {
    height: 54,
  },
});
