import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../api/cartApi';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

// Actions
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };
    
    case CART_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case CART_ACTIONS.SET_CART:
      const items = action.payload.items || [];
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => 
        sum + (item.productId.price * item.quantity), 0
      );
      return {
        ...state,
        items,
        totalItems,
        totalPrice,
        loading: false,
        error: null,
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return { items: [], totalItems: 0, loading: false, error: null };
    
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
      console.error('Error fetching cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      await cartAPI.addToCart(productId, quantity);
      await fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Update item quantity
  const updateCartItem = async (productId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      await cartAPI.updateCartItem(productId, quantity);
      await fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Error updating cart item:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      await cartAPI.removeFromCart(productId);
      await fetchCart(); // Refresh cart data
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      await cartAPI.clearCart();
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Merge guest cart when user logs in
  const mergeGuestCart = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId && isAuthenticated) {
        await cartAPI.mergeCart();
        await fetchCart(); // Refresh cart data
      }
    } catch (error) {
      console.error('Error merging cart:', error);
    }
  };

  // Load cart on mount and when auth state changes
  useEffect(() => {
    fetchCart();
  }, []);

  // Merge cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      mergeGuestCart();
    }
  }, [isAuthenticated, user]);

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
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
