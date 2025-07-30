import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  TablePagination,
  IconButton,
  Avatar,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  SortByAlpha as SortIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../api/adminApi';
import { formatDate } from '../../utils/adminUtils';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userOrderCounts, setUserOrderCounts] = useState({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const roles = [
    { value: 'USER', label: 'Người dùng', color: 'primary' },
    { value: 'ADMIN', label: 'Quản trị viên', color: 'error' },
  ];

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchQuery, roleFilter, sortOrder]);

  useEffect(() => {
    fetchOrderCounts();
  }, []);

  // Re-fetch users when order counts change to apply sorting
  useEffect(() => {
    if (Object.keys(userOrderCounts).length > 0 && 
        (sortOrder.includes('completed') || sortOrder.includes('total-orders'))) {
      fetchUsers();
    }
  }, [userOrderCounts]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page !== 0) {
        setPage(0);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    if (page !== 0) {
      setPage(0);
    }
  }, [roleFilter, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Prepare API parameters
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      
      // Add search parameter
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      // Add role filter parameter
      if (roleFilter) {
        params.role = roleFilter;
      }
      
      // Add sort parameter (only for backend-supported sorts)
      if (sortOrder && !sortOrder.includes('completed') && !sortOrder.includes('total-orders')) {
        params.sort = sortOrder;
      }
      
      console.log('Fetching users with params:', params);
      
      const response = await adminAPI.getAllUsers(params);
      
      if (response.data.success) {
        let userData = response.data.data || [];
        
        // Apply client-side sorting for order-related sorts
        if (sortOrder && Object.keys(userOrderCounts).length > 0) {
          userData = [...userData].sort((a, b) => {
            switch (sortOrder) {
              case 'completed-asc':
                return (userOrderCounts[a.id]?.completed || 0) - (userOrderCounts[b.id]?.completed || 0);
              case 'completed-desc':
                return (userOrderCounts[b.id]?.completed || 0) - (userOrderCounts[a.id]?.completed || 0);
              case 'total-orders-asc':
                return (userOrderCounts[a.id]?.total || 0) - (userOrderCounts[b.id]?.total || 0);
              case 'total-orders-desc':
                return (userOrderCounts[b.id]?.total || 0) - (userOrderCounts[a.id]?.total || 0);
              case 'name-asc':
                return a.fullName.localeCompare(b.fullName);
              case 'name-desc':
                return b.fullName.localeCompare(a.fullName);
              case 'email-asc':
                return a.email.localeCompare(b.email);
              case 'email-desc':
                return b.email.localeCompare(a.email);
              case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
              case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
              default:
                return 0;
            }
          });
        }
        
        setUsers(userData);
        setTotalUsers(response.data.total || 0);
      } else {
        setError(response.data.message || 'Không thể tải danh sách người dùng');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderCounts = async () => {
    try {
      // Fetch tất cả đơn hàng để tính toán số đơn hoàn thành
      const response = await adminAPI.getAllOrders({ limit: 1000 }); // Lấy nhiều để đảm bảo có đủ data
      
      if (response.data.success && response.data.data) {
        const orderCounts = {};
        
        // Tính số đơn hàng hoàn thành cho mỗi user
        response.data.data.forEach(order => {
          const userId = order.userId;
          if (!orderCounts[userId]) {
            orderCounts[userId] = { total: 0, completed: 0 };
          }
          
          orderCounts[userId].total += 1;
          
          // Đếm đơn hàng hoàn thành - chỉ những đơn có status COMPLETED hoặc DELIVERED
          if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
            orderCounts[userId].completed += 1;
          }
        });
        
        setUserOrderCounts(orderCounts);
      }
    } catch (error) {
      console.error('Error fetching order counts:', error);
      // Không hiển thị lỗi cho user vì đây là tính năng phụ
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        setLoading(true);
        setError('');
        setSuccess('');
        
        const response = await adminAPI.deleteUser(userId);
        
        if (response.data.success) {
          setSuccess('Xóa người dùng thành công');
          fetchUsers();
        } else {
          setError(response.data.message || 'Không thể xóa người dùng');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Lỗi khi xóa người dùng');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setSortOrder('');
    setPage(0);
  };

  const formatDateLocal = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Quản lý người dùng</Typography>
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
            <Grid item xs={12} sm={6} md={4} lg={4}>
              <TextField
                fullWidth
                placeholder="Tìm theo tên, email hoặc SĐT..."
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
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={roleFilter}
                  label="Vai trò"
                  onChange={(e) => {
                    console.log('Role filter changed to:', e.target.value);
                    setRoleFilter(e.target.value);
                  }}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3}>
              <FormControl fullWidth>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortOrder}
                  label="Sắp xếp"
                  onChange={(e) => {
                    console.log('Sort order changed to:', e.target.value);
                    setSortOrder(e.target.value);
                  }}
                  sx={{ minWidth: 200 }}
                  startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="">Mặc định</MenuItem>
                  <MenuItem value="name-asc">Tên A-Z</MenuItem>
                  <MenuItem value="name-desc">Tên Z-A</MenuItem>
                  <MenuItem value="email-asc">Email A-Z</MenuItem>
                  <MenuItem value="email-desc">Email Z-A</MenuItem>
                  <MenuItem value="completed-asc">Đơn hoàn thành tăng dần</MenuItem>
                  <MenuItem value="completed-desc">Đơn hoàn thành giảm dần</MenuItem>
                  <MenuItem value="total-orders-asc">Tổng đơn hàng tăng dần</MenuItem>
                  <MenuItem value="total-orders-desc">Tổng đơn hàng giảm dần</MenuItem>
                  <MenuItem value="date-asc">Ngày tham gia cũ nhất</MenuItem>
                  <MenuItem value="date-desc">Ngày tham gia mới nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={12} lg={3}>
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
                  disabled={!searchQuery && !roleFilter && !sortOrder}
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
                  {totalUsers} người dùng
                  {(searchQuery || roleFilter) && (
                    <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {' '}(đã lọc)
                    </span>
                  )}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>SĐT</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Đơn hàng (Hoàn thành/Tổng)</TableCell>
              <TableCell>Đăng ký qua</TableCell>
              <TableCell>Ngày tham gia</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {user.fullName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {user.fullName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.phoneNumber || 'Chưa cập nhật'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={roles.find(r => r.value === user.role)?.label || user.role}
                      color={roles.find(r => r.value === user.role)?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        {userOrderCounts[user.id]?.completed || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        /{userOrderCounts[user.id]?.total || 0}
                      </Typography>
                    </Box>
                    {/* <Typography variant="caption" color="text.secondary" display="block">
                      done/total
                    </Typography> */}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.authProvider === 'local' ? 'Email' : user.authProvider}
                      color={user.authProvider === 'local' ? 'default' : 'info'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateLocal(user.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleViewUser(user)}
                      color="primary"
                      size="small"
                    >
                      <ViewIcon />
                    </IconButton>
                    {user.role !== 'ADMIN' && (
                      <IconButton
                        onClick={() => handleDeleteUser(user.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  {searchQuery || roleFilter ? 
                    'Không tìm thấy người dùng phù hợp' : 
                    'Không có người dùng nào'
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalUsers}
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

      {/* User Detail Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>
          Chi tiết người dùng
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              {/* User Avatar and Basic Info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
                        {selectedUser.fullName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Typography variant="h6">
                        {selectedUser.fullName}
                      </Typography>
                      <Chip 
                        label={roles.find(r => r.value === selectedUser.role)?.label || selectedUser.role}
                        color={roles.find(r => r.value === selectedUser.role)?.color || 'default'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Thông tin chi tiết
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body1">
                            {selectedUser.email}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Số điện thoại
                          </Typography>
                          <Typography variant="body1">
                            {selectedUser.phoneNumber || 'Chưa cập nhật'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Ngày sinh
                          </Typography>
                          <Typography variant="body1">
                            {selectedUser.dateOfBirth ? formatDateLocal(selectedUser.dateOfBirth) : 'Chưa cập nhật'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Giới tính
                          </Typography>
                          <Typography variant="body1">
                            {selectedUser.gender === 'MALE' ? 'Nam' : 
                             selectedUser.gender === 'FEMALE' ? 'Nữ' : 
                             selectedUser.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Đăng ký qua
                          </Typography>
                          <Chip 
                            label={selectedUser.authProvider === 'local' ? 'Email' : selectedUser.authProvider}
                            color={selectedUser.authProvider === 'local' ? 'default' : 'info'}
                            size="small"
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Ngày tham gia
                          </Typography>
                          <Typography variant="body1">
                            {formatDateLocal(selectedUser.createdAt)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Đơn hàng hoàn thành
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {userOrderCounts[selectedUser.id]?.completed || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              / {userOrderCounts[selectedUser.id]?.total || 0} tổng đơn
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Addresses */}
              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Địa chỉ đã lưu ({selectedUser.addresses.length})
                    </Typography>
                    {selectedUser.addresses.map((address, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle2">
                              {address.recipientName}
                              {address.isDefault && (
                                <Chip label="Mặc định" color="primary" size="small" sx={{ ml: 1 }} />
                              )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {address.phoneNumber}
                            </Typography>
                            <Typography variant="body2">
                              {address.address}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {address.ward}, {address.district}, {address.province}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Account Status */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trạng thái tài khoản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Xác thực email
                      </Typography>
                      <Chip 
                        label={selectedUser.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                        color={selectedUser.isEmailVerified ? 'success' : 'warning'}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Trạng thái
                      </Typography>
                      <Chip 
                        label={selectedUser.isActive ? 'Kích hoạt' : 'Tạm khóa'}
                        color={selectedUser.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
