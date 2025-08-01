import { useState, useEffect, useCallback } from 'react';
import { adminCache, CACHE_DURATIONS } from '../utils/cacheUtils';

/**
 * Custom hook for managing cached data with API calls
 * @param {string} cacheKey - Key for caching data
 * @param {Function} fetchFunction - Function to fetch fresh data
 * @param {Object} options - Configuration options
 * @returns {Object} - State and control functions
 */
export const useCachedData = (cacheKey, fetchFunction, options = {}) => {
  const {
    defaultValue = null,
    cacheDuration = CACHE_DURATIONS.MEDIUM,
    enableAutoRefresh = true,
    dependencies = [],
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, [cacheKey]);

  // Auto refresh when dependencies change
  useEffect(() => {
    if (enableAutoRefresh && dependencies.length > 0) {
      const cachedResult = adminCache.get(cacheKey);
      if (cachedResult.isExpired || !cachedResult.data) {
        fetchData(false);
      }
    }
  }, dependencies);

  const loadCachedData = useCallback(() => {
    try {
      const cachedResult = adminCache.get(cacheKey, defaultValue);
      
      if (!cachedResult.isExpired && cachedResult.data !== null) {
        setData(cachedResult.data);
        setLastUpdated(cachedResult.timestamp);
        return true;
      }
      
      // Cache expired or empty, fetch fresh data
      if (enableAutoRefresh) {
        fetchData(false);
      }
      
      return false;
    } catch (err) {
      console.error('Error loading cached data:', err);
      setError(err);
      return false;
    }
  }, [cacheKey, defaultValue, enableAutoRefresh]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      
      setData(result);
      setLastUpdated(Date.now());
      
      // Cache the result
      adminCache.set(cacheKey, result, cacheDuration);
      
      if (onSuccess) {
        onSuccess(result, forceRefresh);
      }
      
      return result;
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
      
      if (onError) {
        onError(err, forceRefresh);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, cacheKey, cacheDuration, onSuccess, onError]);

  const refreshData = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    adminCache.remove(cacheKey);
    setData(defaultValue);
    setLastUpdated(null);
  }, [cacheKey, defaultValue]);

  const isValid = useCallback(() => {
    return adminCache.isValid(cacheKey);
  }, [cacheKey]);

  const getTimeSinceUpdate = useCallback(() => {
    return adminCache.getTimeSinceUpdate(cacheKey);
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    fetchData,
    refreshData,
    clearCache,
    isValid,
    getTimeSinceUpdate,
    loadCachedData,
  };
};

/**
 * Hook specifically for category product counts
 */
export const useCategoryProductCounts = (categories = [], adminAPI, productAPI) => {
  const [useBatchAPI, setUseBatchAPI] = useState(true);
  
  const fetchProductCounts = useCallback(async () => {
    // Try batch API first - NEW OPTIMIZED ENDPOINT
    try {
      const response = await adminAPI.getCategoryProductCounts();
      if (response.data.success && response.data.data) {
        // Convert array response to object format for compatibility
        // Response format: [{ categoryId, categoryName, categorySlug, productCount }]
        const counts = {};
        response.data.data.forEach(item => {
          counts[item.categoryId] = item.productCount;
        });
        
        setUseBatchAPI(true);
        return counts;
      }
    } catch (error) {
      setUseBatchAPI(false);
    }

    // Fallback to individual API calls
    setUseBatchAPI(false);
    const counts = {};
    const batchSize = 5;

    for (let i = 0; i < categories.length; i += batchSize) {
      const batch = categories.slice(i, i + batchSize);
      
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
      
      // Small delay between batches
      if (i + batchSize < categories.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return counts;
  }, [categories, adminAPI, productAPI]);

  const cachedDataHook = useCachedData(
    'category_product_counts',
    fetchProductCounts,
    {
      defaultValue: {},
      cacheDuration: CACHE_DURATIONS.MEDIUM,
      dependencies: [categories.length], // Refresh when categories change
    }
  );

  return {
    ...cachedDataHook,
    useBatchAPI,
  };
};

export default useCachedData;
