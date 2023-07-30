import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { configureChains } from "wagmi";
import { foundry } from "wagmi/chains";
export const CHAINS = [foundry]
export const { publicClient, webSocketPublicClient } = configureChains(
  CHAINS,
  // /env.mjs ensures the the app isn't built without .env vars
  [jsonRpcProvider({
    rpc: () => ({
      http: `http://localhost:8545`,
    })
  }), alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID! })],
)