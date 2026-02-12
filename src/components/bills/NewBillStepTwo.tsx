import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import DueDateCalendar from "@/src/components/bills/DueDateCalendar";
import Typography from "@/src/components/typography.component";
import type { BillFrequency } from "@/src/data/entities";

type NewBillStepTwoColors = {
  primary: string;
  text: string;
  muted: string;
  border: string;
  card: string;
  background: string;
};

type NewBillStepTwoLabels = {
  frequencyTitle: string;
  frequencyMonthly: string;
  frequencyQuarterly: string;
  frequencyYearly: string;
  dueTitle: string;
  dueSummary: string;
  repeatSummary: string;
  saving: string;
  add: string;
};

type NewBillStepTwoProps = {
  frequency: BillFrequency;
  onSelectFrequency: (value: BillFrequency) => void;
  dueDay: number;
  onSelectDueDay: (day: number) => void;
  summaryLabel: string;
  onSave: () => void;
  saving: boolean;
  insetsBottom: number;
  colors: NewBillStepTwoColors;
  labels: NewBillStepTwoLabels;
};

export default function NewBillStepTwo({
  frequency,
  onSelectFrequency,
  dueDay,
  onSelectDueDay,
  summaryLabel,
  onSave,
  saving,
  insetsBottom,
  colors,
  labels,
}: NewBillStepTwoProps) {
  const frequencyLabels: Record<BillFrequency, string> = {
    monthly: labels.frequencyMonthly,
    quarterly: labels.frequencyQuarterly,
    yearly: labels.frequencyYearly,
  };

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 160 + insetsBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <Typography variant="subtitle" color={colors.text}>
            {labels.frequencyTitle}
          </Typography>
          <View style={[styles.segment, { backgroundColor: colors.border }]}>
            {(["monthly", "quarterly", "yearly"] as BillFrequency[]).map(
              (option) => {
                const active = option === frequency;
                return (
                  <Pressable
                    key={option}
                    onPress={() => onSelectFrequency(option)}
                    style={({ pressed }) => [
                      styles.segmentItem,
                      active && { backgroundColor: colors.card },
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <Typography
                      variant="caption"
                      style={{
                        color: active ? colors.primary : colors.muted,
                        fontWeight: active ? "800" : "600",
                      }}
                    >
                      {frequencyLabels[option]}
                    </Typography>
                  </Pressable>
                );
              },
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.dueHeader}>
            <Typography variant="subtitle" color={colors.text}>
              {labels.dueTitle}
            </Typography>
            <Typography variant="caption" color={colors.primary}>
              {labels.dueSummary}
            </Typography>
          </View>
          <DueDateCalendar
            dueDay={dueDay}
            onSelectDueDay={onSelectDueDay}
            colors={colors}
          />
          <Typography
            variant="caption"
            style={[styles.dueHint, { color: colors.muted }]}
          >
            {labels.repeatSummary}
          </Typography>
        </View>

      </ScrollView>

      <View
        style={[
          styles.bottomSummary,
          {
            backgroundColor: `${colors.background}EE`,
            borderTopColor: colors.border,
            paddingBottom: 16 + insetsBottom,
          },
        ]}
      >
        <Typography
          variant="caption"
          color={colors.muted}
          style={styles.summaryText}
        >
          {summaryLabel}
        </Typography>
        <Pressable
          onPress={onSave}
          disabled={saving}
          style={[
            styles.primaryButton,
            { backgroundColor: colors.primary, marginTop: 12 },
          ]}
        >
          <Typography style={styles.primaryButtonText}>
            {saving ? labels.saving : labels.add}
          </Typography>
          <MaterialIcons name="check-circle" size={18} color="#fff" />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  inputGroup: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 10,
  },
  segment: {
    borderRadius: 14,
    padding: 4,
    flexDirection: "row",
    gap: 6,
  },
  segmentItem: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dueHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dueHint: {
    textAlign: "center",
  },
  bottomSummary: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  summaryText: {
    textAlign: "center",
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
