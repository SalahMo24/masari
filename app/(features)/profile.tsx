import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Typography from "@/src/components/typography.component";
import { useI18n } from "@/src/i18n/useI18n";
import { useThemeMode } from "@/src/theme/AppThemeProvider";
import { useAppTheme } from "@/src/theme/useAppTheme";

const PLACEHOLDER_NAME = "Ahmed Mahmoud";
const PLACEHOLDER_EMAIL = "ahmed.m@masari.eg";

export default function ProfileScreen() {
  const theme = useAppTheme();
  const { mode, setMode } = useThemeMode();
  const { t, locale, setLocale } = useI18n();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const colors = useMemo(
    () => ({
      text: theme.colors.text,
      muted: theme.colors.mutedText,
      background: theme.colors.background,
      card: theme.colors.card,
      border: theme.colors.border,
      primary: theme.colors.accent,
      success: theme.colors.success,
    }),
    [theme],
  );

  const languageLabel =
    locale === "ar" ? t("profile.language.ar.full") : t("profile.language.en.full");
  const currencyLabel = t("dashboard.currency");
  const appVersion =
    Constants.expoConfig?.version ?? "2.4.0";
  const versionText = t("profile.version").replace("v2.4.0", `v${appVersion}`);

  const handleSelectLanguage = (newLocale: "en" | "ar") => {
    setLocale(newLocale);
    setLanguageModalVisible(false);
  };

  const handleLogOut = () => {
    Alert.alert(
      t("profile.logOut"),
      undefined,
      [{ text: "OK" }],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header block: avatar, name, email */}
        <View style={[styles.profileHeader, { borderBottomColor: colors.border }]}>
          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: `${colors.primary}1A`, borderColor: `${colors.primary}33` },
              ]}
            >
              <MaterialIcons
                name="person"
                size={48}
                color={colors.primary}
              />
            </View>
            <View
              style={[
                styles.verifiedBadge,
                { backgroundColor: colors.success, borderColor: colors.card },
              ]}
            >
              <MaterialIcons name="verified-user" size={14} color="#fff" />
            </View>
          </View>
          <Typography variant="h3" weight="700" color={colors.text} style={styles.userName}>
            {PLACEHOLDER_NAME}
          </Typography>
          <Typography variant="caption" color={colors.muted} style={styles.userEmail}>
            {PLACEHOLDER_EMAIL}
          </Typography>
        </View>

        {/* Preferences section */}
        <View style={styles.section}>
          <Typography
            variant="overline"
            color={colors.muted}
            style={styles.sectionTitle}
          >
            {t("profile.preferences")}
          </Typography>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Language row */}
            <Pressable
              style={({ pressed }) => [
                styles.row,
                pressed && { backgroundColor: colors.background },
                { borderBottomColor: colors.border },
              ]}
              onPress={() => setLanguageModalVisible(true)}
            >
              <View style={[styles.rowIconWrap, { backgroundColor: `${colors.primary}1A` }]}>
                <MaterialIcons name="translate" size={20} color={colors.primary} />
              </View>
              <Typography variant="body" weight="500" color={colors.text} style={styles.rowLabel}>
                {t("profile.language")}
              </Typography>
              <View style={styles.rowRight}>
                <Typography variant="small" color={colors.muted}>
                  {languageLabel}
                </Typography>
                <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
              </View>
            </Pressable>

            {/* Appearance row */}
            <View style={[styles.row, { borderBottomColor: colors.border }]}>
              <View style={[styles.rowIconWrap, { backgroundColor: `${colors.primary}1A` }]}>
                <MaterialIcons name="dark-mode" size={20} color={colors.primary} />
              </View>
              <Typography variant="body" weight="500" color={colors.text} style={styles.rowLabel}>
                {t("profile.appearance")}
              </Typography>
              <View style={[styles.segmentedControl, { backgroundColor: colors.background }]}>
                <Pressable
                  style={[
                    styles.segment,
                    mode === "light" && {
                      backgroundColor: colors.card,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 2,
                      elevation: 2,
                    },
                  ]}
                  onPress={() => setMode("light")}
                >
                  <Typography
                    variant="caption"
                    weight="600"
                    color={mode === "light" ? colors.primary : colors.muted}
                  >
                    {t("profile.light")}
                  </Typography>
                </Pressable>
                <Pressable
                  style={[
                    styles.segment,
                    mode === "dark" && {
                      backgroundColor: colors.card,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 2,
                      elevation: 2,
                    },
                  ]}
                  onPress={() => setMode("dark")}
                >
                  <Typography
                    variant="caption"
                    weight="600"
                    color={mode === "dark" ? colors.primary : colors.muted}
                  >
                    {t("profile.dark")}
                  </Typography>
                </Pressable>
              </View>
            </View>

            {/* Primary Currency row (display-only) */}
            <View style={styles.row}>
              <View style={[styles.rowIconWrap, { backgroundColor: `${colors.primary}1A` }]}>
                <MaterialIcons name="payments" size={20} color={colors.primary} />
              </View>
              <Typography variant="body" weight="500" color={colors.text} style={styles.rowLabel}>
                {t("profile.primaryCurrency")}
              </Typography>
              <View style={styles.rowRight}>
                <Typography variant="small" weight="600" color={colors.muted}>
                  {currencyLabel}
                </Typography>
                <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
              </View>
            </View>
          </View>
        </View>

        {/* Log out */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.logOutButton,
              {
                backgroundColor: colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleLogOut}
          >
            <Typography variant="body" weight="700" color={colors.text}>
              {t("profile.logOut")}
            </Typography>
          </Pressable>
          <Typography variant="caption" color={colors.muted} style={styles.versionText}>
            {versionText}
          </Typography>
        </View>
      </ScrollView>

      {/* Language picker modal */}
      <Modal
        transparent
        visible={languageModalVisible}
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setLanguageModalVisible(false)}
          />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Typography variant="h5" weight="700" color={colors.text} style={styles.modalTitle}>
              {t("profile.selectLanguage")}
            </Typography>
            <Pressable
              style={({ pressed }) => [
                styles.languageOption,
                locale === "en" && { borderColor: colors.primary, backgroundColor: `${colors.primary}0D` },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => handleSelectLanguage("en")}
            >
              <Typography
                variant="body"
                weight="500"
                color={locale === "en" ? colors.primary : colors.text}
              >
                {t("profile.language.en.full")}
              </Typography>
              {locale === "en" && (
                <MaterialIcons name="check-circle" size={22} color={colors.primary} />
              )}
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.languageOption,
                locale === "ar" && { borderColor: colors.primary, backgroundColor: `${colors.primary}0D` },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => handleSelectLanguage("ar")}
            >
              <Typography
                variant="body"
                weight="500"
                color={locale === "ar" ? colors.primary : colors.text}
              >
                {t("profile.language.ar.full")}
              </Typography>
              {locale === "ar" && (
                <MaterialIcons name="check-circle" size={22} color={colors.primary} />
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  avatarRow: {
    position: "relative",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    paddingHorizontal: 8,
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  segmentedControl: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 8,
    gap: 0,
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 32,
    alignItems: "center",
    gap: 16,
  },
  logOutButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  versionText: {
    fontSize: 11,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    marginBottom: 16,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 8,
  },
});
