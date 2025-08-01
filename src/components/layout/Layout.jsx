import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import BackToTopButton from '../BackToTopButton';

const Layout = ({ children }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        overflow: 'hidden' // Prevent horizontal scrolling
      }}
    >
      <Header />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          py: { xs: 2, md: 3 },
          overflow: 'hidden' // Prevent horizontal overflow
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            overflow: 'hidden' // Prevent horizontal overflow in container
          }}
        >
          {children}
        </Container>
      </Box>
      <Footer />
      <BackToTopButton />
    </Box>
  );
};

export default Layout;
