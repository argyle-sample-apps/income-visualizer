import { PeriodId } from "consts";
import { GranularityId } from "stores/global";
import { useAccounts } from "./use-accounts";
import { createEmptyPoints } from "utils/points";
import {
  formatISO,
  isSameDay,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
  differenceInDays,
  endOfMonth,
  endOfWeek,
  hoursToSeconds,
  isBefore,
  isThisMonth,
  isThisWeek,
} from "date-fns";
import split from "just-split";
import mean from "just-mean";
import { sum } from "d3-array";
import currency from "currency.js";
import { useActivities } from "./use-activities";
import { usePayouts } from "./use-payouts";
import { Payout } from "models/payout";
import { Account } from "models/account";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type getDataParams = {
  type: "income" | "hours" | "hourly" | "totalPay";
  period: PeriodId;
  granularity: GranularityId;
};

type Point = { date: Date | string; value: number };

type AccountData = {
  accountId: string;
  name: string;
  color: string;
  type: "income" | "hours" | "hourly";
  points: Point[];
  period?: "weekly" | "monthly" | "daily";
};

type DataSet = {
  income: AccountData;
  hours: AccountData;
  hourly: AccountData;
  totalPayValues: any;
};

export function getStartDate(period: PeriodId) {
  const currentDate = new Date();

  let fromDate: Date;

  switch (period) {
    case "ytd":
      // get first day of current year
      fromDate = startOfYear(currentDate);
      break;
    case "mtd":
      // get first day of current month
      fromDate = startOfMonth(currentDate);
      break;
    case "wtd":
      // get first day of current week
      fromDate = startOfWeek(currentDate);
      break;
    case "last12m":
      // substract 12 months from current
      fromDate = subMonths(currentDate, 12);
      break;
    case "last3m":
      // substract 3 months from current
      fromDate = subMonths(currentDate, 3);
      break;
    case "last4w":
      // substract 4 weeks from current
      fromDate = subWeeks(currentDate, 4);
      break;
    case "last7d":
      // substract 7 days from current
      fromDate = subDays(currentDate, 7);
      break;
    default:
      fromDate = subYears(currentDate, 2);
      break;
  }

  return fromDate;
}

function withTotal(accounts, granularity) {
  const accountPoints = accounts.map((account) => account[granularity]);

  const map = new Map();

  for (let i = 0; i < accountPoints.length; i++) {
    const array = accountPoints[i];

    for (let i = 0; i < array.length; i++) {
      const point = array[i];
      const date = formatISO(new Date(point.date));

      if (!map.get(date)) {
        map.set(date, {
          date: new Date(date),
          value: currency(point.value, { precision: 2 }).value,
        });
      } else {
        const item = map.get(date);
        const value = currency(point.value, { precision: 2 });
        const sum = currency(item.value).add(value);

        map.set(date, {
          date: new Date(date),
          value: sum.value,
        });
      }
    }
  }

  const totals = Array.from(map.values());

  return [
    {
      accountId: "total",
      name: "Total",
      color: "#494A62",
      points: totals,
      rawPoints: totals,
      [granularity]: totals,
    },
    ...accounts,
  ];
}

function transformPayouts(account: Account, payouts: Payout[]) {
  const incomeValues = [];
  const hoursValues = [];
  const hourlyValues = [];
  const totalPayValues = [];

  for (let i = 0; i < payouts.length; i++) {
    const payout = payouts[i];

    const { end_date } = payout.payout_period;
    const date = parseISO(end_date as unknown as string);

    if (isValid(date)) {
      const income = parseFloat(payout.net_pay);

      const hours = hoursToSeconds(parseFloat(payout.hours));

      const hourly = income / parseFloat(payout.hours);

      incomeValues.push({ value: currency(income).value, date });
      hoursValues.push({ value: hours, date });
      hourlyValues.push({ value: currency(hourly).value, date });

      const {
        base: basePay,
        bonus,
        commission,
        other,
        overtime,
      } = payout.gross_pay_list_totals;

      const totalPay = {
        base: Number(basePay?.amount || 0),
        bonus: Number(bonus?.amount || 0),
        commission: Number(commission?.amount || 0),
        other: Number(other?.amount || 0),
        overtime: Number(overtime?.amount || 0),
        netPay: Number(payout?.net_pay || 0),
        taxes: Number(payout?.taxes || 0),
        deductions: Number(payout?.deductions || 0),
        reimbursements: Number(payout?.reimbursements || 0),
        date,
      };

      totalPayValues.push(totalPay);
    }
  }

  const payout = payouts.find((payout) => payout.payout_period);

  const { start_date, end_date } = payout.payout_period;

  const date = parseISO(end_date as unknown as string);

  const days = differenceInDays(new Date(end_date), new Date(start_date));

  let period = null;

  if (days > 28) {
    period = "monthly";
  } else if (days === 1) {
    period = "daily";
  } else if (days === 7) {
    period = "weekly";
  } else {
    period = "biweekly";
  }

  const base = {
    accountId: account.id,
    name: account.link_item_details.name,
    color: account.color,
    period,
  };

  type DataType = "income" | "hours" | "hourly";

  return {
    income: { ...base, type: "income" as DataType, points: incomeValues },
    hours: { ...base, type: "hours" as DataType, points: hoursValues },
    hourly: { ...base, type: "hourly" as DataType, points: hourlyValues },
    totalPayValues,
  };
}

