import { Debug } from "components/debug";
import { useData } from "hooks/use-data";

export default function DataIncome() {
  const { data: income } = useData({
    type: "income",
    period: "last7d",
    granularity: "daily",
  });
  const { data: hours } = useData({
    type: "hours",
    period: "last7d",
    granularity: "daily",
  });
  return (
    <div className="flex space-x-2">
      <div className="flex-1">
        <div className="font-bold">incme</div>
        <Debug>{income}</Debug>
      </div>
      <div className="flex-1">
        <div className="font-bold">hours</div>
        <Debug>{hours}</Debug>
      </div>
    </div>
  );
}
