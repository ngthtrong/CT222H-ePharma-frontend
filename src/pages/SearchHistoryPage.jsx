import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { formatCurrency } from '../utils/formatters';

const SearchHistoryPage = () => {
  const navigate = useNavigate();
  const {
    searchHistory,
    popularQueries,
    loading,
    error,
    loadSearchHistory,
    loadPopularQueries,
    removeSearchHistory,
    clearHistory
  } = useSearchHistory();

  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filteredHistory, setFilteredHistory] = useState([]);

  useEffect(() => {
    loadSearchHistory();
    loadPopularQueries(10);
  }, [loadSearchHistory, loadPopularQueries]);

  useEffect(() => {
    setFilteredHistory(searchHistory);
  }, [searchHistory]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFilters = (filters) => {
    if (!filters || Object.keys(filters).length === 0) {
      return 'Không có bộ lọc';
    }
    
    const filterText = [];
    if (filters.category) filterText.push(`Danh mục: ${filters.category}`);
    if (filters.brand) filterText.push(`Thương hiệu: ${filters.brand}`);
    if (filters.minPrice || filters.maxPrice) {
      filterText.push(`Giá: ${formatCurrency(filters.minPrice || 0)} - ${formatCurrency(filters.maxPrice || 999999999)}`);
    }
    if (filters.sortBy) filterText.push(`Sắp xếp: ${filters.sortBy}`);
    
    return filterText.join(', ');
  };

  const handleReSearch = (item) => {
    const searchQuery = item.searchQuery;
    const filters = item.searchFilters || {};
    
    // Build URL with search query and filters
    const params = new URLSearchParams();
    params.set('search', searchQuery);
    
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    
    navigate(`/products?${params.toString()}`);
  };

  const handleDeleteHistory = async (id) => {
    await removeSearchHistory(id);
  };

  const handleClearAllHistory = async () => {
    await clearHistory();
    setOpenClearDialog(false);
  };

  const filterByDateRange = () => {
    if (!dateRange.startDate && !dateRange.endDate) {
      setFilteredHistory(searchHistory);
      return;
    }

    const filtered = searchHistory.filter(item => {
      const itemDate = new Date(item.timestamp);
      const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
      const end = dateRange.endDate ? new Date(dateRange.endDate + 'T23:59:59') : null;
      
      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      
      return true;
    });

    setFilteredHistory(filtered);
  };

  const resetDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    setFilteredHistory(searchHistory);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Lịch sử tìm kiếm
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và xem lại các lần tìm kiếm trước đây của bạn
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Popular Queries */}
      {popularQueries.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Từ khóa tìm kiếm phổ biến
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {popularQueries.map((query, index) => (
                <Chip
                  key={index}
                  label={query}
                  color="primary"
                  variant="outlined"
                  clickable
                  onClick={() => navigate(`/products?search=${encodeURIComponent(query)}`)}
                  icon={<SearchIcon />}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Date Filter & Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="Từ ngày"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="Đến ngày"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={filterByDateRange}
                  startIcon={<DateRangeIcon />}
                >
                  Lọc
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetDateFilter}
                  startIcon={<RefreshIcon />}
                >
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredHistory.length} lịch sử tìm kiếm
            </Typography>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearIcon />}
              onClick={() => setOpenClearDialog(true)}
              disabled={searchHistory.length === 0}
            >
              Xóa tất cả
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Search History List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {filteredHistory.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {searchHistory.length === 0 ? 'Chưa có lịch sử tìm kiếm' : 'Không tìm thấy kết quả phù hợp'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchHistory.length === 0 ? 'Hãy thử tìm kiếm một số sản phẩm!' : 'Thử điều chỉnh bộ lọc thời gian'}
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredHistory.map((item, index) => (
                <Box key={item.id}>
                  <ListItem>
                    <ListItemIcon>
                      <HistoryIcon color="action" />
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                            {item.searchQuery}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            {formatDate(item.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatFilters(item.searchFilters)}
                          </Typography>
                          
                          {item.clickedProducts && item.clickedProducts.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Chip 
                                label={`Đã xem ${item.clickedProducts.length} sản phẩm`}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => handleReSearch(item)}
                        color="primary"
                        title="Tìm kiếm lại"
                      >
                        <SearchIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteHistory(item.id)}
                        color="error"
                        title="Xóa"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {index < filteredHistory.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Clear All Confirmation Dialog */}
      <Dialog
        open={openClearDialog}
        onClose={() => setOpenClearDialog(false)}
      >
        <DialogTitle>Xóa toàn bộ lịch sử tìm kiếm</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa toàn bộ lịch sử tìm kiếm? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClearDialog(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleClearAllHistory}
            color="error"
            variant="contained"
          >
            Xóa tất cả
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SearchHistoryPage;