function filterPayouts(
  payouts: DataSet,
  startDate: Date,
  granularity: GranularityId
) {
  const { totalPayValues, ...rest } = payouts;

  const filteredTotalPayValues = totalPayValues.filter((val) => {
    const date = val.date instanceof Date ? val.date : parseISO(val.date);
    return isSameDay(date, startDate) || date > startDate;
  });

  const totalPayValuesSum = filteredTotalPayValues.reduce(
    (prev, curr) => {
      const gross = currency(curr.base)
        .add(curr.overtime)
        .add(curr.bonus)
        .add(curr.other)
        .add(curr.reimbursements);

      const net = currency(curr.netPay)
        .subtract(curr.taxes)
        .subtract(curr.deductions);

      return {
        base: prev.base.add(currency(curr.base)),
        bonus: prev.bonus.add(curr.bonus),
        commission: prev.commission.add(curr.commission),
        other: prev.other.add(curr.other),
        overtime: prev.overtime.add(curr.overtime),
        netPay: prev.netPay.add(curr.netPay),
        taxes: prev.taxes.add(curr.taxes),
        deductions: prev.deductions.add(curr.deductions),
        reimbursements: prev.reimbursements.add(curr.reimbursements),
        gross: prev.gross.add(gross),
        net: prev.net.add(net),
      };
    },
    {
      base: currency(0),
      bonus: currency(0),
      commission: currency(0),
      other: currency(0),
      overtime: currency(0),
      netPay: currency(0),
      taxes: currency(0),
      deductions: currency(0),
      reimbursements: currency(0),
      gross: currency(0),
      net: currency(0),
    }
  );

  const dataSets = Object.values(rest);

  const filteredDataSets = dataSets.map((dataSet) => {
    type Period = "daily" | "monthly" | "biweekly" | "weekly";

    const period: Period = dataSet.period;

    const filteredPoints = dataSet.points.reverse().filter((point) => {
      const date =
        point.date instanceof Date ? point.date : parseISO(point.date);
      return isSameDay(date, startDate) || date > startDate;
    });

    const points = filteredPoints.map((point) => {
      const normalizedDate =
        period === "monthly"
          ? endOfMonth(new Date(point.date))
          : endOfWeek(new Date(point.date), { weekStartsOn: 0 });

      const date =
        normalizedDate instanceof Date
          ? normalizedDate
          : parseISO(normalizedDate);

      return { ...point, date };
    });

    const emptyPointsPerPeriod = createEmptyPoints(period).filter((point) => {
      const today = new Date();
      const date =
        point.date instanceof Date ? point.date : parseISO(point.date);

      return (
        (isSameDay(date, startDate) || isBefore(new Date(startDate), date)) &&
        isBefore(date, today)
      );
    });

    const uniqueDatesMap = new Map();

    for (let i = 0; i < emptyPointsPerPeriod.length; i++) {
      const point = emptyPointsPerPeriod[i];
      uniqueDatesMap.set(formatISO(point.date), point);
    }

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      uniqueDatesMap.set(formatISO(point.date), point);
    }

    const mergedPoints = Array.from(uniqueDatesMap.values());

    let finalPoints = [];

    switch (granularity) {
      case "monthly":
        if (period === "monthly") {
          finalPoints = mergedPoints;
        } else {
          const map = new Map();

          for (let i = 0; i < mergedPoints.length; i++) {
            const point = mergedPoints[i];

            if (isThisMonth(point.date)) {
              continue;
            }

            const month = formatISO(endOfMonth(new Date(point.date)));

            if (!map.get(month)) {
              map.set(month, {
                date: new Date(month),
                value: currency(point.value, { precision: 2 }).value,
              });
            } else {
              const item = map.get(month);
              const value = currency(point.value, { precision: 2 });
              const sum = currency(item.value).add(value);

              map.set(month, {
                date: new Date(month),
                value: sum.value,
              });
            }
          }

          finalPoints = Array.from(map.values());
        }
        break;
      case "weekly":
        if (period === "weekly") {
          finalPoints = mergedPoints.filter((point) => {
            return !isThisWeek(point.date);
          });
        } else {
          finalPoints = [];
        }
        break;
      default:
        finalPoints = [];
    }

    return {
      ...dataSet,
      rawPoints: mergedPoints,
      points: finalPoints,
      [granularity]: finalPoints,
    };
  });

  return {
    data: filteredDataSets,
    totalPaySum: totalPayValuesSum,
  };
}

