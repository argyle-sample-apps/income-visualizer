import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const fetchActivities = async () => {
  const { data } = await axios.get(`/api/activities`);

  return data;
};

export function useActivities({ enabled }) {
  return useQuery(["activities"], fetchActivities, { enabled });
}
