import { useI18n } from "@/src/i18n/useI18n";
import { Platform, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type CategoryDatum = {
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
}) => {
  const { t } = useI18n();
  const resolvedTotalAmount = totalAmount ?? "0";
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>
        {t("dashboard.categoryBreakdown")}
      </Text>
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
              <Text
                style={[
                  styles.donutLabel,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                {t("dashboard.monthly")}
              </Text>
              <Text
                style={[
                  styles.donutValue,
                  {
                    color: colors.text,
                    fontFamily: monoFont,
                  },
                ]}
              >
                {resolvedTotalAmount}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.categoryList, { borderTopColor: colors.border }]}>
          {categories.map((category) => (
            <View key={category.label} style={[styles.categoryRow]}>
              <View style={[styles.categoryLeft]}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: category.color },
                  ]}
                />
                <View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {category.label}
                  </Text>
                  <Text
                    style={[
                      styles.categorySubtitle,
                      {
                        color: colors.muted,
                      },
                    ]}
                  >
                    {category.subtitle}
                  </Text>
                </View>
              </View>
              <View style={[styles.categoryRight]}>
                <Text
                  style={[
                    styles.categoryAmount,
                    {
                      color: colors.text,
                      fontFamily: monoFont,
                    },
                  ]}
                >
                  {category.amount}
                </Text>
                <Text
                  style={[
                    styles.categoryPercent,
                    {
                      color: colors.muted,
                    },
                  ]}
                >
                  {category.percent}
                </Text>
              </View>
            </View>
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
    fontSize: 11,
    fontWeight: "700",
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
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  donutValue: {
    fontSize: 20,
    fontWeight: "700",
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
    fontSize: 14,
    fontWeight: "600",
  },
  categorySubtitle: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  categoryRight: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  categoryPercent: {
    fontSize: 10,
  },
});

export default DonutChartCard;
