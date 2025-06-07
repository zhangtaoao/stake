import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { StakeContractAddress } from "../utils/env";
import { stakeAbi } from "../assets/abis/stake";

// 质押
export const useDepositETH = () => {
  const { writeContract, ...writeRest } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({
    hash: writeRest.data,
  });
  return {
    write: (value: bigint) =>
      writeContract({
        address: StakeContractAddress,
        abi: stakeAbi,
        functionName: "depositETH",
        args: [],
        value,
      }),
    writeRest,
    receipt,
  };
};

// 解质押
export const useUnStake = () => {
  const { writeContract, ...writeRest } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({
    hash: writeRest.data,
  });
  return {
    write: (args: readonly [bigint, bigint]) =>
      writeContract({
        address: StakeContractAddress,
        abi: stakeAbi,
        functionName: "unstake",
        args,
      }),
    writeRest,
    receipt,
  };
};

// 提现
export const useWithdraw = () => {
  const { writeContract, ...writeRest } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({
    hash: writeRest.data,
  });
  return {
    write: (args: readonly [bigint]) =>
      writeContract({
        address: StakeContractAddress,
        abi: stakeAbi,
        functionName: "withdraw",
        args,
      }),
    writeRest,
    receipt,
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
