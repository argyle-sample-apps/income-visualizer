import React from "react";
import { BarStack } from "@visx/shape";
import { Group } from "@visx/group";
import { AxisBottom } from "@visx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { formatCurrency } from "utils/format";

type IncomeSet = {
  [key: string]: number | string;
  label: string;
};

type TooltipData = any;

export type BarStackProps = {
  width: number;
  height: number;
  data: any;
};

export function BarStackChart({ width, height, data }: BarStackProps) {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<TooltipData>();

  const keys = Object.keys(data[0]).filter((key) => key !== "label");
  const colors = Object.values(data[0])
    .filter((_, i) => i > 0)
    .map((item: any) => item.color);
  const values = data.map((d: any) =>
    keys.reduce(
      (acc, key) => ({
        ...acc,
        [key]: d[key].value,
      }),
      { label: d.label }
    )
  );

  const totals = data.map((d: any) => {
    let total = 0;
    Object.keys(d)
      .filter((key) => key !== "label")
      .forEach((key) => {
        total += d[key].value;
      });

    return total;
  });

  // accessors
  const getLabel = (d: IncomeSet) => d.label;

  const xMax = width;
  const yMax = height - 50;

  // scales
  const xScale = scaleBand<string>({
    domain: data.map(getLabel),
    padding: 0.2,
    range: [0, xMax],
    round: true,
    paddingInner: 0.6,
    paddingOuter: 0.6,
  });
  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...totals)],
    nice: true,
    range: [yMax, 0],
  });
  const colorScale = scaleOrdinal<string, string>({
    domain: keys,
    range: colors,
  });

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  return (
    <div>
      <svg ref={containerRef} width={width} height={height}>
        <Group>
          <BarStack
            data={values}
            keys={keys}
            x={getLabel}
            xScale={xScale}
            yScale={yScale}
            color={colorScale}
          >
            {(barStacks) => {
              return barStacks.map((barStack, i) =>
                barStack.bars.map((bar) => {
                  return (
                    <rect
                      key={`bar-stack-${barStack.index}-${bar.index}`}
                      x={bar.x}
                      y={bar.y}
                      height={bar.height}
                      width={bar.width}
                      fill={bar.color}
                      onMouseLeave={() => {
                        hideTooltip();
                      }}
                      onMouseMove={(event) => {
                        // TooltipInPortal expects coordinates to be relative to containerRef
                        // localPoint returns coordinates relative to the nearest SVG, which
                        // is what containerRef is set to in this example.
                        const eventSvgCoords = localPoint(event);
                        const left = bar.x + bar.width / 2;
                        showTooltip({
                          tooltipData: data[bar.index],
                          tooltipTop: eventSvgCoords?.y,
                          tooltipLeft: left,
                        });
                      }}
                    />
                  );
                })
              );
            }}
          </BarStack>
        </Group>
        <AxisBottom
          top={yMax}
          scale={xScale}
          stroke="#313439"
          tickStroke="#313439"
          tickLabelProps={() => ({
            fill: "#313439",
            fontSize: 11,
            textAnchor: "middle",
          })}
        />
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{ position: "absolute" }}
        >
          <div className="space-y-0.5 rounded-md bg-gray-100 px-3 py-1">
            {Object.entries(tooltipData)
              .filter(([key, value]: any) => key !== "label")
              .map(([key, value]: any) => (
                <div key={key} className="flex items-center space-x-2">
                  <span
                    className="block h-2 w-2 rounded-full"
                    style={{ backgroundColor: value.color }}
                  ></span>
                  <span className="text-sm">{formatCurrency(value.value)}</span>
                </div>
              ))}
            <div className="text-sm text-gray">{tooltipData.label}</div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
