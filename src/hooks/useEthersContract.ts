import { useMemo } from "react";
import { Contract } from "ethers";
import { useEthersSigner } from "./useEthersSigner";
import { useEthersProvider } from "./useEthersProvider";
import { stakeAbi } from "../assets/abis/stake";
import { StakeContractAddress } from "../utils/env";

/**
 * 使用 Ethers.js 的合约 hook
 */
export function useEthersContract() {
  const signer = useEthersSigner();
  const provider = useEthersProvider();

  // 只读合约实例
  const readOnlyContract = useMemo(() => {
    if (!provider) return null;
    return new Contract(StakeContractAddress, stakeAbi, provider);
  }, [provider]);

  // 可写合约实例
  const writeableContract = useMemo(() => {
    if (!signer) return null;
    return new Contract(StakeContractAddress, stakeAbi, signer);
  }, [signer]);

  return {
    readOnlyContract,
    writeableContract,
    provider,
    signer,
  };
}

/**
 * 质押合约 hook
 */
export const useStakeContractEthers = () => {
  return useEthersContract();
};
