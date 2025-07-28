import React from 'react';
import { Box, Container } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Header />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          py: { xs: 2, md: 3 },
          px: isAdminPage ? { xs: 1, md: 2 } : 0,
        }}
      >
        {isAdminPage ? (
          children
        ) : (
          <Container maxWidth="lg">
            {children}
          </Container>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
