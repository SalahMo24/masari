import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Line } from "react-native-svg";

import Typography from "@/src/components/typography.component";
import type { BarDatum } from "./bar-chart-card.component";

const BarChart = ({
  barData,
  colors,
}: {
  barData: BarDatum[];
  colors: {
    primary: string;
    muted: string;
    border: string;
    card: string;
    text: string;
  };
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <View style={styles.barChart}>
      <View style={styles.chartGrid}>
        <GridOverlay color={colors.border} />
      </View>
      <View style={styles.barsRow}>
        {barData.map((bar, index) => {
          const isSelected = selectedIndex === index;
          return (
            <Pressable
              key={bar.id}
              onPress={() =>
                setSelectedIndex((current) =>
                  current === index ? null : index,
                )
              }
              style={styles.barItem}
            >
              <View style={styles.chartArea}>
                {isSelected && (
                  <View
                    style={[
                      styles.tooltip,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        bottom: `${Math.round(bar.value * 100)}%`,
                      },
                    ]}
                  >
                    <Typography
                      variant="caption"
                      weight="600"
                      style={[styles.tooltipText, { color: colors.text }]}
                    >
                      {bar.amountLabel}
                    </Typography>
                  </View>
                )}
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: bar.highlight
                        ? colors.primary
                        : `${colors.primary}1A`,
                      height: `${Math.round(bar.value * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Typography
                variant="caption"
                weight={bar.highlight ? "700" : "500"}
                style={[
                  styles.barLabel,
                  {
                    color: bar.highlight ? colors.primary : colors.muted,
                  },
                ]}
              >
                {bar.label}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
function GridOverlay({ color }: { color: string }) {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <Line x1="0" y1="0" x2="100" y2="0" stroke={color} strokeWidth="1" />
      <Line x1="0" y1="25" x2="100" y2="25" stroke={color} strokeWidth="1" />
      <Line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth="1" />
      <Line x1="0" y1="75" x2="100" y2="75" stroke={color} strokeWidth="1" />
      <Line x1="0" y1="100" x2="100" y2="100" stroke={color} strokeWidth="1" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  barChart: {
    height: 140,
    marginTop: 12,
  },
  chartGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  barsRow: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  chartArea: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    position: "relative",
  },
  barFill: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tooltip: {
    position: "absolute",
    alignSelf: "center",
    width: 65,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    transform: [{ translateY: -6 }],
    zIndex: 1,
  },
  tooltipText: {},
  barLabel: {},
});

export default BarChart;
