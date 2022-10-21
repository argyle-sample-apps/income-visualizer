import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Account } from "models/account";
import { COLORS } from "consts";

function withColors(accounts: Account[]) {
  return accounts?.reverse().map((account, index) => ({
    ...account,
    color: COLORS[index],
  }));
}

const fetchAccounts = async () => {
  const { data } = await axios.get<Account[]>(`/api/accounts`);

  const connected = data?.filter(
    (account) => account.was_connected && account.status !== "error"
  );

  return withColors(connected);
};

export function useAccounts({ refetchInterval }) {
  return useQuery(["accounts"], fetchAccounts, { refetchInterval });
}
