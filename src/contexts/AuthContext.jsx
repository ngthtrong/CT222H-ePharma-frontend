import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, cartAPI } from '../api';
import { getLocalStorage, setLocalStorage, removeLocalStorage, cleanupLocalStorage } from '../utils/localStorage';

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
    // Cleanup invalid localStorage data first
    cleanupLocalStorage();
    
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

  const handleLoginSuccess = async (data) => {
    setLocalStorage('accessToken', data.accessToken);
    const guestCartSessionId = getLocalStorage('sessionId');

    // Must fetch profile first to be authenticated for merge cart call
    const profile = await authAPI.getMyProfile();
    dispatch({ type: 'LOAD_USER', payload: profile });
    
    if (guestCartSessionId) {
      try {
        await cartAPI.mergeCart();
        removeLocalStorage('sessionId'); // Clear guest cart session after successful merge
        console.log('Guest cart merged successfully.');
      } catch (error) {
        console.error('Failed to merge guest cart:', error);
        // Decide how to handle merge failure. Maybe notify the user.
      }
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authAPI.login(credentials);
      const { data } = response;
      
      await handleLoginSuccess(data);
      
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
      
      // Automatically log in the user after successful registration
      await handleLoginSuccess(data);
      
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
