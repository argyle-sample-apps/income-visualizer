import clsx from "clsx";

type SplitterProps = {
  className?: string;
  color?: string;
};

export const Splitter = ({ className, color }: SplitterProps) => {
  return (
    <div
      className={clsx("flex h-px", className, color ? color : "bg-gray-T08")}
    />
  );
};
