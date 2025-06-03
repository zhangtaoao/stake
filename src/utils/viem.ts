import { createPublicClient, http, PublicClient } from "viem";
import { sepolia } from "viem/chains";

export const viemClient = (chainId: number) => {
  const clients: {
    [key: number]: PublicClient;
  } = {
    [sepolia.id]: createPublicClient({
      chain: sepolia,
      transport: http("https://sepolia.infura.io/v3/5cfcd5c2fa38419a867609416a53ecd9"),
    }),
  };

  return clients[chainId];
};
