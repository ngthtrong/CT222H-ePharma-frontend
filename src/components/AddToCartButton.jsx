import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  AddShoppingCart as AddShoppingCartIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useCart } from '../contexts/CartContext';

const AddToCartButton = ({ 
  productId, 
  quantity = 1, 
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  outOfStock = false,
  children,
  onSuccess,
  onError,
  showSnackbar = true,
  successMessage,
  ...props 
}) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!productId) {
      console.error('❌ AddToCartButton: ProductId is missing');
      setError('Thiếu thông tin sản phẩm');
      if (onError) onError('ProductId is missing');
      return;
    }

    if (outOfStock || disabled) {
      return;
    }
    
    try {
      setIsAdding(true);
      setError('');
      
      await addToCart(productId, quantity);
      
      setShowSuccess(true);
      if (onSuccess) onSuccess();
      
      // Auto hide success state after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.message || 'Không thể thêm sản phẩm vào giỏ hàng';
      setError(errorMessage);
      if (onError) onError(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleCloseError = () => {
    setError('');
  };

  const getButtonContent = () => {
    if (children) return children;
    
    if (isAdding) return 'Đang thêm...';
    if (showSuccess) return 'Đã thêm!';
    if (outOfStock) return 'Hết hàng';
    return 'Thêm vào giỏ';
  };

  const getButtonIcon = () => {
    if (isAdding) return <CircularProgress size={20} color="inherit" />;
    if (showSuccess) return <CheckIcon />;
    return <AddShoppingCartIcon />;
  };

  const getButtonColor = () => {
    if (showSuccess) return 'success';
    return 'primary';
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={getButtonIcon()}
        onClick={handleAddToCart}
        disabled={outOfStock || disabled || isAdding}
        color={getButtonColor()}
        {...props}
      >
        {getButtonContent()}
      </Button>

      {/* Success Snackbar */}
      {showSnackbar && (
        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={handleCloseSuccess}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSuccess} 
            severity="success" 
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {successMessage || `Đã thêm ${quantity} sản phẩm vào giỏ hàng! 🛒`}
          </Alert>
        </Snackbar>
      )}

      {/* Error Snackbar */}
      {showSnackbar && (
        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseError} 
            severity="error" 
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {error}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

AddToCartButton.propTypes = {
  productId: PropTypes.string.isRequired,
  quantity: PropTypes.number,
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  outOfStock: PropTypes.bool,
  children: PropTypes.node,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  showSnackbar: PropTypes.bool,
  successMessage: PropTypes.string,
};

export default AddToCartButton;
