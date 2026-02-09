import { useI18n } from "@/src/i18n/useI18n";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Typography from "@/src/components/typography.component";

type CategoryDatum = {
  id: string;
  label: string;
  subtitle: string;
  amount: string;
  percent: string;
  color: string;
};

const DonutChartCard = ({
  colors,
  categories,
  spendingSegments,
  monoFont,
  totalAmount,
  onCategoryPress,
}: {
  colors: {
    primary: string;
    muted: string;
    border: string;
    card: string;
    text: string;
    background: string;
  };
  categories: CategoryDatum[];
  spendingSegments: { percent: number; color: string }[];
  monoFont: string;
  totalAmount?: string;
  onCategoryPress?: (categoryId: string) => void;
}) => {
  const { t } = useI18n();
  const resolvedTotalAmount = totalAmount ?? "0";
  return (
    <View style={styles.section}>
      <Typography variant="overline" style={[styles.sectionTitle, { color: colors.muted }]}>
        {t("dashboard.categoryBreakdown")}
      </Typography>
      <View
        style={[
          styles.card,
          styles.categoryCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.donutWrapper}>
          <View style={styles.donutContainer}>
            <DonutChart
              size={160}
              strokeWidth={12}
              segments={spendingSegments}
              trackColor={colors.border}
            />
            <View style={styles.donutCenter}>
              <Typography
                variant="overline"
                style={[
                  styles.donutLabel,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                {t("dashboard.monthly")}
              </Typography>
              <Typography
                variant="h5"
                weight="700"
                style={[
                  styles.donutValue,
                  {
                    color: colors.text,
                    fontFamily: monoFont,
                  },
                ]}
              >
                {resolvedTotalAmount}
              </Typography>
            </View>
          </View>
        </View>
        <View style={[styles.categoryList, { borderTopColor: colors.border }]}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => onCategoryPress?.(category.id)}
              disabled={!onCategoryPress}
              style={({ pressed }) => [
                styles.categoryRow,
                pressed ? styles.categoryRowPressed : null,
              ]}
            >
              <View style={[styles.categoryLeft]}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: category.color },
                  ]}
                />
                <View>
                  <Typography
                    variant="body"
                    weight="600"
                    style={[
                      styles.categoryLabel,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {category.label}
                  </Typography>
                  <Typography
                    variant="overline"
                    style={[
                      styles.categorySubtitle,
                      {
                        color: colors.muted,
                      },
                    ]}
                  >
                    {category.subtitle}
                  </Typography>
                </View>
              </View>
              <View style={[styles.categoryRight]}>
                <Typography
                  variant="body"
                  weight="700"
                  style={[
                    styles.categoryAmount,
                    {
                      color: colors.text,
                      fontFamily: monoFont,
                    },
                  ]}
                >
                  {category.amount}
                </Typography>
                <Typography
                  variant="caption"
                  style={[
                    styles.categoryPercent,
                    {
                      color: colors.muted,
                    },
                  ]}
                >
                  {category.percent}
                </Typography>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

function DonutChart({
  size,
  strokeWidth,
  segments,
  trackColor,
}: {
  size: number;
  strokeWidth: number;
  segments: { percent: number; color: string }[];
  trackColor: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedSegments = segments.map((segment) => ({
    ...segment,
    length: circumference * segment.percent,
  }));
  let cumulativeOffset = 0;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {normalizedSegments.map((segment, index) => {
        const dasharray = `${segment.length} ${circumference - segment.length}`;
        const dashoffset = -cumulativeOffset;
        cumulativeOffset += segment.length;
        return (
          <Circle
            key={`segment-${index}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  sectionTitle: {
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
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
        elevation: 2,
      },
    }),
  },

  categoryCard: {
    padding: 20,
    marginTop: 12,
  },
  donutWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  donutContainer: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
  },
  donutLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  donutValue: {
  },
  categoryList: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 12,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryRowPressed: {
    opacity: 0.7,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryLabel: {
  },
  categorySubtitle: {
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  categoryRight: {
    alignItems: "flex-end",
  },
  categoryAmount: {
  },
  categoryPercent: {
  },
});

export default DonutChartCard;
