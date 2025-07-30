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
  Alert,
  CircularProgress,
  Chip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../api/adminApi';
import { categoryAPI } from '../../api/categoryApi';
import { validateCategoryForm, createSlug } from '../../utils/adminUtils';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentCategoryId: '',
    isActive: true,
    sortOrder: 1,
    seoTitle: '',
    seoDescription: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await categoryAPI.getCategories();
      
      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        setError(response.data.message || 'Không thể tải danh sách danh mục');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Lỗi khi tải danh sách danh mục');
    } finally {
      setLoading(false);
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
        isActive: category.isActive !== undefined ? category.isActive : true,
        sortOrder: category.sortOrder || 1,
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
        isActive: true,
        sortOrder: 1,
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
        seoTitle: value ? `${value} - WellVerse` : '',
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      
      // Validate form
      const errors = validateCategoryForm(formData);
      if (errors.length > 0) {
        setError(errors.join(', '));
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
        setSuccess(editingCategory ? 'Cập nhật danh mục thành công' : 'Tạo danh mục thành công');
        handleCloseDialog();
        fetchCategories();
      } else {
        setError(response.data.message || 'Không thể lưu danh mục');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Lỗi khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        setLoading(true);
        setError('');
        setSuccess('');
        
        const response = await adminAPI.deleteCategory(categoryId);
        
        if (response.data.success) {
          setSuccess('Xóa danh mục thành công');
          fetchCategories();
        } else {
          setError(response.data.message || 'Không thể xóa danh mục');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Lỗi khi xóa danh mục');
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

  const categoryTree = buildCategoryTree(categories);
  const flatCategories = flattenCategoryTree(categoryTree);

  // Get parent categories for select dropdown
  const parentCategories = categories.filter(cat => cat.parentCategoryId === null);

  const getCategoryLevel = (category) => {
    return '—'.repeat(category.level * 2) + (category.level > 0 ? ' ' : '');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Quản lý danh mục</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm danh mục
        </Button>
      </Box>

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

      {/* Categories Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Danh mục cha</TableCell>
              <TableCell>Thứ tự</TableCell>
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
            ) : categories.length > 0 ? (
              categories.map((category) => (
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
                    <Typography variant="body2">
                      {category.sortOrder || 1}
                    </Typography>
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
                  Chưa có danh mục nào
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="sortOrder"
                label="Thứ tự sắp xếp"
                type="number"
                value={formData.sortOrder}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 1 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                }
                label="Kích hoạt"
              />
            </Box>

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
    </Box>
  );
};

export default AdminCategories;
