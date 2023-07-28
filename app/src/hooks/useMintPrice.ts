import { useWhitelistStatus } from './useWhitelistStatus';


export const useMintPrice = (): string => {
  const whitelisted = useWhitelistStatus();

  // query contract for mint price
  // query for whitelist status
  // replace amount with contract query
  const MINT_PRICE = "0.01 ether";

  if (whitelisted) {
    return "0 ether";
  }
  return MINT_PRICE;
};
