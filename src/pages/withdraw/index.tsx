"use client";

import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import styles from "../../styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useWalletClient } from "wagmi";
import { useStakeContract } from "../../hooks/useContract";
import { formatEther, parseEther } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { toast } from "react-toastify";

export type UserStakeData = {
  // 质押
  staked: string;
  // 可提现
  withdrawable: string;
  // 待提现
  withdrawPending: string;
};

const _userData = {
  staked: "0",
  withdrawable: "0",
  withdrawPending: "0",
};

const Withdraw = () => {
  // 合约
  const stakeContract = useStakeContract();
  // 钱包地址
  const { address, isConnected } = useAccount();
  // 质押loading
  const [loading, setLoading] = useState(false);
  // 提现loading
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  // 提现金额
  const [amount, setAmount] = useState("0");
  // 用户质押数据
  const [userData, setUserData] = useState<UserStakeData>(_userData);
  // 钱包客户端
  const { data } = useWalletClient();

  // 是否可提现
  const isWithdrawable = useMemo(() => {
    return Number(userData.withdrawable) > 0 && isConnected;
  }, [userData, isConnected]);

  /**
   * 获取用户质押数据
   */
  const getUserStakeData = async () => {
    if (!stakeContract || !address) return;
    const staked = await stakeContract.read.stakingBalance([0, address]);
    //@ts-ignore
    const [requestAmount, pendingWithdrawAmount] = await stakeContract.read.withdrawAmount([0, address]);
    const ava = Number(formatEther(pendingWithdrawAmount as bigint));
    const p = Number(formatEther(requestAmount as bigint));
    setUserData({
      staked: formatEther(staked as bigint),
      withdrawPending: (p - ava).toFixed(4),
      withdrawable: ava.toString(),
    });
  };

  useEffect(() => {
    if (stakeContract && address) {
      getUserStakeData();
    }
  }, [stakeContract, address]);

  /**
   * 提现
   */
  const handleWithdraw = async () => {
    if (!stakeContract || !address || !data) return;
    try {
      setWithdrawLoading(true);
      const tx = await stakeContract.write.withdraw([0]);
      const res = await waitForTransactionReceipt(data, { hash: tx });
      console.log(res, "tx");
      toast.success("Transaction receipt !");
      getUserStakeData();
    } catch (error) {
      console.error("Failed to withdraw", error);
    } finally {
      setWithdrawLoading(false);
    }
  };

  /**
   * 解质押
   */
  const handleUnStake = async () => {
    if (!stakeContract || !address || !data) return;
    try {
      setLoading(true);
      const tx = await stakeContract.write.unstake([0, parseEther(amount)]);
      const res = await waitForTransactionReceipt(data, { hash: tx });
      console.log(res, "tx");
      toast.success("Transaction receipt !");
      getUserStakeData();
    } catch (error) {
      console.error("Failed to unstake", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display={"flex"} flexDirection={"column"} alignItems={"center"} width={"100%"}>
      <Typography sx={{ fontSize: "30px", fontWeight: "bold" }}>Rcc Stake</Typography>
      <Typography sx={{}}>Stake ETH to earn tokens.</Typography>
      <Box sx={{ border: "1px solid #eee", borderRadius: "12px", p: "20px", width: "600px", mt: "30px" }}>
        <Grid
          container
          sx={{
            mb: "60px",
            "& .title": {
              fontSize: "15px",
              mb: "5px",
            },
            "& .val": {
              fontSize: "18px",
              fontWeight: "bold",
            },
          }}
        >
          <Grid size={{ xs: 4 }}>
            <Box display={"flex"} alignItems={"center"} flexDirection={"column"}>
              <Box className="title">Staked Amount: </Box>
              <Box className="val">{userData.staked} ETH</Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box display={"flex"} alignItems={"center"} flexDirection={"column"}>
              <Box className="title">Available to withdraw </Box>
              <Box className="val">{userData.withdrawable} ETH</Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box display={"flex"} alignItems={"center"} flexDirection={"column"}>
              <Box className="title">Pending Withdraw: </Box>
              <Box className="val">{userData.withdrawPending} ETH</Box>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ fontSize: "20px", mb: "10px" }}>Unstake</Box>
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
            <Button variant="contained" loading={loading} loadingIndicator="Loading…" onClick={handleUnStake}>
              UnStake
            </Button>
          )}
        </Box>
        <Box sx={{ fontSize: "20px", mb: "10px", mt: "40px" }}>Withdraw</Box>
        <Box> Ready Amount: {userData.withdrawable} </Box>
        <Typography fontSize={"14px"} color={"#888"}>
          After unstaking, you need to wait 20 minutes to withdraw.
        </Typography>
        <Button sx={{ mt: "20px" }} disabled={!isWithdrawable} variant="contained" loading={withdrawLoading} onClick={handleWithdraw}>
          Withdraw {isWithdrawable}
        </Button>
      </Box>
    </Box>
  );
};

export default Withdraw;
