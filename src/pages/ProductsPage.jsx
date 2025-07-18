import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Breadcrumbs,
  Link,
  Pagination,
  Divider,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { 
  NavigateNext as NavigateNextIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import { productAPI, categoryAPI } from '../api';

const ProductsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // API states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, selectedCategory, priceRange]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories([
        { id: 'all', name: 'Tất cả sản phẩm', count: 0 },
        ...response.data.map(cat => ({ ...cat, count: 0 }))
      ]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sortBy,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      };
      
      const response = await productAPI.getProducts(params);
      setProducts(response.data.products || response.data);
      setTotalPages(response.data.totalPages || Math.ceil(response.data.length / 12));
    } catch (error) {
      setError('Không thể tải danh sách sản phẩm');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock brands for now
  const brands = [
    { id: 'brand1', name: 'Traphaco', count: 45 },
    { id: 'brand2', name: 'Imexpharm', count: 32 },
    { id: 'brand3', name: 'Domesco', count: 28 },
    { id: 'brand4', name: 'Pymepharco', count: 25 },
    { id: 'brand5', name: 'Pfizer', count: 20 },
  ];

  // Mock products data (will be replaced by API data)
  const mockProducts = [
    {
      id: 1,
      name: 'Paracetamol 500mg - Hộp 20 viên',
      price: 15000,
      originalPrice: 20000,
      image: '/api/placeholder/300/200',
      brand: 'abbott',
    },
    {
      id: 2,
      name: 'Vitamin C 1000mg - Chai 60 viên',
      price: 120000,
      image: '/api/placeholder/300/200',
      brand: 'pfizer',
    },
    {
      id: 3,
      name: 'Thuốc cảm cúm 999 - Hộp 10 gói',
      price: 45000,
      originalPrice: 55000,
      image: '/api/placeholder/300/200',
      brand: 'johnson',
    },
    {
      id: 4,
      name: 'Khẩu trang y tế 4 lớp - Hộp 50 chiếc',
      price: 85000,
      image: '/api/placeholder/300/200',
      brand: 'abbott',
    },
    {
      id: 5,
      name: 'Dầu gội đầu Clear Men - Chai 650ml',
      price: 159000,
      originalPrice: 189000,
      image: '/api/placeholder/300/200',
      brand: 'unilever',
    },
    {
      id: 6,
      name: 'Kem đánh răng Colgate - Tuýp 200g',
      price: 45000,
      image: '/api/placeholder/300/200',
      brand: 'colgate',
    },
    {
      id: 7,
      name: 'Sữa rửa mặt Cetaphil - Chai 125ml',
      price: 249000,
      image: '/api/placeholder/300/200',
      brand: 'johnson',
    },
    {
      id: 8,
      name: 'Nhiệt kế điện tử Omron - 1 chiếc',
      price: 350000,
      originalPrice: 420000,
      image: '/api/placeholder/300/200',
      brand: 'abbott',
    },
  ];

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleBrandChange = (brandId) => {
    setSelectedBrands(prev => 
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const FilterContent = () => (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Bộ lọc
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileFilterOpen(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Category Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Danh mục
        </Typography>
        <List disablePadding>
          {categories.map((category) => (
            <ListItemButton
              key={category.id}
              selected={selectedCategory === category.id}
              onClick={() => handleCategoryChange(category.id)}
              sx={{ px: 0 }}
            >
              <ListItemText
                primary={category.name}
                secondary={`${category.count} sản phẩm`}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Price Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Khoảng giá
        </Typography>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={1000000}
          step={10000}
          valueLabelFormat={(value) => `${(value / 1000).toFixed(0)}k`}
          sx={{ mt: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {(priceRange[0] / 1000).toFixed(0)}k
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(priceRange[1] / 1000).toFixed(0)}k
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Brand Filter */}
      <Box>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Thương hiệu
        </Typography>
        <FormGroup>
          {brands.map((brand) => (
            <FormControlLabel
              key={brand.id}
              control={
                <Checkbox
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => handleBrandChange(brand.id)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  {brand.name} ({brand.count})
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link color="inherit" href="/">
          Trang chủ
        </Link>
        <Typography color="text.primary">Sản phẩm</Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Desktop Filters */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Paper elevation={0} variant="outlined">
              <FilterContent />
            </Paper>
          </Grid>
        )}

        {/* Products Column */}
        <Grid item xs={12} md={isMobile ? 12 : 9}>
          {/* Mobile Filter Button and Sort */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && (
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setMobileFilterOpen(true)}
                >
                  Bộ lọc
                </Button>
              )}
              <Typography variant="body1" color="text.secondary">
                Hiển thị {products.length} sản phẩm
              </Typography>
            </Box>
            
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Sắp xếp theo</InputLabel>
              <Select
                value={sortBy}
                label="Sắp xếp theo"
                onChange={handleSortChange}
              >
                <MenuItem value="newest">Mới nhất</MenuItem>
                <MenuItem value="price-asc">Giá tăng dần</MenuItem>
                <MenuItem value="price-desc">Giá giảm dần</MenuItem>
                <MenuItem value="best-selling">Bán chạy nhất</MenuItem>
                <MenuItem value="rating">Đánh giá cao nhất</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Products Grid */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
              {products.map((product) => (
                <Grid item xs={6} sm={4} md={4} lg={3} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "medium" : "large"}
              siblingCount={isMobile ? 0 : 1}
              boundaryCount={isMobile ? 1 : 2}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            maxWidth: '80vw',
          },
        }}
      >
        <FilterContent />
      </Drawer>
    </Box>
  );
};

export default ProductsPage;
