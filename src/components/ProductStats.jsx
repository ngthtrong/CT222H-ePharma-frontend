import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  LocalOffer as OfferIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const ProductStats = ({ products, pagination, selectedFilters }) => {
  const totalProducts = pagination?.totalItems || products.length;
  const inStockProducts = products.filter(p => p.stockQuantity > 0).length;
  const onSaleProducts = products.filter(p => p.discountPercent > 0).length;
  const lowStockProducts = products.filter(p => p.stockQuantity > 0 && p.stockQuantity < 10).length;

  const stats = [
    {
      label: 'Tổng sản phẩm',
      value: totalProducts,
      icon: <InventoryIcon />,
      color: 'primary'
    },
    {
      label: 'Còn hàng',
      value: inStockProducts,
      icon: <InventoryIcon />,
      color: 'success'
    },
    {
      label: 'Đang giảm giá',
      value: onSaleProducts,
      icon: <OfferIcon />,
      color: 'error'
    },
    {
      label: 'Sắp hết hàng',
      value: lowStockProducts,
      icon: <TrendingUpIcon />,
      color: 'warning'
    }
  ];

  const hasActiveFilters = Object.values(selectedFilters).some(filter => 
    filter && filter !== '' && (Array.isArray(filter) ? filter.some(f => f !== 0 && f !== 5000000) : true)
  );

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon />
          Thống kê sản phẩm
        </Typography>
        {hasActiveFilters && (
          <Chip 
            label="Có bộ lọc đang áp dụng" 
            color="primary" 
            variant="outlined" 
            size="small" 
          />
        )}
      </Box>
      
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1,
                backgroundColor: `${stat.color}.50`,
                border: 1,
                borderColor: `${stat.color}.200`,
              }}
            >
              <Box sx={{ color: `${stat.color}.main` }}>
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: `${stat.color}.main` }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {pagination && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Hiển thị {products.length} trên tổng số {totalProducts} sản phẩm
            {pagination.currentPage && pagination.totalPages && (
              <> • Trang {pagination.currentPage} / {pagination.totalPages}</>
            )}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

ProductStats.propTypes = {
  products: PropTypes.array.isRequired,
  pagination: PropTypes.object,
  selectedFilters: PropTypes.object.isRequired,
};

export default ProductStats;
