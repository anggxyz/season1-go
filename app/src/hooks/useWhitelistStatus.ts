import { useEffect, useState } from "react";
import { useConnectedTwitterAccount } from "./useConnectedTwitterAccount";
import { useDataStore } from "./useDataStore";

export const useWhitelistStatus = () => {
  const [whitelistStatus, setWhitelistStatus] = useState(false);
  const { data: whitelist } = useDataStore({ key: "whitelist" }) as { data: { data: string[]} };
  const { isConnected: isTwitterConnected, data: twitterAccount } = useConnectedTwitterAccount();

  useEffect(() => {
    if (isTwitterConnected && twitterAccount?.payload && whitelist) {
      return setWhitelistStatus(whitelist.data.includes(twitterAccount?.payload?.username))
    }
    return setWhitelistStatus(false);
  }, [
    isTwitterConnected,
    twitterAccount?.payload,
    whitelist
  ])

  return whitelistStatus;
}
