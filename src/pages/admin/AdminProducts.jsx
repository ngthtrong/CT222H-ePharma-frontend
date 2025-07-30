import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  TablePagination,
  Grid,
  Card,
  CardContent,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../api/adminApi';
import { categoryAPI } from '../../api/categoryApi';
import { formatCurrency } from '../../utils/formatters';
import { validateProductForm, createSlug } from '../../utils/adminUtils';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    sku: '',
    barcode: '',
    trackQuantity: true,
    quantity: 0,
    lowStockThreshold: 5,
    categoryId: '',
    brand: '',
    weight: '',
    dimensions: '',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
    isFeatured: false,
    images: [],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await adminAPI.getAdminProducts();
      
      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setError(response.data.message || 'Không thể tải danh sách sản phẩm');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      
      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        console.error('Error fetching categories:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || '',
        comparePrice: product.comparePrice || '',
        costPrice: product.costPrice || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        trackQuantity: product.trackQuantity !== undefined ? product.trackQuantity : true,
        quantity: product.quantity || 0,
        lowStockThreshold: product.lowStockThreshold || 5,
        categoryId: product.categoryId || '',
        brand: product.brand || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || ''),
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
        images: product.images || [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        price: '',
        comparePrice: '',
        costPrice: '',
        sku: '',
        barcode: '',
        trackQuantity: true,
        quantity: 0,
        lowStockThreshold: 5,
        categoryId: '',
        brand: '',
        weight: '',
        dimensions: '',
        tags: '',
        metaTitle: '',
        metaDescription: '',
        isActive: true,
        isFeatured: false,
        images: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: createSlug(value),
        metaTitle: value ? `${value} - WellVerse` : '',
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      
      // Validate form
      const errors = validateProductForm(formData);
      if (errors.length > 0) {
        setError(errors.join(', '));
        return;
      }

      setLoading(true);
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        comparePrice: parseFloat(formData.comparePrice) || 0,
        costPrice: parseFloat(formData.costPrice) || 0,
        quantity: parseInt(formData.quantity) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        categoryId: formData.categoryId || null,
      };
      
      let response;
      if (editingProduct) {
        response = await adminAPI.updateProduct(editingProduct.id, productData);
      } else {
        response = await adminAPI.createProduct(productData);
      }
      
      if (response.data.success) {
        setSuccess(editingProduct ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công');
        handleCloseDialog();
        fetchProducts();
      } else {
        setError(response.data.message || 'Không thể lưu sản phẩm');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Lỗi khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        setLoading(true);
        setError('');
        setSuccess('');
        
        const response = await adminAPI.deleteProduct(productId);
        
        if (response.data.success) {
          setSuccess('Xóa sản phẩm thành công');
          fetchProducts();
        } else {
          setError(response.data.message || 'Không thể xóa sản phẩm');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Lỗi khi xóa sản phẩm');
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Chưa phân loại';
  };

  const getStockStatus = (product) => {
    if (!product.trackQuantity) return { label: 'Không theo dõi', color: 'default' };
    
    if (product.quantity <= 0) return { label: 'Hết hàng', color: 'error' };
    if (product.quantity <= product.lowStockThreshold) return { label: 'Sắp hết', color: 'warning' };
    return { label: 'Còn hàng', color: 'success' };
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Quản lý sản phẩm</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm sản phẩm
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Lọc theo danh mục</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Lọc theo danh mục"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="">Tất cả danh mục</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredProducts.length} sản phẩm
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sản phẩm</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Kho</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {product.name}
                        </Typography>
                        {product.brand && (
                          <Typography variant="caption" color="text.secondary">
                            {product.brand}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {product.sku || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getCategoryName(product.categoryId)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(product.price)}
                        </Typography>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            {formatCurrency(product.comparePrice)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {product.trackQuantity ? (
                        <Box>
                          <Typography variant="body2">
                            {product.quantity}
                          </Typography>
                          <Chip 
                            label={stockStatus.label}
                            size="small"
                            color={stockStatus.color}
                          />
                        </Box>
                      ) : (
                        <Chip 
                          label="Không theo dõi"
                          size="small"
                          color="default"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={product.isActive ? 'Hoạt động' : 'Ẩn'}
                          size="small"
                          color={product.isActive ? 'success' : 'default'}
                        />
                        {product.isFeatured && (
                          <Chip 
                            label="Nổi bật"
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenDialog(product)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(product.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Không tìm thấy sản phẩm nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </TableContainer>

      {/* Product Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>
          {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Basic Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Thông tin cơ bản</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="name"
                      label="Tên sản phẩm"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      fullWidth
                      placeholder="VD: Thuốc giảm đau Paracetamol 500mg"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="slug"
                      label="Slug (URL)"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      fullWidth
                      placeholder="VD: thuoc-giam-dau-paracetamol-500mg"
                      helperText="Slug sẽ được tự động tạo từ tên sản phẩm"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Danh mục</InputLabel>
                      <Select
                        name="categoryId"
                        value={formData.categoryId}
                        label="Danh mục"
                        onChange={handleInputChange}
                      >
                        <MenuItem value="">
                          <em>Chọn danh mục</em>
                        </MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="shortDescription"
                      label="Mô tả ngắn"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                      fullWidth
                      placeholder="Mô tả ngắn gọn về sản phẩm..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="description"
                      label="Mô tả chi tiết"
                      value={formData.description}
                      onChange={handleInputChange}
                      multiline
                      rows={4}
                      fullWidth
                      placeholder="Mô tả chi tiết về sản phẩm, công dụng, cách sử dụng..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Giá cả</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      name="price"
                      label="Giá bán"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      fullWidth
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="comparePrice"
                      label="Giá so sánh"
                      type="number"
                      value={formData.comparePrice}
                      onChange={handleInputChange}
                      fullWidth
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      helperText="Giá gốc để hiển thị khuyến mãi"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      name="costPrice"
                      label="Giá vốn"
                      type="number"
                      value={formData.costPrice}
                      onChange={handleInputChange}
                      fullWidth
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      helperText="Giá nhập hàng"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quản lý kho</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="sku"
                      label="SKU"
                      value={formData.sku}
                      onChange={handleInputChange}
                      fullWidth
                      placeholder="VD: PAR-500-01"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="barcode"
                      label="Mã vạch"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="trackQuantity"
                          checked={formData.trackQuantity}
                          onChange={handleInputChange}
                        />
                      }
                      label="Theo dõi số lượng tồn kho"
                    />
                  </Grid>

                  {formData.trackQuantity && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          name="quantity"
                          label="Số lượng hiện tại"
                          type="number"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          fullWidth
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          name="lowStockThreshold"
                          label="Ngưỡng cảnh báo"
                          type="number"
                          value={formData.lowStockThreshold}
                          onChange={handleInputChange}
                          fullWidth
                          InputProps={{ inputProps: { min: 0 } }}
                          helperText="Cảnh báo khi số lượng dưới ngưỡng này"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Thông tin bổ sung</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="brand"
                      label="Thương hiệu"
                      value={formData.brand}
                      onChange={handleInputChange}
                      fullWidth
                      placeholder="VD: Traphaco"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      name="weight"
                      label="Trọng lượng"
                      value={formData.weight}
                      onChange={handleInputChange}
                      fullWidth
                      placeholder="VD: 50g"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="dimensions"
                      label="Kích thước"
                      value={formData.dimensions}
                      onChange={handleInputChange}
                      fullWidth
                      placeholder="VD: 10cm x 5cm x 2cm"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="tags"
                      label="Tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      fullWidth
                      placeholder="VD: thuốc giảm đau, paracetamol, sốt"
                      helperText="Phân tách bằng dấu phẩy"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                        />
                      }
                      label="Kích hoạt sản phẩm"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleInputChange}
                        />
                      }
                      label="Sản phẩm nổi bật"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>SEO</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="metaTitle"
                      label="Meta Title"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      fullWidth
                      placeholder="Thuốc giảm đau Paracetamol 500mg - WellVerse"
                      helperText="Tiêu đề SEO (tối đa 60 ký tự)"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="metaDescription"
                      label="Meta Description"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                      fullWidth
                      placeholder="Thuốc giảm đau, hạ sốt hiệu quả với thành phần Paracetamol 500mg..."
                      helperText="Mô tả SEO (tối đa 160 ký tự)"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.name || !formData.slug || !formData.categoryId}
          >
            {loading ? <CircularProgress size={20} /> : (editingProduct ? 'Cập nhật' : 'Thêm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProducts;
