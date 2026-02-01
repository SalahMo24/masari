import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { I18nManager, Platform, StyleSheet, Text, View } from "react-native";

const monoFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

const Wallet = ({
  icon,
  label,
  subLabel,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  subLabel: string;
  value: string;
}) => {
  const theme = useAppTheme();
  const { t } = useI18n();
  const isRtl = I18nManager.isRTL;

  const colors = useMemo(
    () => ({
      primary: theme.colors.accent,
      nileGreen: theme.colors.success,
      gold: theme.colors.warning,
      text: theme.colors.text,
      muted: theme.colors.mutedText,
      background: theme.colors.background,
      card: theme.colors.card,
      border: theme.colors.border,
    }),
    [theme]
  );
  return (
    <View
      style={[
        styles.card,
        styles.walletCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.walletHeader]}>
        <MaterialIcons name={icon} size={20} color={colors.primary} />
        <Text style={[styles.walletTag, { color: colors.muted }]}>{label}</Text>
      </View>
      <Text style={[styles.walletLabel, { color: colors.muted }]}>
        {subLabel}
      </Text>
      <Text
        style={[
          styles.walletValue,
          {
            color: colors.text,
            fontFamily: monoFont,
          },
        ]}
      >
        {t("dashboard.currency")} {value}
      </Text>
    </View>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  walletCard: {
    flex: 1,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  walletTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  walletLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  walletValue: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
});
