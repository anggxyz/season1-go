import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { type Chain, configureChains } from "wagmi";
import { foundry, goerli } from "wagmi/chains";
import { deployed } from "./contracts/vcs1";

const mainnetForked: Chain = {
  id: 1,
  name: "Tenderly Mainnet Fork",
  network: "tenderly-mainnet-fork",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.tenderly.co/fork/afbe755b-c8de-41b9-8134-69c5e4692b9c"],
    },
    public: {
      http: ["https://rpc.tenderly.co/fork/afbe755b-c8de-41b9-8134-69c5e4692b9c"],
    }
  },
  blockExplorers: {
    default: {
      name: "tenderly fork explorer",
      url: "https://dashboard.tenderly.co/angelagilhotra/project/fork/afbe755b-c8de-41b9-8134-69c5e4692b9c/contract/afbe755b-c8de-41b9-8134-69c5e4692b9c/0x38628490c3043e5d0bbb26d5a0a62fc77342e9d5"
    }
  },
  testnet: true
}

const supportedChains = [mainnetForked, foundry, goerli] as Chain[];
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