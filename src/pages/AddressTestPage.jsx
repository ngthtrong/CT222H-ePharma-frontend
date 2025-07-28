import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import AddressManager from '../components/AddressManager';

const AddressTestPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Test Address Manager
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Trang test tính năng quản lý địa chỉ người dùng
        </Typography>
        
        <AddressManager />
      </Box>
    </Container>
  );
};

export default AddressTestPage;
