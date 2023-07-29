import { useAccount, useContractWrite } from 'wagmi';
import { deployed } from '~src/utils/contracts/vcs1';
import { useIsOwner } from './useIsOwner';

export const useMint = (): {
  isMinting: boolean,
  isError: boolean,
  mint: () => void;
} => {
  const { address } = useAccount();
  const { tokenOfOwnerByIndexRefetch,balanceOfRefetch } = useIsOwner();
  const { data, isLoading, isSuccess, write, isError, error } = useContractWrite({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'mintTo',
    args: [address],
    chainId: deployed.chainId,
    onSuccess: () => {
      tokenOfOwnerByIndexRefetch();
      balanceOfRefetch();
    }
  })

  console.log({data, isSuccess, isError, error})

  return {
    isMinting: isLoading, isError, mint: write
  }
};
