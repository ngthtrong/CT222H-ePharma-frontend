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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Edit as EditIcon,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const roles = [
    { value: 'USER', label: 'Người dùng', color: 'default' },
    { value: 'ADMIN', label: 'Quản trị viên', color: 'error' },
  ];

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchQuery, roleFilter, sortOrder]);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page !== 0) {
        setPage(0);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery,
        role: roleFilter,
        sort: sortOrder,
      };
      
      const response = await adminAPI.getAllUsers(params);
      
      if (response.data.success) {
        setUsers(response.data.data || []);
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

  const handleSearch = () => {
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleChip = (role) => {
    const roleConfig = {
      USER: { label: 'Người dùng', color: 'primary' },
      ADMIN: { label: 'Quản trị viên', color: 'error' },
    };
    
    const config = roleConfig[role] || { label: role, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getAuthProviderChip = (provider) => {
    const providerConfig = {
      local: { label: 'Email', color: 'default' },
      google: { label: 'Google', color: 'info' },
      facebook: { label: 'Facebook', color: 'primary' },
    };
    
    const config = providerConfig[provider] || { label: provider, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Quản lý người dùng
      </Typography>

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
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              size="small"
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={roleFilter || ''}
                label="Vai trò"
                onChange={(e) => setRoleFilter(e.target.value || '')}
                sx={{ minWidth: 90 }}
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortOrder || ''}
                label="Sắp xếp"
                onChange={(e) => setSortOrder(e.target.value || '')}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="">Mặc định</MenuItem>
                <MenuItem value="name-asc">Tên A-Z</MenuItem>
                <MenuItem value="name-desc">Tên Z-A</MenuItem>
                <MenuItem value="orders-asc">Đơn hàng tăng dần</MenuItem>
                <MenuItem value="orders-desc">Đơn hàng giảm dần</MenuItem>
                <MenuItem value="date-asc">Ngày tham gia cũ nhất</MenuItem>
                <MenuItem value="date-desc">Ngày tham gia mới nhất</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              fullWidth
            >
              Tìm kiếm
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
              <TableCell>Đơn hàng</TableCell>
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
                    <Typography variant="subtitle2">
                      {user.fullName}
                    </Typography>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber || 'Chưa cập nhật'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={roles.find(r => r.value === user.role)?.label || user.role}
                      color={roles.find(r => r.value === user.role)?.color || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {user.completedOrdersCount || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        hoàn thành
                      </Typography>
                    </Box>
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
                    {formatDate(user.createdAt)}
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
                  Không có người dùng nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
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
                            {selectedUser.dateOfBirth ? formatDate(selectedUser.dateOfBirth) : 'Chưa cập nhật'}
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
                            {formatDate(selectedUser.createdAt)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Đơn hàng hoàn thành
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {selectedUser.completedOrdersCount || 0} đơn hàng
                          </Typography>
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
