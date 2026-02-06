import type { ID, Wallet } from "@/src/data/entities";
import { Pressable, StyleSheet, View } from "react-native";
import Typography from "@/src/components/typography.component";

export interface WalletSelectorProps {
  wallets: Wallet[];
  selectedId: ID | null;
  onSelect: (id: ID) => void;
  borderColor: string;
  activeBg: string;
  text: string;
  muted: string;
  activeText?: string;
}

export function WalletSelector({
  wallets,
  selectedId,
  onSelect,
  borderColor,
  activeBg,
  text,
  muted,
  activeText,
}: WalletSelectorProps) {
  return (
    <View style={[styles.walletSelector, { borderColor }]}>
      {wallets.map((w) => {
        const active = w.id === selectedId;
        return (
          <Pressable
            key={w.id}
            onPress={() => onSelect(w.id)}
            style={({ pressed }) => [
              styles.walletPill,
              active && { backgroundColor: activeBg },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Typography
              style={[
                styles.walletPillText,
                { color: active ? activeText ?? text : muted },
              ]}
            >
              {w.name}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  walletSelector: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    alignSelf: "center",
  },
  walletPill: {
    paddingHorizontal: 18,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  walletPillText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
