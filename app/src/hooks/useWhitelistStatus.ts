import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useContractRead } from 'wagmi'
import { deployed } from '~src/utils/contracts/vcs1';


export const useWhitelistStatus = (): {status: boolean, isError: boolean} => {
  const { address, isConnected, isDisconnected } = useAccount();

  const [status, setStatus] = useState<boolean>(false);

  const { data, isError, isLoading, isFetching, isSuccess, error } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'isWhitelisted',
    args: [address],
    chainId: deployed.chainId
  })

  useEffect(() => {
    if (!isError && isSuccess) {
      return setStatus(Boolean(data))
    }
    return setStatus(false);
  }, [data, isError, isSuccess, isConnected, isDisconnected])

  // @todo remove logging here
  console.log({ data, isError, isLoading, isFetching, isSuccess, error });

  return {
    status,
    isError
  };
};
