import api from './config';
import { setSessionId, getSessionId, clearSessionId } from '../utils/localStorage';

// Tạo sessionId cho guest cart
export const createGuestSession = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Xóa session sau khi merge
export const clearGuestSession = () => {
  localStorage.removeItem('sessionId');
};

// =================================================================================
// Cart API
// =================================================================================

/**
 * Gets the current user's or guest's cart.
 * The distinction is handled by the axios interceptor which adds
 * the appropriate 'Authorization' or 'X-Cart-Session-ID' header.
 */
export const getCart = async () => {
  const { data } = await api.get('/cart');
  return data;
};

/**
 * Adds an item to the cart.
 * @param {{ productId: string, quantity: number }} item - The item to add.
 */
export const addItemToCart = async (item) => {
  const { data } = await api.post('/cart/items', item);
  return data;
};

/**
 * Updates the quantity of an item in the cart.
 * @param {string} productId - The ID of the product to update.
 * @param {{ quantity: number }} payload - The new quantity.
 */
export const updateCartItem = async (productId, payload) => {
  const { data } = await api.put(`/cart/items/${productId}`, payload);
  return data;
};

/**
 * Removes an item from the cart.
 * @param {string} productId - The ID of the product to remove.
 */
export const removeCartItem = async (productId) => {
  const { data } = await api.delete(`/cart/items/${productId}`);
  return data;
};

/**
 * Clears all items from the cart.
 */
export const clearCart = async () => {
  const { data } = await api.delete('/cart');
  return data;
};

/**
 * Merges the guest cart into the user's cart after login.
 * The axios interceptor will attach both the auth token and the session ID.
 */
export const mergeCart = async () => {
  // No need to pass headers here, the interceptor handles it.
  const { data } = await api.post('/cart/merge');
  return data;
};

// Export cartAPI object
export const cartAPI = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeCart
};
