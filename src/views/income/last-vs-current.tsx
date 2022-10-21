import { Heading } from "components/typography";
import { BarStackChart } from "charts/bar-stack";
import { useAtomValue } from "jotai";
import { selectedPeriodAtom } from "stores/global";
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { PeriodId } from "consts";
import { useData } from "hooks/use-data";
import { ChartLoader } from "components/loader";

export function IncomeLastVsCurrent() {
  const selectedPeriod = useAtomValue(selectedPeriodAtom);
  const { data: income, isLoading } = useData({
    type: "income",
    period: "all",
    granularity: "daily",
  });

  function calculate(data, previous, current) {
    const withoutTotal = data.filter((d) => d.accountId !== "total");

    const previousTotal = withoutTotal.reduce(
      (acc, account) => {
        const total = account.rawPoints
          .filter((point) => {
            return point.date >= previous.start && point.date <= previous.end;
          })
          .reduce((acc, point) => acc + point.value, 0);

        return {
          ...acc,
          [account.accountId]: {
            color: account.color,
            value: total,
          },
        };
      },
      {
        label: previous.label,
      }
    );
    const currentTotal = withoutTotal.reduce(
      (acc, account) => {
        const total = account.rawPoints
          .filter((point) => {
            return point.date >= current.start && point.date <= current.end;
          })
          .reduce((acc, point) => acc + point.value, 0);

        return {
          ...acc,
          [account.accountId]: {
            color: account.color,
            value: total,
          },
        };
      },
      {
        label: current.label,
      }
    );

    return [previousTotal, currentTotal];
  }

  function getPeriods(selectedPeriod: PeriodId) {
    if (selectedPeriod === "ytd") {
      const currentYear = new Date();
      const previousYear = subYears(new Date(), 1);
      const previous = {
        start: startOfYear(previousYear),
        end: endOfYear(previousYear),
        label: format(previousYear, "yyyy"),
      };
      const current = {
        start: startOfYear(currentYear),
        end: endOfYear(currentYear),
        label: format(currentYear, "yyyy"),
      };

      return { previous, current };
    }
    if (selectedPeriod === "mtd") {
      const currentMonth = new Date();
      const previousMonth = subMonths(new Date(), 1);
      const previous = {
        start: startOfMonth(previousMonth),
        end: endOfMonth(previousMonth),
        label: format(previousMonth, "MMM yyyy"),
      };
      const current = {
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
        label: format(currentMonth, "MMM yyyy"),
      };

      return { previous, current };
    }
    if (selectedPeriod === "wtd") {
      const currentWeek = new Date();
      const previousWeek = subWeeks(new Date(), 1);
      const previous = {
        start: startOfWeek(previousWeek),
        end: endOfWeek(previousWeek),
        label: `${format(startOfWeek(previousWeek), "MMM d")} - ${format(
          endOfWeek(previousWeek),
          "MMM d"
        )}`,
      };
      const current = {
        start: startOfWeek(currentWeek),
        end: endOfMonth(currentWeek),
        label: `${format(startOfWeek(currentWeek), "MMM d")} - ${format(
          endOfWeek(currentWeek),
          "MMM d"
        )}`,
      };

      return { previous, current };
    }
    if (selectedPeriod === "last12m") {
      const today = new Date();
      const previous = {
        start: subMonths(today, 24),
        end: subMonths(today, 12),
        label: `${format(subMonths(today, 24), "MMM yyyy")} - ${format(
          subMonths(today, 12),
          "MMM yyyy"
        )}`,
      };
      const current = {
        start: subMonths(today, 12),
        end: today,
        label: `${format(subMonths(today, 12), "MMM yyyy")} - ${format(
          today,
          "MMM yyyy"
        )}`,
      };

      return { previous, current };
    }
    if (selectedPeriod === "last3m") {
      const today = new Date();
      const previous = {
        start: subMonths(today, 6),
        end: subMonths(today, 3),
        label: `${format(subMonths(today, 6), "MMM yyyy")} - ${format(
          subMonths(today, 3),
          "MMM yyyy"
        )}`,
      };
      const current = {
        start: subMonths(today, 3),
        end: today,
        label: `${format(subMonths(today, 3), "MMM yyyy")} - ${format(
          today,
          "MMM yyyy"
        )}`,
      };

      return { previous, current };
    }
    if (selectedPeriod === "last4w") {
      const today = new Date();
      const previous = {
        start: subWeeks(today, 8),
        end: subWeeks(today, 4),
        label: `${format(subWeeks(today, 8), "MMM d")} - ${format(
          subWeeks(today, 4),
          "MMM d"
        )}`,
      };
      const current = {
        start: subWeeks(today, 4),
        end: today,
        label: `${format(subWeeks(today, 4), "MMM d")} - ${format(
          today,
          "MMM d"
        )}`,
      };

      return { previous, current };
    }
    if (selectedPeriod === "last7d") {
      const today = new Date();
      const previous = {
        start: subDays(today, 14),
        end: subDays(today, 7),
        label: `${format(subDays(today, 14), "MMM d")} - ${format(
          subDays(today, 7),
          "MMM d"
        )}`,
      };
      const current = {
        start: subDays(today, 7),
        end: today,
        label: `${format(subDays(today, 7), "MMM d")} - ${format(
          today,
          "MMM d"
        )}`,
      };

      return { previous, current };
    }
  }

  function getHeader(selectedPeriod: PeriodId) {
    switch (selectedPeriod) {
      case "ytd":
        return "year";
      case "mtd":
        return "month";
      case "wtd":
        return "week";
      case "last12m":
        return "12 months";
      case "last3m":
        return "3 months";
      case "last4w":
        return "4 weeks";
      case "last7d":
        return "7 days";

      default:
        return "month";
    }
  }

  const { previous, current } = getPeriods(selectedPeriod);
  const data = calculate(income, previous, current);
  const header = getHeader(selectedPeriod);

  return (
    <section className="mb-12 px-4">
      <Heading className="mb-3">Last vs current {header}</Heading>
      {isLoading ? (
        <ChartLoader />
      ) : (
        <BarStackChart width={339} height={200} data={data} />
      )}
    </section>
  );
}
