import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, cartAPI } from '../api';
import { logout as logoutAPI } from '../api/authApi';
import { getLocalStorage, setLocalStorage, removeLocalStorage, cleanupLocalStorage, clearAuthData, getSessionId, clearSessionId } from '../utils/localStorage';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  console.log('AuthReducer:', action.type, { 
    currentState: { 
      isAuthenticated: state.isAuthenticated, 
      hasUser: !!state.user, 
      hasToken: !!state.token 
    },
    action: action.type,
    payload: action.payload 
  });
  
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      console.log('LOGOUT action dispatched - resetting all auth state');
      return {
        ...state,
        user: null,
        token: null,
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
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);



  // Effect để theo dõi sự thay đổi của token và tự động gọi getMyProfile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (state.token && !state.user) {
        try {
          const response = await authAPI.getMyProfile();
          
          // authAPI.getMyProfile() trả về response.data, có thể có cấu trúc:
          // { success, message, data: { user info } } hoặc trực tiếp user data
          let userProfile;
          if (response.success && response.data) {
            // Nested response structure
            userProfile = response.data;
          } else if (response.id || response.email) {
            // Direct user data
            userProfile = response;
          } else {
            throw new Error('Invalid user profile response');
          }
          
          setLocalStorage('user', userProfile); // Lưu user data vào localStorage
          dispatch({ type: 'LOAD_USER', payload: userProfile });
          
          // Merge guest cart if available
          const guestCartSessionId = getSessionId();
          if (guestCartSessionId) {
            try {
              console.log('Found guest cart session ID, attempting to merge:', guestCartSessionId);
              await cartAPI.mergeCart();
              clearSessionId(); // Sử dụng function từ localStorage utils
              console.log('Guest cart merged successfully and session ID cleared.');
            } catch (error) {
              console.error('Failed to merge guest cart:', error);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Token might be invalid, clean up
          console.log('Removing token due to profile fetch error');
          removeLocalStorage('accessToken');
          removeLocalStorage('user');
          // Use LOGOUT action to ensure complete state reset
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    fetchUserProfile();
  }, [state.token]);

  // Effect để khởi tạo từ localStorage khi app load
  useEffect(() => {
    console.log('=== Initial localStorage check ===');
    cleanupLocalStorage();
    
    const token = getLocalStorage('accessToken');
    const user = getLocalStorage('user');
    
    console.log('Initial load - Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null/undefined');
    console.log('Initial load - User from localStorage:', user ? 'found' : 'not found');
    console.log('Initial load - Current auth state:', { 
      isAuthenticated: state.isAuthenticated, 
      hasUser: !!state.user, 
      hasToken: !!state.token 
    });
    
    if (token && user) {
      console.log('Both token and user found - setting authenticated state');
      try {
        // Set both token and user together to maintain consistency
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { 
            user: user, 
            token: token 
          } 
        });
      } catch (error) {
        console.log('Error setting initial state:', error);
        removeLocalStorage('accessToken');
        removeLocalStorage('user');
        dispatch({ type: 'STOP_LOADING' });
      }
    } else if (token) {
      console.log('Only token found - will fetch user profile');
      // Có token nhưng không có user data, cần fetch lại
      dispatch({ type: 'SET_TOKEN', payload: token });
    } else {
      console.log('No token found - user not authenticated');
      // Ensure clean state if no valid authentication data
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'STOP_LOADING' });
    }
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      console.log('Attempting login with:', credentials);
      
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      // authAPI.login() trả về response.data, có cấu trúc:
      // { success, message, data: { accessToken, user, tokenType, ... } }
      const { success, message, data } = response;
      
      if (!success) {
        throw new Error(message || 'Login failed');
      }
      
      const { accessToken, user } = data;
      
      // Lưu token và user data vào localStorage
      setLocalStorage('accessToken', accessToken);
      setLocalStorage('user', user);
      
      // Debug: Verify token was saved
      const savedToken = getLocalStorage('accessToken');
      console.log('=== LOGIN DEBUG ===');
      console.log('Full response structure:', response);
      console.log('Token from response:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NO TOKEN IN RESPONSE');
      console.log('Token saved to localStorage:', savedToken ? `${savedToken.substring(0, 20)}...` : 'FAILED TO SAVE');
      console.log('localStorage check:', localStorage.getItem('accessToken') ? 'TOKEN EXISTS' : 'NO TOKEN');
      
      // Dispatch LOGIN_SUCCESS với đầy đủ thông tin user và token
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user: user, 
          token: accessToken 
        } 
      });
      
      // Merge guest cart if available (Bước 3c, 3d trong yêu cầu)
      const guestCartSessionId = getSessionId();
      if (guestCartSessionId) {
        try {
          console.log('Found guest cart session ID after login, attempting to merge:', guestCartSessionId);
          await cartAPI.mergeCart();
          clearSessionId(); // Xóa cartSessionId khỏi localStorage sau khi gộp thành công
          console.log('Guest cart merged successfully after login and session ID cleared.');
        } catch (error) {
          console.error('Failed to merge guest cart after login:', error);
          // Vẫn clear session ID ngay cả khi merge thất bại để tránh loop
          clearSessionId();
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = 'Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authAPI.register(userData);
      
      // authAPI.register() trả về response.data, có cấu trúc:
      // { success, message, data: { accessToken, user, tokenType, ... } }
      const { success, message, data } = response;
      
      if (!success) {
        throw new Error(message || 'Registration failed');
      }
      
      const { accessToken, user } = data;
      
      // Lưu token và user data vào localStorage
      setLocalStorage('accessToken', accessToken);
      setLocalStorage('user', user);
      
      // Dispatch LOGIN_SUCCESS với đầy đủ thông tin user và token
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user: user, 
          token: accessToken 
        } 
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };
  // Main logout function theo flow chuẩn
  const logout = async () => {
    // Tránh multiple concurrent logout calls
    if (isLoggingOut) {
      console.log('Logout already in progress, ignoring...');
      return;
    }
    
    setIsLoggingOut(true);
    
    try {
      // Bước 1: Lấy Token đã lưu
      const tokenFromStorage = getLocalStorage('accessToken');
      const tokenFromState = state.token;
      const tokenToUse = tokenFromState || tokenFromStorage;
      
      console.log('=== Logout Process Started ===');
      console.log('Token available:', !!tokenToUse);
      console.log('User authenticated:', state.isAuthenticated);
      
      // Bước 2: Gọi API Logout (nếu có token)
      if (tokenToUse && state.isAuthenticated) {
        console.log('Calling logout API...');
        try {
          // Đảm bảo token có trong localStorage để API sử dụng
          if (!tokenFromStorage && tokenFromState) {
            setLocalStorage('accessToken', tokenFromState);
          }
          
          // Gọi API logout với timeout để tránh treo
          const logoutPromise = logoutAPI();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Logout timeout')), 5000)
          );
          
          await Promise.race([logoutPromise, timeoutPromise]);
          console.log('Logout API call successful');
        } catch (apiError) {
          // Log lỗi nhưng không dừng quá trình logout
          console.warn('Logout API failed, but continuing with cleanup:', apiError.message);
        }
      } else {
        console.log('No valid authentication state, skipping API call');
      }
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Bước 3: Xử lý dọn dẹp ở Frontend (LUÔN THỰC HIỆN)
      console.log('=== Frontend Cleanup Started ===');
      
      // 3.1: Xóa Token và thông tin người dùng
      clearAuthData();
      
      // 3.2: Xóa cart session ID để tránh conflict
      clearSessionId();
      
      // 3.3: Reset State về trạng thái ban đầu
      dispatch({ type: 'LOGOUT' });
      
      setIsLoggingOut(false);
      
      console.log('=== Logout Process Completed ===');
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
