import { StyleSheet, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";

type BarDatum = { label: string; value: number; highlight?: boolean };

const BarChart = ({
  barData,
  colors,
}: {
  barData: BarDatum[];
  colors: { primary: string; muted: string; border: string };
}) => {
  return (
    <View style={styles.barChart}>
      <View style={styles.chartGrid}>
        <GridOverlay color={colors.border} />
      </View>
      <View style={styles.barsRow}>
        {barData.map((bar) => (
          <View key={bar.label} style={styles.barItem}>
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
            <Text
              style={[
                styles.barLabel,
                {
                  color: bar.highlight ? colors.primary : colors.muted,
                  fontWeight: bar.highlight ? "700" : "500",
                },
              ]}
            >
              {bar.label}
            </Text>
          </View>
        ))}
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
    alignItems: "flex-end",
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  barFill: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: {
    fontSize: 10,
  },
});

export default BarChart;
