import { useContractRead } from 'wagmi';
import { useWhitelistStatus } from './useWhitelistStatus';
import { deployed } from '~src/utils/contracts/vcs1';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';

export const useMintPrice = (): string => {
  const {status} = useWhitelistStatus();
  const [mintPrice, setMintPrice] = useState<string>("");

  const { data, isLoading, error } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'MINT_PRICE',
    chainId: deployed.chainId
  })
  useEffect(() => {
    if (status) {
      return setMintPrice("0 ether");
    }
    if (data && !isLoading && !error) {
      return setMintPrice(formatEther(data as bigint) + " ether");
    }
  }, [data, isLoading, error, status])

  // @todo remove logging here
  console.log({ data, isLoading, error });

  return mintPrice;
};
