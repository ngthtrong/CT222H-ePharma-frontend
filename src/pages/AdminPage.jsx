import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { productAPI, categoryAPI, userAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'product', 'category', 'user'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user?.role !== 'admin') {
      return;
    }
    fetchData();
  }, [activeTab, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 0:
          const productsResponse = await productAPI.getProducts();
          setProducts(productsResponse.data.products || productsResponse.data);
          break;
        case 1:
          const categoriesResponse = await categoryAPI.getCategories();
          setCategories(categoriesResponse.data);
          break;
        case 2:
          const usersResponse = await userAPI.getUsers();
          setUsers(usersResponse.data);
          break;
        default:
          break;
      }
    } catch (error) {
      setError('Không thể tải dữ liệu');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    setOpenDialog(true);
    
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (dialogType === 'product') {
        if (editingItem) {
          await productAPI.updateProduct(editingItem.id, formData);
        } else {
          await productAPI.createProduct(formData);
        }
      } else if (dialogType === 'category') {
        if (editingItem) {
          await categoryAPI.updateCategory(editingItem.id, formData);
        } else {
          await categoryAPI.createCategory(formData);
        }
      } else if (dialogType === 'user') {
        if (editingItem) {
          await userAPI.updateUser(editingItem.id, formData);
        }
      }
      
      handleCloseDialog();
      fetchData();
    } catch (error) {
      setError('Không thể lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) {
      return;
    }

    try {
      setLoading(true);
      
      if (type === 'product') {
        await productAPI.deleteProduct(id);
      } else if (type === 'category') {
        await categoryAPI.deleteCategory(id);
      } else if (type === 'user') {
        await userAPI.deleteUser(id);
      }
      
      fetchData();
    } catch (error) {
      setError('Không thể xóa dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Bạn không có quyền truy cập trang này
      </Alert>
    );
  }

  const renderProductsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Quản lý sản phẩm</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('product')}
        >
          Thêm sản phẩm
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price?.toLocaleString()} VND</TableCell>
                <TableCell>{product.category?.name}</TableCell>
                <TableCell>
                  <Chip
                    label={product.inStock ? 'Còn hàng' : 'Hết hàng'}
                    color={product.inStock ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog('product', product)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete('product', product.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderCategoriesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Quản lý danh mục</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('category')}
        >
          Thêm danh mục
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog('category', category)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete('category', category.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderUsersTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Quản lý người dùng</Typography>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    color={user.role === 'admin' ? 'warning' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog('user', user)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete('user', user.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderDialog = () => (
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {
          dialogType === 'product' ? 'sản phẩm' :
          dialogType === 'category' ? 'danh mục' : 'người dùng'
        }
      </DialogTitle>
      <DialogContent>
        {dialogType === 'product' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tên sản phẩm"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Giá"
              name="price"
              type="number"
              value={formData.price || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={handleInputChange}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
        
        {dialogType === 'category' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tên danh mục"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Mô tả"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </Box>
        )}
        
        {dialogType === 'user' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tên"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select
                name="role"
                value={formData.role || ''}
                onChange={handleInputChange}
              >
                <MenuItem value="user">Người dùng</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Lưu'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quản trị hệ thống
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Sản phẩm" />
          <Tab label="Danh mục" />
          <Tab label="Người dùng" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {activeTab === 0 && renderProductsTab()}
          {activeTab === 1 && renderCategoriesTab()}
          {activeTab === 2 && renderUsersTab()}
        </Box>
      )}
      
      {renderDialog()}
    </Box>
  );
};

export default AdminPage;
