import React from 'react';
import { Card, CardContent, Box, Typography, useTheme } from '@mui/material';
import { TrendingUp, Wallet, AccessTime, CheckCircle } from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: 'staked' | 'withdrawable' | 'pending' | 'wallet';
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  loading?: boolean;
}

const iconMap = {
  staked: TrendingUp,
  withdrawable: CheckCircle,
  pending: AccessTime,
  wallet: Wallet,
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon = 'staked',
  color = 'primary',
  loading = false,
}) => {
  const theme = useTheme();
  const IconComponent = iconMap[icon];

  const getIconColor = () => {
    switch (color) {
      case 'secondary':
        return theme.palette.secondary.main;
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getGradient = () => {
    switch (color) {
      case 'secondary':
        return 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)';
      case 'success':
        return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
      default:
        return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
    }
  };

  return (
    <Card
      className="hover-lift animate-fadeInUp"
      sx={{
        height: '100%',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: getGradient(),
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              p: 1,
              borderRadius: '12px',
              background: `${getIconColor()}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconComponent
              sx={{
                fontSize: '1.2rem',
                color: getIconColor(),
              }}
            />
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ py: 1 }}>
            <Box
              sx={{
                height: '28px',
                width: '80%',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '4px',
                mb: 1,
              }}
            />
            {subtitle && (
              <Box
                sx={{
                  height: '16px',
                  width: '60%',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: '4px',
                }}
              />
            )}
          </Box>
        ) : (
          <>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: subtitle ? 0.5 : 0,
                wordBreak: 'break-all',
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.875rem',
                }}
              >
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard; 