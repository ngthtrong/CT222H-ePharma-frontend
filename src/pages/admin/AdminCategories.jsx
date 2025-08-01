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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../api/adminApi';
import { categoryAPI } from '../../api/categoryApi';
import { productAPI } from '../../api/productApi';
import { validateCategoryForm, createSlug } from '../../utils/adminUtils';
import { useSnackbar } from '../../hooks/useSnackbar';
import { adminCache, CACHE_KEYS, CACHE_DURATIONS } from '../../utils/cacheUtils';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProductCounts, setLoadingProductCounts] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [productCounts, setProductCounts] = useState({});

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // Snackbar hook
  const { snackbar, hideSnackbar, showSuccess, showError, showWarning } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentCategoryId: '',
    seoTitle: '',
    seoDescription: '',
  });

  useEffect(() => {
    fetchCategories();
    loadCachedProductCounts();
  }, []);

  const loadCachedProductCounts = () => {
    try {
      const cachedResult = adminCache.get(CACHE_KEYS.CATEGORY_PRODUCT_COUNTS);
      
      if (!cachedResult.isExpired && cachedResult.data && Object.keys(cachedResult.data).length > 0) {
        setProductCounts(cachedResult.data);
        return;
      }
      
      // Cache expired or not found, fetch fresh data when categories are loaded
      if (categories.length > 0) {
        fetchProductCounts(categories);
      }
    } catch (error) {
      console.error('Error loading cached product counts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      const response = await categoryAPI.getCategories();
      
      if (response.data.success) {
        const categoriesData = response.data.data || [];
        setCategories(categoriesData);
        
        // Only fetch product counts if cache is expired or empty
        const cachedResult = adminCache.get(CACHE_KEYS.CATEGORY_PRODUCT_COUNTS);
        
        if (cachedResult.isExpired || !cachedResult.data || Object.keys(cachedResult.data).length === 0) {
          await fetchProductCounts(categoriesData);
        }
      } else {
        showError(response.data.message || 'Không thể tải danh sách danh mục');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showError('Lỗi khi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCounts = async (categoriesData, forceRefresh = false) => {
    try {
      setLoadingProductCounts(true);
      
      if (forceRefresh) {
        showWarning('Đang cập nhật số lượng sản phẩm...');
      }
      
      // Try to get counts from a single API call first (if available)
      try {
        const response = await adminAPI.getCategoryProductCounts();
        if (response.data.success && response.data.data) {
          // Convert array response to object format for compatibility
          const counts = {};
          response.data.data.forEach(item => {
            counts[item.categoryId] = item.productCount;
          });
          
          setProductCounts(counts);
          adminCache.set(CACHE_KEYS.CATEGORY_PRODUCT_COUNTS, counts, CACHE_DURATIONS.MEDIUM);
          
          if (forceRefresh) {
            showSuccess('Cập nhật số lượng sản phẩm thành công');
          }
          return;
        }
      } catch (error) {
        // If batch API doesn't exist, fall back to individual calls
      }
      
      // Fallback: individual API calls with batch processing  
      const counts = {};
      const batchSize = 5; // Process 5 categories at a time
      
      for (let i = 0; i < categoriesData.length; i += batchSize) {
        const batch = categoriesData.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (category) => {
          try {
            const response = await productAPI.getProductsWithFilters({ category: category.id });
            
            if (response.data && response.data.success && response.data.data) {
              return { categoryId: category.id, count: response.data.data.length };
            } else {
              return { categoryId: category.id, count: 0 };
            }
          } catch (error) {
            console.error(`Error fetching products for category ${category.id}:`, error);
            return { categoryId: category.id, count: 0 };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(result => {
          counts[result.categoryId] = result.count;
        });
        
        // Small delay between batches to avoid overwhelming the server
        if (i + batchSize < categoriesData.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setProductCounts(counts);
      adminCache.set(CACHE_KEYS.CATEGORY_PRODUCT_COUNTS, counts, CACHE_DURATIONS.MEDIUM);
      
      if (forceRefresh) {
        showSuccess('Cập nhật số lượng sản phẩm thành công (fallback method)');
      }
      console.log('✅ Completed individual API calls for', Object.keys(counts).length, 'categories');
    } catch (error) {
      console.error('Error fetching product counts:', error);
      if (forceRefresh) {
        showError('Lỗi khi cập nhật số lượng sản phẩm');
      }
    } finally {
      setLoadingProductCounts(false);
    }
  };

  const handleRefreshProductCounts = async () => {
    if (categories.length > 0) {
      await fetchProductCounts(categories, true);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parentCategoryId: category.parentCategoryId || '',
        seoTitle: category.seoTitle || '',
        seoDescription: category.seoDescription || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        parentCategoryId: '',
        seoTitle: '',
        seoDescription: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setFormData({});
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
        seoTitle: value ? `${value} - WellVerse` : '',
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      const errors = validateCategoryForm(formData);
      if (errors.length > 0) {
        showError(errors.join(', '));
        return;
      }

      setLoading(true);
      
      const categoryData = {
        ...formData,
        parentCategoryId: formData.parentCategoryId || null,
      };
      
      let response;
      if (editingCategory) {
        response = await adminAPI.updateCategory(editingCategory.id, categoryData);
      } else {
        response = await adminAPI.createCategory(categoryData);
      }
      
      if (response.data.success) {
        showSuccess(editingCategory ? 'Cập nhật danh mục thành công' : 'Tạo danh mục thành công');
        handleCloseDialog();
        await fetchCategories(); // This will also refresh product counts if needed
        // Invalidate cache after category changes
        adminCache.remove(CACHE_KEYS.CATEGORY_PRODUCT_COUNTS);
      } else {
        showError(response.data.message || 'Không thể lưu danh mục');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showError('Lỗi khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        setLoading(true);
        
        const response = await adminAPI.deleteCategory(categoryId);
        
        if (response.data.success) {
          showSuccess('Xóa danh mục thành công');
          await fetchCategories(); // This will also refresh product counts if needed
          // Invalidate cache after category deletion
          adminCache.remove(CACHE_KEYS.CATEGORY_PRODUCT_COUNTS);
        } else {
          showError(response.data.message || 'Không thể xóa danh mục');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        showError('Lỗi khi xóa danh mục');
      } finally {
        setLoading(false);
      }
    }
  };

  // Build category tree for display
  const buildCategoryTree = (categories, parentId = null, level = 0) => {
    return categories
      .filter(cat => cat.parentCategoryId === parentId)
      .map(category => ({
        ...category,
        level,
        children: buildCategoryTree(categories, category.id, level + 1)
      }));
  };

  // Flatten tree for table display
  const flattenCategoryTree = (tree) => {
    let result = [];
    tree.forEach(category => {
      result.push(category);
      if (category.children && category.children.length > 0) {
        result = result.concat(flattenCategoryTree(category.children));
      }
    });
    return result;
  };

  // Filter and sort categories
  const filteredAndSortedCategories = (() => {
    let filtered = categories.filter(category => {
      const matchesSearch = !searchQuery || 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = !typeFilter ||
        (typeFilter === 'parent' && !category.parentCategoryId) ||
        (typeFilter === 'child' && category.parentCategoryId);
      
      return matchesSearch && matchesType;
    });

    // Apply sorting
    if (sortOrder) {
      filtered.sort((a, b) => {
        switch (sortOrder) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'products-asc':
            return (productCounts[a.id] || 0) - (productCounts[b.id] || 0);
          case 'products-desc':
            return (productCounts[b.id] || 0) - (productCounts[a.id] || 0);
          default:
            return 0;
        }
      });
    }

    return filtered;
  })();

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setSortOrder('');
  };

  const categoryTree = buildCategoryTree(categories);
  const flatCategories = flattenCategoryTree(categoryTree);

  // Get parent categories for select dropdown
  const parentCategories = categories.filter(cat => cat.parentCategoryId === null);

  const getCategoryLevel = (category) => {
    return '—'.repeat(category.level * 2) + (category.level > 0 ? ' ' : '');
  };

  const formatLastUpdated = () => {
    return adminCache.getTimeSinceUpdate(CACHE_KEYS.CATEGORY_PRODUCT_COUNTS);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Quản lý danh mục</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshProductCounts}
            disabled={loadingProductCounts || loading}
            color="primary"
          >
            {loadingProductCounts ? <CircularProgress size={16} /> : 'Làm mới số lượng'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm danh mục
          </Button>
        </Stack>
      </Box>

      {/* Product counts info */}
      {adminCache.isValid(CACHE_KEYS.CATEGORY_PRODUCT_COUNTS) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Số lượng sản phẩm được cập nhật {formatLastUpdated()}
            {loadingProductCounts && ' - Đang cập nhật...'}
          </Typography>
        </Box>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm danh mục..."
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
            
            <Grid item xs={12} sm={6} md={2} lg={2}>
              <FormControl fullWidth>
                <InputLabel>Loại</InputLabel>
                <Select
                  value={typeFilter}
                  label="Loại"
                  onChange={(e) => setTypeFilter(e.target.value)}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="parent">Danh mục gốc</MenuItem>
                  <MenuItem value="child">Danh mục con</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <FormControl fullWidth>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortOrder}
                  label="Sắp xếp"
                  onChange={(e) => setSortOrder(e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">Mặc định</MenuItem>
                  <MenuItem value="name-asc">Tên A-Z</MenuItem>
                  <MenuItem value="name-desc">Tên Z-A</MenuItem>
                  <MenuItem value="products-desc">Nhiều sản phẩm nhất</MenuItem>
                  <MenuItem value="products-asc">Ít sản phẩm nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={12} lg={1}>
              <Stack 
                direction={{ xs: 'column', sm: 'row', lg: 'column' }} 
                spacing={1} 
                alignItems={{ xs: 'stretch', sm: 'center', lg: 'stretch' }}
                sx={{ width: '100%' }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={!searchQuery && !typeFilter && !sortOrder}
                  fullWidth
                  sx={{ minWidth: { xs: 'auto', sm: '120px', lg: 'auto' } }}
                >
                  Xóa lọc
                </Button>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    textAlign: { xs: 'center', sm: 'left', lg: 'center' },
                    mt: { xs: 0.5, sm: 0, lg: 0.5 }
                  }}
                >
                  {filteredAndSortedCategories.length} danh mục
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Danh mục cha</TableCell>
              <TableCell>Số lượng sản phẩm</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredAndSortedCategories.length > 0 ? (
              filteredAndSortedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {category.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {category.description || 'Chưa có mô tả'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {category.parentCategoryId ? (
                      <Chip 
                        label={
                          categories.find(c => c.id === category.parentCategoryId)?.name || 'N/A'
                        }
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip label="Danh mục gốc" color="primary" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={productCounts[category.id] || 0}
                        color={productCounts[category.id] > 0 ? "success" : "default"}
                        size="small"
                        variant="outlined"
                      />
                      {loadingProductCounts && (
                        <CircularProgress size={16} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenDialog(category)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(category.id)}
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
                <TableCell colSpan={6} align="center">
                  {searchQuery || typeFilter ? 
                    'Không tìm thấy danh mục phù hợp' : 
                    'Chưa có danh mục nào'
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Category Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>
          {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              name="name"
              label="Tên danh mục"
              value={formData.name}
              onChange={handleInputChange}
              required
              fullWidth
              placeholder="VD: Thuốc tim mạch"
            />
            
            <TextField
              name="slug"
              label="Slug (URL friendly)"
              value={formData.slug}
              onChange={handleInputChange}
              required
              fullWidth
              placeholder="VD: thuoc-tim-mach"
              helperText="Slug sẽ được tự động tạo từ tên danh mục"
            />

            <TextField
              name="description"
              label="Mô tả"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={3}
              fullWidth
              placeholder="Các loại thuốc điều trị bệnh tim mạch..."
            />

            <FormControl fullWidth>
              <InputLabel>Danh mục cha</InputLabel>
              <Select
                name="parentCategoryId"
                value={formData.parentCategoryId || ''}
                label="Danh mục cha"
                onChange={handleInputChange}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">
                  <em>Không có (Danh mục gốc)</em>
                </MenuItem>
                {categories.filter(cat => !editingCategory || cat.id !== editingCategory.id).map((category) => (
                  <MenuItem 
                    key={category.id} 
                    value={category.id}
                  >
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              name="seoTitle"
              label="SEO Title"
              value={formData.seoTitle}
              onChange={handleInputChange}
              fullWidth
              placeholder="Thuốc tim mạch chất lượng cao"
              helperText="Tiêu đề SEO cho tối ưu hóa tìm kiếm"
            />

            <TextField
              name="seoDescription"
              label="SEO Description"
              value={formData.seoDescription}
              onChange={handleInputChange}
              multiline
              rows={2}
              fullWidth
              placeholder="Thuốc tim mạch an toàn, hiệu quả từ các thương hiệu uy tín"
              helperText="Mô tả SEO (tối đa 160 ký tự)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.name || !formData.slug}
          >
            {loading ? <CircularProgress size={20} /> : (editingCategory ? 'Cập nhật' : 'Thêm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={hideSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCategories;
