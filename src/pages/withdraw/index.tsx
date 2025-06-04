"use client";

import { Box, Button, TextField, Typography, Card, CardContent, InputAdornment, Alert, Chip, Divider, useTheme, Stepper, Step, StepLabel } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { toast } from "react-toastify";
import StatsCard from "../../components/StatsCard";
import { CheckCircle, TrendingDown, AccessTime, Warning } from "@mui/icons-material";
import { formatEther, parseEther } from "ethers";
import { useStakeContractEthers } from "../../hooks/useEthersContract";

export type UserStakeData = {
  staked: string;
  withdrawable: string;
  withdrawPending: string;
};

const _userData = {
  staked: "0",
  withdrawable: "0",
  withdrawPending: "0",
};

const Withdraw = () => {
  const theme = useTheme();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [userData, setUserData] = useState<UserStakeData>(_userData);
  const { readOnlyContract, writeableContract } = useStakeContractEthers();

  // 是否可提现
  const isWithdrawable = useMemo(() => {
    return Number(userData.withdrawable) > 0 && isConnected;
  }, [userData, isConnected]);

  // 是否有质押金额
  const hasStakedAmount = useMemo(() => {
    return Number(userData.staked) > 0;
  }, [userData.staked]);

  /**
   * 获取用户质押数据
   */
  const getUserStakeData = useCallback(async () => {
    if (!readOnlyContract || !address) return;

    try {
      setDataLoading(true);
      const staked = await readOnlyContract.stakingBalance(0, address);
      const [requestAmount, pendingWithdrawAmount] = await readOnlyContract.withdrawAmount(0, address);

      const ava = Number(formatEther(pendingWithdrawAmount));
      const p = Number(formatEther(requestAmount));

      setUserData({
        staked: formatEther(staked),
        withdrawPending: (p - ava).toFixed(4),
        withdrawable: ava.toString(),
      });
    } catch (error) {
      console.error("Failed to get stake data", error);
    } finally {
      setDataLoading(false);
    }
  }, [readOnlyContract, address]);

  useEffect(() => {
    if (readOnlyContract && address) {
      getUserStakeData();
    }
  }, [readOnlyContract, address, getUserStakeData]);

  /**
   * 提现
   */
  const handleWithdraw = async () => {
    if (!writeableContract || !address) return;

    try {
      setWithdrawLoading(true);
      toast.info("Initiating withdrawal...");

      const tx = await writeableContract.withdraw(0);
      toast.info("Transaction submitted, waiting for confirmation...");

      const receipt = await tx.wait();
      console.log(receipt, "tx receipt");
      toast.success("Withdrawal successful! 🎉");
      await getUserStakeData();
    } catch (error: any) {
      console.error("Failed to withdraw", error);
      toast.error(error?.reason || error?.message || "Failed to withdraw");
    } finally {
      setWithdrawLoading(false);
    }
  };

  /**
   * 解质押
   */
  const handleUnStake = async () => {
    if (!writeableContract || !address || !amount) return;

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
      setLoading(true);
      toast.info("Initiating unstake...");

      const tx = await writeableContract.unstake(0, parseEther(amount));
      toast.info("Transaction submitted, waiting for confirmation...");

      const receipt = await tx.wait();
      console.log(receipt, "tx receipt");
      toast.success("Unstake successful! ⏰ 20 minutes waiting period started");
      await getUserStakeData();
      setAmount(""); // 清空输入框
    } catch (error: any) {
      console.error("Failed to unstake", error);
      toast.error(error?.reason || error?.message || "Failed to unstake");
    } finally {
      setLoading(false);
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
          <Stepper activeStep={getActiveStep()} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: completed ? theme.palette.success.main : active ? theme.palette.primary.main : theme.palette.grey[300],
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      {completed ? <CheckCircle /> : index + 1}
                    </Box>
                  )}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Card>
      </Box>

      {/* Stats Cards */}
      {isConnected && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
            mb: 4,
            width: "100%",
          }}
          className="animate-fadeInUp"
        >
          <StatsCard title="Staked Amount" value={`${parseFloat(userData.staked).toFixed(4)} ETH`} subtitle="Total staked" icon="staked" color="primary" loading={dataLoading} />
          <StatsCard title="Pending Withdrawal" value={`${parseFloat(userData.withdrawPending).toFixed(4)} ETH`} subtitle="Waiting period" icon="pending" color="warning" loading={dataLoading} />
          <StatsCard title="Available to Withdraw" value={`${parseFloat(userData.withdrawable).toFixed(4)} ETH`} subtitle="Ready for withdrawal" icon="withdrawable" color="success" loading={dataLoading} />
        </Box>
      )}

      {/* Main Cards */}
      <Box sx={{ display: "grid", gap: 3 }}>
        {/* Unstake Card */}
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
              background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
            },
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <TrendingDown sx={{ color: theme.palette.warning.main, fontSize: 32 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Unstake ETH
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mb: 4,
              }}
            >
              {`Request to unstake your ETH. There's a 20-minute waiting period before you can withdraw.`}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            {!isConnected ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                  Connect your wallet to unstake
                </Typography>
                <ConnectButton />
              </Box>
            ) : !hasStakedAmount ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                {`You don't have any staked ETH to unstake.`}
              </Alert>
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
                      "& input": {
                        py: 2,
                      },
                    },
                  }}
                />

                {amount && parseFloat(amount) > 0 && (
                  <Alert severity={parseFloat(amount) > parseFloat(userData.staked) ? "error" : "warning"} sx={{ mb: 3 }} icon={<AccessTime />}>
                    {parseFloat(amount) > parseFloat(userData.staked) ? "Amount exceeds your staked balance" : `You will unstake ${amount} ETH. There's a 20-minute waiting period before withdrawal.`}
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleUnStake}
                  disabled={loading || !amount || parseFloat(amount) <= 0 || !writeableContract}
                  sx={{
                    py: 2,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: "16px",
                    backgroundColor: theme.palette.warning.main,
                    "&:hover": {
                      backgroundColor: theme.palette.warning.dark,
                    },
                  }}
                >
                  {loading ? "Unstaking..." : "Unstake ETH"}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Withdraw Card */}
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
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            },
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 32 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Withdraw ETH
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mb: 4,
              }}
            >
              Withdraw your ETH that has completed the waiting period.
            </Typography>

            <Divider sx={{ mb: 4 }} />

            {!isConnected ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                  Connect your wallet to withdraw
                </Typography>
                <ConnectButton />
              </Box>
            ) : !isWithdrawable ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                {Number(userData.withdrawPending) > 0 ? "Your unstake request is pending. Please wait for the 20-minute period to complete." : "No ETH available for withdrawal. You need to unstake first."}
              </Alert>
            ) : (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
                  You have {userData.withdrawable} ETH ready for withdrawal!
                </Alert>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleWithdraw}
                  disabled={withdrawLoading || !writeableContract}
                  sx={{
                    py: 2,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderRadius: "16px",
                    backgroundColor: theme.palette.success.main,
                    "&:hover": {
                      backgroundColor: theme.palette.success.dark,
                    },
                  }}
                >
                  {withdrawLoading ? "Withdrawing..." : `Withdraw ${userData.withdrawable} ETH`}
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: "center" }}>
                💡 Tip: Once you withdraw, the ETH will be transferred back to your wallet immediately.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Withdraw;
