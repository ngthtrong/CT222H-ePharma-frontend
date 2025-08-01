import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, cartAPI } from '../api';
import { logout as logoutAPI } from '../api/authApi';
import { getLocalStorage, setLocalStorage, removeLocalStorage, cleanupLocalStorage, clearAuthData, getSessionId, clearSessionId } from '../utils/localStorage';
import { oauth2Auth } from '../utils/oauth2Auth';

// Export AuthContext để có thể import trực tiếp
export const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
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
              await cartAPI.mergeCart();
              clearSessionId();
            } catch (error) {
              // Failed to merge guest cart, but continue silently
            }
          }
        } catch (error) {
          // Token might be invalid, clean up
          removeLocalStorage('accessToken');
          removeLocalStorage('user');
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    fetchUserProfile();
  }, [state.token]);

  // Effect để khởi tạo từ localStorage khi app load
  useEffect(() => {
    cleanupLocalStorage();
    
    const token = getLocalStorage('accessToken');
    const user = getLocalStorage('user');
    
    if (token && user) {
      try {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { 
            user: user, 
            token: token 
          } 
        });
      } catch (error) {
        removeLocalStorage('accessToken');
        removeLocalStorage('user');
        dispatch({ type: 'STOP_LOADING' });
      }
    } else if (token) {
      // Có token nhưng không có user data, cần fetch lại
      dispatch({ type: 'SET_TOKEN', payload: token });
    } else {
      // Ensure clean state if no valid authentication data
      dispatch({ type: 'LOGOUT' });
      dispatch({ type: 'STOP_LOADING' });
    }
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      // Xóa tất cả thông tin user và token cũ trước khi đăng nhập mới
      clearAuthData();
      clearSessionId();
      dispatch({ type: 'LOGOUT' });
      
      const response = await authAPI.login(credentials);
      
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
      
      // Dispatch LOGIN_SUCCESS với đầy đủ thông tin user và token
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user: user, 
          token: accessToken 
        } 
      });
      
      // Merge guest cart if available
      const guestCartSessionId = getSessionId();
      if (guestCartSessionId) {
        try {
          await cartAPI.mergeCart();
          clearSessionId();
        } catch (error) {
          clearSessionId();
        }
      }
      
      return { success: true };
    } catch (error) {
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
      // { success, message, data: { user data } }
      const { success, message, data } = response;
      
      if (!success) {
        throw new Error(message || 'Registration failed');
      }
      
      // Không tự động đăng nhập sau khi đăng ký
      // Chỉ trả về thông báo thành công
      dispatch({ type: 'STOP_LOADING' });
      
      return { success: true, message: message || 'Đăng ký thành công' };
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
      return;
    }
    
    setIsLoggingOut(true);
    
    try {
      // Lấy Token và gọi API Logout nếu có
      const tokenFromStorage = getLocalStorage('accessToken');
      const tokenFromState = state.token;
      const tokenToUse = tokenFromStorage || tokenFromState;
      
      if (tokenToUse && state.isAuthenticated) {
        try {
          // Đảm bảo token có trong localStorage để API sử dụng
          if (!tokenFromStorage && tokenFromState) {
            setLocalStorage('accessToken', tokenFromState);
          }
          
          await logoutAPI();
        } catch (apiError) {
          // Logout API failed, but continuing with cleanup
        }
      }
      
    } catch (error) {
      // Logout error handled silently
    } finally {
      // Xóa Token và thông tin người dùng
      clearAuthData();
      
      // Xóa cart session ID để tránh conflict
      clearSessionId();
      
      // Reset State về trạng thái ban đầu
      dispatch({ type: 'LOGOUT' });
      
      setIsLoggingOut(false);
    }
  };

  // OAuth2 Login function
  const oauth2Login = async (provider) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      // Clear existing auth data before OAuth2 login
      clearAuthData();
      clearSessionId();
      dispatch({ type: 'LOGOUT' });
      
      // Initiate OAuth2 flow
      await oauth2Auth.login(provider);
      
      // Note: After OAuth2 redirect, the callback will be handled by processOAuth2Callback
      
    } catch (error) {
      console.error(`OAuth2 ${provider} login error:`, error);
      const errorMessage = error.message || `Đăng nhập với ${provider} thất bại`;
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Process OAuth2 callback after redirect
  const processOAuth2Callback = async (provider, code, state) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      // Process OAuth2 callback with backend
      const response = await oauth2Auth.processCallback(provider, code, state);
      
      if (!response.success) {
        throw new Error(response.message || 'OAuth2 authentication failed');
      }
      
      const { accessToken, user } = response.data;
      
      // Save token and user data to localStorage
      setLocalStorage('accessToken', accessToken);
      setLocalStorage('user', user);
      
      // Dispatch LOGIN_SUCCESS with user and token
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          user: user, 
          token: accessToken 
        } 
      });
      
      // Merge guest cart if available
      const guestCartSessionId = getSessionId();
      if (guestCartSessionId) {
        try {
          await cartAPI.mergeCart();
        } catch (error) {
          console.warn('Failed to merge cart after OAuth2 login:', error);
        }
      }
      
      oauth2Auth.showSuccess(`Đăng nhập với ${provider} thành công!`);
      return { success: true };
      
    } catch (error) {
      console.error(`OAuth2 ${provider} callback error:`, error);
      
      // Clear stored state on error
      oauth2Auth.clearState();
      
      let errorMessage = `Đăng nhập với ${provider} thất bại`;
      if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      oauth2Auth.showError(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  // Check for OAuth2 callback on component mount
  useEffect(() => {
    const handleOAuth2Callback = async () => {
      // First check for direct success (backend redirect with token)
      const directSuccess = oauth2Auth.handleDirectSuccess();
      
      if (directSuccess && directSuccess.isDirectCallback) {
        if (directSuccess.error) {
          // Handle OAuth2 error from direct callback
          const errorMessage = oauth2Auth.getErrorMessage(directSuccess.error, directSuccess.provider);
          oauth2Auth.showError(errorMessage);
          dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (directSuccess.token && directSuccess.user) {
          // Handle direct success with token and user data
          try {
            // Store authentication data
            setLocalStorage('accessToken', directSuccess.token);
            setLocalStorage('user', directSuccess.user);
            
            // Update auth state
            dispatch({ 
              type: 'LOGIN_SUCCESS', 
              payload: { 
                user: directSuccess.user, 
                token: directSuccess.token 
              } 
            });
            
            // Merge guest cart if available
            const guestCartSessionId = getSessionId();
            if (guestCartSessionId) {
              try {
                await cartAPI.mergeCart();
                clearSessionId();
              } catch (error) {
                console.warn('Failed to merge cart after OAuth2 login:', error);
              }
            }
            
            oauth2Auth.showSuccess(`Đăng nhập với ${directSuccess.provider} thành công!`);
            
            // Clean up URL and redirect
            window.history.replaceState({}, document.title, '/');
            
          } catch (error) {
            console.error('Error processing direct OAuth2 success:', error);
            dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
          }
        }
        return;
      }

      // Then check for standard callback
      const callbackData = oauth2Auth.checkForCallback();
      
      if (callbackData && callbackData.isCallback) {
        if (callbackData.error) {
          // Handle OAuth2 error from provider
          const errorMessage = oauth2Auth.getErrorMessage(callbackData.error, callbackData.provider);
          oauth2Auth.showError(errorMessage);
          dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (callbackData.code && callbackData.state) {
          // Process successful OAuth2 callback
          const result = await processOAuth2Callback(
            callbackData.provider, 
            callbackData.code, 
            callbackData.state
          );
          
          // Clean up URL and redirect to home on success
          if (result.success) {
            window.history.replaceState({}, document.title, '/');
          } else {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      }
    };

    handleOAuth2Callback();
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    oauth2Login,
    processOAuth2Callback,
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
