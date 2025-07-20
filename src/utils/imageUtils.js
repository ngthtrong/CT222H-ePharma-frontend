/**
 * Utility functions for handling images
 */

/**
 * Tạo placeholder image khi không có ảnh
 * @param {number} width - Width của ảnh
 * @param {number} height - Height của ảnh  
 * @param {string} text - Text hiển thị trong placeholder
 * @returns {string} - Data URL của placeholder image
 */
export const createPlaceholderImage = (width = 300, height = 200, text = 'No Image') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);
  
  // Border
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = '#999';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL();
};

/**
 * Fallback image URL đơn giản
 */
export const FALLBACK_IMAGE_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

/**
 * Xử lý lỗi khi load ảnh
 * @param {Event} event - Event object từ onError
 * @param {string} fallbackUrl - URL fallback (optional)
 */
export const handleImageError = (event, fallbackUrl = FALLBACK_IMAGE_URL) => {
  if (event.target.src !== fallbackUrl) {
    event.target.src = fallbackUrl;
  } else {
    // Nếu fallback cũng lỗi, ẩn ảnh
    event.target.style.display = 'none';
  }
};

/**
 * Component wrapper cho image với fallback
 */
export const getImageSrc = (imageSrc, width = 300, height = 200) => {
  return imageSrc || FALLBACK_IMAGE_URL;
};
