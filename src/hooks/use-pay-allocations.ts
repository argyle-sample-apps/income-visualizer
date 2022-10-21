import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { PayAllocation } from "models/pay-allocation";
import { Account } from "models/account";
import groupBy from "just-group-by";

const fetchPayAllocations = async () => {
  const { data: payAllocations } = await axios.get<PayAllocation[]>(
    `/api/pay-allocations`
  );
  const { data: accounts } = await axios.get<Account[]>(`/api/accounts`);

  const connected = accounts?.filter(
    (account) => account.was_connected && account.status !== "error"
  );

  const groupedAllocations = groupBy(payAllocations, (a) => a.account);

  const merged = connected.map((account) => {
    const allocations = Object.values(groupedAllocations?.[account.id]) || [];

    return {
      allocations: [...allocations],
      account: { ...account },
    };
  });

  return merged;
};

export function usePayAllocations() {
  return useQuery(["pay-allocations"], fetchPayAllocations);
}
