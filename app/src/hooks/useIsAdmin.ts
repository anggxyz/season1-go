import { useEffect, useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { deployed } from "~src/utils/contracts/vcs1";

export default function useIsAdmin (): boolean {
  const {address, isConnected, isDisconnected} = useAccount();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // hash to minter
    const { data: isAdminFromContract } = useContractRead({
      address: deployed.address as `0x${string}`,
      abi: deployed.abi,
      functionName: 'isAdmin',
      args: [address],
      chainId: deployed.chainId,
    })

    useEffect(() => {
      setIsAdmin(Boolean(isAdminFromContract));
    }, [isAdminFromContract, isConnected, isDisconnected])


  return isAdmin;
}
