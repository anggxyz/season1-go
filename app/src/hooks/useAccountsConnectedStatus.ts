import { useEffect, useState } from "react"
import { useAccount } from "wagmi";
import { useConnectedTwitterAccount } from "./useConnectedTwitterAccount";

type ConnectStatus = "CONNECTED" | "DISCONNECTED";

export const useAccountsConnectedStatus = () => {
  const { isConnected: isTwitterConnected } = useConnectedTwitterAccount();
  const [connectStatus, setConnectStatus] = useState<{
    wallet: ConnectStatus,
    twitter: ConnectStatus
  }>({
    wallet: "DISCONNECTED",
    twitter: "DISCONNECTED"
  });
  const { isDisconnected, isConnected } = useAccount();

  useEffect(() => {
    setConnectStatus((s) => {
      return {
        ...s,
        wallet: isConnected ? "CONNECTED" : "DISCONNECTED"
      }})
  }, [isConnected, isDisconnected])
  useEffect(() => {
    setConnectStatus((s) => {
      return {
        ...s,
        twitter: isTwitterConnected ? "CONNECTED" : "DISCONNECTED"
      }
    })
  }, [isTwitterConnected])

  return connectStatus;
}