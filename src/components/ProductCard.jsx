import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { AddShoppingCart as AddShoppingCartIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../api/cartApi';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  
  // Get the first image from images array, fallback to placeholder
  const getProductImage = () => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://via.placeholder.com/300x225/e3f2fd/1976d2?text=No+Image+Available';
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent card click navigation
    try {
      await cartAPI.addToCart(product._id || product.id, 1);
      console.log('Added to cart:', product.name);
      // Call parent callback if provided
      if (onAddToCart) {
        onAddToCart(product);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleCardClick = () => {
    // Navigate to product detail page using slug
    const slug = product.slug || product._id || product.id;
    navigate(`/product/${slug}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
          boxShadow: 6,
          cursor: 'pointer',
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Image Container với aspect ratio cố định */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '75%', // 4:3 aspect ratio
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
        }}
      >
        <CardMedia
          component="img"
          image={getProductImage()}
          alt={product.name}
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x225/e3f2fd/1976d2?text=Image+Error';
          }}
        />
      </Box>
      
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        p: { xs: 1.5, sm: 2 },
        gap: 1
      }}>
        {/* Product Name */}
        <Typography
          variant="body1"
          fontWeight="medium"
          sx={{
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.4,
            minHeight: '2.8em',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          {product.name}
        </Typography>

        {/* Brand */}
        {product.brand && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 400,
              mb: 1,
            }}
          >
            Thương hiệu: {product.brand}
          </Typography>
        )}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Price Section */}
        <Box sx={{ mb: 2 }}>
          {hasDiscount ? (
            <Box>
              <Typography
                variant="h6"
                color="error"
                fontWeight="bold"
                sx={{ 
                  mb: 0.5,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                {product.price.toLocaleString('vi-VN')}đ
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ 
                  textDecoration: 'line-through',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                {product.originalPrice.toLocaleString('vi-VN')}đ
              </Typography>
            </Box>
          ) : (
            <Typography
              variant="h6"
              color="primary"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {product.price.toLocaleString('vi-VN')}đ
            </Typography>
          )}
        </Box>

        {/* Add to Cart Button */}
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddShoppingCartIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />}
          onClick={handleAddToCart}
          sx={{
            py: { xs: 0.8, sm: 1 },
            borderRadius: 2,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Thêm vào giỏ
          </Box>
          <Box component="span" sx={{ display: { xs: 'block', sm: 'none' } }}>
            Thêm
          </Box>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
