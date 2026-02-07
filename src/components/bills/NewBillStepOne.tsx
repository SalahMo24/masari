import { MaterialIcons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AmountDisplay, Keypad, type KeypadKey } from "@/src/components/amount";
import { CategoryChips } from "@/src/components/transactions";
import Typography from "@/src/components/typography.component";
import type { Category, ID } from "@/src/data/entities";

type NewBillStepOneColors = {
  primary: string;
  text: string;
  muted: string;
  border: string;
  card: string;
};

type NewBillStepOneLabels = {
  name: string;
  namePlaceholder: string;
  category: string;
  next: string;
};

type NewBillStepOneProps = {
  name: string;
  onChangeName: (value: string) => void;
  categories: Category[];
  selectedCategoryId: ID | null;
  onSelectCategory: (id: ID) => void;
  currency: string;
  formattedAmount: string;
  integerDigitsEntered: number;
  decimalDigitsEntered: number;
  cursorPart: "int" | "dec";
  onNext: () => void;
  onPressDigit: (digit: string) => void;
  onPressBackspace: () => void;
  onPressDotToggle: () => void;
  onLongPressClear: () => void;
  isRtl: boolean;
  colors: NewBillStepOneColors;
  labels: NewBillStepOneLabels;
};

const billKeypadKeys: KeypadKey[] = [
  { type: "digit", value: "1" },
  { type: "digit", value: "2" },
  { type: "digit", value: "3" },
  { type: "digit", value: "4" },
  { type: "digit", value: "5" },
  { type: "digit", value: "6" },
  { type: "digit", value: "7" },
  { type: "digit", value: "8" },
  { type: "digit", value: "9" },
  { type: "dot" },
  { type: "zero" },
  { type: "backspace" },
];

export default function NewBillStepOne({
  name,
  onChangeName,
  categories,
  selectedCategoryId,
  onSelectCategory,
  currency,
  formattedAmount,
  integerDigitsEntered,
  decimalDigitsEntered,
  cursorPart,
  onNext,
  onPressDigit,
  onPressBackspace,
  onPressDotToggle,
  onLongPressClear,
  isRtl,
  colors,
  labels,
}: NewBillStepOneProps) {
  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputGroup}>
          <Typography variant="caption" color={colors.muted}>
            {labels.name}
          </Typography>
          <TextInput
            value={name}
            onChangeText={onChangeName}
            placeholder={labels.namePlaceholder}
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Typography variant="caption" color={colors.muted}>
            {labels.category}
          </Typography>
          <CategoryChips
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={onSelectCategory}
            accent={colors.primary}
            border={colors.border}
            text={colors.text}
            muted={colors.muted}
            card={colors.card}
          />
        </View>

        <View style={styles.amountSection}>
          <AmountDisplay
            currency={currency}
            formattedAmount={formattedAmount}
            integerDigitsEntered={integerDigitsEntered}
            decimalDigitsEntered={decimalDigitsEntered}
            cursorPart={cursorPart}
            currencyColor={colors.primary}
            amountColor={colors.text}
            showCaret={false}
            styles={{
              amountBlock: styles.amountBlock,
              amountRow: styles.amountRow,
              amountContainer: styles.amountContainer,
              currency: styles.amountCurrency,
              digit: styles.amountText,
            }}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomArea}>
        <Pressable
          onPress={onNext}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        >
          <Typography style={styles.primaryButtonText}>
            {labels.next}
          </Typography>
          <MaterialIcons
            name={isRtl ? "arrow-back" : "arrow-forward"}
            size={18}
            color="#fff"
          />
        </Pressable>
        <Keypad
          keys={billKeypadKeys}
          columns={3}
          onDigit={onPressDigit}
          onBackspace={onPressBackspace}
          onDotToggle={onPressDotToggle}
          onLongPressClear={onLongPressClear}
          border={colors.border}
          background="transparent"
          pressedBackground={`${colors.border}66`}
          text={colors.text}
          accent={colors.primary}
          showKeyBorders={false}
          styleOverrides={{
            keypad: [styles.keypad, { borderTopColor: colors.border }],
            key: styles.keypadKey,
            keyText: styles.keypadText,
          }}
        />
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
  input: {
    borderBottomWidth: 2,
    paddingVertical: 10,
    fontSize: 22,
    fontWeight: "700",
  },
  amountSection: {
    marginTop: 24,
    display: "flex",

    alignItems: "center",
  },
  amountBlock: {
    paddingVertical: 2,
  },
  amountRow: {
    paddingHorizontal: 0,
  },
  amountContainer: {
    // alignItems: "baseline",
  },
  amountText: {
    fontSize: 52,
    fontWeight: "800",
    letterSpacing: -1,
  },
  amountCurrency: {
    fontSize: 16,
    fontWeight: "700",
  },
  bottomArea: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
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
  keypad: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  keypadKey: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  keypadText: {
    fontSize: 26,
    fontWeight: "600",
  },
});
