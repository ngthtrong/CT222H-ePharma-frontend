import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, cartAPI } from '../api';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../utils/localStorage';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'STOP_LOADING':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = getLocalStorage('accessToken');
    const user = getLocalStorage('user');
    
    if (token && user) {
      try {
        dispatch({ type: 'LOAD_USER', payload: user });
      } catch (error) {
        removeLocalStorage('accessToken');
        removeLocalStorage('user');
        dispatch({ type: 'STOP_LOADING' });
      }
    } else {
      dispatch({ type: 'STOP_LOADING' });
    }
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authAPI.login(credentials);
      const { data } = response;
      const { user, accessToken } = data;
      
      setLocalStorage('accessToken', accessToken);
      setLocalStorage('user', user);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
      
      // Sau khi đăng nhập thành công, kiểm tra và merge giỏ hàng
      const sessionId = getLocalStorage('sessionId');
      if (sessionId) {
        try {
          await cartAPI.mergeCart();
          console.log('Cart merged successfully');
        } catch (error) {
          console.error('Error merging cart:', error);
        }
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authAPI.register(userData);
      const { data } = response;
      const { user, accessToken } = data;
      
      setLocalStorage('accessToken', accessToken);
      setLocalStorage('user', user);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
      
      // Sau khi đăng ký thành công, kiểm tra và merge giỏ hàng
      const sessionId = getLocalStorage('sessionId');
      if (sessionId) {
        try {
          await cartAPI.mergeCart();
          console.log('Cart merged successfully');
        } catch (error) {
          console.error('Error merging cart:', error);
        }
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeLocalStorage('accessToken');
      removeLocalStorage('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
