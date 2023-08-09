import { useContractRead } from 'wagmi';
import { deployed } from '~src/utils/contracts/vcs1';
import { useEffect, useState } from 'react';

export const useIsPaused = () => {
  const [publicMints, setPublicMints] = useState<boolean>(false);
  const [whitelistTransfers, setWhitelistTransfers] = useState<boolean>(false);

  const { data: publicMintsPaused, isLoading: publicMintsPausedLoading, error:publicMintsPausedError } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'publicMintsPaused',
    chainId: deployed.chainId
  })
  const { data: whitelistTransfersPaused, isLoading: whitelistTransfersPausedLoading, error: whitelistTransfersPausedError } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'whitelistTransfersPaused',
    chainId: deployed.chainId
  })

  useEffect(() => {
    if (!publicMintsPausedLoading && !publicMintsPausedError) {
      setPublicMints(Boolean(publicMintsPaused));
    }
    if (!whitelistTransfersPausedLoading && !whitelistTransfersPausedError) {
      setWhitelistTransfers(Boolean(whitelistTransfersPaused));
    }
  }, [
    publicMintsPaused,
    publicMintsPausedLoading,
    publicMintsPausedError,
    whitelistTransfersPaused,
    whitelistTransfersPausedLoading,
    whitelistTransfersPausedError
  ])

  return {
    publicMints, whitelistTransfers
  };
};
