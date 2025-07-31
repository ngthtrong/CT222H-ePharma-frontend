import React from 'react';
import { IconButton, Badge } from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartIcon = ({ color = 'inherit', size = 'medium' }) => {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <IconButton
      color={color}
      onClick={handleCartClick}
      size={size}
      aria-label={`Cart with ${totalItems} items`}
    >
      <Badge badgeContent={totalItems} color="error" max={99}>
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  );
};

export default CartIcon;
