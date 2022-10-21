import clsx from "clsx";
import { useInView } from "react-intersection-observer";
import { useSetAtom } from "jotai";
import { DatePicker } from "components/date-picker";
import { datePickerOpenAtom } from "stores/global";

export const Topbar = () => {
  // Using IntersectionObserver to detect when
  // the "sticky" element becomes pinned due to scroll.
  //
  // https://davidwalsh.name/detect-sticky

  const { ref, inView, entry } = useInView({ threshold: 1 });
  const setIsOpen = useSetAtom(datePickerOpenAtom);

  return (
    <div
      ref={ref}
      className={clsx("sticky -top-px z-10 space-y-4 bg-white py-4 px-4", {
        "border-b": entry && !inView,
      })}
    >
      <DatePicker onClick={() => setIsOpen(true)} />
    </div>
  );
};
