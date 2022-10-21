import { useAtomValue } from "jotai";
import { selectedGranularityAtom, selectedPeriodAtom } from "stores/global";
import { Heading } from "components/typography";
import { LinesChartWithTooltip } from "charts/lines";
import { Splitter } from "components/splitter";
import { InlineButton } from "components/button";
import { AddSmallIcon } from "components/icons";
import { ArgyleLink } from "components/argyle-link";
import { useEffect, useState } from "react";
import { ChartLoader, Loader } from "components/loader";
import { useData } from "hooks/use-data";

export function IncomeMain() {
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkInstance, setLinkInstance] = useState<any>();

  const handleLinkOpen = () => {
    if (!linkInstance) {
      return setLinkLoading(true);
    }

    linkInstance.open();
  };

  useEffect(() => {
    if (linkInstance && linkLoading === true) {
      setLinkLoading(false);
      linkInstance.open();
    }
  }, [linkLoading, linkInstance]);

  const selectedPeriod = useAtomValue(selectedPeriodAtom);
  const selectedGranularity = useAtomValue(selectedGranularityAtom);

  const { data, isLoading } = useData({
    type: "income",
    period: selectedPeriod,
    granularity: selectedGranularity,
  });

  return (
    <section className="px-4">
      <ArgyleLink
        onClose={() => {}}
        onLinkInit={(link) => {
          setLinkInstance(link);
        }}
      />
      <Heading className="mb-5">My income</Heading>
      <Splitter />
      {isLoading ? (
        <ChartLoader />
      ) : (
        <LinesChartWithTooltip
          width={339}
          height={140}
          data={data}
          type="currency"
        />
      )}
      <div>
        <InlineButton onClick={handleLinkOpen}>
          <div className="flex items-center space-x-1">
            <span>
              <AddSmallIcon />
            </span>
            <span className="text-sm text-purple">Add an account</span>
          </div>
        </InlineButton>
      </div>
    </section>
  );
}
