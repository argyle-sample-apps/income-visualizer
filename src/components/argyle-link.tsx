declare global {
  interface Window {
    Argyle: any;
  }
}

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  CredentialsHints,
  SamplePasswordButton,
} from "views/credentials-hints";
import { useQueryClient } from "@tanstack/react-query";
import { getCookie, setCookie } from "cookies-next";
import { useAtom } from "jotai";
import { linkScriptLoadedAtom } from "stores/global";

type ArgyleLinkProps = {
  onClose: () => void;
  onLinkInit: (link: any) => void;
};

export function ArgyleLink({ onClose, onLinkInit }: ArgyleLinkProps) {
  const [isLinkScriptLoaded, setIsLinkScriptLoaded] =
    useAtom(linkScriptLoadedAtom);

  const userToken = getCookie("argyle-x-user-token");

  const queryClient = useQueryClient();

  const [showHints, setShowHints] = useState(false);
  const [showHintsButton, setShowHintsButton] = useState(false);

  const handleUIEvent = (event: any) => {
    switch (event.name) {
      case "search - opened":
      case "success - opened":
      case "pd success - opened":
        setShowHintsButton(false);
        break;

      case "login - opened":
      case "mfa - opened":
        setShowHintsButton(true);
        break;

      case "link closed":
        setShowHintsButton(false);
        setShowHints(false);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (isLinkScriptLoaded) {
      const link = window.Argyle.create({
        customizationId: process.env.NEXT_PUBLIC_ARGYLE_CUSTOMIZATION_ID,
        pluginKey: process.env.NEXT_PUBLIC_ARGYLE_LINK_KEY,
        apiHost: process.env.NEXT_PUBLIC_ARGYLE_BASE_URL,
        userToken: userToken || "",
        payDistributionUpdateFlow: false,
        linkItems: [],
        onUserCreated: async ({
          userId,
          userToken,
        }: {
          userId: string;
          userToken: string;
        }) => {
          setCookie("argyle-x-user-token", userToken, { maxAge: 60 * 60 * 24 });
          setCookie("argyle-x-user-id", userId, { maxAge: 60 * 60 * 24 });
        },
        onAccountConnected: async ({
          userId,
          accountId,
          linkItemId,
        }: {
          userId: string;
          accountId: string;
          linkItemId: string;
        }) => {
          queryClient.invalidateQueries(["accounts"]);
        },
        onUIEvent: handleUIEvent,
        onClose,
      });

      onLinkInit(link);
    }
  }, [userToken, isLinkScriptLoaded]);

  return (
    <>
      <CredentialsHints isOpen={showHints} />
      <SamplePasswordButton
        showHintsButton={showHintsButton}
        showHints={showHints}
        onClick={() => setShowHints(!showHints)}
      />
      <Script
        src="https://plugin.argyle.com/argyle.web.v3.js"
        onLoad={() => setIsLinkScriptLoaded(true)}
      />
    </>
  );
}
