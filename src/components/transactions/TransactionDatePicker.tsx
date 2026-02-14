import { MaterialIcons } from "@/src/components/icons/legacyVectorIcons";
import Typography from "@/src/components/typography.component";
import type { TransactionMonthCell } from "@/src/hooks/transactions/useTransactionDatePicker";
import {
  I18nManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ColorValue,
} from "react-native";

type DatePickerColors = {
  text: string;
  mutedText: string;
  border: string;
  card: string;
  background: string;
  accent: string;
};

type DatePickerLabels = {
  pickTitle: string;
  previousMonth: string;
  nextMonth: string;
  cancel: string;
  confirm: string;
  openCalendar: string;
};

export type TransactionDatePickerProps = {
  insetsBottom: number;
  colors: DatePickerColors;
  labels: DatePickerLabels;
  isVisible: boolean;
  selectedDateLabel: string;
  monthLabel: string;
  weekdayLabels: string[];
  monthCells: TransactionMonthCell[];
  quickDates: { key: string; date: Date; label: string; isActive: boolean }[];
  disableNextMonth: boolean;
  onOpen: () => void;
  onClose: () => void;
  onConfirm: () => void;
  onSelectQuickDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
};

export function TransactionDatePicker({
  insetsBottom,
  colors,
  labels,
  isVisible,
  selectedDateLabel,
  monthLabel,
  weekdayLabels,
  monthCells,
  quickDates,
  disableNextMonth,
  onOpen,
  onClose,
  onConfirm,
  onSelectQuickDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: TransactionDatePickerProps) {
  const isRtl = I18nManager.isRTL;
  return (
    <>
      <View
        style={[
          styles.quickDateWrap,
          {
            borderTopColor: colors.border,
            borderBottomColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      >
        <Pressable
          onPress={onOpen}
          accessibilityRole="button"
          accessibilityLabel={labels.openCalendar}
          style={({ pressed }) => [
            styles.calendarIconButton,
            {
              borderColor: colors.border,
              backgroundColor: withAlpha(colors.accent, "14"),
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <MaterialIcons
            name="calendar-month"
            size={18}
            color={colors.accent}
          />
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickDateScrollContent}
        >
          {quickDates.map((quick) => (
            <Pressable
              key={quick.key}
              onPress={() => onSelectQuickDate(quick.date)}
              style={({ pressed }) => [
                styles.quickDateChip,
                quick.isActive
                  ? {
                      borderColor: withAlpha(colors.accent, "20"),
                      backgroundColor: withAlpha(colors.accent, "14"),
                    }
                  : { borderColor: "transparent" },
                pressed && { opacity: 0.82 },
              ]}
            >
              <Typography
                variant="caption"
                weight={quick.isActive ? "700" : "600"}
                color={quick.isActive ? colors.accent : colors.mutedText}
              >
                {quick.label}
              </Typography>
            </Pressable>
          ))}

          {!quickDates.some((quick) => quick.isActive) ? (
            <Pressable
              onPress={onOpen}
              style={({ pressed }) => [
                styles.quickDateChip,
                {
                  borderColor: withAlpha(colors.accent, "20"),
                  backgroundColor: withAlpha(colors.accent, "14"),
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <Typography variant="caption" weight="700" color={colors.accent}>
                {selectedDateLabel}
              </Typography>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>

      <Modal
        transparent
        visible={isVisible}
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
                paddingBottom: 24 + insetsBottom,
              },
            ]}
          >
            <View
              style={[
                styles.handle,
                { backgroundColor: withAlpha(colors.border, "AA") },
              ]}
            />
            <Typography variant="subtitle" weight="700" color={colors.text}>
              {labels.pickTitle}
            </Typography>

            <View style={[styles.monthRow, { flexDirection: "row" }]}>
              <Pressable
                onPress={onPrevMonth}
                style={styles.monthNavButton}
                accessibilityLabel={labels.previousMonth}
              >
                <MaterialIcons
                  name={isRtl ? "chevron-right" : "chevron-left"}
                  size={22}
                  color={colors.text}
                />
              </Pressable>

              <Typography variant="subtitle" color={colors.text}>
                {monthLabel}
              </Typography>

              <Pressable
                onPress={onNextMonth}
                disabled={disableNextMonth}
                style={styles.monthNavButton}
                accessibilityLabel={labels.nextMonth}
              >
                <MaterialIcons
                  name={isRtl ? "chevron-left" : "chevron-right"}
                  size={22}
                  color={disableNextMonth ? colors.mutedText : colors.text}
                />
              </Pressable>
            </View>

            <View style={[styles.weekdayRow, { flexDirection: "row" }]}>
              {weekdayLabels.map((weekday) => (
                <View key={weekday} style={styles.weekdayCell}>
                  <Typography variant="small" color={colors.mutedText}>
                    {weekday}
                  </Typography>
                </View>
              ))}
            </View>

            <View style={[styles.daysGrid, { flexDirection: "row" }]}>
              {monthCells.map((cell) => {
                if (!cell.date) {
                  return <View key={cell.key} style={styles.dayCell} />;
                }

                const disabled = cell.disabled;
                const highlighted = cell.isSelected;

                return (
                  <View key={cell.key} style={styles.dayCell}>
                    <Pressable
                      onPress={() => {
                        if (!disabled) {
                          if (cell.date) {
                            onSelectDate(cell.date);
                          }
                        }
                      }}
                      disabled={disabled}
                      style={[
                        styles.dayButton,
                        highlighted
                          ? { backgroundColor: colors.accent }
                          : undefined,
                      ]}
                    >
                      <Typography
                        variant="caption"
                        weight={cell.isToday ? "700" : "500"}
                        color={
                          disabled
                            ? colors.mutedText
                            : highlighted
                              ? "#fff"
                              : colors.text
                        }
                      >
                        {cell.date.getDate()}
                      </Typography>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <View style={[styles.actionRow, { flexDirection: "row" }]}>
              <Pressable
                onPress={onClose}
                style={[
                  styles.secondaryAction,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <Typography variant="subtitle" color={colors.text}>
                  {labels.cancel}
                </Typography>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                style={[
                  styles.primaryAction,
                  { backgroundColor: colors.accent },
                ]}
              >
                <Typography variant="subtitle" weight="700" color="#fff">
                  {labels.confirm}
                </Typography>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function withAlpha(color: string, alphaHex: string): ColorValue {
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return `${color}${alphaHex}`;
  }
  return color;
}

const styles = StyleSheet.create({
  quickDateWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  calendarIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginEnd: 8,
  },
  quickDateScrollContent: {
    gap: 6,
    paddingEnd: 16,
  },
  quickDateChip: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 14,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    alignSelf: "center",
  },
  monthRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  weekdayCell: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 4,
  },
  daysGrid: {
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    alignItems: "center",
    marginBottom: 8,
  },
  dayButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    gap: 10,
    marginTop: 4,
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryAction: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
});
