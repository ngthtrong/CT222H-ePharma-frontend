import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook để quản lý API calls với loading, error, và data state
 * @param {Function} apiFunc - Function API cần gọi
 * @param {Array} deps - Dependencies array (như useEffect)
 * @param {boolean} immediate - Có gọi API ngay lập tức hay không
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useApi = (apiFunc, deps = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunc(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, reset };
};

/**
 * Custom hook để quản lý pagination
 * @param {Function} apiFunc - Function API cần gọi
 * @param {Object} initialParams - Tham số ban đầu
 * @returns {Object} - { data, loading, error, pagination, loadMore, refresh, setParams }
 */
export const usePagination = (apiFunc, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasMore: false,
  });
  const [params, setParams] = useState({ page: 1, limit: 10, ...initialParams });

  const fetchData = useCallback(async (isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunc(params);
      const { data: items, pagination: paginationData } = response.data;
      
      if (isLoadMore) {
        setData(prev => [...prev, ...items]);
      } else {
        setData(items);
      }
      
      setPagination({
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems,
        hasMore: paginationData.currentPage < paginationData.totalPages,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [apiFunc, params]);

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading) {
      setParams(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.hasMore, loading]);

  const refresh = useCallback(() => {
    setParams(prev => ({ ...prev, page: 1 }));
  }, []);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: 1 }));
  }, []);

  useEffect(() => {
    fetchData(params.page > 1);
  }, [fetchData, params.page]);

  useEffect(() => {
    if (params.page === 1) {
      fetchData(false);
    }
  }, [params]);

  return {
    data,
    loading,
    error,
    pagination,
    loadMore,
    refresh,
    setParams: updateParams,
  };
};

/**
 * Custom hook để quản lý local storage state
 * @param {string} key - Key trong localStorage
 * @param {*} defaultValue - Default value
 * @returns {Array} - [value, setValue]
 */
export const useLocalStorage = (key, defaultValue = null) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key]);

  return [value, setStoredValue];
};

/**
 * Custom hook để debounce một value
 * @param {*} value - Value cần debounce
 * @param {number} delay - Delay time in milliseconds
 * @returns {*} - Debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
