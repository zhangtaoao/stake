import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
import { http } from 'viem';


export const config = getDefaultConfig({
  appName: "ZT",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http("https://sepolia.infura.io/v3/5cfcd5c2fa38419a867609416a53ecd9"),
  },
  ssr: true,
});

export const defaultChainId: number = sepolia.id;
