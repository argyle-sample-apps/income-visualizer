import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { AnimatedPie } from "./pie";

export type DonutProps = {
  width: number;
  height: number;
  animate?: boolean;
  data: {
    key: string;
    label: string;
    color: string;
    value: number;
    percentage: number;
  }[];
};

export function Donut({ width, height, animate = true, data }: DonutProps) {
  const radius = Math.min(width, height) / 2;
  const centerY = height / 2;
  const centerX = width / 2;

  return (
    <svg width={width} height={height} className="">
      <Group top={centerY} left={centerX}>
        <Pie data={data} pieValue={(d) => d.value} outerRadius={radius}>
          {(pie) => (
            <AnimatedPie
              {...pie}
              animate={animate}
              getKey={(arc) => arc.data.label}
              getColor={(arc) => arc.data.color}
            />
          )}
        </Pie>
      </Group>
    </svg>
  );
}
