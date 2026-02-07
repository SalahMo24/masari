import { addMonths, addYears, endOfMonth, startOfDay } from "date-fns";

import type { BillFrequency } from "@/src/data/entities";

const clampDayInMonth = (date: Date, day: number) => {
  const lastDay = endOfMonth(date).getDate();
  return Math.min(day, lastDay);
};

const setDayForMonth = (date: Date, day: number) => {
  const safeDay = clampDayInMonth(date, day);
  return new Date(date.getFullYear(), date.getMonth(), safeDay);
};

const advanceDate = (date: Date, frequency: BillFrequency, day: number) => {
  const advanced =
    frequency === "quarterly"
      ? addMonths(date, 3)
      : frequency === "yearly"
        ? addYears(date, 1)
        : addMonths(date, 1);
  return setDayForMonth(advanced, day);
};

export const computeNextDueDate = (
  today: Date,
  day: number,
  frequency: BillFrequency,
) => {
  let candidate = setDayForMonth(today, day);
  const startToday = startOfDay(today);
  while (candidate < startToday) {
    candidate = advanceDate(candidate, frequency, day);
  }
  return candidate;
};
