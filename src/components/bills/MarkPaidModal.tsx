import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  I18nManager,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Typography from "@/src/components/typography.component";
import type { Bill, ID, Wallet } from "@/src/data/entities";
import { formatAmountForSummary } from "@/src/utils/amount";

type MarkPaidModalColors = {
  primary: string;
  text: string;
  muted: string;
  background: string;
  card: string;
  border: string;
  success: string;
  warning: string;
};

type MarkPaidModalLabels = {
  prompt: string;
  paidToday: string;
  changeDate: string;
  confirm: string;
  walletAvailable: string;
  walletEmpty: string;
};

type MarkPaidModalProps = {
  visible: boolean;
  bill: Bill | null;
  wallets: Wallet[];
  selectedWalletId: ID | null;
  onSelectWallet: (id: ID) => void;
  onClose: () => void;
  onConfirm: () => void;
  paidToday: boolean;
  onTogglePaidToday: (value: boolean) => void;
  currency: string;
  insetsBottom: number;
  colors: MarkPaidModalColors;
  labels: MarkPaidModalLabels;
};

const monoFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export default function MarkPaidModal({
  visible,
  bill,
  wallets,
  selectedWalletId,
  onSelectWallet,
  onClose,
  onConfirm,
  paidToday,
  onTogglePaidToday,
  currency,
  insetsBottom,
  colors,
  labels,
}: MarkPaidModalProps) {
  const isRtl = I18nManager.isRTL;

  const amountLabel = useMemo(() => {
    if (!bill) return "";
    return `${currency} ${formatAmountForSummary(bill.amount)}`;
  }, [bill, currency]);

  if (!bill) return null;

  const canConfirm = Boolean(selectedWalletId);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: 24 + insetsBottom,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <Typography variant="caption" color={colors.muted} align="center">
              {labels.prompt}
            </Typography>
            <Typography
              variant="h4"
              weight="700"
              color={colors.text}
              align="center"
              style={styles.title}
            >
              {bill.name}
            </Typography>
            <View style={[styles.amountPill, { backgroundColor: colors.card }]}>
              <Typography
                variant="h3"
                color={colors.text}
                style={{ fontFamily: monoFont }}
                align="center"
              >
                {amountLabel}
              </Typography>
            </View>
          </View>

          <View style={styles.walletSection}>
            {wallets.length === 0 ? (
              <Typography variant="caption" color={colors.muted} align="center">
                {labels.walletEmpty}
              </Typography>
            ) : (
              wallets.map((wallet) => {
                const active = wallet.id === selectedWalletId;
                const accent =
                  wallet.type === "bank" ? colors.primary : colors.warning;
                const iconName =
                  wallet.type === "bank"
                    ? "account-balance"
                    : "account-balance-wallet";
                const availableLabel = labels.walletAvailable.replace(
                  "{amount}",
                  `${currency} ${formatAmountForSummary(wallet.balance)}`,
                );
                return (
                  <Pressable
                    key={wallet.id}
                    onPress={() => onSelectWallet(wallet.id)}
                    style={[
                      styles.walletCard,
                      {
                        borderColor: active ? colors.primary : "transparent",
                        backgroundColor: colors.card,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.walletRow,
                        { flexDirection: isRtl ? "row-reverse" : "row" },
                      ]}
                    >
                      <View
                        style={[
                          styles.walletIcon,
                          { backgroundColor: `${accent}1A` },
                        ]}
                      >
                        <MaterialIcons
                          name={iconName}
                          size={22}
                          color={accent}
                        />
                      </View>
                      <View style={styles.walletContent}>
                        <Typography variant="subtitle" color={colors.text}>
                          {wallet.name}
                        </Typography>
                        <Typography variant="caption" color={colors.success}>
                          {availableLabel}
                        </Typography>
                      </View>
                      <View
                        style={[
                          styles.walletRadio,
                          {
                            borderColor: active
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                      >
                        {active && (
                          <View
                            style={[
                              styles.walletRadioInner,
                              { backgroundColor: colors.primary },
                            ]}
                          />
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>

          <Pressable
            onPress={onConfirm}
            disabled={!canConfirm}
            style={[
              styles.confirmButton,
              {
                backgroundColor: canConfirm ? colors.primary : colors.border,
              },
            ]}
          >
            <Typography
              variant="subtitle"
              weight="700"
              color={canConfirm ? colors.background : colors.muted}
            >
              {labels.confirm}
            </Typography>
            <MaterialIcons
              name={isRtl ? "chevron-left" : "chevron-right"}
              size={22}
              color={canConfirm ? colors.background : colors.muted}
            />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 20,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
    opacity: 0.6,
  },
  header: {
    alignItems: "center",
    gap: 10,
  },
  title: {
    paddingHorizontal: 24,
  },
  amountPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
  },
  walletSection: {
    gap: 12,
  },
  walletCard: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 14,
  },
  walletRow: {
    alignItems: "center",
    gap: 12,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  walletContent: {
    flex: 1,
    gap: 4,
  },
  walletRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  walletRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  toggleRow: {
    alignItems: "center",
  },
  togglePill: {
    flexDirection: "row",
    borderRadius: 999,
    padding: 3,
    gap: 6,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 120,
  },
  confirmButton: {
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
