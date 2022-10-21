import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Profile } from "models/profile";

const fetchProfile = async () => {
  const { data } = await axios.get<Profile>(`/api/profile`);

  return data;
};

export function useProfile() {
  return useQuery(["profile"], fetchProfile, { keepPreviousData: true });
}
