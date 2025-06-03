"use client";

import { Box, Button, TextField, Typography } from "@mui/material";
import styles from "../../styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useBalance, useWalletClient } from "wagmi";
import { useStakeContract } from "../../hooks/useContract";
import { formatEther, parseEther } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { toast } from "react-toastify";

const Home = () => {
  const stakeContract = useStakeContract();
  const { address, isConnected } = useAccount();
  const [stakedAmount, setStakedAmount] = useState("0");
  const [amount, setAmount] = useState("0");
  const [loading, setLoading] = useState(false);
  const { data } = useWalletClient();
  const { data: balance } = useBalance({
    address: address,
  });

  useEffect(() => {
    if (stakeContract && address) {
      getStakedAmount();
    }
  }, [stakeContract, address]);

  /**
   * 获取质押数量
   */
  const getStakedAmount = useCallback(async () => {
    if (address && stakeContract) {
      const res = await stakeContract?.read.stakingBalance([0, address]);
      setStakedAmount(formatEther(res as bigint));
      console.log("stakedAmount", res);
    }
  }, [address, stakeContract]);

  /**
   * 质押
   */
  const handleStake = async () => {
    if (!stakeContract || !address || !data) return;
    console.log(balance, amount, "wallet");

    // 如果质押金额大于当前余额，则提示错误
    if (parseFloat(amount) > parseFloat(balance!.formatted)) {
      toast.error("Amount cannot be greater than current balance");
      return;
    }
    try {
      setLoading(true);
      // 质押
      const tx = await stakeContract.write.depositETH([], { value: parseEther(amount) });
      // 等待交易确认
      const res = await waitForTransactionReceipt(data, { hash: tx });
      // 交易成功
      console.log(res, "tx");
      toast.success("Transaction receipt !");
      // 更新质押数量
      getStakedAmount();
    } catch (error) {
      console.error("Failed to stake", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display={"flex"} flexDirection={"column"} alignItems={"center"} width={"100%"}>
      <Typography sx={{ fontSize: "30px", fontWeight: "bold" }}>Rcc Stake</Typography>
      <Typography sx={{}}>Stake ETH to earn tokens.</Typography>
      <Box sx={{ border: "1px solid #eee", borderRadius: "12px", p: "20px", width: "600px", mt: "30px" }}>
        <Box display={"flex"} alignItems={"center"} gap={"5px"} mb="10px">
          <Box>Staked Amount: </Box>
          <Box>{stakedAmount} ETH</Box>
        </Box>
        <TextField
          onChange={(e) => {
            setAmount(e.target.value);
          }}
          sx={{ minWidth: "300px" }}
          label="Amount"
          type="number"
          variant="outlined"
        />
        <Box mt="30px">
          {!isConnected ? (
            <ConnectButton />
          ) : (
            <Button variant="contained" loading={loading} loadingIndicator="Loading…" onClick={handleStake}>
              Stake
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
