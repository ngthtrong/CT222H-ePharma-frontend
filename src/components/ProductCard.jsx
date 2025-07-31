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

const ProductCard = ({ product }) => {
  const hasDiscount = product.discountPercent > 0;
  const finalPrice = hasDiscount
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={RouterLink} to={`/product/${product.slug}`}>
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
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ justifyContent: 'center', p: 2 }}>
        <AddToCartButton
          productId={product.id || product._id}
          quantity={1}
          outOfStock={product.stockQuantity === 0}
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
  }).isRequired,
};

export default ProductCard;
