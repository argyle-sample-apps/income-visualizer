import Link from "next/link";
import { useRouter } from "next/router";
import { useResizeDetector } from "react-resize-detector";
import { isStandaloneMode } from "utils/general";
import {
  HomeIcon,
  IncomeIcon,
  AccountsIcon,
  CardIcon,
  EarlyPayIcon,
  CreditIcon,
  WorkIcon,
} from "components/icons";
import clsx from "clsx";

type BottomNavigationProps = {
  height: number;
};

type WithBottomNavigationProps = {
  children: React.ReactNode;
};

function getBasePath(path: string) {
  return path.split("/")[1];
}

function BottomNavigation({ height }: BottomNavigationProps) {
  const router = useRouter();
  const basePath = getBasePath(router.pathname);

  const links = [
    { id: 1, label: "Early Pay", url: "/early", icon: <EarlyPayIcon /> },
    { id: 2, label: "Income", url: "/income", icon: <IncomeIcon /> },
  ];

  return (
    <div className="space-between flex w-full border-t pt-2" style={{ height }}>
      {links.map((link) => (
        <Link key={link.id} href={link.url}>
          <a
            className={clsx(
              "flex flex-1 flex-col items-center text-[10px]",
              basePath === getBasePath(link.url) ? "text-purple" : "text-gray"
            )}
          >
            <span className="block h-6 w-6">{link.icon}</span>
            <span>{link.label}</span>
          </a>
        </Link>
      ))}
    </div>
  );
}

function WithBottomNavigation({ children }: WithBottomNavigationProps) {
  const { height, ref } = useResizeDetector();
  const standalone = isStandaloneMode();
  const bottomNavHeight = standalone ? 83 : 54;

  return (
    <div id="__container" className="bg-white" ref={ref}>
      <main
        className="scrollbar overflow-auto"
        style={height ? { height: height - bottomNavHeight } : {}}
      >
        {children}
      </main>
      <BottomNavigation height={bottomNavHeight} />
    </div>
  );
}

export default WithBottomNavigation;
