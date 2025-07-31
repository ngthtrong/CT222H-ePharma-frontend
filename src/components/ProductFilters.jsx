import React from 'react';
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Box,
  Chip,
  Button,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';
import PropTypes from 'prop-types';

const ProductFilters = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  onFilterChange,
  onPriceChange,
  onPriceChangeCommitted,
  onClearFilters
}) => {
  const hasActiveFilters = selectedCategory || 
    priceRange[0] > 0 || priceRange[1] < 5000000;

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Bộ lọc
        </Typography>
        {hasActiveFilters && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            sx={{ minWidth: 'auto' }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </Box>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Bộ lọc đang áp dụng:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {selectedCategory && (
              <Chip
                label="Danh mục"
                size="small"
                onDelete={() => onFilterChange(setSelectedCategory)({ target: { name: 'category', value: '' } })}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      )}

      {/* Category Filter */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="category-select-label">Danh mục</InputLabel>
        <Select
          labelId="category-select-label"
          name="category"
          value={selectedCategory || ''}
          label="Danh mục"
          onChange={onFilterChange(setSelectedCategory)}
        >
          <MenuItem value="">
            <em>Tất cả</em>
          </MenuItem>
          {categories.map((cat, index) => (
            <MenuItem key={cat.id || cat._id || index} value={cat.id || cat._id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Price Range Filter */}
      <Typography gutterBottom>Khoảng giá</Typography>
      <Slider
        value={priceRange}
        onChange={onPriceChange}
        onChangeCommitted={onPriceChangeCommitted}
        valueLabelDisplay="auto"
        min={0}
        max={5000000}
        step={50000}
        getAriaValueText={(value) => `${formatCurrency(value)}`}
        valueLabelFormat={(value) => `${formatCurrency(value)}`}
      />
      <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="caption">{formatCurrency(priceRange[0])}</Typography>
        <Typography variant="caption">{formatCurrency(priceRange[1])}</Typography>
      </Box>

      {/* Sort By */}
      <FormControl fullWidth>
        <InputLabel id="sort-by-label">Sắp xếp theo</InputLabel>
        <Select
          labelId="sort-by-label"
          name="sortBy"
          value={sortBy || ''}
          label="Sắp xếp theo"
          onChange={onFilterChange(setSortBy)}
        >
          <MenuItem value="name_asc">Tên (A-Z)</MenuItem>
          <MenuItem value="name_desc">Tên (Z-A)</MenuItem>
          <MenuItem value="price_asc">Giá (Thấp đến Cao)</MenuItem>
          <MenuItem value="price_desc">Giá (Cao đến Thấp)</MenuItem>
          <MenuItem value="discount_desc">Giảm giá nhiều nhất</MenuItem>
          <MenuItem value="newest">Mới nhất</MenuItem>
          <MenuItem value="popular">Phổ biến nhất</MenuItem>
        </Select>
      </FormControl>
    </Paper>
  );
};

ProductFilters.propTypes = {
  categories: PropTypes.array.isRequired,
  selectedCategory: PropTypes.string,
  setSelectedCategory: PropTypes.func.isRequired,
  priceRange: PropTypes.array.isRequired,
  setPriceRange: PropTypes.func.isRequired,
  sortBy: PropTypes.string,
  setSortBy: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onPriceChange: PropTypes.func.isRequired,
  onPriceChangeCommitted: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
};

export default ProductFilters;
