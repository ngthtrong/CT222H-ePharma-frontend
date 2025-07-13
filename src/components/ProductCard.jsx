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

const ProductCard = ({ product }) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleAddToCart = () => {
    console.log('Added to cart:', product.name);
    // TODO: Implement add to cart functionality
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: 6,
          cursor: 'pointer',
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.image || '/api/placeholder/300/200'}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        p: { xs: 1.5, sm: 2 }
      }}>
        <Typography
          variant="body1"
          fontWeight="medium"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.4,
            minHeight: '2.8em',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {product.name}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
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
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Thêm vào giỏ
            </Box>
            <Box component="span" sx={{ display: { xs: 'block', sm: 'none' } }}>
              Thêm
            </Box>
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
