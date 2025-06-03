import { useMemo } from "react";
import { Address, Abi } from "viem";
import { useChainId, useWalletClient } from "wagmi";
import { getContract } from "../utils/contractHelper";
import { StakeContractAddress } from "../utils/env";
import { stakeAbi } from "../assets/abis/stake";

export function useContract(addressOrAddressMap: Address | { [chainId: number]: Address }, abi: Abi | readonly unknown[]) {
  // 获取当前链id
  const chainId = useChainId();
  // 获取当前钱包客户端
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!chainId) return null;
    let address: Address | undefined;
    // 如果addressOrAddressMap是字符串，则直接赋值
    if (typeof addressOrAddressMap === "string") address = addressOrAddressMap;
    // 如果addressOrAddressMap是对象，则根据chainId获取对应的地址
    else address = addressOrAddressMap[chainId];
    // 如果地址不存在，则返回null
    if (!address) return null;

    try {
      return getContract({
        abi,
        address,
        chainId,
        signer: walletClient ?? undefined,
      });
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [walletClient, chainId, addressOrAddressMap, abi]);
}


export const useStakeContract = () => {
  return useContract(StakeContractAddress, stakeAbi as Abi);
};
