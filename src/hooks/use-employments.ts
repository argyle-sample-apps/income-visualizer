import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Employment } from "models/employment";

const fetchEmployments = async () => {
  const { data } = await axios.get<Employment[]>(`/api/employments`);

  return data;
};

export function useEmployments() {
  return useQuery(["employments"], fetchEmployments);
}
