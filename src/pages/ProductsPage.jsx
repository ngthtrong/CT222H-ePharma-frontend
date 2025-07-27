import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Paper,
} from '@mui/material';
import { getProducts } from '../api/productApi';
import { getCategories } from '../api/categoryApi';
import ProductCard from '../components/ProductCard';
import { formatCurrency } from '../utils/formatters';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'name_asc');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: searchParams.get('page') || 1,
        limit: 12,
        categoryId: searchParams.get('category'),
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice'),
        sortBy: searchParams.get('sortBy'),
        search: searchParams.get('search'),
      };
      // Remove null/undefined params
      Object.keys(params).forEach(key => params[key] == null && delete params[key]);

      const response = await getProducts(params);
      setProducts(response.data.data || response.data.products || response.data || []);
      setPagination(response.pagination || {});
    } catch (err) {
      setError('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const categoriesResponse = await getCategories();
        const cats = categoriesResponse.data;
        if (cats && cats.data) {
          setCategories(cats.data || []);
        } else if (Array.isArray(cats)) {
          setCategories(cats);
        } else {
          setCategories([]);
        }
      } catch (err) {
        setCategories([]);
      }
    };
    fetchInitialData();
  }, []);

  const handlePageChange = (event, value) => {
    setSearchParams(prev => {
      prev.set('page', value);
      return prev;
    });
  };

  const handleFilterChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter(value);
    setSearchParams(prev => {
      if (value) {
        prev.set(name, value);
      } else {
        prev.delete(name);
      }
      prev.set('page', '1'); // Reset to first page on filter change
      return prev;
    });
  };
  
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handlePriceChangeCommitted = (event, newValue) => {
     setSearchParams(prev => {
      prev.set('minPrice', newValue[0]);
      prev.set('maxPrice', newValue[1]);
      prev.set('page', '1');
      return prev;
    });
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Our Products
      </Typography>
      <Grid container spacing={4}>
        {/* Filters */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Filters</Typography>
            {/* Category Filter */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                name="category"
                value={selectedCategory}
                label="Category"
                onChange={handleFilterChange(setSelectedCategory)}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {categories.map((cat, index) => (
                  <MenuItem key={cat._id || index} value={cat._id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Price Range Filter */}
            <Typography gutterBottom>Price Range</Typography>
             <Slider
                value={priceRange}
                onChange={handlePriceChange}
                onChangeCommitted={handlePriceChangeCommitted}
                valueLabelDisplay="auto"
                min={0}
                max={5000000}
                step={50000}
                getAriaValueText={(value) => `${formatCurrency(value)}`}
                valueLabelFormat={(value) => `${formatCurrency(value)}`}
            />
             <Box display="flex" justifyContent="space-between">
                <Typography variant="caption">{formatCurrency(priceRange[0])}</Typography>
                <Typography variant="caption">{formatCurrency(priceRange[1])}</Typography>
            </Box>


            {/* Sort By */}
             <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                name="sortBy"
                value={sortBy}
                label="Sort By"
                onChange={handleFilterChange(setSortBy)}
              >
                <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                <MenuItem value="price_asc">Price (Low to High)</MenuItem>
                <MenuItem value="price_desc">Price (High to Low)</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Products Grid */}
        <Grid size={{ xs: 12, md: 9 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <Grid container spacing={2}>
                {products.length > 0 ? (
                  products.map((product) => (
                    <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <ProductCard product={product} />
                    </Grid>
                  ))
                ) : (
                  <Typography sx={{p: 3}}>No products found matching your criteria.</Typography>
                )}
              </Grid>
              {pagination.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductsPage;
