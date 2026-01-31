import { PlaceholderScreen } from "@/src/screens/PlaceholderScreen";
import { useI18n } from "@/src/i18n/useI18n";

export default function DashboardScreen() {
  const { t } = useI18n();

  return (
    <PlaceholderScreen
      title={t("tab.dashboard")}
      description={t("placeholder.dashboard")}
    />
  );
}
