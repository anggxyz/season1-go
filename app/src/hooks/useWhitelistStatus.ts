import { useAccount } from 'wagmi'


export const useWhitelistStatus = (): boolean => {
  const { address } = useAccount();

  // query contract to check whitelist status
  console.log({address});

  return true;
};
