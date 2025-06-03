'use client'
import { 
  Box, 
  Typography, 
  useTheme, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText,
  useMediaQuery
} from "@mui/material"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu as MenuIcon, Close } from "@mui/icons-material"

const Header = () => {
  const theme = useTheme()
  const pathname = usePathname()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const Links = [
    {
      name: 'Stake',
      path: '/'
    },
    {
      name: 'Withdrawal',
      path: '/withdraw'
    }
  ]

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const NavLinks = () => (
    <Box display={'flex'} flexDirection={isMobile ? 'column' : 'row'} gap={isMobile ? 1 : 0}>
      {Links.map(link => {
        const active = (pathname === link.path || pathname === link.path + '/');
        return (
          <Link key={link.name} href={link.path} style={{ textDecoration: 'none' }}>
            <Typography
              className='hover-lift'
              onClick={() => isMobile && setDrawerOpen(false)}
              sx={{
                mx: isMobile ? 0 : 3,
                my: isMobile ? 1 : 0,
                px: isMobile ? 2 : 3,
                py: 1.5,
                fontWeight: active ? '600' : '500',
                fontSize: isMobile ? '1.1rem' : '1rem',
                color: active ? theme.palette.primary.main : theme.palette.text.primary,
                borderRadius: '12px',
                background: active ? `${theme.palette.primary.main}15` : 'transparent',
                border: active ? `2px solid ${theme.palette.primary.main}30` : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                '&:hover': {
                  background: active ? `${theme.palette.primary.main}20` : `${theme.palette.primary.main}10`,
                  border: `2px solid ${theme.palette.primary.main}40`,
                  transform: 'translateY(-2px)',
                },
                '&::after': active ? {
                  content: '""',
                  position: 'absolute',
                  bottom: isMobile ? 'auto' : '-8px',
                  left: isMobile ? '8px' : '50%',
                  right: isMobile ? 'auto' : 'auto',
                  top: isMobile ? '50%' : 'auto',
                  transform: isMobile ? 'translateY(-50%)' : 'translateX(-50%)',
                  width: isMobile ? '4px' : '20px',
                  height: isMobile ? '20px' : '4px',
                  borderRadius: '2px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                } : {},
              }}
            >
              {link.name}
            </Typography>
          </Link>
        )
      })}
    </Box>
  )

  return (
    <>
      <Box 
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: { xs: '12px 20px', md: '16px 40px' },
          maxWidth: '1200px',
          mx: 'auto',
        }}>
          {/* Logo */}
          <Box
            className="hover-lift"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Typography
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                }}
              >
                R
              </Typography>
            </Box>
            <Typography
              className="gradient-text"
              sx={{
                fontSize: { xs: '1.5rem', md: '1.8rem' },
                fontWeight: 700,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              RCC Stake
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box display={'flex'} alignItems={'center'} gap={4}>
              <NavLinks />
              <ConnectButton />
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box display={'flex'} alignItems={'center'} gap={2}>
              <ConnectButton />
              <IconButton
                onClick={toggleDrawer}
                sx={{
                  p: 1,
                  borderRadius: '12px',
                  background: `${theme.palette.primary.main}15`,
                  '&:hover': {
                    background: `${theme.palette.primary.main}25`,
                  },
                }}
              >
                <MenuIcon sx={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: '280px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography
              className="gradient-text"
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              Menu
            </Typography>
            <IconButton onClick={toggleDrawer}>
              <Close />
            </IconButton>
          </Box>
          <NavLinks />
        </Box>
      </Drawer>
    </>
  )
}

export default Header