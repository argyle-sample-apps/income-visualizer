import { formatISO, parseISO } from "date-fns";
import { useEmployments } from "hooks/use-employments";
import { DataPoint } from "components/data-point";
import { Subheading } from "components/typography";
import { useAccounts } from "hooks/use-accounts";
import { Account } from "models/account";
import { usePayouts } from "hooks/use-payouts";
import { formatCurrency } from "utils/format";

export const IncomeSourcesList = () => {
  const {
    data: payouts,
    isLoading: isPayoutsLoading,
    isError: isPayoutsError,
  } = usePayouts({ enabled: true });
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    isError: isAccountsError,
  } = useAccounts({ refetchInterval: false });
  const {
    data: employments,
    isLoading: isEmploymentsLoading,
    isError: isEmploymentsError,
  } = useEmployments();

  if (isEmploymentsLoading || isAccountsLoading || isPayoutsLoading) {
    return <div>Loading...</div>;
  }

  if (isEmploymentsError || isAccountsError || isPayoutsError) {
    return <div>Error...</div>;
  }

  return (
    <div className="mt-4">
      <div className="w-2/3">
        <Subheading>Income sources</Subheading>
      </div>
      {employments.map((employment, i) => {
        const account = accounts?.[i] as Account;

        let amount;
        let period;
        let startDate: string;

        if (employment.base_pay.amount) {
          amount = employment.base_pay.amount;
          period = employment.base_pay.period;
          startDate = employment.hire_datetime;
        } else {
          const amountFromPayouts = payouts
            .filter((payout) => payout.account === account.id)
            .reduce((acc: number, val: any) => {
              return acc + Number(val.gross_pay);
            }, 0);

          amount = amountFromPayouts;
          period = "monthly";
          startDate = account.availability.activities.available_from;
        }

        const startDateFormatted = formatISO(parseISO(startDate), {
          representation: "date",
        });

        const linkItem = account.link_item_details;

        return (
          <div key={employment.id} className="mt-4">
            <div className="flex items-center">
              <img
                className="mr-2 h-6 w-6 rounded-full"
                src={linkItem.logo_url}
                alt={linkItem.name}
              />
              <Subheading>{linkItem.name}</Subheading>
            </div>
            <div className="mt-4 flex gap-x-12">
              <DataPoint label="Start date" value={startDateFormatted} />
              <DataPoint
                label="Average pay"
                value={`${formatCurrency(amount)} ${period}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
