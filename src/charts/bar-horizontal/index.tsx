import { useMemo } from "react";
import { Bar } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { Paragraph } from "components/typography";
import { formatCurrency, formatPercent } from "utils/format";

export type BarHorizontalProps = {
  width: number;
  data: {
    key: string;
    label: string;
    color: string;
    value: number;
    percentage: number;
  }[];
};

export const BarHorizontal = ({ width, data }: BarHorizontalProps) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, width],
        round: true,
        domain: [0, maxValue],
      }),
    [width, maxValue]
  );

  return (
    <div>
      {data.map((d) => {
        const barHeight = 1.5;
        const barWidth = xScale(d.value);

        const percentage = formatPercent(d.percentage || 0);
        const value = formatCurrency(d.value);

        return (
          <div key={d.key} className="mb-4">
            <div className="mb-2 flex space-x-3">
              <Paragraph className="!text-gray-darkest">{d.label}</Paragraph>
              <Paragraph className="!text-gray-darkest opacity-60">
                {value}
              </Paragraph>
              <Paragraph>{percentage}</Paragraph>
            </div>
            <svg width={width} height={barHeight}>
              <Bar width={barWidth} height={barHeight} fill={d.color} />
            </svg>
          </div>
        );
      })}
    </div>
  );
};
