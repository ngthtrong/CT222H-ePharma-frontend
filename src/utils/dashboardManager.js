/**
 * Dashboard Manager
 * Manages WebSocket connections and API calls for dashboard analytics
 * Based on WEBSOCKET-DASHBOARD-API-GUIDE.md
 */

import api from '../api/config.js';
import { getAccessToken } from './localStorage.js';

class DashboardManager {
  constructor() {
    this.baseURL = '/api/v1';
    this.wsURL = 'ws://localhost:8080/ws';
    this.dashboardSocket = null;
    this.notificationSocket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 5000;
    this.isConnecting = false;
    this.listeners = new Set();
  }

  // Get current access token with proper cleaning
  getToken() {
    const token = getAccessToken();
    if (!token) return null;
    
    // Clean token - loại bỏ dấu ngoặc kép thừa nếu có (giống như trong config.js)
    return token.replace(/^["']|["']$/g, '');
  }

  // Add event listener for real-time updates
  addListener(callback) {
    this.listeners.add(callback);
  }

  // Remove event listener
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners of updates
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in dashboard listener:', error);
      }
    });
  }

  // Basic Dashboard APIs using the configured axios instance
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getRecentOrders(limit = 10) {
    try {
      const response = await api.get(`/admin/dashboard/recent-orders?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting recent orders:', error);
      throw error;
    }
  }

  async getTopProducts(limit = 10) {
    try {
      const response = await api.get(`/admin/dashboard/top-products?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting top products:', error);
      throw error;
    }
  }

  // Advanced Analytics APIs
  async getAdvancedMetrics(startDate, endDate) {
    try {
      const response = await api.get('/admin/analytics/dashboard', {
        params: { startDate, endDate }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting advanced metrics:', error);
      throw error;
    }
  }

  async getRealTimeMetrics() {
    try {
      const response = await api.get('/admin/analytics/realtime');
      return response.data.data;
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      throw error;
    }
  }

  // WebSocket Connections - với fallback graceful
  connectDashboardWebSocket() {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    
    // Kiểm tra token trước khi kết nối WebSocket
    const token = this.getToken();
    if (!token) {
      console.warn('No token available for WebSocket connection - skipping WebSocket, using HTTP-only mode');
      this.isConnecting = false;
      return;
    }
    
    try {
      // Simplified WebSocket endpoints - chỉ thử những endpoint có khả năng hoạt động
      const wsEndpoints = [
        `ws://localhost:8081/ws/dashboard`,
        `ws://localhost:8080/ws/dashboard`
      ];

      this.tryWebSocketConnection(wsEndpoints, 0);
    } catch (error) {
      console.warn('Error initializing WebSocket connection, continuing with HTTP-only mode:', error);
      this.isConnecting = false;
    }
  }

  tryWebSocketConnection(endpoints, index) {
    if (index >= endpoints.length) {
      console.log('All WebSocket endpoints failed - continuing with HTTP-only mode');
      this.isConnecting = false;
      return;
    }

    const endpoint = endpoints[index];
    const token = this.getToken();
    
    // Add token to WebSocket URL if available
    const wsUrl = token ? `${endpoint}?token=${token}` : endpoint;
    console.log(`Trying WebSocket connection to: ${endpoint}`); // Don't log full URL with token

    try {
      this.dashboardSocket = new WebSocket(wsUrl);
      
      // Shorter timeout để không chờ quá lâu
      const connectionTimeout = setTimeout(() => {
        if (this.dashboardSocket.readyState === WebSocket.CONNECTING) {
          console.log(`WebSocket connection timeout for ${endpoint} - trying next endpoint`);
          this.dashboardSocket.close();
          this.tryWebSocketConnection(endpoints, index + 1);
        }
      }, 2000); // Giảm từ 3s xuống 2s

      this.dashboardSocket.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('✅ Dashboard WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Subscribe to real-time updates
        this.subscribeToTopics();
      };

      this.dashboardSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleRealTimeUpdate(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.dashboardSocket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(`Dashboard WebSocket disconnected (code: ${event.code})`);
        this.isConnecting = false;
        
        // Chỉ thử reconnect nếu không phải lỗi endpoint
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts && index === 0) {
          this.scheduleReconnect();
        } else if (index < endpoints.length - 1) {
          // Try next endpoint immediately
          this.tryWebSocketConnection(endpoints, index + 1);
        } else {
          console.log('🔄 WebSocket unavailable - dashboard will use HTTP polling mode');
        }
      };

      this.dashboardSocket.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.warn(`WebSocket connection failed for ${endpoint}, trying next...`);
        this.isConnecting = false;
        
        // Try next endpoint immediately
        this.tryWebSocketConnection(endpoints, index + 1);
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      // Try next endpoint
      this.tryWebSocketConnection(endpoints, index + 1);
    }
  }

  subscribeToTopics() {
    if (this.dashboardSocket && this.dashboardSocket.readyState === WebSocket.OPEN) {
      const subscriptions = {
        action: 'subscribe',
        topics: [
          '/topic/realtime-metrics',
          '/topic/order-updates',
          '/topic/revenue-updates',
          '/topic/active-users'
        ]
      };
      
      this.dashboardSocket.send(JSON.stringify(subscriptions));
    }
  }

  connectNotificationWebSocket() {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No access token available for notification WebSocket - notifications will use HTTP polling');
        return;
      }

      // Thử kết nối notification WebSocket
      const wsUrl = `ws://localhost:8081/ws/notifications?token=${token}`;
      console.log('Trying notification WebSocket connection...');
      
      this.notificationSocket = new WebSocket(wsUrl);
      
      // Timeout cho notification WebSocket
      const notificationTimeout = setTimeout(() => {
        if (this.notificationSocket.readyState === WebSocket.CONNECTING) {
          console.log('Notification WebSocket timeout - using HTTP polling instead');
          this.notificationSocket.close();
        }
      }, 3000);

      this.notificationSocket.onopen = () => {
        clearTimeout(notificationTimeout);
        console.log('✅ Notification WebSocket connected');
      };

      this.notificationSocket.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          this.handleNotification(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      this.notificationSocket.onclose = () => {
        clearTimeout(notificationTimeout);
        console.log('📱 Notification WebSocket disconnected - notifications will use HTTP polling');
        // Không tự động reconnect notification WebSocket để tránh spam logs
      };

      this.notificationSocket.onerror = (error) => {
        clearTimeout(notificationTimeout);
        console.warn('Notification WebSocket failed - notifications will use HTTP polling');
      };

    } catch (error) {
      console.warn('Error creating notification WebSocket - notifications will use HTTP polling:', error);
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connectDashboardWebSocket();
      }
    }, delay);
  }

  handleRealTimeUpdate(data) {
    // Handle different types of real-time updates
    switch (data.type || data.topic) {
      case 'realtime-metrics':
      case '/topic/realtime-metrics':
        this.notifyListeners({
          type: 'realtime-metrics',
          data: data.data || data
        });
        break;
        
      case 'order-updates':
      case '/topic/order-updates':
        this.notifyListeners({
          type: 'order-update',
          data: data.data || data
        });
        break;
        
      case 'revenue-updates':
      case '/topic/revenue-updates':
        this.notifyListeners({
          type: 'revenue-update',
          data: data.data || data
        });
        break;
        
      case 'active-users':
      case '/topic/active-users':
        this.notifyListeners({
          type: 'active-users',
          data: data.data || data
        });
        break;
        
      default:
        // Handle generic updates
        this.notifyListeners({
          type: 'generic-update',
          data: data
        });
    }
  }

  handleNotification(notification) {
    this.notifyListeners({
      type: 'notification',
      data: notification
    });
  }

  // Utility methods for testing
  async testConnection() {
    try {
      const token = this.getToken();
      console.log('🔍 Testing dashboard connection...');
      console.log('Current token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const stats = await this.getDashboardStats();
      console.log('✅ Dashboard HTTP API test successful:', stats);
      return true;
    } catch (error) {
      console.error('❌ Dashboard connection test failed:', error);
      return false;
    }
  }

  // Disable WebSocket và chỉ dùng HTTP
  disableWebSocket() {
    console.log('🔄 Disabling WebSocket - switching to HTTP-only mode');
    this.disconnect();
    this.maxReconnectAttempts = 0; // Prevent reconnection attempts
  }

  // Enable lại WebSocket
  enableWebSocket() {
    console.log('🔄 Enabling WebSocket');
    this.maxReconnectAttempts = 3;
    this.connectDashboardWebSocket();
  }

  // Kiểm tra và khởi động với HTTP-first approach
  async initialize() {
    console.log('🚀 Initializing Dashboard Manager...');
    
    // Test HTTP connection first
    const httpWorks = await this.testConnection();
    
    if (!httpWorks) {
      console.error('❌ HTTP API failed - dashboard may not work properly');
      return false;
    }
    
    // Nếu HTTP works, thử WebSocket (optional)
    console.log('✅ HTTP API working - attempting WebSocket connection...');
    this.connectDashboardWebSocket();
    
    return true;
  }

  // Format utilities
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatNumber(number) {
    return new Intl.NumberFormat('vi-VN').format(number);
  }

  formatDate(date) {
    return new Date(date).toLocaleString('vi-VN');
  }

  // Send ping to keep connection alive
  pingWebSocket() {
    if (this.dashboardSocket && this.dashboardSocket.readyState === WebSocket.OPEN) {
      this.dashboardSocket.send(JSON.stringify({
        action: 'ping',
        timestamp: Date.now()
      }));
    }
  }

  // Start ping interval
  startPingInterval() {
    return setInterval(() => {
      this.pingWebSocket();
    }, 30000); // Ping every 30 seconds
  }

  // Disconnect all WebSocket connections
  disconnect() {
    if (this.dashboardSocket) {
      this.dashboardSocket.close(1000, 'Intentional disconnect');
      this.dashboardSocket = null;
    }
    
    if (this.notificationSocket) {
      this.notificationSocket.close(1000, 'Intentional disconnect');
      this.notificationSocket = null;
    }
    
    this.listeners.clear();
  }

  // Check if WebSocket is connected
  isConnected() {
    return this.dashboardSocket && this.dashboardSocket.readyState === WebSocket.OPEN;
  }

  // Get connection status
  getConnectionStatus() {
    return {
      dashboard: this.dashboardSocket ? this.dashboardSocket.readyState : WebSocket.CLOSED,
      notification: this.notificationSocket ? this.notificationSocket.readyState : WebSocket.CLOSED,
      isConnected: this.isConnected(),
      hasToken: !!this.getToken()
    };
  }
}

// Create singleton instance
const dashboardManager = new DashboardManager();

// Auto-initialize khi có token (sẽ được gọi từ dashboard component)
// dashboardManager.initialize();

export default dashboardManager;
