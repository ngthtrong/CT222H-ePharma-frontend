import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  List,
  ListItemButton,
  ListItemText,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data
  const categories = [
    { id: 'all', name: 'Tất cả sản phẩm', children: [] },
    { 
      id: 'duoc-pham', 
      name: 'Dược phẩm', 
      children: [
        { id: 'thuoc-khong-ke-don', name: 'Thuốc không kê đơn' },
        { id: 'thuoc-ke-don', name: 'Thuốc kê đơn' },
        { id: 'thuoc-cam-cum', name: 'Thuốc cảm cúm' },
      ]
    },
    { 
      id: 'cham-soc-ca-nhan', 
      name: 'Chăm sóc cá nhân',
      children: [
        { id: 'cham-soc-da', name: 'Chăm sóc da' },
        { id: 'cham-soc-toc', name: 'Chăm sóc tóc' },
        { id: 've-sinh-rang-mieng', name: 'Vệ sinh răng miệng' },
      ]
    },
    { 
      id: 'thiet-bi-y-te', 
      name: 'Thiết bị y tế',
      children: [
        { id: 'may-do-huyet-ap', name: 'Máy đo huyết áp' },
        { id: 'nhiet-ke', name: 'Nhiệt kế' },
        { id: 'may-xong-mui', name: 'Máy xông mũi' },
      ]
    },
  ];

  const brands = [
    'Abbott', 'Sanofi', 'Traphaco', 'Hau Giang', 'DHG Pharma', 
    'Stada', 'Pfizer', 'Johnson & Johnson', 'L\'Oreal', 'Eucerin'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price-asc', label: 'Giá tăng dần' },
    { value: 'price-desc', label: 'Giá giảm dần' },
    { value: 'bestselling', label: 'Bán chạy nhất' },
  ];

  const products = [
    {
      id: 1,
      name: 'Paracetamol 500mg - Hộp 100 viên',
      price: 25000,
      discount: 20,
      image: 'https://via.placeholder.com/300x300/ffffff/0D47A1?text=Paracetamol',
      category: 'duoc-pham',
      brand: 'Traphaco',
    },
    {
      id: 2,
      name: 'Vitamin C 1000mg - Chai 60 viên',
      price: 150000,
      discount: 15,
      image: 'https://via.placeholder.com/300x300/ffffff/f57c00?text=Vitamin+C',
      category: 'duoc-pham',
      brand: 'DHG Pharma',
    },
    {
      id: 3,
      name: 'Kem chống nắng SPF50+ - Tuýp 50ml',
      price: 320000,
      discount: 25,
      image: 'https://via.placeholder.com/300x300/ffffff/7b1fa2?text=Kem+chống+nắng',
      category: 'cham-soc-ca-nhan',
      brand: 'L\'Oreal',
    },
    {
      id: 4,
      name: 'Máy đo huyết áp điện tử',
      price: 850000,
      discount: 10,
      image: 'https://via.placeholder.com/300x300/ffffff/2e7d32?text=Máy+đo+HA',
      category: 'thiet-bi-y-te',
      brand: 'Abbott',
    },
    {
      id: 5,
      name: 'Dầu gội đầu trị gàu - Chai 400ml',
      price: 180000,
      image: 'https://via.placeholder.com/300x300/ffffff/0D47A1?text=Dầu+gội',
      category: 'cham-soc-ca-nhan',
      brand: 'Johnson & Johnson',
    },
    {
      id: 6,
      name: 'Thuốc ho Prospan - Chai 100ml',
      price: 95000,
      image: 'https://via.placeholder.com/300x300/ffffff/d32f2f?text=Thuốc+ho',
      category: 'duoc-pham',
      brand: 'Stada',
    },
    {
      id: 7,
      name: 'Nhiệt kế điện tử - Đầu mềm',
      price: 120000,
      image: 'https://via.placeholder.com/300x300/ffffff/2e7d32?text=Nhiệt+kế',
      category: 'thiet-bi-y-te',
      brand: 'Abbott',
    },
    {
      id: 8,
      name: 'Kem dưỡng ẩm Eucerin - Tuýp 200ml',
      price: 280000,
      image: 'https://via.placeholder.com/300x300/ffffff/7b1fa2?text=Kem+dưỡng',
      category: 'cham-soc-ca-nhan',
      brand: 'Eucerin',
    },
  ];

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleBrandChange = (brandName) => {
    setSelectedBrands(prev => 
      prev.includes(brandName) 
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
    );
    setCurrentPage(1);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
    setCurrentPage(1);
  };

  const handleAddToCart = (product) => {
    console.log('Thêm vào giỏ hàng:', product);
  };

  // Filter và sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      
      return matchesSearch && matchesCategory && matchesPrice && matchesBrand;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
        default:
          return 0;
      }
    });

  const productsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const FilterSidebar = () => (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, height: 'fit-content' }}>
      <Typography variant="h6" gutterBottom color="#212121">
        Bộ lọc
      </Typography>
      
      {/* Lọc theo danh mục */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom color="#212121">
          Danh mục
        </Typography>
        <List dense>
          {categories.map((category) => (
            <Box key={category.id}>
              <ListItemButton
                selected={selectedCategory === category.id}
                onClick={() => handleCategorySelect(category.id)}
                sx={{ pl: 0, py: 0.5 }}
              >
                <ListItemText 
                  primary={category.name}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    color: selectedCategory === category.id ? '#0D47A1' : '#424242'
                  }}
                />
              </ListItemButton>
              {category.children.map((child) => (
                <ListItemButton
                  key={child.id}
                  selected={selectedCategory === child.id}
                  onClick={() => handleCategorySelect(child.id)}
                  sx={{ pl: 2, py: 0.25 }}
                >
                  <ListItemText 
                    primary={child.name}
                    primaryTypographyProps={{
                      fontSize: '0.8rem',
                      color: selectedCategory === child.id ? '#0D47A1' : '#424242'
                    }}
                  />
                </ListItemButton>
              ))}
            </Box>
          ))}
        </List>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Lọc theo giá */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom color="#212121">
          Khoảng giá
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatPrice(value) + 'đ'}
            min={0}
            max={1000000}
            step={10000}
            marks={[
              { value: 0, label: '0đ' },
              { value: 500000, label: '500K' },
              { value: 1000000, label: '1M' },
            ]}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Lọc theo thương hiệu */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom color="#212121">
          Thương hiệu
        </Typography>
        <FormGroup>
          {brands.map((brand) => (
            <FormControlLabel
              key={brand}
              control={
                <Checkbox
                  size="small"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                />
              }
              label={
                <Typography variant="body2" color="#424242">
                  {brand}
                </Typography>
              }
            />
          ))}
        </FormGroup>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" color="#424242" underline="hover">
            Trang chủ
          </MuiLink>
          {selectedCategory !== 'all' && (
            <Typography color="#212121">
              {categories.find(c => c.id === selectedCategory)?.name || 'Sản phẩm'}
            </Typography>
          )}
          {selectedCategory === 'all' && (
            <Typography color="#212121">Tất cả sản phẩm</Typography>
          )}
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom color="#212121">
            {selectedCategory === 'all' 
              ? 'Tất cả sản phẩm' 
              : categories.find(c => c.id === selectedCategory)?.name || 'Sản phẩm'
            }
          </Typography>
          
          {/* Search and Sort */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ flexGrow: 1, minWidth: 200, backgroundColor: '#fff' }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortBy}
                label="Sắp xếp"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ backgroundColor: '#fff' }}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography variant="body2" color="#424242">
            Hiển thị {currentProducts.length} trong tổng số {filteredProducts.length} sản phẩm
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Filters Sidebar - Desktop */}
          {!isMobile && (
            <Grid item md={3}>
              <FilterSidebar />
            </Grid>
          )}

          {/* Products Grid */}
          <Grid item xs={12} md={isMobile ? 12 : 9}>
            <Grid container spacing={2}>
              {currentProducts.map((product) => (
                <Grid item xs={12} sm={6} lg={4} key={product.id}>
                  <ProductCard product={product} onAddToCart={handleAddToCart} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(event, value) => setCurrentPage(value)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}

            {currentProducts.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="#424242" gutterBottom>
                  Không tìm thấy sản phẩm nào
                </Typography>
                <Typography variant="body2" color="#424242">
                  Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductsPage;
