import { Fragment } from "react";
import { addDays, format } from "date-fns";
import { useAtomValue } from "jotai";
import { GranularityId, selectedGranularityAtom } from "stores/global";

type LinesSummaryProps = {
  selectedDate: Date;
  summary: any;
};

function getFormattedDate(date: Date, granularity: GranularityId): string {
  switch (granularity) {
    case "daily":
      return format(date, "MMM d");

    case "weekly":
      const start = format(date, "MMM d");
      const end = format(addDays(date, 6), "MMM d");
      const year = format(date, "yyyy");

      const startYear = format(date, "yyyy");
      const endYear = format(addDays(date, 6), "yyyy");

      if (startYear !== endYear) {
        return `${start}, ${startYear} - ${end}, ${endYear}`;
      }

      return `${start} - ${end}, ${year}`;

    case "monthly":
      return format(date, "MMM yyyy");
    default:
      return format(date, "MMM d");
  }
}

export const LinesSummary = ({
  selectedDate,
  summary = [],
}: LinesSummaryProps) => {
  const selectedGranularity = useAtomValue(selectedGranularityAtom);

  return (
    <div className="my-4 flex justify-between">
      <div className="text-sm">
        {selectedDate && getFormattedDate(selectedDate, selectedGranularity)}
      </div>
      <div className="grid grid-cols-summary gap-y-1">
        {summary.map((account) => (
          <Fragment key={account.accountId}>
            <span className="mr-3 whitespace-nowrap text-right text-sm tabular-nums">
              {account.total}
            </span>
            <div className="flex items-center justify-center">
              <span
                className="mr-1.5 block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: account.color }}
              />
            </div>
            <span className="whitespace-nowrap text-sm text-gray">
              {account.name}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
