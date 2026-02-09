import { useEffect, useMemo } from "react";
import {
  I18nManager,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";

import NewBillHeader from "@/src/components/bills/NewBillHeader";
import NewBillStepOne from "@/src/components/bills/NewBillStepOne";
import NewBillStepTwo from "@/src/components/bills/NewBillStepTwo";
import Typography from "@/src/components/typography.component";
import { useAmountInput } from "@/src/hooks/amount";
import { useNewBillForm } from "@/src/hooks/bills/useNewBillForm";
import { useNewBillLabels } from "@/src/hooks/bills/useNewBillLabels";
import { useTransactionData } from "@/src/hooks/transactions";
import { useI18n } from "@/src/i18n/useI18n";
import { useAppTheme } from "@/src/theme/useAppTheme";
import { ensureBillCategories, isBillCategory } from "@/src/utils/bills/categories";
import { useSQLiteContext } from "expo-sqlite";

export default function NewBillScreen() {
  const theme = useAppTheme();
  const { t } = useI18n();
  const router = useRouter();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const isRtl = I18nManager.isRTL;
  const today = useMemo(() => new Date(), []);

  const { categories, loading, refreshData } = useTransactionData();

  useEffect(() => {
    let active = true;
    const syncCategories = async () => {
      try {
        const created = await ensureBillCategories(db);
        if (created && active) {
          await refreshData();
        }
      } catch (error) {
        console.error(error);
      }
    };
    syncCategories();
    return () => {
      active = false;
    };
  }, [db, refreshData]);

  const billCategories = useMemo(
    () => categories.filter((category) => isBillCategory(category)),
    [categories],
  );

  const {
    parsedAmount,
    formattedAmount,
    integerDigitsEntered,
    decimalDigitsEntered,
    cursorPart,
    onPressDigit,
    onPressBackspace,
    onPressDotToggle,
    onLongPressClear,
  } = useAmountInput({
    allowOperators: false,
    allowEquals: false,
    maxIntegerDigits: 9,
  });

  const colors = useMemo(
    () => ({
      primary: theme.colors.accent,
      text: theme.colors.text,
      muted: theme.colors.mutedText,
      background: theme.colors.background,
      card: theme.colors.card,
      border: theme.colors.border,
      success: theme.colors.success,
      warning: theme.colors.warning,
    }),
    [theme]
  );

  const {
    step,
    name,
    setName,
    selectedCategoryId,
    setSelectedCategoryId,
    frequency,
    setFrequency,
    dueDay,
    setDueDay,
    saving,
    onBack,
    onNext,
    onSave,
  } = useNewBillForm({
    t,
    db,
    router,
    categories: billCategories,
    parsedAmount,
    today,
  });

  const { currency, summaryLabel, stepOneLabel, stepTwoLabel } = useNewBillLabels({
    t,
    frequency,
    parsedAmount,
    name,
  });

  const stepLabel = step === 1 ? stepOneLabel : stepTwoLabel;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <NewBillHeader
          title={t("screen.bill.new")}
          stepLabel={stepLabel}
          step={step}
          total={2}
          onBack={onBack}
          isRtl={isRtl}
          textColor={colors.text}
        />

        {loading ? (
          <View style={styles.loadingState}>
            <Typography variant="caption" style={{ color: colors.muted }}>
              {t("bill.new.loading")}
            </Typography>
          </View>
        ) : step === 1 ? (
          <NewBillStepOne
            name={name}
            onChangeName={setName}
            categories={billCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => setSelectedCategoryId(id)}
            currency={currency}
            formattedAmount={formattedAmount}
            integerDigitsEntered={integerDigitsEntered}
            decimalDigitsEntered={decimalDigitsEntered}
            cursorPart={cursorPart}
            onNext={onNext}
            onPressDigit={onPressDigit}
            onPressBackspace={onPressBackspace}
            onPressDotToggle={onPressDotToggle}
            onLongPressClear={onLongPressClear}
            isRtl={isRtl}
            colors={colors}
            labels={{
              name: t("bill.new.field.name"),
              namePlaceholder: t("bill.new.field.name.placeholder"),
              category: t("bill.new.field.category"),
              next: t("bill.new.cta.next"),
            }}
          />
        ) : (
          <NewBillStepTwo
            frequency={frequency}
            onSelectFrequency={(value) => setFrequency(value)}
            dueDay={dueDay}
            onSelectDueDay={(day) => setDueDay(day)}
            summaryLabel={summaryLabel}
            onSave={onSave}
            saving={saving}
            insetsBottom={insets.bottom}
            colors={colors}
            labels={{
              frequencyTitle: t("bill.new.field.frequency"),
              frequencyMonthly: t("bill.new.frequency.monthly"),
              frequencyQuarterly: t("bill.new.frequency.quarterly"),
              frequencyYearly: t("bill.new.frequency.yearly"),
              dueTitle: t("bill.new.field.due"),
              dueSummary: t("bill.new.summary.due").replace("{day}", String(dueDay)),
              repeatSummary: t("bill.new.summary.repeat").replace("{day}", String(dueDay)),
              saving: t("bill.new.cta.saving"),
              add: t("bill.new.cta.add"),
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
