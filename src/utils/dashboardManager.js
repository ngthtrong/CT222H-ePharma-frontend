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

  // WebSocket Connections
  connectDashboardWebSocket() {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    
    try {
      // Try different WebSocket endpoints
      const wsEndpoints = [
        `${this.wsURL}/dashboard`,
        `${this.wsURL.replace('8080', '8081')}/dashboard`,
        `${this.wsURL}/analytics`,
        `${this.wsURL.replace('8080', '8081')}/analytics`
      ];

      this.tryWebSocketConnection(wsEndpoints, 0);
    } catch (error) {
      console.error('Error initializing WebSocket connection:', error);
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
    console.log(`Trying WebSocket connection to: ${wsUrl}`);

    try {
      this.dashboardSocket = new WebSocket(wsUrl);
      
      const connectionTimeout = setTimeout(() => {
        if (this.dashboardSocket.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket connection timeout - trying next endpoint');
          this.dashboardSocket.close();
          this.tryWebSocketConnection(endpoints, index + 1);
        }
      }, 3000);

      this.dashboardSocket.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('Dashboard WebSocket connected successfully');
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
        console.log('Dashboard WebSocket disconnected');
        this.isConnecting = false;
        
        // Try to reconnect if not closed intentionally
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else if (index < endpoints.length - 1) {
          // Try next endpoint
          setTimeout(() => {
            this.tryWebSocketConnection(endpoints, index + 1);
          }, 1000);
        }
      };

      this.dashboardSocket.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('Dashboard WebSocket error:', error);
        this.isConnecting = false;
        
        // Try next endpoint
        setTimeout(() => {
          this.tryWebSocketConnection(endpoints, index + 1);
        }, 1000);
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setTimeout(() => {
        this.tryWebSocketConnection(endpoints, index + 1);
      }, 1000);
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
        console.error('No access token available for WebSocket connection');
        return;
      }

      this.notificationSocket = new WebSocket(`${this.wsURL}/notifications?token=${token}`);
      
      this.notificationSocket.onopen = () => {
        console.log('Notification WebSocket connected');
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
        console.log('Notification WebSocket disconnected');
        setTimeout(() => this.connectNotificationWebSocket(), this.reconnectDelay);
      };

      this.notificationSocket.onerror = (error) => {
        console.error('Notification WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error creating notification WebSocket:', error);
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
      console.log('Current token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const stats = await this.getDashboardStats();
      console.log('Dashboard stats test successful:', stats);
      return true;
    } catch (error) {
      console.error('Dashboard connection test failed:', error);
      return false;
    }
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

export default dashboardManager;
