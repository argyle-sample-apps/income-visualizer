import clsx from "clsx";
import { useAtomValue } from "jotai";
import { selectedGranularityAtom, selectedPeriodAtom } from "stores/global";
import { useData } from "hooks/use-data";

export const Notification = () => {
  const selectedPeriod = useAtomValue(selectedPeriodAtom);
  const selectedGranularity = useAtomValue(selectedGranularityAtom);

  const { isLoading, isRefetching } = useData({
    type: "income",
    period: selectedPeriod,
    granularity: selectedGranularity,
  });

  const showLoader = !isLoading && isRefetching;

  return (
    <div
      className={clsx(
        "absolute bottom-0 z-10 flex w-full justify-center bg-blue-100 transition-transform delay-1000",
        { "translate-y-12": !showLoader }
      )}
    >
      <div className="flex items-center space-x-2 py-3">
        <span className="block h-2 w-2 animate-ping rounded-full bg-blue-500"></span>
        <span className="font-medium text-blue-500">Fetching more data...</span>
      </div>
    </div>
  );
};
