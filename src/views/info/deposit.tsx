import { Heading, Paragraph, Subheading } from "components/typography";
import { DataPoint } from "components/data-point";
import { usePayAllocations } from "hooks/use-pay-allocations";
import { formatCurrency } from "utils/format";

export function DepositInfo() {
  const {
    data: payAllocations,
    isLoading: isPayAllocationsLoading,
    isError: isPayAllocationsError,
  } = usePayAllocations();

  if (isPayAllocationsLoading) {
    return (
      <div className="grid animate-pulse gap-10">
        {[1, 2, 3].map((el) => (
          <div key={el}>
            <div className="mb-2 h-3 w-20 rounded-full bg-gray-200"></div>
            <div className="h-4 w-32 rounded-full bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isPayAllocationsError) {
    return <div>An error occurred.</div>;
  }

  function renderAllocationValue({ allocation_type, allocation_value }: any) {
    if (allocation_value === "remainder") {
      return "Remainder";
    }
    if (allocation_type === "percent") {
      return allocation_value + "%";
    } else {
      return formatCurrency(allocation_value);
    }
  }

  return (
    <>
      <Heading className="mb-3">Deposit information</Heading>
      {payAllocations.map((payAllocation) => {
        return (
          <div key={payAllocation.account.id} className="mb-6">
            <div className="flex items-center">
              <img
                className="mr-2 h-6 w-6 rounded-full"
                src={payAllocation.account.link_item_details?.logo_url}
                alt={payAllocation.account.link_item_details?.name}
              />
              <Subheading>
                {payAllocation.account.link_item_details?.name}
              </Subheading>
            </div>
            {payAllocation.allocations.map((allocation: any) => {
              return (
                <div key={allocation.id}>
                  <div className="my-4">
                    <Paragraph>
                      <span className="text-orange-dark">
                        {renderAllocationValue(allocation)}
                      </span>
                    </Paragraph>
                  </div>
                  <div className="flex gap-x-12">
                    <DataPoint
                      label="Account number"
                      value={allocation.bank_account.account_number}
                    />
                    <DataPoint
                      label="Routing number"
                      value={allocation.bank_account.routing_number}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
