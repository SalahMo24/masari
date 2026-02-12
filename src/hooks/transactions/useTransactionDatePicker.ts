import { useCallback, useMemo, useState } from "react";

type UseTransactionDatePickerParams = {
  locale: "en" | "ar";
  labels: {
    today: string;
    yesterday: string;
  };
};

export type TransactionMonthCell = {
  key: string;
  date: Date | null;
  disabled: boolean;
  isToday: boolean;
  isSelected: boolean;
};

export type UseTransactionDatePickerResult = {
  selectedDate: Date;
  isDatePickerVisible: boolean;
  dateLabel: string;
  selectedDateLabel: string;
  monthLabel: string;
  weekdayLabels: string[];
  monthCells: TransactionMonthCell[];
  quickDates: { key: string; date: Date; label: string; isActive: boolean }[];
  disableNextMonth: boolean;
  occurredAt: string;
  isFutureDateSelected: boolean;
  openDatePicker: () => void;
  closeDatePicker: () => void;
  confirmDate: () => void;
  onSelectQuickDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDraftDate: (date: Date) => void;
};

export function useTransactionDatePicker({
  locale,
  labels,
}: UseTransactionDatePickerParams): UseTransactionDatePickerResult {
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(today);
  const [pickerMonth, setPickerMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const localeTag = useMemo(
    () => (locale === "ar" ? "ar-EG" : "en-US"),
    [locale],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        month: "short",
        day: "numeric",
      }),
    [localeTag],
  );

  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(localeTag, {
        month: "long",
        year: "numeric",
      }),
    [localeTag],
  );

  const dateLabel = useMemo(
    () => dateFormatter.format(selectedDate),
    [dateFormatter, selectedDate],
  );

  const selectedDateLabel = useMemo(() => {
    const normalized = startOfLocalDay(selectedDate);
    if (isSameLocalDay(normalized, today)) {
      return labels.today;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameLocalDay(normalized, yesterday)) {
      return labels.yesterday;
    }

    return dateFormatter.format(normalized);
  }, [dateFormatter, labels.today, labels.yesterday, selectedDate, today]);

  const monthLabel = useMemo(
    () => monthFormatter.format(pickerMonth),
    [monthFormatter, pickerMonth],
  );

  const weekdayLabels = useMemo(() => {
    const weekdayFormatter = new Intl.DateTimeFormat(localeTag, {
      weekday: "short",
    });
    return Array.from({ length: 7 }, (_, idx) =>
      weekdayFormatter.format(new Date(2023, 0, 1 + idx)),
    );
  }, [localeTag]);

  const monthCells = useMemo(() => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const firstWeekDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStart = startOfLocalDay(new Date());

    const cells: { key: string; date: Date | null }[] = [];
    for (let i = 0; i < firstWeekDay; i += 1) {
      cells.push({ key: `empty-${i}`, date: null });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        key: `${year}-${month}-${day}`,
        date: new Date(year, month, day),
      });
    }

    const trailing = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < trailing; i += 1) {
      cells.push({ key: `tail-${i}`, date: null });
    }

    return cells.map((cell) => {
      if (!cell.date) {
        return {
          key: cell.key,
          date: null,
          disabled: true,
          isToday: false,
          isSelected: false,
        };
      }

      const dayDate = startOfLocalDay(cell.date);
      return {
        key: cell.key,
        date: dayDate,
        disabled: dayDate.getTime() > todayStart.getTime(),
        isToday: isSameLocalDay(dayDate, todayStart),
        isSelected: isSameLocalDay(dayDate, draftDate),
      };
    });
  }, [draftDate, pickerMonth]);

  const quickDates = useMemo(() => {
    const candidates: Date[] = [];
    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );

    // Show all past days in the current month (including today).
    for (let day = today.getDate(); day >= 1; day -= 1) {
      candidates.push(new Date(today.getFullYear(), today.getMonth(), day));
    }

    // In the first week, append the last week from previous month.
    if (today.getDate() <= 7) {
      const previousMonthLastDay = new Date(
        currentMonthStart.getFullYear(),
        currentMonthStart.getMonth(),
        0,
      );
      for (let offset = 0; offset < 7; offset += 1) {
        const previousCandidate = new Date(previousMonthLastDay);
        previousCandidate.setDate(previousMonthLastDay.getDate() - offset);
        candidates.push(previousCandidate);
      }
    }

    return candidates.map((candidate) => {
      const normalized = startOfLocalDay(candidate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const label =
        isSameLocalDay(normalized, today)
          ? labels.today
          : isSameLocalDay(normalized, yesterday)
            ? labels.yesterday
            : dateFormatter.format(normalized);

      return {
        key: `quick-${normalized.toISOString()}`,
        date: normalized,
        label,
        isActive: isSameLocalDay(normalized, selectedDate),
      };
    });
  }, [dateFormatter, labels.today, labels.yesterday, selectedDate, today]);

  const disableNextMonth = useMemo(() => {
    const currentMonth = new Date();
    return (
      pickerMonth.getFullYear() === currentMonth.getFullYear() &&
      pickerMonth.getMonth() === currentMonth.getMonth()
    );
  }, [pickerMonth]);

  const occurredAt = useMemo(
    () => startOfLocalDay(selectedDate).toISOString(),
    [selectedDate],
  );

  const isFutureDateSelected = useMemo(() => {
    const todayStart = startOfLocalDay(new Date());
    return startOfLocalDay(selectedDate).getTime() > todayStart.getTime();
  }, [selectedDate]);

  const openDatePicker = useCallback(() => {
    const normalized = startOfLocalDay(selectedDate);
    setDraftDate(normalized);
    setPickerMonth(
      new Date(normalized.getFullYear(), normalized.getMonth(), 1),
    );
    setDatePickerVisible(true);
  }, [selectedDate]);

  const closeDatePicker = useCallback(() => {
    setDatePickerVisible(false);
  }, []);

  const confirmDate = useCallback(() => {
    setSelectedDate(startOfLocalDay(draftDate));
    setDatePickerVisible(false);
  }, [draftDate]);

  const onPrevMonth = useCallback(() => {
    setPickerMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  }, []);

  const onNextMonth = useCallback(() => {
    setPickerMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  }, []);

  const onSelectDraftDate = useCallback((date: Date) => {
    setDraftDate(startOfLocalDay(date));
  }, []);

  const onSelectQuickDate = useCallback((date: Date) => {
    const normalized = startOfLocalDay(date);
    setSelectedDate(normalized);
    setDraftDate(normalized);
    setPickerMonth(new Date(normalized.getFullYear(), normalized.getMonth(), 1));
  }, []);

  return {
    selectedDate,
    isDatePickerVisible,
    dateLabel,
    selectedDateLabel,
    monthLabel,
    weekdayLabels,
    monthCells,
    quickDates,
    disableNextMonth,
    occurredAt,
    isFutureDateSelected,
    openDatePicker,
    closeDatePicker,
    confirmDate,
    onSelectQuickDate,
    onPrevMonth,
    onNextMonth,
    onSelectDraftDate,
  };
}

function startOfLocalDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
