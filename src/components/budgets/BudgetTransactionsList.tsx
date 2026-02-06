import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import Typography from "@/src/components/typography.component";
import type { BudgetDetailTransaction } from "@/src/hooks/budgets/useBudgetDetail";

type BudgetTransactionsListProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  items: BudgetDetailTransaction[];
  emptyLabel: string;
  colors: {
    text: string;
    muted: string;
    card: string;
    border: string;
    accent: string;
  };
};

export function BudgetTransactionsList({
  title,
  actionLabel,
  onAction,
  items,
  emptyLabel,
  colors,
}: BudgetTransactionsListProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Typography variant="subtitle" style={[styles.title, { color: colors.text }]}>
          {title}
        </Typography>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction}>
            <Typography
              variant="caption"
              style={[styles.actionText, { color: colors.accent }]}
            >
              {actionLabel}
            </Typography>
          </Pressable>
        ) : null}
      </View>
      {items.length === 0 ? (
        <Typography variant="small" style={[styles.emptyText, { color: colors.muted }]}>
          {emptyLabel}
        </Typography>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.row,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.border }]}>
                <MaterialIcons name={item.iconName} size={20} color={colors.text} />
              </View>
              <View style={styles.rowBody}>
                <Typography
                  variant="body"
                  weight="700"
                  style={[styles.rowTitle, { color: colors.text }]}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  style={[styles.rowDate, { color: colors.muted }]}
                >
                  {item.dateLabel}
                </Typography>
              </View>
              <View style={styles.rowRight}>
                <Typography
                  variant="body"
                  weight="700"
                  style={[styles.rowAmount, { color: colors.text }]}
                >
                  {item.amountLabel}
                </Typography>
                {item.shareLabel ? (
                  <Typography
                    variant="overline"
                    style={[styles.shareLabel, { color: colors.accent }]}
                  >
                    {item.shareLabel}
                  </Typography>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 13,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13,
  },
  rowDate: {
    fontSize: 11,
    marginTop: 2,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  rowAmount: {
    fontSize: 13,
  },
  shareLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
