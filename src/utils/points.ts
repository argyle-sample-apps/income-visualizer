import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  subYears,
} from "date-fns";
import { GranularityId } from "stores/global";

type ExtendedGranularityId = GranularityId | "biweekly";

export function createEmptyPoints(interval: ExtendedGranularityId) {
  const today = new Date();
  const start = subYears(today, 2);

  let dates;

  switch (interval) {
    case "daily":
      dates = eachDayOfInterval({ start, end: today });
      break;

    case "weekly":
      dates = eachWeekOfInterval({ start, end: today }).map((date) =>
        endOfWeek(date, { weekStartsOn: 0 })
      );
      break;

    case "biweekly":
      dates = eachWeekOfInterval({ start, end: today })
        .map((date) => endOfWeek(date, { weekStartsOn: 0 }))
        .filter((_, i) => i % 2 === 0);

      break;

    case "monthly":
      dates = eachMonthOfInterval({ start, end: today }).map((date) =>
        endOfMonth(date)
      );
      break;

    default:
      break;
  }

  return dates.map((date) => ({ date: date, value: 0 }));
}
