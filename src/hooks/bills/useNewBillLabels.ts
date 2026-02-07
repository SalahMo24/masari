import { useMemo } from "react";

import type { BillFrequency } from "@/src/data/entities";
import { formatAmountForSummary } from "@/src/utils/amount";

type UseNewBillLabelsParams = {
  t: (key: string) => string;
  frequency: BillFrequency;
  parsedAmount: number;
  name: string;
};

export function useNewBillLabels({
  t,
  frequency,
  parsedAmount,
  name,
}: UseNewBillLabelsParams) {
  const currency = useMemo(() => t("dashboard.currency"), [t]);
  const frequencyLabel = useMemo(() => {
    if (frequency === "quarterly") return t("bill.new.frequency.quarterly");
    if (frequency === "yearly") return t("bill.new.frequency.yearly");
    return t("bill.new.frequency.monthly");
  }, [frequency, t]);

  const amountLabel = useMemo(
    () => `${currency} ${formatAmountForSummary(parsedAmount)}`,
    [currency, parsedAmount],
  );
  const summaryLabel = useMemo(
    () =>
      `${amountLabel} • ${name || t("bill.new.summary.name")} • ${frequencyLabel}`,
    [amountLabel, frequencyLabel, name, t],
  );

  const stepOneLabel = useMemo(() => t("bill.new.step1.label"), [t]);
  const stepTwoLabel = useMemo(() => t("bill.new.step2.label"), [t]);

  return {
    currency,
    frequencyLabel,
    amountLabel,
    summaryLabel,
    stepOneLabel,
    stepTwoLabel,
  };
}
