import { useEffect, useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { deployed } from '~src/utils/contracts/vcs1';
import { useWhitelistStatus } from './useWhitelistStatus';
import { useComputeHash } from './useComputeHash';
import { useConnectedTwitterAccount } from './useConnectedTwitterAccount';

/**
 *
 * 1. check if current account owns an NFT
 * 2. if yes -> query tokenOfOwnerByIndex
 * 3. return;
 * 4. check if current owner has minted before (using isMinter)
 * 5. is yes -> query minterToTokenId for tokenid
 * 6. return
 * 7. check if twitter account has minted before (using hashToMinter)
 * 8. if yes -> query minterToTokenId for the address returned from hashToMinter, and display a message saying that this twitter account has already minted this token id
 *
 * - the nft is either in their wallet or they minted and transferred or minted and are now logged in with a different wallet (but same twitter)
 *
 * - query tokenofownerbyindex of currently connected account [has the nft in their wallet, might or might not have minted before]
 * - query isMinter for currently connected account [minted before but doesnt have the nft in their wallet right now]
 * - if twitter account connected and is in whitelist:
 *   - query hashToMinter
 *   - query minterToTokenId of minter returned from above
 *
 * precedence:
 *   - tokenofownerbyindex (this is the nft the address owns) -> tokenid
 *   - isMinter -> tokenid
 *   - hashToMinter -> address -> minterToTokenId -> tokenid + message
 *
 *
 */



interface OwnershipType {
  // connected address has minted before
  AddressMinted: boolean,
  // connected twitter has minted before
  TwitterMinted: boolean,
  // connected address owns an NFT
  WalletOwns: boolean

}


export const useIsOwnerOfToken = (): {
  isOwner: boolean,
  tokenId: number,
  tokenOfOwnerByIndexRefetch: () => unknown,
  balanceOfRefetch: () => unknown;
  isMinterRefetch: () => unknown;
  ownershipType: OwnershipType;
} => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<number>(0);
  const { address, isConnected, isDisconnected } = useAccount();
  const [ownershipType, setOwnershipType] = useState<OwnershipType>({
    AddressMinted: false,
    TwitterMinted: false,
    WalletOwns: false
  })
  const twitter = useConnectedTwitterAccount();
  const whitelistStatus = useWhitelistStatus();
  const {hash} = useComputeHash({key: twitter.data?.payload?.username});

  // query contract to check owner
  const {
    data: balanceOf,
    isLoading: balanceOfLoading,
    error: balanceOfError,
    refetch: balanceOfRefetch,
  } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'balanceOf',
    args: [address],
    chainId: deployed.chainId
  })

  // query for token id owned by wallet
  // this would just return the first token id
  const {
    data: tokenOfOwnerByIndex,
    isLoading: tokenOfOwnerByIndexLoading,
    error: tokenOfOwnerByIndexError,
    refetch: tokenOfOwnerByIndexRefetch
  } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, 0],
    chainId: deployed.chainId,
    enabled: Number(balanceOf) > 0
  })

  // query if currently connected account has minted before
  const {
    data: isMinter,
    isLoading: isMinterLoading,
    error: isMinterError,
    refetch: isMinterRefetch
  } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'isMinter',
    args: [address],
    chainId: deployed.chainId
  })

  // hash to minter
  const {
    data: hashToMinter,
    isLoading: hashToMinterLoading,
    error: hashToMinterError,
    isFetched: hashToMinterFetched
  } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'hashToMinter',
    args: [hash],
    chainId: deployed.chainId,
    enabled: Boolean(whitelistStatus)
  })

  // minter to token id
  const {
    data: minterToTokenId,
    isLoading: minterToTokenIdLoading,
    error: minterToTokenIdError,
    // refetch: minterToTokenIdRefetch
  } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'minterToTokenId',
    args: [hashToMinter],
    chainId: deployed.chainId,
    enabled: Boolean(hashToMinterFetched)
  })

  // SETTING TOKEN ID
  useEffect(() => {
    setIsOwner(
      ownershipType.AddressMinted
      || ownershipType.TwitterMinted
      || ownershipType.WalletOwns
    )
  }, [ownershipType])


  // SETTING IF WALLET OWNS THE NFT
  useEffect(() => {
    if (
      address
      && isConnected
      && !tokenOfOwnerByIndexLoading
      && !balanceOfLoading
      && !tokenOfOwnerByIndexError
      && !balanceOfError
    ) {
      if (Number(balanceOf) > 0) {
        setOwnershipType((curr) => {
          return {
            ...curr,
            WalletOwns: true
          }
        })
        return setTokenId(Number(tokenOfOwnerByIndex))
      }
    }
    setOwnershipType((curr) => {
      return {
        ...curr,
        WalletOwns: false
      }
    })
    return setTokenId(Number(tokenOfOwnerByIndex))
  }, [
    address,
    isConnected,
    isDisconnected,
    balanceOf,
    balanceOfError,
    balanceOfLoading,
    tokenOfOwnerByIndex,
    tokenOfOwnerByIndexLoading,
    tokenOfOwnerByIndexError
  ])


  // SETTING IF ADDRESS HAS MINTED THE NFT BEFORE
  useEffect(() => {
    if (
      address
      && isConnected
      && !isMinterLoading
      && !isMinterError
    ) {
      if (isMinter) {
        return setOwnershipType((curr) => {
          return {
            ...curr,
            AddressMinted: true
          }
        })
      }
    }
    return setOwnershipType((curr) => {
      return {
        ...curr,
        AddressMinted: false
      }
    })
  }, [
    address,
    isConnected,
    isDisconnected,
    isMinter,
    isMinterError,
    isMinterLoading,
  ])

  // SETTING IF TWITTER HASH WAS USED TO MINT BEFORE
  useEffect(() => {
    if (
      address
      && isConnected
      && !hashToMinterLoading
      && !minterToTokenIdLoading
      && !hashToMinterError
      && !minterToTokenIdError
    ) {
      if (minterToTokenId) {
        setTokenId(Number(tokenOfOwnerByIndex) ?? Number(minterToTokenId));
        return setOwnershipType((curr) => {
          return {
            ...curr,
            TwitterMinted: true
          }
        })
      }
    }
    setTokenId(Number(tokenOfOwnerByIndex));
    return setOwnershipType((curr) => {
      return {
        ...curr,
        TwitterMinted: false
      }
    })
  }, [
    address,
    isConnected,
    isDisconnected,
    hashToMinterLoading,
    minterToTokenIdLoading,
    hashToMinterError,
    minterToTokenIdError,
    minterToTokenId,
    tokenOfOwnerByIndex
  ])

  return {
    isOwner,
    tokenId,
    tokenOfOwnerByIndexRefetch,
    balanceOfRefetch,
    isMinterRefetch,
    ownershipType
  };
};