function transformActivities(account: Account, activities: any[]): DataSet {
  const map = new Map();

  for (let j = 0; j < activities.length; j++) {
    const activity = activities[j];
    const date = parseISO(activity.end_date);

    if (isValid(date)) {
      const key = formatISO(date, { representation: "date" });
      if (!map.has(key)) {
        map.set(key, {
          income: 0,
          seconds: 0,
        });
      }

      const current = map.get(key);

      const income = activity.income;
      const total = currency(income.total);
      const pay = currency(income.pay);
      const bonus = currency(income.bonus);
      const tips = currency(income.tips);
      const fees = currency(income.fees);

      map.set(key, {
        total: total.add(current.total),
        seconds: current.seconds + activity.duration,
        pay: pay.add(current.pay),
        bonus: bonus.add(current.bonus),
        tips: tips.add(current.tips),
        fees: fees.add(current.fees),
      });
    }
  }

  const getKey = (point) => formatISO(point.date, { representation: "date" });

  const base = {
    accountId: account.id,
    name: account.link_item_details.name,
    color: account.color,
  };

  const income = createEmptyPoints("daily").map((point) => {
    const key = getKey(point);
    const value = map.get(key)?.total.value || 0;

    return { ...point, value };
  });

  const hours = createEmptyPoints("daily").map((point) => {
    const key = getKey(point);
    const value = map.get(key)?.seconds || 0;

    return { ...point, value: value };
  });

  const hourly = createEmptyPoints("daily").map((point) => {
    const key = getKey(point);
    const income = map.get(key)?.total.value || 0;
    const seconds = map.get(key)?.seconds || 0;

    const isValid = seconds > 0 && income > 0;

    const hourly = isValid ? income / (seconds / 3600) : 0;
    const rounded = currency(hourly).value;

    return { ...point, value: rounded };
  });

  const totalPayValues = createEmptyPoints("daily").map((point) => {
    const key = getKey(point);
    const total = map.get(key)?.total.value || 0;
    const pay = map.get(key)?.pay.value || 0;
    const bonus = map.get(key)?.bonus.value || 0;
    const tips = map.get(key)?.tips.value || 0;
    const fees = map.get(key)?.fees.value || 0;

    return { ...point, total, pay, bonus, tips, fees };
  });

  return {
    income: { ...base, type: "income", points: income },
    hours: { ...base, type: "hours", points: hours },
    hourly: { ...base, type: "hourly", points: hourly },
    totalPayValues,
  };
}

