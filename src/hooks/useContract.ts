import { useReadContract, useWriteContract } from "wagmi";
import { StakeContractAddress } from "../utils/env";
import { stakeAbi } from "../assets/abis/stake";

export const useStakeContract = () => {
  const { writeContract, ...writeRest } = useWriteContract();

  return {
    // 写入方法
    write: {
      depositETH: (value: bigint) =>
        writeContract({
          address: StakeContractAddress,
          abi: stakeAbi,
          functionName: "depositETH",
          args: [],
          value,
        }),
      unstake: (args: readonly [bigint, bigint]) =>
        writeContract({
          address: StakeContractAddress,
          abi: stakeAbi,
          functionName: "unstake",
          args,
        }),
      withdraw: (args: readonly [bigint]) =>
        writeContract({
          address: StakeContractAddress,
          abi: stakeAbi,
          functionName: "withdraw",
          args,
        }),
    },
    ...writeRest,
  };
};

// 读取质押余额
export const useStakingBalance = (poolId: bigint, address: `0x${string}` | undefined) => {
  return useReadContract({
    address: StakeContractAddress,
    abi: stakeAbi,
    functionName: "stakingBalance",
    args: [poolId, address!],
    query: {
      enabled: !!address,
    },
  });
};

// 读取提现金额
export const useWithdrawAmount = (poolId: bigint, address: `0x${string}` | undefined) => {
  return useReadContract({
    address: StakeContractAddress,
    abi: stakeAbi,
    functionName: "withdrawAmount",
    args: [poolId, address!],
    query: {
      enabled: !!address,
    },
  });
};
