import { PlaceholderScreen } from "@/src/screens/PlaceholderScreen";
import { useI18n } from "@/src/i18n/useI18n";

export default function BillsScreen() {
  const { t } = useI18n();

  return (
    <PlaceholderScreen
      title={t("tab.bills")}
      description={t("placeholder.bills")}
    />
  );
}
