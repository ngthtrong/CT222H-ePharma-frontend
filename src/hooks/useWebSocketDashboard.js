import { useState, useEffect, useRef, useCallback } from 'react';
import dashboardManager from '../utils/dashboardManager';

/**
 * Custom hook for managing WebSocket connections for real-time analytics
 * Based on WEBSOCKET-DASHBOARD-API-GUIDE.md
 * Uses centralized DashboardManager for better connection management
 * Supports graceful fallback when WebSocket is not available
 */
export const useWebSocketDashboard = () => {
  const [connected, setConnected] = useState(false);
  const [realTimeData, setRealTimeData] = useState(null);
  const [error, setError] = useState(null);
  
  const reconnectTimer = useRef(null);
  const pingInterval = useRef(null);
  const listenerRef = useRef(null);
  
  // Check if WebSocket is disabled via environment variable
  const isWebSocketDisabled = import.meta.env.VITE_DISABLE_WEBSOCKET === 'true';

  // Handle real-time data updates from dashboard manager
  const handleRealTimeUpdate = useCallback((update) => {
    switch (update.type) {
      case 'realtime-metrics':
        setRealTimeData(prevData => ({
          ...prevData,
          ...update.data,
          timestamp: update.data.timestamp || Date.now()
        }));
        break;
        
      case 'order-update':
        setRealTimeData(prevData => ({
          ...prevData,
          orderUpdate: update.data,
          lastOrderUpdate: Date.now()
        }));
        break;
        
      case 'revenue-update':
        setRealTimeData(prevData => ({
          ...prevData,
          revenue: update.data.revenue,
          revenueUpdate: Date.now()
        }));
        break;
        
      case 'active-users':
        setRealTimeData(prevData => ({
          ...prevData,
          activeUsersOnline: update.data.count || update.data.activeUsersOnline,
          activeUsersUpdate: Date.now()
        }));
        break;
        
      case 'notification':
        // Handle notifications separately if needed
        console.log('Received notification:', update.data);
        break;
        
      default:
        // Handle generic updates
        setRealTimeData(prevData => ({
          ...prevData,
          ...update.data
        }));
    }
  }, []);

  const connect = useCallback(() => {
    if (isWebSocketDisabled) {
      console.log('🚫 WebSocket disabled via VITE_DISABLE_WEBSOCKET - dashboard works in offline mode');
      setConnected(false);
      setError(null);
      return;
    }

    try {
      // Check current connection status
      const status = dashboardManager.getConnectionStatus();
      if (status.isConnected) {
        setConnected(true);
        setError(null);
        return;
      }

      // Add listener for real-time updates
      listenerRef.current = handleRealTimeUpdate;
      dashboardManager.addListener(listenerRef.current);

      // Connect to dashboard WebSocket
      dashboardManager.connectDashboardWebSocket();
      
      // Start ping interval to keep connection alive
      pingInterval.current = dashboardManager.startPingInterval();

      // Check connection status periodically
      const statusCheckInterval = setInterval(() => {
        const currentStatus = dashboardManager.getConnectionStatus();
        setConnected(currentStatus.isConnected);
        
        if (currentStatus.isConnected) {
          setError(null);
        } else if (!isWebSocketDisabled) {
          setError('WebSocket disconnected - trying to reconnect...');
        }
      }, 5000);

      // Store interval ref for cleanup
      reconnectTimer.current = statusCheckInterval;

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setConnected(false);
      setError('Failed to connect to real-time analytics');
    }
  }, [handleRealTimeUpdate, isWebSocketDisabled]);

  const disconnect = useCallback(() => {
    if (listenerRef.current) {
      dashboardManager.removeListener(listenerRef.current);
      listenerRef.current = null;
    }

    if (reconnectTimer.current) {
      clearInterval(reconnectTimer.current);
      reconnectTimer.current = null;
    }

    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }

    setConnected(false);
    setRealTimeData(null);
    setError(null);
  }, []);

  const sendMessage = useCallback((message) => {
    if (dashboardManager.isConnected()) {
      try {
        dashboardManager.dashboardSocket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        setError('Failed to send message');
      }
    } else {
      console.warn('WebSocket not connected - cannot send message');
      setError('WebSocket not connected');
    }
  }, []);

  useEffect(() => {
    if (!isWebSocketDisabled) {
      console.log('🚀 Initializing WebSocket Analytics (real-time features enabled)');
      connect();
    } else {
      console.log('ℹ️ WebSocket disabled - dashboard runs in HTTP-only mode (all features available)');
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, isWebSocketDisabled]);

  return {
    connected,
    realTimeData,
    error,
    connect,
    disconnect,
    sendMessage,
    isWebSocketDisabled,
    dashboardManager // Expose dashboard manager for advanced usage
  };
};

