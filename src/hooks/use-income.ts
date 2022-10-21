import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Income } from "models/income";

const fetchIncome = async (year: number) => {
  const { data } = await axios.get<Income>(`/api/income/${year}`);

  return data;
};

export function useIncome({ year }: { year: number }) {
  return useQuery(["income", year], () => fetchIncome(year));
}
