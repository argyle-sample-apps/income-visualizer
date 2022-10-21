import { Heading } from "components/typography";
import { HorizontalBreakdownBar } from "charts/breakdown";
import { Splitter } from "components/splitter";
import { useAtomValue } from "jotai";
import { selectedPeriodAtom } from "stores/global";
import { useData } from "hooks/use-data";
import currency from "currency.js";
import { ChartLoader } from "components/loader";

export function IncomeTotal() {
  const selectedPeriod = useAtomValue(selectedPeriodAtom);

  const { data, isLoading } = useData({
    type: "totalPay",
    period: selectedPeriod,
    granularity: "daily",
  });

  if (isLoading) {
    return null;
  }

  const totalPay = data.reduce(
    (prev, curr) => {
      return {
        base: prev.base.add(curr.base),
        bonus: prev.bonus.add(curr.bonus),
        commission: prev.commission.add(curr.commission),
        other: prev.other.add(curr.other),
        overtime: prev.overtime.add(curr.overtime),
        netPay: prev.netPay.add(curr.netPay),
        taxes: prev.taxes.add(curr.taxes),
        deductions: prev.deductions.add(curr.deductions),
        reimbursements: prev.reimbursements.add(curr.reimbursements),
        total: prev.total.add(curr.total),
        pay: prev.pay.add(curr.pay),
        tips: prev.tips.add(curr.tips),
        fees: prev.fees.add(curr.fees),
        gross: prev.gross.add(curr.gross),
        net: prev.net.add(curr.net),
      };
    },
    {
      base: currency(0),
      bonus: currency(0),
      commission: currency(0),
      other: currency(0),
      overtime: currency(0),
      netPay: currency(0),
      taxes: currency(0),
      deductions: currency(0),
      reimbursements: currency(0),
      total: currency(0),
      pay: currency(0),
      tips: currency(0),
      fees: currency(0),
      gross: currency(0),
      net: currency(0),
    }
  );

  const grossData = [
    { key: "Base pay", value: totalPay.base.value },
    { key: "Bonuses", value: totalPay.bonus.value },
    { key: "Tips", value: totalPay.tips.value },
    { key: "Commissions", value: totalPay.commission.value },
    { key: "Overtime", value: totalPay.overtime.value },
    { key: "Reimbursements", value: totalPay.reimbursements.value },
  ];

  const netData = [
    { key: "Pay", value: totalPay.pay.value },
    { key: "Taxes", value: totalPay.taxes.value },
    { key: "Deductions", value: totalPay.deductions.value },
    { key: "Fees", value: totalPay.fees.value },
  ];

  return (
    <section className="px-4">
      <Heading className="mb-3">Total pay</Heading>
      <Splitter />
      {isLoading ? (
        <ChartLoader />
      ) : (
        <>
          <HorizontalBreakdownBar
            total={totalPay.gross.value}
            data={grossData}
            title={"Gross pay"}
            theme={"cyan"}
          />
          <Splitter />
          <HorizontalBreakdownBar
            total={totalPay.net.value}
            data={netData}
            title={"Net pay"}
            theme={"green"}
          />
        </>
      )}
      <Splitter />
    </section>
  );
}
