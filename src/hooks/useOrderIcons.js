import React from 'react';
import { 
  Schedule as PendingIcon,
  Build as ProcessingIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

/**
 * Hook to provide icons for order status and payment status
 */
export const useOrderIcons = () => {
  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return React.createElement(PendingIcon);
      case 'PROCESSING':
        return React.createElement(ProcessingIcon);
      case 'SHIPPED':
        return React.createElement(ShippingIcon);
      case 'COMPLETED':
        return React.createElement(CompleteIcon);
      case 'CANCELLED':
        return React.createElement(CancelIcon);
      default:
        return null;
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'UNPAID':
        return React.createElement(PaymentIcon, { color: 'error' });
      case 'PAID':
        return React.createElement(PaymentIcon, { color: 'success' });
      default:
        return null;
    }
  };

  return {
    getOrderStatusIcon,
    getPaymentStatusIcon
  };
};

export default useOrderIcons;
