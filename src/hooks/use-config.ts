import { getCookie, setCookies } from "cookies-next";

type Config = {
  pay: number;
  duration: number;
  pay_cycle: "month" | "week";
  duration_cycle: "month" | "week";
};

const defaultConfig: Config = {
  pay: 500,
  duration: 6,
  pay_cycle: "month",
  duration_cycle: "month",
};

export function useConfig() {
  const cookie = getCookie("argyle-x-session");

  if (!cookie) {
    const stringified = JSON.stringify(defaultConfig);

    setCookies("argyle-x-session", stringified, { maxAge: 60 * 60 * 24 });

    return defaultConfig;
  }

  const parsed = JSON.parse(cookie as string);

  return parsed;
}
