import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../api/cartApi';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0, // Đổi từ totalPrice thành totalAmount theo API docs
  loading: false,
  error: null,
};

// Actions
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CART: 'SET_CART',
  CLEAR_CART: 'CLEAR_CART',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case CART_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case CART_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case CART_ACTIONS.SET_CART:
      const cartData = action.payload;
      const items = cartData?.items || [];
      const totalItems = items.length; // Chỉ đếm số lượng loại sản phẩm khác nhau
      const totalAmount = cartData?.totalAmount || 0;
      
      return {
        ...state,
        items,
        totalItems,
        totalAmount,
        loading: false,
        error: null,
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return { 
        ...state,
        items: [], 
        totalItems: 0, 
        totalAmount: 0,
        loading: false, 
        error: null 
      };
    
    default:
      return state;
  }
};

// Context
const CartContext = createContext();

// Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Fetch cart data
  const fetchCart = async () => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await cartAPI.getCart();
      dispatch({ type: CART_ACTIONS.SET_CART, payload: response.data });
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Add item to cart - theo đúng API guide format
  const addToCart = async (productId, quantity = 1) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      
      // Call API với đúng format: addItemToCart(productId, quantity)
      const response = await cartAPI.addItemToCart(productId, quantity);
      
      // Fetch updated cart data
      await fetchCart();
      
      return response;
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Update item quantity
  const updateCartItem = async (productId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      
      // Call API với đúng format: updateCartItem(productId, quantity)
      await cartAPI.updateCartItem(productId, quantity);
      
      // Fetch updated cart data
      await fetchCart();
    } catch (error) {
      console.error('❌ Error updating cart item:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      
      await cartAPI.removeCartItem(productId);
      
      // Fetch updated cart data
      await fetchCart();
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      
      await cartAPI.clearCart();
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Merge guest cart when user logs in - theo đúng API guide
  const mergeGuestCart = async () => {
    try {
      const sessionId = localStorage.getItem('cartSessionId'); // Fix: sử dụng đúng key name
      
      if (sessionId && isAuthenticated) {
        const response = await cartAPI.mergeCart();
        
        if (response) {
          // Fetch updated cart after merge
          await fetchCart();
        }
      }
    } catch (error) {
      console.error('❌ Error merging cart:', error);
      // Không throw error để tránh breaking login flow
    }
  };

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      mergeGuestCart();
    } else {
      // Fetch cart for guest user
      fetchCart();
    }
  }, [isAuthenticated, user]);

  // Utility function to get total quantity (actual sum of all quantities)
  const getTotalQuantity = () => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const value = {
    ...state,
    // Core cart operations
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    // Utility functions
    mergeGuestCart,
    getTotalQuantity, // Hàm để lấy tổng số lượng thực tế nếu cần
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
