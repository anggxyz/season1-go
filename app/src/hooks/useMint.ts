import { useAccount, useContractWrite } from 'wagmi';
import { deployed } from '~src/utils/contracts/vcs1';
import { useIsOwnerOfToken } from './useIsOwnerOfToken';
import { useConnectedTwitterAccount } from './useConnectedTwitterAccount';
import { getHash } from '~src/utils/generateHash';
import { useMintPrice } from './useMintPrice';

export const useMint = () => {
  const { address } = useAccount();
  const { tokenOfOwnerByIndexRefetch, balanceOfRefetch } = useIsOwnerOfToken();
  const { data: twitterInfo } = useConnectedTwitterAccount();
  const { parsed } = useMintPrice();
  const {
    // data: publicMintData,
    isLoading: publicMintIsLoading,
    // isSuccess: publicMintIsSuccess,
    write: publicMint,
    isError: publicMintIsError,
    // error: publicMintError
  } = useContractWrite({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'mintTo',
    args: [address],
    chainId: deployed.chainId,
    value: parsed,
    onSuccess: () => {
      tokenOfOwnerByIndexRefetch();
      balanceOfRefetch();
    },
  })

  const {
    // data: whitelistMintData,
    isLoading: whitelistMintIsLoading,
    // isSuccess: whitelistMintIsSuccess,
    write: whitelistMint,
    isError: whitelistMintIsError,
    // error: whitelistMintError
  } = useContractWrite({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'mintTo',
    args: [address, getHash(twitterInfo?.payload?.username)],
    chainId: deployed.chainId,
    onSuccess: () => {
      tokenOfOwnerByIndexRefetch();
      balanceOfRefetch();
    },
  })

  return {
    publicMintIsLoading,
    publicMintIsError,
    publicMint,
    whitelistMintIsLoading,
    whitelistMint,
    whitelistMintIsError
  }
};
