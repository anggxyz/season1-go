import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { deployed } from '~src/utils/contracts/vcs1';


export const useIsOwner = (): {
  isOwner: boolean,
  tokenId: number,
  tokenOfOwnerByIndexRefetch: () => unknown,
  balanceOfRefetch: () => unknown;
} => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<number>(0);
  const { address, isConnected, isDisconnected } = useAccount();
  // query contract to check owner
  const { data: balanceOf, isLoading: balanceOfLoading, error: balanceOfError, refetch: balanceOfRefetch } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'balanceOf',
    args: [address],
    chainId: deployed.chainId
  })
  const { data: tokenOfOwnerByIndex, isLoading: tokenOfOwnerByIndexLoading, error: tokenOfOwnerByIndexError, refetch: tokenOfOwnerByIndexRefetch } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 0],
    chainId: deployed.chainId,
    enabled: Number(balanceOf) > 0
  })

  // @todo remove logging here
  console.log({
    balanceOf,
    balanceOfLoading,
    balanceOfError,
    tokenOfOwnerByIndex,
    tokenOfOwnerByIndexLoading,
    tokenOfOwnerByIndexError
  });

  useEffect(() => {
    if (address && isConnected && !tokenOfOwnerByIndexLoading && !balanceOfLoading && !tokenOfOwnerByIndexError && !balanceOfError) {
      if (Number(balanceOf) > 0) {
        setIsOwner(true);
        return setTokenId(Number(tokenOfOwnerByIndex))
      }
    }
    setIsOwner(false);
    return setTokenId(Number(tokenOfOwnerByIndex))
  }, [address, isConnected, isDisconnected, balanceOf, balanceOfError, balanceOfLoading, tokenOfOwnerByIndex, tokenOfOwnerByIndexLoading, tokenOfOwnerByIndexError])

  return {isOwner, tokenId, tokenOfOwnerByIndexRefetch, balanceOfRefetch};
};
