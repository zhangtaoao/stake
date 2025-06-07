"use client";

import { Box, Button, TextField, Typography, Card, CardContent, InputAdornment, Alert, Chip, Divider, useTheme, Stepper, Step, StepLabel } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useStakeContract, useStakingBalance, useWithdrawAmount } from "../../hooks/useContract";
import { formatEther, parseEther } from "viem";
import { toast } from "react-toastify";
import StatsCard from "../../components/StatsCard";
import { CheckCircle, TrendingDown, AccessTime, Warning } from "@mui/icons-material";

export type UserStakeData = {
  staked: string;
  withdrawable: string;
  withdrawPending: string;
};

const Withdraw = () => {
  const theme = useTheme();
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");

  const { write, data: hash, isPending } = useStakeContract();

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const { data: stakedAmountRaw, isLoading: stakedLoading, refetch: refetchStaked } = useStakingBalance(BigInt(0), address);
  const { data: withdrawAmountRaw, isLoading: withdrawLoading, refetch: refetchWithdraw } = useWithdrawAmount(BigInt(0), address);

  const userData = useMemo(() => {
    if (!stakedAmountRaw || !withdrawAmountRaw) {
      return {
        staked: "0",
        withdrawable: "0",
        withdrawPending: "0",
      };
    }

    // withdrawAmountRaw 应该返回 [requestAmount, pendingWithdrawAmount]
    const [requestAmount, pendingWithdrawAmount] = withdrawAmountRaw as [bigint, bigint];
    const ava = Number(formatEther(pendingWithdrawAmount));
    const p = Number(formatEther(requestAmount));

    return {
      staked: formatEther(stakedAmountRaw),
      withdrawPending: (p - ava).toFixed(4),
      withdrawable: ava.toString(),
    };
  }, [stakedAmountRaw, withdrawAmountRaw]);

  const dataLoading = stakedLoading || withdrawLoading;

  // 当交易确认后，刷新数据
  useEffect(() => {
    if (isConfirmed) {
      refetchStaked();
      refetchWithdraw();
      setAmount("");
      toast.success("Transaction successful! 🎉");
    }
  }, [isConfirmed, refetchStaked, refetchWithdraw]);

  // 是否可提现
  const isWithdrawable = useMemo(() => {
    return Number(userData.withdrawable) > 0 && isConnected;
  }, [userData, isConnected]);

  // 是否有质押金额
  const hasStakedAmount = useMemo(() => {
    return Number(userData.staked) > 0;
  }, [userData.staked]);

  /**
   * 提现
   */
  const handleWithdraw = async () => {
    if (!address) return;
    try {
      toast.info("Initiating withdrawal...");

      write.withdraw([BigInt(0)]);
      toast.info("Transaction submitted, waiting for confirmation...");
    } catch (error: any) {
      console.error("Failed to withdraw", error);
      toast.error(error?.shortMessage || "Failed to withdraw");
    }
  };

  /**
   * 解质押
   */
  const handleUnStake = async () => {
    if (!address || !amount) return;

    // 验证输入
    if (parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > parseFloat(userData.staked)) {
      toast.error("Amount cannot be greater than staked balance");
      return;
    }

    try {
      toast.info("Initiating unstake...");

      write.unstake([BigInt(0), parseEther(amount)]);
      toast.info("Transaction submitted, waiting for confirmation...");
    } catch (error: any) {
      console.error("Failed to unstake", error);
      toast.error(error?.shortMessage || "Failed to unstake");
    }
  };

  const handleMaxUnstake = () => {
    setAmount(userData.staked);
  };

  const steps = ["Stake ETH", "Request Unstake", "Wait 20 minutes", "Withdraw"];

  const getActiveStep = () => {
    if (Number(userData.staked) === 0) return 0;
    if (Number(userData.withdrawPending) === 0 && Number(userData.withdrawable) === 0) return 1;
    if (Number(userData.withdrawPending) > 0) return 2;
    if (Number(userData.withdrawable) > 0) return 3;
    return 1;
  };

  const loading = isPending || isConfirming;

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
          Withdraw Stakes
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.secondary,
            mb: 3,
            fontSize: { xs: "1rem", md: "1.25rem" },
          }}
        >
          Unstake your ETH and withdraw your earnings
        </Typography>

        {/* Process Steps */}
        <Card
          sx={{
            mb: 4,
            p: 3,
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Withdrawal Process
          </Typography>
          <Stepper activeStep={getActiveStep()} sx={{ mb: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Card>
      </Box>

      {/* Stats Cards */}
      {isConnected && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" }, gap: 3, mb: 4, width: "100%" }} className="animate-fadeInUp">
          <StatsCard title="Staked Amount" value={`${parseFloat(userData.staked).toFixed(4)} ETH`} subtitle="Total staked balance" icon="staked" color="primary" loading={dataLoading} />
          <StatsCard title="Available to Withdraw" value={`${parseFloat(userData.withdrawable).toFixed(4)} ETH`} subtitle="Ready for withdrawal" icon="withdrawable" color="success" loading={dataLoading} />
          <StatsCard title="Pending Withdrawal" value={`${parseFloat(userData.withdrawPending).toFixed(4)} ETH`} subtitle="Waiting period active" icon="pending" color="warning" loading={dataLoading} />
        </Box>
      )}

      {!isConnected ? (
        <Card
          className="hover-lift animate-fadeInUp"
          sx={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "24px",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.secondary }}>
              Connect your wallet to manage your stakes
            </Typography>
            <ConnectButton />
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gap: 4 }}>
          {/* Unstake Section */}
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
                background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <TrendingDown sx={{ color: theme.palette.warning.main, fontSize: "2rem" }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Unstake ETH
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    Start the withdrawal process for your staked ETH
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 4 }} />

              {!hasStakedAmount ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  {`You don't have any staked ETH to unstake. Visit the stake page to start staking.`}
                </Alert>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: theme.palette.text.primary }}>
                    Unstake Amount
                  </Typography>

                  <TextField
                    fullWidth
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    label="Amount to unstake"
                    type="number"
                    variant="outlined"
                    placeholder="0.0"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Button
                              size="small"
                              onClick={handleMaxUnstake}
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
                        "& input": { py: 2 },
                      },
                    }}
                  />

                  {amount && parseFloat(amount) > 0 && (
                    <Alert severity={parseFloat(amount) > parseFloat(userData.staked) ? "error" : "warning"} sx={{ mb: 3 }} icon={<Warning />}>
                      {parseFloat(amount) > parseFloat(userData.staked) ? "Amount exceeds your staked balance" : `After unstaking ${amount} ETH, you'll need to wait 20 minutes before withdrawal.`}
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleUnStake}
                    disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(userData.staked)}
                    sx={{
                      py: 2,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                      },
                    }}
                  >
                    {loading ? "Unstaking..." : "Unstake ETH"}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Withdraw Section */}
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
                background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <CheckCircle sx={{ color: theme.palette.success.main, fontSize: "2rem" }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Withdraw
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    Withdraw your available ETH to your wallet
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Ready Amount:
                </Typography>
                <Chip label={`${userData.withdrawable} ETH`} color="success" sx={{ fontWeight: 600, fontSize: "1rem" }} />
              </Box>

              {Number(userData.withdrawPending) > 0 && (
                <Alert severity="info" sx={{ mb: 3 }} icon={<AccessTime />}>
                  You have {userData.withdrawPending} ETH in the 20-minute waiting period. Check back later to withdraw these funds.
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={!isWithdrawable}
                onClick={handleWithdraw}
                sx={{
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: "16px",
                  background: isWithdrawable ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)" : undefined,
                  "&:hover": {
                    background: isWithdrawable ? "linear-gradient(135deg, #059669 0%, #10b981 100%)" : undefined,
                  },
                }}
              >
                {loading ? "Withdrawing..." : isWithdrawable ? "Withdraw ETH" : "No funds available"}
              </Button>

              <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: "center" }}>
                  💡 Tip: After unstaking, funds require a 20-minute waiting period before they become available for withdrawal.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default Withdraw;
