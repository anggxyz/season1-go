/**
 * DO NOT use this to gate content
 * ONLY for state of nav items or some buttons
 * use SERVER SESSION TO GATE CONTENT
 */

import { useEffect, useState } from "react";
import { useAccount } from "wagmi"
export const walletHasToken = (address: string): boolean => {
  // add token checking logic here
  console.log({ address });
  return true
}

export const useIsTokenGated = () => {
  const [locked, setLocked] = useState<boolean>(false);
  const {address} = useAccount();
  useEffect(() => {
    if (!address || !(walletHasToken(address))) {
      setLocked(true);
    }
    if (address && walletHasToken(address)) {
      setLocked(false);
    }
  }, [address])

  return locked;
}