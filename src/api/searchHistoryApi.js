import api from './config';

// Lấy lịch sử tìm kiếm
export const getSearchHistory = async (recent = false) => {
  const params = recent ? '?recent=true' : '';
  const response = await api.get(`/search-history${params}`);
  return response.data;
};

// Lấy lịch sử tìm kiếm theo khoảng thời gian
export const getSearchHistoryByDateRange = async (startDate, endDate) => {
  const response = await api.get(`/search-history/date-range?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// Lấy từ khóa phổ biến
export const getPopularSearchQueries = async (limit = 10) => {
  const response = await api.get(`/search-history/popular?limit=${limit}`);
  return response.data;
};

// Lưu lịch sử tìm kiếm
export const saveSearchHistory = async (searchData) => {
  const response = await api.post('/search-history', searchData);
  return response.data;
};

// Cập nhật sản phẩm đã click
export const updateClickedProducts = async (searchHistoryId, productIds) => {
  const response = await api.put(`/search-history/${searchHistoryId}/clicked-products`, productIds);
  return response.data;
};

// Xóa một lịch sử tìm kiếm
export const deleteSearchHistory = async (searchHistoryId) => {
  const response = await api.delete(`/search-history/${searchHistoryId}`);
  return response.data;
};

// Xóa toàn bộ lịch sử
export const clearAllSearchHistory = async () => {
  const response = await api.delete('/search-history');
  return response.data;
};
