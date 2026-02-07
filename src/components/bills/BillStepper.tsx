import { StyleSheet, View } from "react-native";
import Typography from "@/src/components/typography.component";
import { useAppTheme } from "@/src/theme/useAppTheme";

type BillStepperProps = {
  label: string;
  step: number;
  total: number;
};

export default function BillStepper({ label, step, total }: BillStepperProps) {
  const theme = useAppTheme();
  const progress = total > 0 ? Math.min(100, Math.max(0, (step / total) * 100)) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Typography variant="overline" color={theme.colors.accent}>
          {label}
        </Typography>
        <Typography variant="caption" color={theme.colors.mutedText}>
          {step} of {total}
        </Typography>
      </View>
      <View style={[styles.track, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.fill,
            { width: `${progress}%`, backgroundColor: theme.colors.accent },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