function filterActivities(activities: DataSet, startDate: Date) {
  const { totalPayValues, ...rest } = activities;
  const dataSets = Object.values(rest);

  const filteredTotalPayValues = totalPayValues.filter((val) => {
    const date = val.date instanceof Date ? val.date : parseISO(val.date);
    return isSameDay(date, startDate) || date > startDate;
  });

  const totalPayValuesSum = filteredTotalPayValues.reduce(
    (prev, curr) => {
      const gross = currency(curr.pay)
        .add(currency(curr.bonus))
        .add(currency(curr.tips));

      const net = gross.subtract(currency(curr.fees));

      return {
        total: prev.total.add(currency(curr.total)),
        pay: prev.pay.add(currency(curr.pay)),
        bonus: prev.bonus.add(currency(curr.bonus)),
        tips: prev.tips.add(currency(curr.commission)),
        fees: prev.fees.add(currency(curr.fees)),
        gross: prev.gross.add(gross),
        net: prev.net.add(net),
      };
    },
    {
      total: currency(0),
      pay: currency(0),
      bonus: currency(0),
      tips: currency(0),
      fees: currency(0),
      gross: currency(0),
      net: currency(0),
    }
  );

  const filteredDataSets = dataSets.map((dataSet) => {
    const index = dataSet.points.findIndex((point) => {
      const date = isValid(point.date)
        ? point.date
        : parseISO(point.date as string);

      return isSameDay(date as Date, startDate);
    });
    const filteredPoints: Point[] = dataSet.points
      .slice(index)
      .map((point) => ({
        ...point,
        date: isValid(point.date) ? point.date : parseISO(point.date as string),
      }));
    const type = dataSet.type;

    const weekChunks: Point[][] = split(filteredPoints, 7).filter(
      (chunk) => chunk.length === 7
    );
    const monthChunks: Point[][] = split(filteredPoints, 31).filter(
      (chunk) => chunk.length === 31
    );

    // precalculate all granularities
    const daily = filteredPoints;
    const weekly = weekChunks.map((chunk) => {
      const date = endOfWeek(new Date(chunk[0].date));
      let value;

      if (type === "hourly") {
        const average = mean(chunk.map((point) => point.value));
        value = Math.round((average + Number.EPSILON) * 100) / 100;
      } else {
        value = sum(chunk.map((point) => point.value));
      }

      return { date, value };
    });
    const monthly = monthChunks.map((chunk) => {
      const date = formatISO(endOfMonth(new Date(chunk[0].date)));
      let value;

      if (type === "hourly") {
        const average = mean(chunk.map((point) => point.value));
        value = Math.round((average + Number.EPSILON) * 100) / 100;
      } else {
        value = sum(chunk.map((point) => point.value));
      }
      return { date: new Date(date), value };
    });

    return { ...dataSet, rawPoints: filteredPoints, daily, weekly, monthly };
  });

  return { data: filteredDataSets, totalPaySum: totalPayValuesSum };
}

export function useData({ type, period, granularity }: getDataParams) {
  const [isRefetching, setIsRefetching] = useState(false);

  const queryClient = useQueryClient();

  const { data: accounts, isLoading: isAccountsLoading } = useAccounts({
    refetchInterval: isRefetching ? 2000 : false,
  });

  const isSynced = (account) =>
    account?.availability?.activities?.status === "synced" &&
    account?.availability?.payouts?.status === "synced";

  useEffect(() => {
    const syncedAccounts = accounts?.every(isSynced);

    if (!syncedAccounts && !isRefetching) {
      setIsRefetching(true);
    }

    if (syncedAccounts && isRefetching) {
      setIsRefetching(false);
    }
  }, [accounts, isRefetching]);

  const { data: activities, isLoading: isActivitiesLoading } = useActivities({
    enabled: !isRefetching,
  });
  const { data: payouts, isLoading: isPayoutsLoading } = usePayouts({
    enabled: !isRefetching,
  });

  if (
    !activities ||
    !activities?.length ||
    !payouts ||
    !payouts?.length ||
    isAccountsLoading ||
    isActivitiesLoading ||
    isPayoutsLoading
  ) {
    return { data: [], isLoading: true, isRefetching };
  }

  const data = {
    income: [],
    hours: [],
    hourly: [],
    totalPayValues: [],
  };

  const requestedStartDate = getStartDate(period);

  // itarete over accounts, figure out what `kind` of an account it is
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];

    if (
      account.link_item_details.kind === "employer" ||
      account.link_item_details.kind === "platform"
    ) {
      const accountPayouts = payouts.filter(
        (payout) => payout.account === account.id
      );

      if (accountPayouts.length === 0) {
        continue;
      }

      const transformedPayouts = transformPayouts(account, accountPayouts);

      const {
        data: [income, hours, hourly],
        totalPaySum,
      } = filterPayouts(transformedPayouts, requestedStartDate, granularity);

      data.income.push(income);
      data.hours.push(hours);
      data.hourly.push(hourly);
      data.totalPayValues.push(totalPaySum);
    } else {
      const accountActivities = activities.filter(
        (activity) => activity.account === account.id
      );

      const transformedActivities = transformActivities(
        account,
        accountActivities
      );

      const {
        data: [income, hours, hourly],
        totalPaySum,
      } = filterActivities(transformedActivities, requestedStartDate);

      data.income.push(income);
      data.hours.push(hours);
      data.hourly.push(hourly);
      data.totalPayValues.push(totalPaySum);
    }
  }

  const mergedData = {
    income: withTotal(data.income || [], granularity),
    hours: withTotal(data.hours || [], granularity),
    hourly: data.hourly,
    totalPay: data.totalPayValues,
  };

  const requestedDataType = mergedData[type];

  const filtered = requestedDataType.map((account) => {
    const { daily, weekly, monthly, ...rest } = account;

    return { ...rest, points: account[granularity] };
  });

  return { data: filtered, isLoading: false, isRefetching };
}
