import { useState, useEffect, useCallback } from 'react';
import { 
  getSearchHistory, 
  getPopularSearchQueries, 
  saveSearchHistory, 
  deleteSearchHistory, 
  clearAllSearchHistory,
  updateClickedProducts 
} from '../api/searchHistoryApi';
import { useAuth } from '../contexts/AuthContext';

export const useSearchHistory = () => {
  const { isAuthenticated } = useAuth();
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularQueries, setPopularQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy lịch sử tìm kiếm
  const loadSearchHistory = useCallback(async (recent = false) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getSearchHistory(recent);
      const data = response.data || [];
      setSearchHistory(data);
      return data;
    } catch (err) {
      console.error('Error loading search history:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Lấy từ khóa phổ biến
  const loadPopularQueries = useCallback(async (limit = 10) => {
    if (!isAuthenticated) return;

    try {
      const response = await getPopularSearchQueries(limit);
      const data = response.data || [];
      setPopularQueries(data);
      return data;
    } catch (err) {
      console.error('Error loading popular queries:', err);
      return [];
    }
  }, [isAuthenticated]);

  // Lưu lịch sử tìm kiếm
  const saveSearch = useCallback(async (searchQuery, searchFilters = {}, clickedProducts = []) => {
    if (!isAuthenticated || !searchQuery.trim()) return null;

    try {
      const searchData = {
        searchQuery: searchQuery.trim(),
        searchFilters,
        clickedProducts
      };
      
      const response = await saveSearchHistory(searchData);
      
      // Cập nhật local state
      const newHistory = response.data;
      setSearchHistory(prev => [newHistory, ...prev.slice(0, 9)]); // Chỉ giữ 10 mục gần nhất
      
      return newHistory;
    } catch (err) {
      console.error('Error saving search history:', err);
      return null;
    }
  }, [isAuthenticated]);

  // Xóa một mục lịch sử
  const removeSearchHistory = useCallback(async (searchHistoryId) => {
    if (!isAuthenticated) return false;

    try {
      await deleteSearchHistory(searchHistoryId);
      setSearchHistory(prev => prev.filter(item => item.id !== searchHistoryId));
      return true;
    } catch (err) {
      console.error('Error deleting search history:', err);
      return false;
    }
  }, [isAuthenticated]);

  // Xóa toàn bộ lịch sử
  const clearHistory = useCallback(async () => {
    if (!isAuthenticated) return false;

    try {
      await clearAllSearchHistory();
      setSearchHistory([]);
      return true;
    } catch (err) {
      console.error('Error clearing search history:', err);
      return false;
    }
  }, [isAuthenticated]);

  // Cập nhật sản phẩm đã click
  const updateProductClicks = useCallback(async (searchHistoryId, productIds) => {
    if (!isAuthenticated) return false;

    try {
      await updateClickedProducts(searchHistoryId, productIds);
      
      // Cập nhật local state
      setSearchHistory(prev => prev.map(item => 
        item.id === searchHistoryId 
          ? { ...item, clickedProducts: productIds }
          : item
      ));
      
      return true;
    } catch (err) {
      console.error('Error updating clicked products:', err);
      return false;
    }
  }, [isAuthenticated]);

  // Auto load khi component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadSearchHistory(true); // Load recent history
      loadPopularQueries(5); // Load popular queries
    } else {
      // Clear data khi logout
      setSearchHistory([]);
      setPopularQueries([]);
    }
  }, [isAuthenticated, loadSearchHistory, loadPopularQueries]);

  return {
    searchHistory,
    popularQueries,
    loading,
    error,
    loadSearchHistory,
    loadPopularQueries,
    saveSearch,
    removeSearchHistory,
    clearHistory,
    updateProductClicks
  };
};
