import type { ReactElement } from "react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useAtom } from "jotai";
import { getCookie } from "cookies-next";
import Fullscreen from "layouts/fullscreen";
import { Header } from "views/header";
import { Topbar } from "views/topbar";
import { IncomeFiltering } from "views/income/filtering";
import { datePickerOpenAtom } from "stores/global";
import { IncomeMain } from "views/income/main";
import { IncomeBySource } from "views/income/by-source";
import { IncomeTotal } from "views/income/total";
import { IncomeHourly } from "views/income/hourly";
import { IncomeLastVsCurrent } from "views/income/last-vs-current";
import { IncomeWorkedHours } from "views/income/worked-hours";
import { Notification } from "components/notification";

export default function Home() {
  const [isOpen, setIsOpen] = useAtom(datePickerOpenAtom);

  return (
    <div className="pt-6 pb-12">
      <Header />
      <Topbar />
      <Notification />
      <IncomeFiltering isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <IncomeMain />
      <IncomeBySource />
      <IncomeLastVsCurrent />
      <IncomeWorkedHours />
      <IncomeHourly />
      <IncomeTotal />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const userId = getCookie("argyle-x-user-id", ctx);

  if (!userId) {
    return {
      redirect: { destination: "/connect", permanent: false },
    };
  }

  return {
    props: {},
  };
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <Fullscreen>{page}</Fullscreen>;
};
