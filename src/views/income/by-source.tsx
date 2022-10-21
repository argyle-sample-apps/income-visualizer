import { Donut } from "charts/donut";
import { Heading } from "components/typography";
import { BarHorizontal } from "charts/bar-horizontal";
import { getPercentage } from "utils/general";
import { useAtomValue } from "jotai";
import { selectedPeriodAtom } from "stores/global";
import { useData } from "hooks/use-data";
import { ChartLoader } from "components/loader";

function getIncomeBySource(data) {
  const [_, ...accounts] = data;
  const result = accounts.map((account) => {
    const totalForAccount = account.rawPoints.reduce(
      (acc, point) => acc + point.value,
      0
    );

    return {
      key: account.accountId,
      label: account.name,
      color: account.color,
      value: totalForAccount,
    };
  });

  const totalForAll = result.reduce((acc, val) => acc + val.value, 0);

  return result.map((source) => ({
    ...source,
    percentage: getPercentage(source.value, totalForAll),
  }));
}

export const IncomeBySource = () => {
  const selectedPeriod = useAtomValue(selectedPeriodAtom);

  const { data, isLoading } = useData({
    type: "income",
    period: selectedPeriod,
    granularity: "daily",
  });

  const sources = getIncomeBySource(data);

  return (
    <section className="mb-12 mt-12 px-4">
      <Heading className="mb-5">By income source</Heading>
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <ChartLoader />
          </div>
        ) : (
          <div className="flex justify-between">
            <BarHorizontal width={220} data={sources} />
            <Donut width={60} height={60} data={sources} />
          </div>
        )}
      </div>
    </section>
  );
};
