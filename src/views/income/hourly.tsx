import { Heading } from "components/typography";
import { LinesChartWithTooltip } from "charts/lines";
import { Splitter } from "components/splitter";
import { useAtomValue } from "jotai";
import { selectedGranularityAtom, selectedPeriodAtom } from "stores/global";
import { useData } from "hooks/use-data";
import { ChartLoader } from "components/loader";

export function IncomeHourly() {
  const selectedPeriod = useAtomValue(selectedPeriodAtom);
  const selectedGranularity = useAtomValue(selectedGranularityAtom);
  const { data, isLoading } = useData({
    type: "hourly",
    period: selectedPeriod,
    granularity: selectedGranularity,
  });

  return (
    <section className="mb-12 px-4">
      <Heading className="mb-3">Hourly rate</Heading>
      <Splitter />
      {isLoading ? (
        <ChartLoader />
      ) : (
        <LinesChartWithTooltip
          width={339}
          height={140}
          data={data}
          type="currency"
          calculation="average"
        />
      )}
    </section>
  );
}
