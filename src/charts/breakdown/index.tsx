import clsx from "clsx";
import { Tooltip } from "@material-tailwind/react";
import { formatCurrency } from "utils/format";

const TooltipContent = ({
  title,
  value,
  barWidthPercentage,
}: {
  title: string;
  value: number;
  barWidthPercentage: number;
}) => {
  return (
    <div>
      <div
        className={clsx(
          "h-[10px] w-px bg-gray-T10",
          barWidthPercentage < 5 ? "ml-1" : "ml-4"
        )}
      ></div>
      <p className="my-0 p-0 text-xs text-gray-darkest opacity-40">{title}</p>
      <p className="my-0 p-0 text-xs text-gray-darkest">
        {formatCurrency(value)}
      </p>
    </div>
  );
};

export const HorizontalBreakdownBar = ({
  data,
  theme,
  title,
  total,
}: {
  data: { key: string; value: number }[];
  theme: string;
  title: string;
  total: string | number;
}) => {
  const totalBarWidth = data.reduce((n, { value }) => n + value, 0);

  const sortedData = data.sort((a, b) => {
    return b.value - a.value;
  });

  return (
    <div className="box-border h-[123px]">
      <div className="flex pb-3 pt-3">
        <p className="mr-4 text-sm text-gray-darkest">{title}</p>
        <p className="text-sm text-gray-darkest opacity-60">
          {formatCurrency(total)}
        </p>
      </div>
      <div className="flex h-[20px]">
        {sortedData.map(({ key, value }, i) => {
          const barWidthPercentage = (100 * value) / totalBarWidth || 0;
          const barWidthStyle = `calc(${barWidthPercentage}% - 1px)`;
          return (
            <Tooltip
              content={
                <TooltipContent
                  title={key}
                  value={value}
                  barWidthPercentage={barWidthPercentage}
                />
              }
              key={i}
              placement="bottom-start"
              className="p-1"
              offset={{
                alignmentAxis: -5,
              }}
            >
              <div
                key={i}
                style={{ width: barWidthStyle }}
                className={clsx(
                  "relative mr-[1px] inline-block h-[20px] bg-cyan-light duration-300 hover:bg-cyan-dark",
                  theme === "green"
                    ? "bg-gray-light first-of-type:bg-green hover:bg-gray"
                    : "bg-cyan-light hover:bg-cyan-dark"
                )}
              />
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
