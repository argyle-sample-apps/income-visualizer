import axios, { AxiosRequestConfig } from "axios";
import { PERIODS } from "consts";

export function isStandaloneMode() {
  if (typeof window !== "undefined") {
    if (
      // @ts-ignore
      window.navigator.standalone ||
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export function getPercentage(value: number, total: number) {
  return (value / total) * 100;
}

export function normalizeByKey(arr: any[], key: string) {
  const normalized = arr.reduce((acc, val) => {
    return {
      ...acc,
      [val[key]]: val,
    };
  }, {});

  return normalized;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getMonthsList() {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
}

export function getPeriodLabel(id) {
  return PERIODS.find((period) => period.id === id)?.label;
}

// fetch all results using pagination
export async function fetchAll<T>(
  url: string,
  config: AxiosRequestConfig
): Promise<T[]> {
  const fetch = async (url: string) => {
    const response = await axios.get<{ next: string | null; results: T[] }>(
      url,
      config
    );
    return response.data;
  };

  let data = await fetch(url);
  let results: T[] = [...data.results];

  while (data.next) {
    data = await fetch(data.next);
    results = [...results, ...data.results];
  }

  return results;
}
