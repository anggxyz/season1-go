import { useContractRead } from 'wagmi';
import { useWhitelistStatus } from './useWhitelistStatus';
import { deployed } from '~src/utils/contracts/vcs1';
import { formatEther } from 'viem';

export const useMintPrice = (): string => {
  const {status} = useWhitelistStatus();

  const { data, isError, isLoading, isFetching, isSuccess, error } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'MINT_PRICE',
    chainId: deployed.chainId
  })
  const MINT_PRICE = formatEther(data as bigint) + " ether";

  // @todo remove logging here
  console.log({ data, isError, isLoading, isFetching, isSuccess, error });

  if (status) {
    return "0 ether";
  }
  return MINT_PRICE;
};
