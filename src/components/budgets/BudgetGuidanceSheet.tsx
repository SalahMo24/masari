import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";
import { formatAmountForSummary } from "@/src/utils/amount";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import Typography from "@/src/components/typography.component";

type BudgetGuidanceSheetLabels = {
  title: string;
  subtitleOnTrack: string;
  subtitleAdjustment: string;
  currentStatus: string;
  spent: string;
  remaining: string;
  targetsTitle: string;
  dailyLimit: string;
  weeklyLimit: string;
  targetsHintOnTrack: string;
  targetsHintAdjustment: string;
  forecastTitle: string;
  forecastCaption: string;
  projectedEnd: string;
  forecastUnder: string;
  forecastOver: string;
  projectedSpend: string;
  projectedSavings: string;
  projectedOverspend: string;
  ctaGotIt: string;
  footerOnTrack: string;
  footerAdjustment: string;
};

type BudgetGuidanceSheetColors = {
  text: string;
  muted: string;
  background: string;
  card: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  primary: string;
};

type BudgetGuidanceSheetProps = {
  visible: boolean;
  insetsBottom: number;
  isAdjustmentNeeded: boolean;
  spent: number;
  limit: number;
  dailyTarget: number;
  weeklyTarget: number;
  projectedTotal: number;
  projectedDelta: number;
  projectedPercent: number;
  currencyLabel: string;
  labels: BudgetGuidanceSheetLabels;
  colors: BudgetGuidanceSheetColors;
  onClose: () => void;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const replaceAmount = (template: string, amountLabel: string) =>
  template.replace("{amount}", amountLabel);

export function BudgetGuidanceSheet({
  visible,
  insetsBottom,
  isAdjustmentNeeded,
  spent,
  limit,
  dailyTarget,
  weeklyTarget,
  projectedTotal,
  projectedDelta,
  projectedPercent,
  currencyLabel,
  labels,
  colors,
  onClose,
}: BudgetGuidanceSheetProps) {
  const progressPercent = limit > 0 ? clampPercent((spent / limit) * 100) : 0;
  const remaining = Math.max(0, limit - spent);
  const projectedDeltaAbs = Math.abs(projectedDelta);
  const toneColor = isAdjustmentNeeded ? colors.warning : colors.success;
  const forecastToneColor = projectedDelta < 0 ? colors.warning : colors.success;

  const formatAmount = (value: number) =>
    `${currencyLabel} ${formatAmountForSummary(value)}`;

  const helperHint = isAdjustmentNeeded
    ? labels.targetsHintAdjustment
    : labels.targetsHintOnTrack;
  const helperHintText = replaceAmount(helperHint, formatAmount(limit));

  const projectedEndText = projectedDelta < 0
    ? replaceAmount(labels.forecastOver, formatAmount(projectedDeltaAbs))
    : replaceAmount(labels.forecastUnder, formatAmount(projectedDeltaAbs));

  const subtitle = isAdjustmentNeeded
    ? labels.subtitleAdjustment
    : labels.subtitleOnTrack;
  const footerText = isAdjustmentNeeded
    ? labels.footerAdjustment
    : labels.footerOnTrack;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insetsBottom + 24,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Typography variant="h4" style={[styles.headerTitle, { color: colors.text }]}>
                {labels.title}
              </Typography>
              <Typography variant="caption" style={[styles.headerSubtitle, { color: colors.muted }]}>
                {subtitle}
              </Typography>
            </View>

            <View style={styles.section}>
              <Typography variant="overline" style={[styles.sectionLabel, { color: colors.muted }]}>
                {labels.currentStatus}
              </Typography>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.statusRow}>
                  <View>
                    <Typography variant="caption" style={{ color: colors.muted }}>
                      {labels.spent}
                    </Typography>
                    <Typography variant="h5" style={[styles.amountValue, { color: colors.text }]}>
                      {formatAmount(spent)}
                    </Typography>
                  </View>
                  <View>
                    <Typography variant="caption" style={[styles.alignRight, { color: toneColor }]}>
                      {labels.remaining}
                    </Typography>
                    <Typography variant="h5" style={[styles.amountValue, styles.alignRight, { color: toneColor }]}>
                      {formatAmount(remaining)}
                    </Typography>
                  </View>
                </View>
                <View style={[styles.track, { backgroundColor: `${colors.border}` }]}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${progressPercent}%`, backgroundColor: toneColor },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Typography variant="overline" style={[styles.sectionLabel, { color: colors.muted }]}>
                {labels.targetsTitle}
              </Typography>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.targetGrid}>
                  <View style={[styles.targetItem, { borderColor: colors.border }]}>
                    <Typography variant="overline" style={[styles.targetLabel, { color: colors.muted }]}>
                      {labels.dailyLimit}
                    </Typography>
                    <Typography variant="h5" style={[styles.targetValue, { color: colors.warning }]}>
                      {formatAmount(dailyTarget)}
                    </Typography>
                  </View>
                  <View style={styles.targetItemLast}>
                    <Typography variant="overline" style={[styles.targetLabel, { color: colors.muted }]}>
                      {labels.weeklyLimit}
                    </Typography>
                    <Typography variant="h5" style={[styles.targetValue, { color: colors.warning }]}>
                      {formatAmount(weeklyTarget)}
                    </Typography>
                  </View>
                </View>
                <View style={[styles.hintRow, { borderTopColor: colors.border }]}>
                  <MaterialIcons
                    name={isAdjustmentNeeded ? "warning" : "info-outline"}
                    size={16}
                    color={toneColor}
                  />
                  <Typography variant="caption" style={[styles.hintText, { color: colors.muted }]}>
                    {helperHintText}
                  </Typography>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.forecastHeader}>
                <Typography variant="overline" style={[styles.sectionLabel, { color: colors.muted }]}>
                  {labels.forecastTitle}
                </Typography>
                <Typography variant="caption" style={[styles.forecastCaption, { color: colors.muted }]}>
                  {labels.forecastCaption}
                </Typography>
              </View>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.projectedRow}>
                  <View
                    style={[
                      styles.projectedIcon,
                      { backgroundColor: `${forecastToneColor}1A` },
                    ]}
                  >
                    <MaterialIcons
                      name="trending-up"
                      size={20}
                      color={forecastToneColor}
                    />
                  </View>
                  <View style={styles.projectedBody}>
                    <Typography variant="overline" style={[styles.targetLabel, { color: colors.muted }]}>
                      {labels.projectedEnd}
                    </Typography>
                    <Typography variant="caption" style={[styles.projectedText, { color: colors.text }]}>
                      {projectedEndText}
                    </Typography>
                  </View>
                </View>
                <View style={[styles.forecastGrid, { borderTopColor: colors.border }]}>
                  <View style={styles.forecastItem}>
                    <Typography variant="overline" style={[styles.targetLabel, { color: colors.muted }]}>
                      {labels.projectedSpend}
                    </Typography>
                    <Typography variant="h6" style={[styles.forecastValue, { color: colors.text }]}>
                      {formatAmount(projectedTotal)}
                    </Typography>
                  </View>
                  <View style={styles.forecastItem}>
                    <Typography variant="overline" style={[styles.targetLabel, { color: forecastToneColor }]}>
                      {projectedDelta < 0
                        ? labels.projectedOverspend
                        : labels.projectedSavings}
                    </Typography>
                    <Typography variant="h6" style={[styles.forecastValue, { color: forecastToneColor }]}>
                      {formatAmount(projectedDeltaAbs)}
                    </Typography>
                  </View>
                </View>
                <View style={styles.projectedPercentRow}>
                  <Typography variant="caption" style={{ color: colors.muted }}>
                    {`${Math.round(projectedPercent)}%`}
                  </Typography>
                </View>
              </View>
            </View>

            <View style={styles.footerBlock}>
              <Pressable
                onPress={onClose}
                style={[styles.cta, { backgroundColor: colors.primary }]}
              >
                <Typography variant="subtitle" style={{ color: "#FFFFFF" }}>
                  {labels.ctaGotIt}
                </Typography>
              </Pressable>
              <View style={styles.footerMessage}>
                <MaterialIcons
                  name={isAdjustmentNeeded ? "info-outline" : "verified-user"}
                  size={16}
                  color={toneColor}
                />
                <Typography variant="caption" style={[styles.footerText, { color: toneColor }]}>
                  {footerText}
                </Typography>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    maxHeight: "95%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40,
    height: 6,
    borderRadius: 999,
    alignSelf: "center",
    opacity: 0.7,
    marginBottom: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 26,
    gap: 4,
  },
  headerTitle: {
    fontWeight: "700",
  },
  headerSubtitle: {
    fontStyle: "italic",
  },
  section: {
    marginBottom: 18,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  amountValue: {
    fontWeight: "700",
    marginTop: 2,
  },
  alignRight: {
    textAlign: "right",
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
  targetGrid: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  targetItem: {
    flex: 1,
    borderRightWidth: 1,
    paddingRight: 10,
  },
  targetItemLast: {
    flex: 1,
    paddingLeft: 10,
  },
  targetLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  targetValue: {
    marginTop: 2,
    fontWeight: "700",
  },
  hintRow: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  hintText: {
    flex: 1,
    lineHeight: 18,
  },
  forecastHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  forecastCaption: {
    fontStyle: "italic",
    textAlign: "right",
    flex: 1,
  },
  projectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  projectedIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  projectedBody: {
    flex: 1,
    gap: 2,
  },
  projectedText: {
    lineHeight: 18,
  },
  forecastGrid: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  forecastItem: {
    flex: 1,
    gap: 2,
  },
  forecastValue: {
    fontWeight: "700",
  },
  projectedPercentRow: {
    alignItems: "flex-end",
  },
  footerBlock: {
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },
  cta: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  footerMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  footerText: {
    fontWeight: "600",
  },
});
