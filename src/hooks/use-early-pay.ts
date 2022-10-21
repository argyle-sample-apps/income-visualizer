import qs from "qs";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

type Decision = {
  approved: boolean;
  durations: number[];
  monthly: number;
  combined: {
    initial: number;
    daily: number;
  };
  criteria: {
    duration: boolean;
    pay: boolean;
  };
  payouts: Record<string, { initial: number; daily: number }>;
};

type useEarlyPayProps = {
  activeAccounts: string[];
};

const fetchEarlyPayDecision = async (params: string) => {
  const { data } = await axios.get<Decision>(`/api/early?${params}`);

  return data;
};

export function useEarlyPay({ activeAccounts }: useEarlyPayProps) {
  const params = qs.stringify({ a: activeAccounts });

  return useQuery(["early-pay"], () => fetchEarlyPayDecision(params), {
    useErrorBoundary: true,
    refetchOnWindowFocus: false,
    retry: true,
  });
}
