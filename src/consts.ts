export const BASE_PATH = "/income-visualizer";
export const COLORS = ["#696EE3", "#FED88A", "#BAE6F0", "#B6E6B8", "#DFE795"];
export const ACCOUNT_FILTER_ALL = "all";

export type PeriodId =
  | "all"
  | "ytd"
  | "mtd"
  | "wtd"
  | "last12m"
  | "last3m"
  | "last4w"
  | "last7d";

export type Period = {
  id: PeriodId;
  label: string;
};

export const PERIODS: Period[] = [
  { id: "ytd", label: "Current year" },
  { id: "mtd", label: "Current month" },
  { id: "wtd", label: "Current week" },
  { id: "last12m", label: "Last 12 months" },
  { id: "last3m", label: "Last 3 months" },
  { id: "last4w", label: "Last 4 weeks" },
  { id: "last7d", label: "Last 7 days" },
];
