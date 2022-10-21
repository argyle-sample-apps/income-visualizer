import clsx from "clsx";
import { InlineButton } from "components/button";
import { ACCOUNT_FILTER_ALL } from "consts";
import { useAccounts } from "hooks/use-accounts";
import { useAtom } from "jotai";
import { selectedAccountAtom } from "stores/global";
import { AddSmallIcon } from "../../components/icons";

type IncomeSourcePickerProps = {
  onLinkOpen?: () => void;
};

type SourceButtonProps = {
  label: string;
  color?: string;
  isActive: boolean;
  onClick: () => void;
};

function SourceButton({ label, color, isActive, onClick }: SourceButtonProps) {
  return (
    <InlineButton
      onClick={onClick}
      className={clsx(
        "flex flex-none items-center rounded-full px-3 py-1 !text-sm",
        isActive ? "!bg-gray-100 !text-gray-darkest" : "!text-gray"
      )}
    >
      {color && (
        <span
          className="mr-2 block h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="flex-none">{label}</span>
    </InlineButton>
  );
}

export function IncomeSourcePicker({ onLinkOpen }: IncomeSourcePickerProps) {
  const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
  const { data: accounts } = useAccounts({ refetchInterval: false });

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 overflow-x-auto pr-4">
        <SourceButton
          label="All"
          isActive={selectedAccount === ACCOUNT_FILTER_ALL}
          onClick={() => setSelectedAccount(ACCOUNT_FILTER_ALL)}
        />
        {accounts?.map((account) => (
          <SourceButton
            key={account.id}
            label={account.link_item_details.name}
            color={account.color}
            isActive={selectedAccount === account.link_item}
            onClick={() => setSelectedAccount(account.link_item)}
          />
        ))}
        {onLinkOpen && (
          <InlineButton
            onClick={onLinkOpen}
            className="flex items-center !text-sm !font-medium !text-purple"
          >
            <div className="mr-1">
              <AddSmallIcon />
            </div>
            Add
          </InlineButton>
        )}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 overflow-hidden bg-gradient-to-l from-white"></div>
    </div>
  );
}
