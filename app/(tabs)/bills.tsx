import { useEffect, useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
  I18nManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MarkPaidModal from "@/src/components/bills/MarkPaidModal";
import Typography from "@/src/components/typography.component";
import type { Bill, ID } from "@/src/data/entities";
import { useBillsOverview } from "@/src/hooks/bills";
import { useTransactionData } from "@/src/hooks/transactions";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { formatAmountForSummary } from "@/src/utils/amount";

const monoFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

const formatShortDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(
    new Date(date),
  );

export default function BillsScreen() {
  const theme = useAppTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    monthLabel,
    totalAmount,
    remainingAmount,
    progressPercent,
    upcomingBills,
    paidBills,
    activeBillsCount,
    savingsEstimate,
    markBillPaid,
  } = useBillsOverview(locale);
  const { wallets } = useTransactionData();

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<ID | null>(null);
  const [markPaidVisible, setMarkPaidVisible] = useState(false);
  const [paidToday, setPaidToday] = useState(true);

  const colors = useMemo(
    () => ({
      primary: theme.colors.accent,
      success: theme.colors.success,
      warning: theme.colors.warning,
      text: theme.colors.text,
      muted: theme.colors.mutedText,
      background: theme.colors.background,
      card: theme.colors.card,
      border: theme.colors.border,
    }),
    [theme],
  );

  const currencyLabel = t("dashboard.currency");
  const summaryTitle = t("bills.summary.title").replace("{month}", monthLabel);
  const totalLabel = `${currencyLabel} ${formatAmountForSummary(totalAmount)}`;
  const remainingLabel = `${currencyLabel} ${formatAmountForSummary(
    remainingAmount,
  )}`;
  const pendingLabel = t("bills.pending").replace(
    "{count}",
    String(upcomingBills.length),
  );
  const showTip = activeBillsCount >= 2 && savingsEstimate !== null;
  const tipAmountLabel = savingsEstimate
    ? `${currencyLabel} ${formatAmountForSummary(savingsEstimate)}`
    : "";

  const summaryBackground = theme.dark ? colors.card : colors.text;
  const summaryText = theme.dark ? colors.text : colors.background;
  const summaryMuted = theme.dark ? colors.muted : "rgba(255,255,255,0.7)";

  const isEmpty = upcomingBills.length === 0 && paidBills.length === 0;

  useEffect(() => {
    if (!markPaidVisible || selectedWalletId || wallets.length === 0) return;
    setSelectedWalletId(wallets[0]?.id ?? null);
  }, [markPaidVisible, selectedWalletId, wallets]);

  const openMarkPaidModal = (bill: Bill) => {
    setSelectedBill(bill);
    setSelectedWalletId(bill.wallet_id ?? wallets[0]?.id ?? null);
    setPaidToday(true);
    setMarkPaidVisible(true);
  };

  const closeMarkPaidModal = () => {
    setMarkPaidVisible(false);
    setSelectedBill(null);
  };

  const handleConfirmPayment = async () => {
    if (!selectedBill || !selectedWalletId) return;
    const success = await markBillPaid(
      selectedBill,
      selectedWalletId,
      paidToday ? new Date() : new Date(),
    );
    if (success) {
      closeMarkPaidModal();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Typography variant="h3" weight="700" color={colors.text}>
            {t("tab.bills")}
          </Typography>
          <Pressable style={styles.headerButton}>
            <MaterialIcons name="more-horiz" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={[styles.summaryCard, { backgroundColor: summaryBackground }]}>
            <View style={styles.summaryHeaderRow}>
              <View>
                <Typography variant="overline" color={summaryMuted}>
                  {summaryTitle}
                </Typography>
                <Typography
                  variant="h2"
                  color={summaryText}
                  style={{ fontFamily: monoFont }}
                >
                  {totalLabel}
                </Typography>
              </View>
              <View
                style={[
                  styles.planPill,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Typography variant="caption" color={colors.background} weight="700">
                  {t("bills.summary.plan")}
                </Typography>
              </View>
            </View>
            <View style={styles.summaryProgress}>
              <View style={styles.summaryRow}>
                <Typography variant="caption" color={summaryMuted}>
                  {t("bills.summary.remaining")}
                </Typography>
                <Typography variant="subtitle" color={colors.warning}>
                  {remainingLabel}
                </Typography>
              </View>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: theme.dark ? colors.border : "rgba(255,255,255,0.15)" },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPercent}%`, backgroundColor: colors.warning },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {showTip && (
          <View style={styles.section}>
            <View
              style={[
                styles.tipCard,
                { backgroundColor: theme.dark ? colors.card : "rgba(212,175,55,0.1)" },
              ]}
            >
              <View
                style={[
                  styles.tipIcon,
                  { backgroundColor: theme.dark ? colors.border : "rgba(212,175,55,0.2)" },
                ]}
              >
                <MaterialIcons name="lightbulb-outline" size={18} color={colors.warning} />
              </View>
              <View style={styles.tipContent}>
                <Typography variant="subtitle" color={colors.text}>
                  {t("bills.tip.title")}
                </Typography>
                <Typography variant="small" color={colors.muted}>
                  {t("bills.tip.body")
                    .replace("{count}", String(activeBillsCount))
                    .replace("{amount}", tipAmountLabel)}
                </Typography>
              </View>
            </View>
          </View>
        )}

        {isEmpty ? (
          <View style={styles.section}>
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Typography variant="h5" color={colors.text}>
                {t("bills.empty.title")}
              </Typography>
              <Typography variant="small" color={colors.muted}>
                {t("bills.empty.description")}
              </Typography>
              <Pressable
                style={[styles.emptyCta, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(features)/bills/new")}
              >
                <Typography variant="subtitle" color={colors.background}>
                  {t("bills.empty.cta")}
                </Typography>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Typography variant="overline" color={colors.muted}>
                  {t("bills.section.upcoming")}
                </Typography>
                {upcomingBills.length > 0 && (
                  <View
                    style={[
                      styles.pendingPill,
                      { backgroundColor: theme.dark ? colors.border : "rgba(212,175,55,0.1)" },
                    ]}
                  >
                    <Typography variant="caption" color={colors.warning} weight="700">
                      {pendingLabel}
                    </Typography>
                  </View>
                )}
              </View>
              <View style={styles.billList}>
                {upcomingBills.map((bill) => {
                  const dueLabel = t("bills.detail.due").replace(
                    "{date}",
                    formatShortDate(bill.next_due_date, locale),
                  );
                  const markPaidColor = colors.background;
                  return (
                    <View
                      key={bill.id}
                      style={[
                        styles.billCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          borderLeftColor: colors.warning,
                        },
                      ]}
                    >
                      <Pressable
                        style={styles.billInfo}
                        onPress={() => router.push(`/(features)/bills/${bill.id}`)}
                      >
                        <Typography variant="subtitle" color={colors.text}>
                          {bill.name}
                        </Typography>
                        <View style={styles.billMeta}>
                          <Typography
                            variant="body"
                            color={colors.text}
                            style={{ fontFamily: monoFont }}
                          >
                            {currencyLabel} {formatAmountForSummary(bill.amount)}
                          </Typography>
                          <Typography variant="caption" color={colors.muted}>
                            •
                          </Typography>
                          <Typography variant="caption" color={colors.muted}>
                            {dueLabel}
                          </Typography>
                        </View>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.markPaidButton,
                          {
                            backgroundColor: colors.primary,
                          },
                        ]}
                        onPress={() => openMarkPaidModal(bill)}
                      >
                        <MaterialIcons name="check-circle" size={16} color={markPaidColor} />
                        <Typography variant="caption" color={markPaidColor} weight="700">
                          {t("bills.action.markPaid")}
                        </Typography>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={[styles.section, styles.paidSection]}>
              <View style={styles.sectionHeaderRow}>
                <Typography variant="overline" color={colors.muted}>
                  {t("bills.section.paid")}
                </Typography>
              </View>
              <View style={styles.billList}>
                {paidBills.map((bill) => {
                  const paidLabel = t("bills.detail.paid").replace(
                    "{date}",
                    formatShortDate(bill.next_due_date, locale),
                  );
                  return (
                    <View
                      key={bill.id}
                      style={[
                        styles.paidCard,
                        { backgroundColor: theme.dark ? colors.card : "rgba(15,23,42,0.04)" },
                      ]}
                    >
                      <Pressable
                        style={styles.billInfo}
                        onPress={() => router.push(`/(features)/bills/${bill.id}`)}
                      >
                        <Typography variant="subtitle" color={colors.muted}>
                          {bill.name}
                        </Typography>
                        <View style={styles.billMeta}>
                          <Typography
                            variant="body"
                            color={colors.muted}
                            style={{ fontFamily: monoFont }}
                          >
                            {currencyLabel} {formatAmountForSummary(bill.amount)}
                          </Typography>
                          <Typography variant="caption" color={colors.muted}>
                            •
                          </Typography>
                          <Typography variant="caption" color={colors.muted}>
                            {paidLabel}
                          </Typography>
                        </View>
                      </Pressable>
                      <View style={styles.paidIcon}>
                        <MaterialIcons name="check-circle" size={20} color={colors.success} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Pressable
        style={[
          styles.fab,
          { backgroundColor: colors.primary, shadowColor: colors.text },
        ]}
        onPress={() => router.push("/(features)/bills/new")}
      >
        <MaterialIcons name="add" size={26} color={colors.background} />
      </Pressable>

      <MarkPaidModal
        visible={markPaidVisible}
        bill={selectedBill}
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onSelectWallet={setSelectedWalletId}
        onClose={closeMarkPaidModal}
        onConfirm={handleConfirmPayment}
        paidToday={paidToday}
        onTogglePaidToday={setPaidToday}
        currency={currencyLabel}
        insetsBottom={insets.bottom}
        colors={colors}
        labels={{
          prompt: t("bill.pay.prompt"),
          paidToday: t("bill.pay.date.today"),
          changeDate: t("bill.pay.date.change"),
          confirm: t("bill.pay.confirm"),
          walletAvailable: t("bill.pay.wallet.available"),
          walletEmpty: t("bill.pay.wallet.empty"),
        }}
      />
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  summaryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  summaryProgress: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  tipCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
    gap: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pendingPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  billList: {
    gap: 12,
  },
  billCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  billInfo: {
    flex: 1,
    gap: 6,
  },
  billMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  markPaidButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  paidSection: {
    opacity: 0.7,
  },
  paidCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  paidIcon: {
    paddingHorizontal: 6,
  },
  emptyCard: {
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },
  emptyCta: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
  },
});
