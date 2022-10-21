import type { NextApiRequest, NextApiResponse } from "next";
import { getCookie } from "cookies-next";
import qs from "qs";
import { getAuthOpts } from "utils/auth";
import {
  parseISO,
  formatISO,
  subMonths,
  startOfMonth,
  differenceInMonths,
  getDate,
  getDaysInMonth,
} from "date-fns";
import { BasePay } from "models/base-pay";
import axios from "axios";
import { z } from "zod";
import { Account } from "models/account";
import { Employment } from "models/employment";
import { Payout } from "models/payout";

async function getEmployments(userId: string): Promise<Employment[]> {
  const { headers } = getAuthOpts();

  const params = {
    user: userId,
  };

  const { data } = await axios.get("/employments", {
    baseURL: process.env.NEXT_PUBLIC_ARGYLE_BASE_URL,
    headers,
    params,
  });

  return data.results;
}

async function getPayouts(userId: string): Promise<Payout[]> {
  const sixMonthsAgo = subMonths(new Date(), 6);
  const fromStartDate = formatISO(startOfMonth(sixMonthsAgo), {
    representation: "date",
  });
  const toStartDate = formatISO(new Date(), {
    representation: "date",
  });

  const { headers } = getAuthOpts();

  const params = {
    user: userId,
    from_start_date: fromStartDate,
    to_start_date: toStartDate,
  };

  const { data } = await axios.get("/payouts", {
    baseURL: process.env.NEXT_PUBLIC_ARGYLE_BASE_URL,
    headers,
    params,
  });

  return data.results;
}

export async function getLinkItem(linkItemId: string) {
  const { headers } = getAuthOpts();

  const { data } = await axios.get("/link-items/" + linkItemId, {
    baseURL: process.env.NEXT_PUBLIC_ARGYLE_BASE_URL,
    headers,
  });

  return data;
}

export async function getAccounts(userId: string): Promise<Account[]> {
  const { headers } = getAuthOpts();

  const params = {
    user: userId,
  };

  const { data } = await axios.get("/accounts", {
    baseURL: process.env.NEXT_PUBLIC_ARGYLE_BASE_URL,
    headers,
    params,
  });

  const connected = data.results.filter(
    (account: any) => account.was_connected && account.status !== "error"
  );

  return connected;
}

function getPayoutAmounts(monthly: number) {
  const today = new Date();
  const factorOfPayCycle = getDate(today) / getDaysInMonth(today);
  const initialPayout = factorOfPayCycle * monthly;
  const dailyPayout = monthly / getDaysInMonth(today);

  return {
    initial: initialPayout,
    daily: dailyPayout,
  };
}

export function toMonthlyPay(pay: BasePay) {
  const { period, amount } = pay;
  const decimal = Number(amount);

  if (period === "hourly") {
    return decimal * 20 * 8;
  }
  if (period === "weekly") {
    return decimal * 4;
  }
  if (period === "biweekly") {
    return decimal * 2;
  }
  if (period === "semimonthly") {
    return decimal * 2;
  }
  if (period === "monthly") {
    return decimal;
  }
  if (period === "annual") {
    return decimal / 12;
  }
  return decimal;
}

function getNormalizedConfig(config: any) {
  const normalized = { ...config };

  if (config.pay_cycle === "week") {
    normalized.pay = config.pay * 4;
  }
  if (config.duration_cycle === "week") {
    normalized.duration = config.duration / 4;
  }

  return normalized;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { userId } = z
      .object({
        userId: z.string(),
      })
      .parse(req.query);

    const { a } = qs.parse(req.query as any);
    const activeAccounts = (a as string[]) || [];

    const cookie = getCookie("argyle-x-session", { req, res }) as string;

    const rawConfig = JSON.parse(cookie);
    const config = getNormalizedConfig(rawConfig);

    const accounts = await getAccounts(userId);
    const userEmployments = await getEmployments(userId);
    const userPayouts = await getPayouts(userId);

    if (
      !accounts ||
      !userEmployments ||
      !userPayouts ||
      !accounts.length ||
      !userEmployments.length ||
      !userPayouts.length
    ) {
      return res.status(503).json({ error: "Please retry later" });
    }

    type Data = {
      monthly: number;
      durations: any[];
      combined: {
        initial: number;
        daily: number;
      };
      payouts: any;
      criteria: {
        duration: boolean;
        pay: boolean;
      };
    };

    const data: Data = {
      monthly: 0,
      durations: [],
      combined: {
        initial: 0,
        daily: 0,
      },
      payouts: {},
      criteria: {
        duration: false,
        pay: false,
      },
    };

    const isActive = (account: Account) => activeAccounts.includes(account.id);

    const linkItems = await Promise.all(
      accounts.map((account) => {
        return getLinkItem(account.link_item);
      })
    );

    accounts.forEach((account) => {
      const linkItem = linkItems.find((li) => li.id === account.link_item);
      const employment = userEmployments.find(
        (ue) => ue.account === account.id
      ) as Employment;
      const payouts = userPayouts.filter((up) => up.account === account.id);

      if (linkItem.kind === "employer" || linkItem.kind === "platform") {
        const hireDate = parseISO(employment.hire_datetime);
        const duration = differenceInMonths(new Date(), hireDate);

        const pay = employment.base_pay;
        const monthly = toMonthlyPay(pay);
        const payoutAmounts = getPayoutAmounts(monthly);

        data.monthly += monthly;
        data.durations.push(duration);
        data.payouts[account.id] = payoutAmounts;

        if (!isActive(account)) {
          data.combined.initial += payoutAmounts.initial;
          data.combined.daily += payoutAmounts.daily;
        }
      } else {
        const startDate = parseISO(
          account.availability.activities.available_from
        );
        const duration = differenceInMonths(new Date(), startDate);

        const amountFromPayouts = payouts.reduce((acc: number, val: any) => {
          return acc + Number(val.gross_pay);
        }, 0);

        const pay = {
          amount: String(amountFromPayouts),
          period: "monthly",
          currency: "USD",
        };

        const monthly = toMonthlyPay(pay);
        const payoutAmounts = getPayoutAmounts(monthly);

        data.monthly += monthly;
        data.durations.push(duration);
        data.payouts[account.id] = payoutAmounts;
        if (!isActive(account)) {
          data.combined.initial += payoutAmounts.initial;
          data.combined.daily += payoutAmounts.daily;
        }
      }
    });

    const isLongEnough = (duration: any) => duration > config.duration;
    if (data.durations.some(isLongEnough)) {
      data.criteria.duration = true;
    }

    if (data.monthly > config.pay) {
      data.criteria.pay = true;
    }

    if (data.criteria.duration && data.criteria.pay) {
      return res.json({
        approved: true,
        ...data,
      });
    } else {
      return res.json({
        approved: false,
        ...data,
      });
    }
  } catch (error) {
    res.status(400).json(error);
  }
}