/**
 * Alternative hook using the old WebSocket implementation
 * Kept for backward compatibility
 */
export const useWebSocketAnalytics = (url = 'ws://localhost:8081/ws-analytics') => {
  const [connected, setConnected] = useState(false);
  const [realTimeData, setRealTimeData] = useState(null);
  const [error, setError] = useState(null);
  
  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const isWebSocketSupported = useRef(true);
  const connectRef = useRef(null);
  
  // Check if WebSocket is disabled via environment variable
  const isWebSocketDisabled = import.meta.env.VITE_DISABLE_WEBSOCKET === 'true';

  // WebSocket endpoints as specified in WEBSOCKET-CONFIG.md
  const fallbackUrls = [
    'ws://localhost:8081/ws-analytics', // Primary endpoint
    'ws://localhost:8081/ws',           // Fallback endpoint  
    'ws://localhost:8080/ws-analytics', // Alternative port
    'ws://localhost:8080/ws'            // Alternative port fallback
  ];

  const handleConnectionFailure = useCallback((urlIndex) => {
    reconnectAttempts.current++;
    
    // Try next URL if available
    if (urlIndex < fallbackUrls.length - 1) {
      setTimeout(() => {
        // Use a ref to avoid dependency cycle
        if (connectRef.current) {
          connectRef.current(urlIndex + 1);
        }
      }, 1000);
    } else if (reconnectAttempts.current >= maxReconnectAttempts) {
      // After all attempts failed, disable WebSocket gracefully
      console.log('ℹ️ All WebSocket endpoints tried - switching to HTTP-only mode (dashboard still fully functional)');
      isWebSocketSupported.current = false;
      setConnected(false);
      setError('Real-time updates unavailable - all features work via HTTP API');
    }
  }, []);

  const connect = useCallback((urlIndex = 0) => {
    // Skip WebSocket connection if disabled via environment variable
    if (isWebSocketDisabled) {
      console.log('🚫 WebSocket disabled via VITE_DISABLE_WEBSOCKET - dashboard works in offline mode');
      setConnected(false);
      setError(null); // Don't show error when intentionally disabled
      return;
    }
    
    // Skip WebSocket connection if not supported or after multiple failures
    if (!isWebSocketSupported.current || reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('⚠️ WebSocket not available - running in offline mode (all features still work via HTTP API)');
      setConnected(false);
      setError('Real-time updates disabled - using HTTP API mode');
      return;
    }

    try {
      // Clean up existing connection
      if (ws.current) {
        ws.current.close();
      }

      const currentUrl = fallbackUrls[urlIndex] || url;
      console.log(`🔌 Attempting WebSocket connection to: ${currentUrl}`);
      
      const socket = new WebSocket(currentUrl);
      
      // Set a connection timeout (optimized for fast fallback)
      const connectionTimeout = setTimeout(() => {
        if (socket.readyState === WebSocket.CONNECTING) {
          console.log('⏰ WebSocket connection timeout - trying next endpoint');
          socket.close();
          handleConnectionFailure(urlIndex);
        }
      }, 3000); // 3 seconds for fast fallback as per guidelines
      
      socket.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('✅ WebSocket Analytics connected successfully to:', currentUrl);
        setConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        
        // Subscribe to topics as specified in WEBSOCKET-CONFIG.md
        const subscriptions = {
          action: 'subscribe',
          topics: [
            '/topic/realtime-metrics',  // Real-time metrics updates
            '/topic/order-updates',     // Live order notifications  
            '/topic/revenue-updates',   // Revenue updates
            '/topic/active-users'       // Active user count
          ]
        };
        
        console.log('📡 Subscribing to WebSocket topics:', subscriptions.topics);
        socket.send(JSON.stringify(subscriptions));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different types of real-time updates based on backend guides
          switch (data.type || data.topic) {
            case 'realtime-metrics':
            case '/topic/realtime-metrics':
              setRealTimeData(prevData => ({
                ...prevData,
                ...data.data,
                timestamp: data.timestamp || Date.now()
              }));
              break;
              
            case 'order-updates':
            case '/topic/order-updates':
              setRealTimeData(prevData => ({
                ...prevData,
                orderUpdate: data.data,
                lastOrderUpdate: data.timestamp || Date.now()
              }));
              break;
              
            case 'revenue-updates':
            case '/topic/revenue-updates':
              setRealTimeData(prevData => ({
                ...prevData,
                revenue: data.data?.revenue || data.revenue,
                revenueUpdate: data.timestamp || Date.now()
              }));
              break;
              
            case 'active-users':
            case '/topic/active-users':
              setRealTimeData(prevData => ({
                ...prevData,
                activeUsersOnline: data.data?.count || data.count,
                activeUsersUpdate: data.timestamp || Date.now()
              }));
              break;
              
            default:
              // Handle generic real-time data (for DASHBOARD-GUIDE.md format)
              if (data.activeUsers !== undefined) {
                setRealTimeData(prevData => ({
                  ...prevData,
                  activeUsersOnline: data.activeUsers,
                  todayRevenue: data.todayRevenue,
                  todayOrders: data.todayOrders,
                  conversionRate: data.conversionRate,
                  topSellingProduct: data.topSellingProduct,
                  timestamp: data.timestamp || Date.now()
                }));
              } else {
                setRealTimeData(prevData => ({
                  ...prevData,
                  ...data
                }));
              }
          }
          
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
          setError('Error parsing real-time data');
        }
      };
      
      socket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket Analytics disconnected:', event.code, event.reason);
        setConnected(false);
        
        // Don't attempt to reconnect if WebSocket is not supported
        if (!isWebSocketSupported.current) {
          return;
        }
        
        // Attempt to reconnect if not closed intentionally
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          handleConnectionFailure(urlIndex);
        }
      };
      
      socket.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket Analytics error:', error);
        setConnected(false);
        
        // Handle connection failure
        handleConnectionFailure(urlIndex);
      };
      
      ws.current = socket;
      
    } catch (connectionError) {
      console.error('Error creating WebSocket connection:', connectionError);
      setConnected(false);
      
      // Handle connection failure
      handleConnectionFailure(urlIndex);
    }
  }, [handleConnectionFailure, url]);

  // Store connect function in ref to break circular dependency
  connectRef.current = connect;

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, 'User disconnected');
      ws.current = null;
    }
    
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    
    setConnected(false);
    setRealTimeData(null);
    setError(null);
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        setError('Failed to send message');
      }
    } else {
      console.warn('WebSocket not connected - cannot send message');
      setError('WebSocket not connected');
    }
  }, []);

  useEffect(() => {
    if (!isWebSocketDisabled) {
      console.log('🚀 Initializing WebSocket Analytics (real-time features enabled)');
      connect();
    } else {
      console.log('ℹ️ WebSocket disabled - dashboard runs in HTTP-only mode (all features available)');
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, isWebSocketDisabled]);

  // Ping mechanism to keep connection alive
  useEffect(() => {
    if (connected) {
      const pingInterval = setInterval(() => {
        sendMessage({ action: 'ping', timestamp: Date.now() });
      }, 30000); // Ping every 30 seconds
      
      return () => clearInterval(pingInterval);
    }
  }, [connected, sendMessage]);

  return {
    connected,
    realTimeData,
    error,
    connect,
    disconnect,
    sendMessage
  };
};

// Export both hooks for flexibility
export default useWebSocketDashboard;
