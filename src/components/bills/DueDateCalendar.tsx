import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import Typography from "@/src/components/typography.component";
import { useI18n } from "@/src/i18n/useI18n";

type DueDateCalendarColors = {
  primary: string;
  text: string;
  muted: string;
  border: string;
  card: string;
  background: string;
};

type DueDateCalendarProps = {
  dueDay: number;
  onSelectDueDay: (day: number) => void;
  colors: DueDateCalendarColors;
};

const DAYS_IN_MONTH = Array.from({ length: 31 }, (_, idx) => idx + 1);
const COLLAPSED_COUNT = 7;

export default function DueDateCalendar({
  dueDay,
  onSelectDueDay,
  colors,
}: DueDateCalendarProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const daysOfWeek = useMemo(
    () => [
      t("bill.new.calendar.day.sun"),
      t("bill.new.calendar.day.mon"),
      t("bill.new.calendar.day.tue"),
      t("bill.new.calendar.day.wed"),
      t("bill.new.calendar.day.thu"),
      t("bill.new.calendar.day.fri"),
      t("bill.new.calendar.day.sat"),
    ],
    [t],
  );
  const visibleDays = useMemo(
    () => (expanded ? DAYS_IN_MONTH : DAYS_IN_MONTH.slice(0, COLLAPSED_COUNT)),
    [expanded],
  );

  return (
    <View>
      <View
        style={[
          styles.calendarCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.weekdayRow}>
          {daysOfWeek.map((day) => (
            <Typography
              key={day}
              variant="caption"
              style={[styles.weekdayLabel, { color: colors.muted }]}
            >
              {day}
            </Typography>
          ))}
        </View>
        <View style={styles.dayGrid}>
          {visibleDays.map((day) => {
            const active = day === dueDay;
            return (
              <Pressable
                key={day}
                onPress={() => onSelectDueDay(day)}
                style={({ pressed }) => [
                  styles.dayCell,
                  {
                    borderColor: active ? colors.primary : "transparent",
                    backgroundColor: active ? colors.primary : "transparent",
                    opacity: pressed ? 0.85 : 1,
                  },
                  active && styles.dayCellActive,
                ]}
              >
                <Typography
                  variant="caption"
                  style={[
                    {
                      color: active ? colors.background : colors.text,
                      fontWeight: active ? "800" : "600",
                    },
                  ]}
                >
                  {day}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={({ pressed }) => [
          styles.toggleButton,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Typography
          variant="caption"
          style={{ color: colors.primary, fontWeight: "700" }}
        >
          {expanded
            ? t("bill.new.calendar.showLess")
            : t("bill.new.calendar.showFull")}
        </Typography>
        <MaterialIcons
          name={expanded ? "expand-less" : "expand-more"}
          size={18}
          color={colors.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekdayLabel: {
    width: "13.5%",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: 5,
  },
  dayCell: {
    width: 42,
    height: 38,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  dayCellActive: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  toggleButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 4,
  },
});
