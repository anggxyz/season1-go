import { useContractRead } from 'wagmi';
import { deployed } from '~src/utils/contracts/vcs1';
import { formatEther, parseEther } from 'viem';
import { useEffect, useState } from 'react';
import { useWhitelistStatus } from './useWhitelistStatus';

export const useMintPrice = () => {
  const status = useWhitelistStatus();
  const [formatted, setMintPrice] = useState<string>("Connect accounts to view mint price");
  const [parsed, setParsed] = useState<bigint>(parseEther("0"));

  const { data, isLoading, error } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'MINT_PRICE',
    chainId: deployed.chainId
  })
  useEffect(() => {
    if (status) {
      setParsed(parseEther("0"))
      return setMintPrice("Mint Price: 0 ether");
    }
    if (data && !isLoading && !error) {
      setParsed(data as bigint);
      return setMintPrice("Mint Price: " + formatEther(data as bigint) + " ether");
    }
  }, [data, isLoading, error, status])

  return { formatted, parsed };
};
