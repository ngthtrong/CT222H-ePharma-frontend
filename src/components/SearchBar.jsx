import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Autocomplete,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Chip,
  ClickAwayListener,
  Popper,
} from '@mui/material';
import {
  Search as SearchIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useAuth } from '../contexts/AuthContext';
import { debounce } from 'lodash';

const SearchBar = ({ 
  placeholder = "Bạn đang tìm gì hôm nay...",
  onSearch,
  fullWidth = false,
  size = 'medium',
  sx = {}
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    searchHistory,
    popularQueries,
    saveSearch,
    removeSearchHistory,
    loadSearchHistory,
    loadPopularQueries
  } = useSearchHistory();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const inputRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);

  // Debounced search để tránh gọi API quá nhiều
  const debouncedSaveSearch = debounce(async (searchQuery, filters = {}) => {
    if (searchQuery.trim().length > 0 && isAuthenticated) {
      await saveSearch(searchQuery, filters);
    }
  }, 1000);

  // Load suggestions khi mở dropdown
  useEffect(() => {
    if (open && isAuthenticated) {
      loadSearchHistory(true); // Load 10 recent searches
      loadPopularQueries(5); // Load 5 popular queries
    }
  }, [open, isAuthenticated, loadSearchHistory, loadPopularQueries]);

  // Combine popular queries và recent history
  useEffect(() => {
    const combined = [];
    
    // Thêm popular queries (nếu có)
    if (popularQueries.length > 0) {
      combined.push({
        type: 'popular',
        title: 'Từ khóa phổ biến',
        items: popularQueries.map(q => ({ query: q, type: 'popular' }))
      });
    }

    // Thêm recent history (nếu có)
    if (searchHistory.length > 0) {
      combined.push({
        type: 'history',
        title: 'Tìm kiếm gần đây',
        items: searchHistory.map(h => ({ 
          ...h, 
          type: 'history',
          query: h.searchQuery 
        }))
      });
    }

    setSuggestions(combined);
  }, [popularQueries, searchHistory]);

  const handleInputFocus = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleInputChange = (event, newValue) => {
    setQuery(newValue || '');
  };

  const handleSearch = async (searchQuery, filters = {}) => {
    if (!searchQuery || !searchQuery.trim()) return;

    const trimmedQuery = searchQuery.trim();
    
    // Đóng dropdown
    setOpen(false);
    
    // Lưu vào search history (debounced)
    debouncedSaveSearch(trimmedQuery, filters);
    
    // Thực hiện search
    if (onSearch) {
      onSearch(trimmedQuery, filters);
    } else {
      // Navigate to products page with search params
      navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleSuggestionClick = (item) => {
    if (item.type === 'history') {
      // Re-search với filters cũ
      handleSearch(item.searchQuery, item.searchFilters || {});
    } else {
      // Search với query mới
      handleSearch(item.query);
    }
  };

  const handleDeleteHistory = async (event, historyId) => {
    event.stopPropagation();
    await removeSearchHistory(historyId);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch(query);
    }
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const formatFilters = (filters) => {
    if (!filters || Object.keys(filters).length === 0) return '';
    
    const filterText = [];
    if (filters.category) filterText.push(`Danh mục: ${filters.category}`);
    if (filters.brand) filterText.push(`Thương hiệu: ${filters.brand}`);
    if (filters.minPrice || filters.maxPrice) {
      filterText.push(`Giá: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'} VND`);
    }
    
    return filterText.join(', ');
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', ...sx }}>
        <TextField
          ref={inputRef}
          fullWidth={fullWidth}
          size={size}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: (
              <IconButton
                size="small"
                onClick={() => handleSearch(query)}
                sx={{ mr: 1 }}
              >
                <SearchIcon />
              </IconButton>
            ),
            endAdornment: query && (
              <IconButton
                size="small"
                onClick={() => setQuery('')}
                sx={{ ml: 1 }}
              >
                <ClearIcon />
              </IconButton>
            ),
            sx: {
              backgroundColor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }
          }}
        />

        {/* Dropdown Suggestions */}
        <Popper
          open={open && isAuthenticated && suggestions.length > 0}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ 
            width: anchorEl?.offsetWidth || 'auto',
            zIndex: 1300 
          }}
        >
          <Paper 
            elevation={4}
            sx={{ 
              mt: 1, 
              maxHeight: 400, 
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {suggestions.map((section, sectionIndex) => (
              <Box key={section.type}>
                {/* Section Header */}
                <Box sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {section.type === 'popular' ? <TrendingUpIcon fontSize="small" /> : <HistoryIcon fontSize="small" />}
                    {section.title}
                  </Typography>
                </Box>

                {/* Section Items */}
                <List dense sx={{ py: 0 }}>
                  {section.items.map((item, itemIndex) => (
                    <ListItem
                      key={`${section.type}-${itemIndex}`}
                      button
                      onClick={() => handleSuggestionClick(item)}
                      sx={{ 
                        py: 1,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {section.type === 'popular' ? 
                          <TrendingUpIcon fontSize="small" color="primary" /> : 
                          <HistoryIcon fontSize="small" color="action" />
                        }
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.query}
                            </Typography>
                            {item.searchFilters && (
                              <Typography variant="caption" color="text.secondary">
                                {formatFilters(item.searchFilters)}
                              </Typography>
                            )}
                            {item.clickedProducts && item.clickedProducts.length > 0 && (
                              <Box sx={{ mt: 0.5 }}>
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
                      
                      {section.type === 'history' && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteHistory(e, item.id)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </ListItem>
                  ))}
                </List>

                {sectionIndex < suggestions.length - 1 && <Divider />}
              </Box>
            ))}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;
