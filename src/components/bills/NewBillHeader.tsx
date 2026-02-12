import { Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";

import BillStepper from "@/src/components/bills/BillStepper";
import Typography from "@/src/components/typography.component";

type NewBillHeaderProps = {
  title: string;
  stepLabel: string;
  step: 1 | 2;
  total: number;
  onBack: () => void;
  isRtl: boolean;
  textColor: string;
};

export default function NewBillHeader({
  title,
  stepLabel,
  step,
  total,
  onBack,
  isRtl,
  textColor,
}: NewBillHeaderProps) {
  return (
    <View>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerButton}>
          <MaterialIcons
            name={isRtl ? "arrow-forward-ios" : "arrow-back-ios"}
            size={22}
            color={textColor}
          />
        </Pressable>
        <Typography variant="h6" style={[styles.headerTitle, { color: textColor }]}>
          {title}
        </Typography>
        <View style={styles.headerButton} />
      </View>
      <BillStepper label={stepLabel} step={step} total={total} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
});
