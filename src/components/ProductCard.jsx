import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Box,
  Chip,
} from '@mui/material';
import PropTypes from 'prop-types';
import { formatCurrency } from '../utils/formatters';
import { getImageSrc, handleImageError } from '../utils/imageUtils';
import AddToCartButton from './AddToCartButton';

const ProductCard = ({ product, onClick }) => {
  const hasDiscount = product.discountPercent > 0;
  const finalPrice = hasDiscount
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 10;

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea 
        component={RouterLink} 
        to={`/product/${product.slug}`}
        onClick={handleCardClick}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={getImageSrc(product.images?.[0], 300, 200)}
            alt={product.name}
            onError={handleImageError}
          />
          {hasDiscount && (
            <Chip 
              label={`-${product.discountPercent}%`} 
              color="error"
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8 }} 
            />
          )}
          {isOutOfStock && (
            <Chip 
              label="Hết hàng" 
              color="error"
              size="small"
              sx={{ position: 'absolute', top: hasDiscount ? 40 : 8, right: 8, backgroundColor: 'rgba(244, 67, 54, 0.9)', color: 'white' }} 
            />
          )}
          {isLowStock && (
            <Chip 
              label="Sắp hết" 
              color="warning"
              size="small"
              sx={{ position: 'absolute', top: hasDiscount ? 40 : 8, right: 8 }} 
            />
          )}
          {product.condition === 'new' && !hasDiscount && !isOutOfStock && !isLowStock && (
            <Chip 
              label="Mới" 
              color="success"
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8 }} 
            />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography 
              variant="h6" 
              color="primary" 
              sx={{ mr: 1 }}
            >
              {formatCurrency(finalPrice)}
            </Typography>
            {hasDiscount && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                {formatCurrency(product.price)}
              </Typography>
            )}
          </Box>
          {/* Stock status indicator */}
          <Box sx={{ mt: 1 }}>
            <Typography 
              variant="caption" 
              color={isOutOfStock ? 'error.main' : isLowStock ? 'warning.main' : 'success.main'}
              sx={{ fontWeight: 500 }}
            >
              {isOutOfStock ? 'Hết hàng' : isLowStock ? `Còn ${product.stockQuantity} sản phẩm` : 'Còn hàng'}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ justifyContent: 'center', p: 2 }}>
        <AddToCartButton
          productId={product.id || product._id}
          quantity={1}
          outOfStock={isOutOfStock}
          fullWidth
        />
      </CardActions>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    price: PropTypes.number.isRequired,
    discountPercent: PropTypes.number,
    stockQuantity: PropTypes.number.isRequired,
    condition: PropTypes.oneOf(['new', 'used', 'refurbished']),
  }).isRequired,
  onClick: PropTypes.func,
};

export default ProductCard;
