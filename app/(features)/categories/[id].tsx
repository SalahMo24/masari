import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  I18nManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Typography from "@/src/components/typography.component";
import { useCategoryDetail } from "@/src/hooks/categories/useCategoryDetail";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";

const monoFont = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

const getColorWithOpacity = (color: string, opacityHex: string) => {
  if (color.startsWith("#") && color.length === 7) {
    return `${color}${opacityHex}`;
  }
  return color;
};

export default function CategoryDetailScreen() {
  const theme = useAppTheme();
  const { t, locale } = useI18n();
  const router = useRouter();
  const isRtl = I18nManager.isRTL;
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const categoryId = Array.isArray(id) ? id[0] : id ?? null;

  const {
    loading,
    category,
    categoryLabel,
    categoryIcon,
    categoryColor,
    monthLabel,
    totalSpentLabel,
    transactionCountLabel,
    comparisonPercentLabel,
    comparisonDirection,
    dayGroups,
  } = useCategoryDetail({ categoryId, locale, t });

  const [visibleGroups, setVisibleGroups] = useState(3);

  useEffect(() => {
    setVisibleGroups(3);
  }, [dayGroups.length]);

  const visibleDayGroups = useMemo(
    () => dayGroups.slice(0, visibleGroups),
    [dayGroups, visibleGroups],
  );
  const hasMoreGroups = dayGroups.length > visibleGroups;

  const colors = useMemo(
    () => ({
      primary: theme.colors.accent,
      text: theme.colors.text,
      muted: theme.colors.mutedText,
      card: theme.colors.card,
      border: theme.colors.border,
      background: theme.colors.background,
      danger: theme.colors.danger,
      success: theme.colors.success,
    }),
    [theme],
  );

  const comparisonIcon =
    comparisonDirection === "up"
      ? "trending-up"
      : comparisonDirection === "down"
        ? "trending-down"
        : "trending-flat";
  const comparisonColor =
    comparisonDirection === "up"
      ? colors.danger
      : comparisonDirection === "down"
        ? colors.success
        : colors.muted;

  if (!loading && categoryId && categoryId !== "uncategorized" && !category) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <MaterialIcons
              name={isRtl ? "chevron-right" : "chevron-left"}
              size={22}
              color={colors.text}
            />
          </Pressable>
          <Typography variant="overline" style={[styles.headerTitle, { color: colors.text }]}>
            {t("category.detail.headerTitle")}
          </Typography>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.emptyState}>
          <Typography variant="body" style={[styles.emptyText, { color: colors.muted }]}>
            {t("category.detail.notFound")}
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <MaterialIcons
            name={isRtl ? "chevron-right" : "chevron-left"}
            size={22}
            color={colors.text}
          />
        </Pressable>
        <Typography variant="overline" style={[styles.headerTitle, { color: colors.text }]}>
          {t("category.detail.headerTitle")}
        </Typography>
        <Pressable onPress={() => null} style={styles.headerButton}>
          <MaterialIcons name="share" size={20} color={colors.text} />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summarySection}>
          <View
            style={[
              styles.categoryIcon,
              {
                backgroundColor: getColorWithOpacity(
                  categoryColor ?? colors.primary,
                  "1A",
                ),
              },
            ]}
          >
            <MaterialIcons
              name={categoryIcon}
              size={36}
              color={categoryColor ?? colors.primary}
            />
          </View>
          <Typography variant="h3" weight="700" style={[styles.categoryName, { color: colors.text }]}>
            {categoryLabel}
          </Typography>
          <Typography variant="caption" style={[styles.monthLabel, { color: colors.muted }]}>
            {monthLabel}
          </Typography>
          <View style={[styles.totalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Typography variant="overline" style={[styles.totalLabel, { color: colors.muted }]}>
              {t("category.detail.totalSpent")}
            </Typography>
            <Typography
              variant="h4"
              weight="700"
              style={[styles.totalValue, { color: colors.text, fontFamily: monoFont }]}
            >
              {totalSpentLabel}
            </Typography>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Typography variant="overline" style={[styles.statLabel, { color: colors.muted }]}>
              {t("category.detail.transactions.label")}
            </Typography>
            <Typography variant="h5" weight="700" style={[styles.statValue, { color: colors.text }]}>
              {transactionCountLabel}
            </Typography>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Typography variant="overline" style={[styles.statLabel, { color: colors.muted }]}>
              {t("category.detail.vsLastMonth")}
            </Typography>
            <View style={styles.statTrendRow}>
              <MaterialIcons name={comparisonIcon} size={18} color={comparisonColor} />
              <Typography
                variant="h5"
                weight="700"
                style={[styles.statValue, { color: comparisonColor }]}
              >
                {comparisonPercentLabel}
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Typography variant="overline" style={[styles.historyTitle, { color: colors.muted }]}>
              {t("category.detail.spendingHistory")}
            </Typography>
            <MaterialIcons name="filter-list" size={20} color={colors.muted} />
          </View>
          {visibleDayGroups.length === 0 ? (
            <Typography variant="body" style={[styles.emptyText, { color: colors.muted }]}>
              {t("category.detail.empty")}
            </Typography>
          ) : (
            <View style={styles.historyList}>
              {visibleDayGroups.map((group) => (
                <View key={group.id} style={styles.dayGroup}>
                  <Typography variant="overline" style={[styles.dayLabel, { color: colors.muted }]}>
                    {group.label}
                  </Typography>
                  <View style={styles.dayItems}>
                    {group.items.map((item) => (
                      <View
                        key={item.id}
                        style={[
                          styles.transactionRow,
                          { backgroundColor: colors.card, borderColor: colors.border },
                        ]}
                      >
                        <View
                          style={[
                            styles.transactionIcon,
                            { backgroundColor: getColorWithOpacity(colors.border, "66") },
                          ]}
                        >
                          <MaterialIcons name={item.iconName} size={20} color={colors.text} />
                        </View>
                        <View style={styles.transactionBody}>
                          <Typography variant="body" weight="700" style={[styles.transactionTitle, { color: colors.text }]}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" style={[styles.transactionSubtitle, { color: colors.muted }]}>
                            {item.subtitle}
                          </Typography>
                        </View>
                        <View style={styles.transactionRight}>
                          <Typography variant="body" weight="700" style={[styles.transactionAmount, { color: colors.text }]}>
                            {item.amountLabel}
                          </Typography>
                          <Typography variant="overline" style={[styles.transactionSource, { color: colors.primary }]}>
                            {item.sourceLabel}
                          </Typography>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
          {hasMoreGroups ? (
            <View style={styles.loadMoreRow}>
              <Pressable
                onPress={() => setVisibleGroups((current) => Math.min(dayGroups.length, current + 3))}
                style={[styles.loadMoreButton, { backgroundColor: getColorWithOpacity(colors.primary, "1A") }]}
              >
                <Typography variant="caption" weight="700" style={[styles.loadMoreText, { color: colors.primary }]}>
                  {t("category.detail.loadMore")}
                </Typography>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  summarySection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: "center",
  },
  categoryIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryName: {
    marginBottom: 4,
  },
  monthLabel: {
    marginBottom: 16,
  },
  totalCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  totalLabel: {
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  totalValue: {},
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  statLabel: {
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  statValue: {},
  statTrendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historySection: {
    paddingHorizontal: 16,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  historyTitle: {
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  historyList: {
    gap: 16,
  },
  dayGroup: {},
  dayLabel: {
    marginBottom: 10,
    paddingHorizontal: 6,
    letterSpacing: 1.2,
  },
  dayItems: {
    gap: 10,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionBody: {
    flex: 1,
  },
  transactionTitle: {},
  transactionSubtitle: {},
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontFamily: monoFont,
  },
  transactionSource: {
    letterSpacing: 0.6,
  },
  loadMoreRow: {
    alignItems: "center",
    paddingVertical: 24,
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
  },
  loadMoreText: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    textAlign: "center",
  },
});
