"use client";

import { Box, Button, TextField, Typography, Card, CardContent, InputAdornment, Alert, Chip, Divider, useTheme } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { toast } from "react-toastify";
import StatsCard from "../../components/StatsCard";
import { AccountBalance, ShowChart, Security } from "@mui/icons-material";
import { formatEther, parseEther } from "ethers";
import { useStakeContractEthers } from "../../hooks/useEthersContract";

const Home = () => {
  const theme = useTheme();
  const { address, isConnected } = useAccount();
  const [stakedAmount, setStakedAmount] = useState("0");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { readOnlyContract, writeableContract } = useStakeContractEthers();
  const { data: balance } = useBalance({
    address: address,
  });

  useEffect(() => {
    if (readOnlyContract && address) {
      getStakedAmount();
    }
  }, [readOnlyContract, address]);

  /**
   * 获取质押数量
   */
  const getStakedAmount = useCallback(async () => {
    if (address && readOnlyContract) {
      try {
        setDataLoading(true);
        const res = await readOnlyContract.stakingBalance(0, address);
        setStakedAmount(formatEther(res));
        console.log("stakedAmount", res);
      } catch (error) {
        console.error("Failed to get staked amount", error);
      } finally {
        setDataLoading(false);
      }
    }
  }, [address, readOnlyContract]);

  /**
   * 质押
   */
  const handleStake = async () => {
    if (!writeableContract || !address || !amount) return;

    // 验证输入
    if (parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // 如果质押金额大于当前余额，则提示错误
    if (parseFloat(amount) > parseFloat(balance!.formatted)) {
      toast.error("Amount cannot be greater than current balance");
      return;
    }

    try {
      setLoading(true);
      toast.info("Initiating stake transaction...");

      // 质押
      const tx = await writeableContract.depositETH({ value: parseEther(amount) });
      toast.info("Transaction submitted, waiting for confirmation...");

      // 等待交易确认
      const receipt = await tx.wait();
      console.log(receipt, "tx receipt");
      toast.success("Stake successful! 🎉");

      // 更新质押数量
      await getStakedAmount();
      setAmount(""); // 清空输入框
    } catch (error: any) {
      console.error("Failed to stake", error);
      toast.error(error?.reason || error?.message || "Failed to stake");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxClick = () => {
    if (balance) {
      // 留出一些gas费用
      const maxAmount = Math.max(0, parseFloat(balance.formatted) - 0.001);
      setAmount(maxAmount.toString());
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1000px",
        mx: "auto",
      }}
    >
      {/* Hero Section */}
      <Box
        className="animate-fadeInUp"
        sx={{
          textAlign: "center",
          mb: 6,
          py: 4,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            mb: 2,
            fontSize: { xs: "2rem", md: "3rem" },
          }}
        >
          RCC Stake
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.secondary,
            mb: 3,
            fontSize: { xs: "1rem", md: "1.25rem" },
          }}
        >
          Stake your ETH to earn rewards and participate in the RCC ecosystem
        </Typography>

        {/* Features */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
            mb: 4,
          }}
        >
          <Chip icon={<Security />} label="Secure Staking" color="primary" variant="outlined" />
          <Chip icon={<ShowChart />} label="Earn Rewards" color="secondary" variant="outlined" />
          <Chip icon={<AccountBalance />} label="DeFi Protocol" color="success" variant="outlined" />
        </Box>
      </Box>

      {/* Stats Cards */}
      {isConnected && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 4, width: "100%" }} className="animate-fadeInUp">
          <StatsCard title="Your Staked Amount" value={`${parseFloat(stakedAmount).toFixed(4)} ETH`} subtitle="Currently earning rewards" icon="staked" color="primary" loading={dataLoading} />
          <StatsCard title="Wallet Balance" value={`${balance ? parseFloat(balance.formatted).toFixed(4) : "0"} ETH`} subtitle="Available to stake" icon="wallet" color="secondary" loading={!balance} />
        </Box>
      )}

      {/* Main Staking Card */}
      <Card
        className="hover-lift animate-fadeInUp"
        sx={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "24px",
          overflow: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          },
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: theme.palette.text.primary,
            }}
          >
            Stake ETH
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              mb: 4,
            }}
          >
            Start earning rewards by staking your ETH tokens
          </Typography>

          <Divider sx={{ mb: 4 }} />

          {!isConnected ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                Connect your wallet to start staking
              </Typography>
              <ConnectButton />
            </Box>
          ) : (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: theme.palette.text.primary,
                }}
              >
                Stake Amount
              </Typography>

              <TextField
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                label="Amount to stake"
                type="number"
                variant="outlined"
                placeholder="0.0"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button
                          size="small"
                          onClick={handleMaxClick}
                          sx={{
                            minWidth: "auto",
                            px: 2,
                            py: 0.5,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          MAX
                        </Button>
                        <Typography sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>ETH</Typography>
                      </Box>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1.1rem",
                    "& input": {
                      py: 2,
                    },
                  },
                }}
              />

              {balance && amount && parseFloat(amount) > 0 && (
                <Alert severity={parseFloat(amount) > parseFloat(balance.formatted) ? "error" : "info"} sx={{ mb: 3 }}>
                  {parseFloat(amount) > parseFloat(balance.formatted) ? "Insufficient balance" : `You will stake ${amount} ETH from your balance of ${parseFloat(balance.formatted).toFixed(4)} ETH`}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleStake}
                disabled={loading || !amount || parseFloat(amount) <= 0 || !writeableContract}
                sx={{
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: "16px",
                }}
              >
                {loading ? "Staking..." : "Stake ETH"}
              </Button>

              <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: "center" }}>
                  💡 Tip: You can withdraw your staked ETH anytime, but there's a 20-minute waiting period after unstaking.
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Home;
