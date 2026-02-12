import { Ionicons } from "@/src/components/icons/legacyVectorIcons";
import { StyleSheet, View } from "react-native";
import type { ID, TransactionType, Wallet } from "@/src/data/entities";
import { WalletSelector } from "./WalletSelector";
import Typography from "@/src/components/typography.component";

export interface WalletSectionProps {
  mode: TransactionType;
  wallets: Wallet[];
  // For expense/income
  walletId: ID | null;
  onWalletSelect: (id: ID) => void;
  // For transfer
  fromWalletId: ID | null;
  toWalletId: ID | null;
  onFromWalletSelect: (id: ID) => void;
  onToWalletSelect: (id: ID) => void;
  // Labels
  paidFromLabel: string;
  receivedIntoLabel: string;
  fromLabel: string;
  toLabel: string;
  transferHint: string;
  // Theme colors
  borderColor: string;
  cardColor: string;
  textColor: string;
  mutedTextColor: string;
  successColor: string;
}

export function WalletSection({
  mode,
  wallets,
  walletId,
  onWalletSelect,
  fromWalletId,
  toWalletId,
  onFromWalletSelect,
  onToWalletSelect,
  paidFromLabel,
  receivedIntoLabel,
  fromLabel,
  toLabel,
  transferHint,
  borderColor,
  cardColor,
  textColor,
  mutedTextColor,
  successColor,
}: WalletSectionProps) {
  if (mode === "expense") {
    return (
      <View style={styles.section}>
        <Typography style={[styles.sectionLabel, { color: mutedTextColor }]}>
          {paidFromLabel}
        </Typography>
        <WalletSelector
          wallets={wallets}
          selectedId={walletId}
          onSelect={onWalletSelect}
          borderColor={borderColor}
          activeBg={cardColor}
          text={textColor}
          muted={mutedTextColor}
        />
      </View>
    );
  }

  if (mode === "income") {
    return (
      <View style={styles.section}>
        <Typography style={[styles.sectionLabel, { color: mutedTextColor }]}>
          {receivedIntoLabel}
        </Typography>
        <WalletSelector
          wallets={wallets}
          selectedId={walletId}
          onSelect={onWalletSelect}
          borderColor={borderColor}
          activeBg={`${successColor}14`}
          text={textColor}
          muted={mutedTextColor}
          activeText={successColor}
        />
      </View>
    );
  }

  // Transfer mode
  return (
    <View style={styles.transferSection}>
      <View style={styles.section}>
        <Typography style={[styles.sectionLabel, { color: mutedTextColor }]}>
          {fromLabel}
        </Typography>
        <WalletSelector
          wallets={wallets}
          selectedId={fromWalletId}
          onSelect={onFromWalletSelect}
          borderColor={borderColor}
          activeBg={cardColor}
          text={textColor}
          muted={mutedTextColor}
        />
      </View>
      <View style={styles.section}>
        <Typography style={[styles.sectionLabel, { color: mutedTextColor }]}>
          {toLabel}
        </Typography>
        <WalletSelector
          wallets={wallets}
          selectedId={toWalletId}
          onSelect={onToWalletSelect}
          borderColor={borderColor}
          activeBg={cardColor}
          text={textColor}
          muted={mutedTextColor}
        />
      </View>
      <Typography style={[styles.transferHint, { color: mutedTextColor }]}>
        <Ionicons
          name="information-circle-outline"
          size={12}
          color={mutedTextColor}
        />{" "}
        {transferHint}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 8,
  },
  transferSection: {
    paddingTop: 4,
  },
  transferHint: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
    fontStyle: "italic",
    opacity: 0.85,
  },
});
