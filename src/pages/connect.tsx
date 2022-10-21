import { ReactElement, useEffect, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/router";
import { Button } from "components/button";
import { StreamlineIcon } from "components/icons";
import { Heading, Paragraph } from "components/typography";
import { ArgyleLink } from "components/argyle-link";
import Fullscreen from "layouts/fullscreen";
import { hasCookie } from "cookies-next";

export default function ConnectPage() {
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkInstance, setLinkInstance] = useState<any>();
  const [linkOpen, setLinkOpen] = useState(false);

  const router = useRouter();

  const handleLinkOpen = () => {
    if (!linkInstance) {
      return setLinkLoading(true);
    }

    linkInstance.open();
    setLinkOpen(true);
  };

  useEffect(() => {
    router.prefetch("/");
  }, []);

  useEffect(() => {
    if (linkInstance && linkLoading === true) {
      setLinkLoading(false);
      linkInstance.open();
      setLinkOpen(true);
    }
  }, [linkLoading, linkInstance]);

  const handleLinkClose = () => {
    const cookie = hasCookie("argyle-x-user-id");

    if (cookie) {
      router.push("/");
    } else {
      setLinkOpen(false);
    }
  };

  return (
    <>
      <ArgyleLink
        onClose={() => handleLinkClose()}
        onLinkInit={(link) => {
          setLinkInstance(link);
        }}
      />
      {!linkOpen && (
        <div className="flex h-full flex-col justify-between">
          <div className="px-4 pr-[16px] pt-24">
            <div className="brand-gradient mb-4 flex h-[52px] w-[52px] content-center rounded-full p-[14px]">
              <StreamlineIcon />
            </div>
            <Heading className="mb-3">Visualize your income</Heading>
            <Paragraph className="mb-6 text-gray-T40">
              Connect to all the places you work to see your income data.
            </Paragraph>
            <div className={clsx("flex", linkLoading && "animate-pulse")}>
              <Button onClick={handleLinkOpen}>Connect your work</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

ConnectPage.getLayout = function getLayout(page: ReactElement) {
  return <Fullscreen>{page}</Fullscreen>;
};
