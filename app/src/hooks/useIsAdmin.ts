import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ADMINS } from "~src/utils/constants";

export default function useIsAdmin (): boolean {
  const {address, isConnected, isDisconnected} = useAccount();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  useEffect(() => {
    setIsAdmin(address ? ADMINS.includes(address) : false)
  }, [address,isConnected,isDisconnected])
  return isAdmin;
}
