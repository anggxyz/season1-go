import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { type Chain, configureChains } from "wagmi";
import { foundry, goerli } from "wagmi/chains";
import { deployed } from "./contracts/vcs1";

const supportedChains = [foundry, goerli] as Chain[];
export const CHAIN = supportedChains.find((chain) => chain.id === deployed.chainId);

if (!CHAIN) {
  throw "CHAIN not found, fix `supportedChains`";
}

export const CHAINS = [CHAIN];

export const { publicClient, webSocketPublicClient } = configureChains(
  CHAINS,
  // /env.mjs ensures the the app isn't built without .env vars
  [
    jsonRpcProvider({
      rpc: () => ({
        http: CHAIN.rpcUrls.default.http[0] ?? "http://localhost:8545",
      })
    }),
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID! })
  ],
)