import { PlaceholderScreen } from "@/src/screens/PlaceholderScreen";
import { useI18n } from "@/src/i18n/useI18n";

export default function BudgetsScreen() {
  const { t } = useI18n();

  return (
    <PlaceholderScreen
      title={t("tab.budgets")}
      description={t("placeholder.budgets")}
    />
  );
}
