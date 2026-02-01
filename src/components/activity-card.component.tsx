import { useAppTheme } from "@/src/theme/useAppTheme";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TransactionType } from "../data/entities";

const ActivityCard = ({
  icon,
  transactionName,
  transactionCategory,
  transactionDate,
  transactionType,
  amount,
  source,
  monoFont,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  transactionName: string;
  transactionCategory: string;
  transactionType: TransactionType;
  transactionDate: string;
  amount: string;
  source: string;
  monoFont: string;
}) => {
  const theme = useAppTheme();

  const colors = useMemo(
    () => ({
      primary: theme.colors.accent,
      muted: theme.colors.mutedText,
      border: theme.colors.border,
      card: theme.colors.card,
      text: theme.colors.text,
      background: theme.colors.background,
      nileGreen: theme.colors.success,
    }),
    [theme]
  );
  return (
    <View
      style={[
        styles.activityRow,
        {
          backgroundColor: `${colors.card}CC`,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={[styles.activityIcon, { backgroundColor: colors.border }]}>
        <MaterialIcons name={icon} size={22} color={colors.muted} />
      </View>
      <View style={styles.activityBody}>
        <Text style={[styles.activityTitle, { color: colors.text }]}>
          {transactionName}
        </Text>
        <Text
          style={[
            styles.activityMeta,
            {
              color: colors.muted,
            },
          ]}
        >
          {transactionCategory} {transactionDate}
        </Text>
      </View>
      <View style={[styles.activityRight]}>
        <Text
          style={[
            styles.activityAmount,
            {
              color:
                transactionType === "income" ? colors.nileGreen : colors.text,
              fontFamily: monoFont,
            },
          ]}
        >
          {amount}
        </Text>
        <Text
          style={[
            styles.activitySource,
            {
              color: colors.muted,
            },
          ]}
        >
          {source}
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginEnd: 12,
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  activityMeta: {
    fontSize: 10,
    marginTop: 2,
  },
  activityRight: {
    alignItems: "flex-end",
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  activitySource: {
    fontSize: 10,
    textTransform: "uppercase",
  },
});
export default ActivityCard;
