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
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../api/adminApi';
import { getCategories } from '../../api/categoryApi';
import { formatCurrency } from '../../utils/formatters';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    discountPercent: '',
    categoryId: '',
    brand: '',
    manufacturer: '',
    stockQuantity: '',
    sku: '',
    images: [],
    isPublished: true,
    inStock: true,
    ingredients: '',
    dosage: '',
    contraindications: '',
    sideEffects: '',
    storage: '',
    expiryDate: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, rowsPerPage, searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
        categoryId: selectedCategory,
      };
      
      const response = await adminAPI.getAdminProducts(params);
      
      if (response.data.success) {
        setProducts(response.data.data || []);
        setTotalProducts(response.data.total || 0);
      } else {
        setError('Không thể tải danh sách sản phẩm');
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
      const categoriesData = await getCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || '',
        discountPercent: product.discountPercent || '',
        categoryId: product.categoryId?._id || product.categoryId || '',
        brand: product.brand || '',
        manufacturer: product.manufacturer || '',
        stockQuantity: product.stockQuantity || '',
        sku: product.sku || '',
        images: product.images || [],
        isPublished: product.isPublished !== undefined ? product.isPublished : true,
        inStock: product.inStock !== undefined ? product.inStock : true,
        ingredients: product.ingredients || '',
        dosage: product.dosage || '',
        contraindications: product.contraindications || '',
        sideEffects: product.sideEffects || '',
        storage: product.storage || '',
        expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        discountPercent: '',
        categoryId: '',
        brand: '',
        manufacturer: '',
        stockQuantity: '',
        sku: '',
        images: [],
        isPublished: true,
        inStock: true,
        ingredients: '',
        dosage: '',
        contraindications: '',
        sideEffects: '',
        storage: '',
        expiryDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        discountPercent: parseFloat(formData.discountPercent) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
      };
      
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, productData);
      } else {
        await adminAPI.createProduct(productData);
      }
      
      handleCloseDialog();
      fetchProducts();
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
        await adminAPI.deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Lỗi khi xóa sản phẩm');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchProducts();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ minWidth: 300 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Danh mục</InputLabel>
          <Select
            value={selectedCategory}
            label="Danh mục"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
        >
          Tìm kiếm
        </Button>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Tồn kho</TableCell>
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
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.brand}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {product.categoryId?.name || 'Chưa phân loại'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCurrency(product.price)}
                    </Typography>
                    {product.discountPercent > 0 && (
                      <Typography variant="caption" color="error">
                        -{product.discountPercent}%
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{product.stockQuantity}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Chip
                        label={product.isPublished ? 'Đã xuất bản' : 'Nháp'}
                        color={product.isPublished ? 'success' : 'default'}
                        size="small"
                      />
                      <Chip
                        label={product.inStock ? 'Còn hàng' : 'Hết hàng'}
                        color={product.inStock ? 'success' : 'error'}
                        size="small"
                      />
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
                      onClick={() => handleDelete(product._id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Không có sản phẩm nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalProducts}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Basic Information */}
            <TextField
              name="name"
              label="Tên sản phẩm"
              value={formData.name}
              onChange={handleInputChange}
              required
              fullWidth
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="sku"
                label="SKU"
                value={formData.sku}
                onChange={handleInputChange}
                required
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  label="Danh mục"
                  onChange={handleInputChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              name="shortDescription"
              label="Mô tả ngắn"
              value={formData.shortDescription}
              onChange={handleInputChange}
              multiline
              rows={2}
              fullWidth
            />

            <TextField
              name="description"
              label="Mô tả chi tiết"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              fullWidth
            />

            {/* Price and Stock */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="price"
                label="Giá (VND)"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                name="discountPercent"
                label="Giảm giá (%)"
                type="number"
                value={formData.discountPercent}
                onChange={handleInputChange}
                sx={{ flex: 1 }}
              />
              <TextField
                name="stockQuantity"
                label="Số lượng tồn"
                type="number"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Brand and Manufacturer */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="brand"
                label="Thương hiệu"
                value={formData.brand}
                onChange={handleInputChange}
                sx={{ flex: 1 }}
              />
              <TextField
                name="manufacturer"
                label="Nhà sản xuất"
                value={formData.manufacturer}
                onChange={handleInputChange}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Medical Information */}
            <TextField
              name="ingredients"
              label="Thành phần"
              value={formData.ingredients}
              onChange={handleInputChange}
              multiline
              rows={2}
              fullWidth
            />

            <TextField
              name="dosage"
              label="Liều dùng"
              value={formData.dosage}
              onChange={handleInputChange}
              fullWidth
            />

            <TextField
              name="contraindications"
              label="Chống chỉ định"
              value={formData.contraindications}
              onChange={handleInputChange}
              multiline
              rows={2}
              fullWidth
            />

            <TextField
              name="sideEffects"
              label="Tác dụng phụ"
              value={formData.sideEffects}
              onChange={handleInputChange}
              multiline
              rows={2}
              fullWidth
            />

            <TextField
              name="storage"
              label="Bảo quản"
              value={formData.storage}
              onChange={handleInputChange}
              fullWidth
            />

            <TextField
              name="expiryDate"
              label="Hạn sử dụng"
              type="date"
              value={formData.expiryDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            {/* Status */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                  />
                }
                label="Đã xuất bản"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                  />
                }
                label="Còn hàng"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.name || !formData.sku}
          >
            {loading ? <CircularProgress size={20} /> : (editingProduct ? 'Cập nhật' : 'Thêm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProducts;
