import clsx from "clsx";
import splitAt from "just-split-at";
import { BottomSheet } from "components/bottom-sheet";
import { InlineButton } from "components/button";
import { Splitter } from "components/splitter";
import { useAtom } from "jotai";
import { selectedPeriodAtom } from "stores/global";
import { PERIODS } from "consts";

type IncomeFilteringProps = {
  isOpen: boolean;
  onClose: () => void;
};

const [top, bottom] = splitAt(PERIODS, 3);

export function IncomeFiltering({ isOpen, onClose }: IncomeFilteringProps) {
  const [selectedPeriod, setSelectedPeriod] = useAtom(selectedPeriodAtom);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="mb-4 space-y-4">
        {top.map((period) => (
          <InlineButton
            key={period.id}
            onClick={() => setSelectedPeriod(period.id)}
            className={clsx(
              selectedPeriod === period.id
                ? "!text-gray-darkest"
                : "!text-gray",
              "text-paragraph text-gray"
            )}
          >
            {period.label}
          </InlineButton>
        ))}
      </div>
      <Splitter className="mt-4" />
      <div className="my-4 space-y-4">
        {bottom.map((period) => (
          <InlineButton
            key={period.id}
            onClick={() => setSelectedPeriod(period.id)}
            className={clsx(
              selectedPeriod === period.id
                ? "!text-gray-darkest"
                : "!text-gray",
              "text-paragraph text-gray"
            )}
          >
            {period.label}
          </InlineButton>
        ))}
      </div>
      <Splitter className="mt-4" />
      <div className="mt-4">
        <InlineButton onClick={onClose} className="!text-purple">
          Done
        </InlineButton>
      </div>
    </BottomSheet>
  );
}
