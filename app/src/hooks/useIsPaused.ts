import { useContractRead } from 'wagmi';
import { deployed } from '~src/utils/contracts/vcs1';
import { useEffect, useState } from 'react';

export const useIsPaused = (): boolean => {
  const [paused, setPaused] = useState<boolean>(false);

  const { data, isLoading, error } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'paused',
    chainId: deployed.chainId
  })
  useEffect(() => {
    if (data && !isLoading && !error) {
      return setPaused(Boolean(data));
    }
  }, [data, isLoading, error])

  // @todo remove logging here
  console.log({ data, isLoading, error });

  return paused;
};
