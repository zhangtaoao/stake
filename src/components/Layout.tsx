import { ReactNode } from "react";
import { Box, Container } from "@mui/material";
import Header from "./Header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'var(--background-gradient)',
      }}
    >
      <Header />
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 4, md: 6 },
          px: { xs: 2, md: 3 },
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {children}
      </Container>
    </Box>
  )
}