import { createPublicClient, http } from 'viem'
import { deployed } from '~src/utils/contracts/vcs1'
import { CHAIN } from '~src/utils/onChainConfig'

export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http()
})

export const isAddressAdmin = async (address?: string) => {
  if (!address) return false;
  const data = await publicClient.readContract({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'isAdmin',
    args: [address],
  })
  return data;
}


