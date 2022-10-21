import { PillButton } from "components/button";
import { SmallChevronDown } from "components/icons";
import { PeriodId } from "consts";
import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { selectedGranularityAtom, selectedPeriodAtom } from "stores/global";
import { getPeriodLabel } from "utils/general";

type DatePickerProps = {
  onClick: () => void;
};

type GranularityButtonsProps = {
  period: PeriodId;
};

const monthlyWeekly = ["ytd", "last12m", "last3m"];
const weeklyDaily = ["mtd", "last4w"];
const daily = ["wtd", "last7d"];

const GranularityButtons = ({ period }: GranularityButtonsProps) => {
  const selectedPeriod = useAtomValue(selectedPeriodAtom);
  const [selectedGranularity, setSelectedGranularity] = useAtom(
    selectedGranularityAtom
  );

  useEffect(() => {
    const isWeeklyDaily = weeklyDaily.includes(selectedPeriod);
    const isMonthlyWeekly = monthlyWeekly.includes(selectedPeriod);
    const isDaily = daily.includes(selectedPeriod);

    if (isWeeklyDaily && selectedGranularity === "monthly") {
      setSelectedGranularity("weekly");
    }

    if (isMonthlyWeekly && selectedGranularity === "daily") {
      setSelectedGranularity("weekly");
    }

    if (
      isDaily &&
      (selectedGranularity === "weekly" || selectedGranularity === "monthly")
    ) {
      setSelectedGranularity("daily");
    }
  }, [selectedPeriod, selectedGranularity, setSelectedGranularity]);

  if (monthlyWeekly.includes(period)) {
    return (
      <>
        <PillButton
          hasBackground={selectedGranularity === "monthly"}
          onClick={() => setSelectedGranularity("monthly")}
        >
          Monthly
        </PillButton>
        <PillButton
          hasBackground={selectedGranularity === "weekly"}
          onClick={() => setSelectedGranularity("weekly")}
        >
          Weekly
        </PillButton>
      </>
    );
  }

  if (weeklyDaily.includes(period)) {
    return (
      <>
        <PillButton
          hasBackground={selectedGranularity === "weekly"}
          onClick={() => setSelectedGranularity("weekly")}
        >
          Weekly
        </PillButton>
        <PillButton
          hasBackground={selectedGranularity === "daily"}
          onClick={() => setSelectedGranularity("daily")}
        >
          Daily
        </PillButton>
      </>
    );
  }

  if (daily.includes(period)) {
    return (
      <>
        <PillButton
          hasBackground={selectedGranularity === "daily"}
          onClick={() => setSelectedGranularity("daily")}
        >
          Daily
        </PillButton>
      </>
    );
  }

  return null;
};

export const DatePicker = ({ onClick }: DatePickerProps) => {
  const selectedPeriod = useAtomValue(selectedPeriodAtom);
  const label = getPeriodLabel(selectedPeriod);

  return (
    <div className="flex justify-between">
      <div className="flex">
        <GranularityButtons period={selectedPeriod} />
      </div>
      <PillButton
        hasBackground
        onClick={onClick}
        rightIcon={
          <span>
            <SmallChevronDown />
          </span>
        }
      >
        {label}
      </PillButton>
    </div>
  );
};
