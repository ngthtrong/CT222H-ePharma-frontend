# Hướng Dẫn Sử Dụng WebSocket & Dashboard API cho Frontend

## Tổng Quan

Hướng dẫn này cung cấp thông tin đầy đủ về tính năng WebSocket và Dashboard Analytics cho hệ thống e-commerce. Hệ thống hỗ trợ:

- **Dashboard Analytics**: Thống kê tổng quan, báo cáo chi tiết, metrics real-time
- **WebSocket**: Real-time notifications và live data updates
- **Advanced Analytics**: Phân tích sâu về doanh thu, sản phẩm, khách hàng

## Base URL

```
HTTP API: http://localhost:8080/api/v1
WebSocket: ws://localhost:8080/ws
```

## Authentication & Authorization

### Admin Authentication (Required cho tất cả Dashboard APIs)
```javascript
const headers = {
    'Authorization': 'Bearer <ADMIN_JWT_TOKEN>',
    'Content-Type': 'application/json'
};
```

---

## DASHBOARD API ENDPOINTS

### 1. Dashboard Tổng Quan

**GET** `/admin/dashboard/stats`

**Mô tả**: Lấy thống kê tổng quan cơ bản của hệ thống

```javascript
async function getDashboardStats() {
    const response = await fetch('/api/v1/admin/dashboard/stats', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // DashboardStatsResponse
}
```

**Response Example**:
```json
{
    "success": true,
    "message": "Lấy thống kê dashboard thành công",
    "data": {
        "totalOrders": 1250,
        "pendingOrders": 85,
        "totalProducts": 320,
        "totalUsers": 450,
        "totalRevenue": 156780000.0,
        "todayRevenue": 2500000.0,
        "monthlyRevenue": 45600000.0,
        "lastUpdated": "2025-01-31T10:30:00Z"
    }
}
```

### 2. Đơn Hàng Gần Đây

**GET** `/admin/dashboard/recent-orders`

**Query Parameters**:
- `limit` (optional): Số lượng đơn hàng muốn lấy (default: 10)

```javascript
async function getRecentOrders(limit = 10) {
    const response = await fetch(`/api/v1/admin/dashboard/recent-orders?limit=${limit}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of RecentOrderResponse
}
```

**Response Format**:
```json
{
    "success": true,
    "message": "Lấy danh sách đơn hàng gần đây thành công",
    "data": [
        {
            "orderId": "order_123",
            "orderCode": "ORD-20250131-001",
            "customerName": "Nguyễn Văn A",
            "totalAmount": 1250000.0,
            "status": "COMPLETED",
            "createdAt": "2025-01-31T09:30:00Z"
        }
    ]
}
```

### 3. Top Sản Phẩm Bán Chạy

**GET** `/admin/dashboard/top-products`

**Query Parameters**:
- `limit` (optional): Số lượng sản phẩm muốn lấy (default: 10)

```javascript
async function getTopSellingProducts(limit = 10) {
    const response = await fetch(`/api/v1/admin/dashboard/top-products?limit=${limit}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of TopProductResponse
}
```

**Response Format**:
```json
{
    "success": true,
    "data": [
        {
            "productId": "prod_001",
            "productName": "Vitamin C 1000mg",
            "productImage": "https://example.com/vitamin-c.jpg",
            "quantitySold": 125,
            "revenue": 6250000.0,
            "categoryName": "Thực phẩm chức năng"
        }
    ]
}
```

---

## ADVANCED ANALYTICS ENDPOINTS

### 4. Advanced Dashboard Metrics

**GET** `/admin/analytics/dashboard`

**Query Parameters**:
- `startDate` (required): Ngày bắt đầu (yyyy-MM-dd)
- `endDate` (required): Ngày kết thúc (yyyy-MM-dd)

**Mô tả**: Lấy thông tin phân tích nâng cao với nhiều metrics chi tiết

```javascript
async function getAdvancedDashboardMetrics(startDate, endDate) {
    const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate
    });

    const response = await fetch(`/api/v1/admin/analytics/dashboard?${params}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // AdvancedDashboardMetrics
}
```

**Response Format**:
```json
{
    "success": true,
    "data": {
        "totalRevenue": 45600000.0,
        "totalOrders": 320,
        "averageOrderValue": 142500.0,
        "revenueGrowthRate": 15.5,
        "conversionRate": 3.2,
        "activeCustomers": 89,
        "topCategories": [
            {
                "categoryName": "Thực phẩm chức năng",
                "totalSold": 450,
                "revenue": 18500000.0
            }
        ],
        "dailyRevenue": [
            {
                "date": "2025-01-01",
                "revenue": 1200000.0
            }
        ],
        "customerSegments": {
            "highValueCustomers": 12,
            "mediumValueCustomers": 28,
            "lowValueCustomers": 49
        },
        "inventoryTurnover": 4.2,
        "generatedAt": "2025-01-31T10:30:00Z"
    }
}
```

### 5. Real-time Metrics

**GET** `/admin/analytics/realtime`

**Mô tả**: Lấy các metrics real-time cho 24 giờ gần đây

```javascript
async function getRealTimeMetrics() {
    const response = await fetch('/api/v1/admin/analytics/realtime', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // RealTimeMetrics
}
```

**Response Format**:
```json
{
    "success": true,
    "data": {
        "ordersLast24h": 42,
        "revenueLast24h": 5250000.0,
        "hourlyOrders": [
            {
                "hour": "00:00",
                "orderCount": 2
            },
            {
                "hour": "01:00", 
                "orderCount": 1
            }
        ],
        "peakHour": "14:00",
        "activeUsersOnline": 25,
        "timestamp": "2025-01-31T10:30:00Z"
    }
}
```

---

## WEBSOCKET IMPLEMENTATION

### WebSocket Configuration

Dự án đã có dependency WebSocket trong `pom.xml`, nhưng cần implement các component sau:

#### 1. WebSocket Configuration Class

```java
// src/main/java/ct222h/vegeta/projectbackend/config/WebSocketConfig.java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Autowired
    private DashboardWebSocketHandler dashboardHandler;
    
    @Autowired
    private NotificationWebSocketHandler notificationHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(dashboardHandler, "/ws/dashboard")
                .setAllowedOrigins("*")
                .withSockJS();
                
        registry.addHandler(notificationHandler, "/ws/notifications")
                .setAllowedOrigins("*")
                .withSockJS();
    }
}
```

#### 2. Dashboard WebSocket Handler

```java
// src/main/java/ct222h/vegeta/projectbackend/websocket/DashboardWebSocketHandler.java
@Component
public class DashboardWebSocketHandler extends TextWebSocketHandler {
    
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    private final AdvancedAnalyticsService analyticsService;
    
    public DashboardWebSocketHandler(AdvancedAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        // Send initial data
        sendRealTimeMetrics(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    @Scheduled(fixedRate = 30000) // Update every 30 seconds
    public void broadcastRealTimeMetrics() {
        try {
            DashboardResponse.RealTimeMetrics metrics = analyticsService.getRealTimeMetrics();
            String message = objectMapper.writeValueAsString(metrics);
            
            sessions.removeIf(session -> {
                try {
                    session.sendMessage(new TextMessage(message));
                    return false;
                } catch (Exception e) {
                    return true; // Remove closed sessions
                }
            });
        } catch (Exception e) {
            log.error("Error broadcasting real-time metrics", e);
        }
    }
    
    private void sendRealTimeMetrics(WebSocketSession session) {
        try {
            DashboardResponse.RealTimeMetrics metrics = analyticsService.getRealTimeMetrics();
            String message = objectMapper.writeValueAsString(metrics);
            session.sendMessage(new TextMessage(message));
        } catch (Exception e) {
            log.error("Error sending real-time metrics", e);
        }
    }
}
```

#### 3. Notification WebSocket Handler

```java
// src/main/java/ct222h/vegeta/projectbackend/websocket/NotificationWebSocketHandler.java
@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {
    
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String token = getTokenFromSession(session);
        if (token != null && jwtTokenProvider.validateToken(token)) {
            String userId = jwtTokenProvider.getUserIdFromToken(token);
            userSessions.put(userId, session);
        } else {
            session.close(CloseStatus.POLICY_VIOLATION);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        userSessions.entrySet().removeIf(entry -> entry.getValue().equals(session));
    }

    public void sendNotificationToUser(String userId, Object notification) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String message = objectMapper.writeValueAsString(notification);
                session.sendMessage(new TextMessage(message));
            } catch (Exception e) {
                log.error("Error sending notification to user: " + userId, e);
            }
        }
    }
    
    public void broadcastNotification(Object notification) {
        String message;
        try {
            message = objectMapper.writeValueAsString(notification);
        } catch (Exception e) {
            log.error("Error serializing notification", e);
            return;
        }
        
        userSessions.values().removeIf(session -> {
            try {
                session.sendMessage(new TextMessage(message));
                return false;
            } catch (Exception e) {
                return true; // Remove closed sessions
            }
        });
    }
    
    private String getTokenFromSession(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null && query.contains("token=")) {
            return query.substring(query.indexOf("token=") + 6);
        }
        return null;
    }
}
```

---

## FRONTEND IMPLEMENTATION

### 1. Dashboard Analytics Manager

```javascript
class DashboardManager {
    constructor() {
        this.adminToken = localStorage.getItem('adminToken');
        this.baseURL = '/api/v1';
        this.wsURL = 'ws://localhost:8080/ws';
        this.dashboardSocket = null;
        this.notificationSocket = null;
    }

    // Basic Dashboard APIs
    async getDashboardStats() {
        return await this.makeRequest('/admin/dashboard/stats');
    }

    async getRecentOrders(limit = 10) {
        return await this.makeRequest(`/admin/dashboard/recent-orders?limit=${limit}`);
    }

    async getTopProducts(limit = 10) {
        return await this.makeRequest(`/admin/dashboard/top-products?limit=${limit}`);
    }

    // Advanced Analytics APIs
    async getAdvancedMetrics(startDate, endDate) {
        const params = new URLSearchParams({ startDate, endDate });
        return await this.makeRequest(`/admin/analytics/dashboard?${params}`);
    }

    async getRealTimeMetrics() {
        return await this.makeRequest('/admin/analytics/realtime');
    }

    // WebSocket Connections
    connectDashboardWebSocket() {
        this.dashboardSocket = new WebSocket(`${this.wsURL}/dashboard`);
        
        this.dashboardSocket.onopen = () => {
            console.log('Dashboard WebSocket connected');
        };

        this.dashboardSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateRealTimeMetrics(data);
        };

        this.dashboardSocket.onclose = () => {
            console.log('Dashboard WebSocket disconnected');
            // Reconnect after 5 seconds
            setTimeout(() => this.connectDashboardWebSocket(), 5000);
        };
    }

    connectNotificationWebSocket() {
        this.notificationSocket = new WebSocket(`${this.wsURL}/notifications?token=${this.adminToken}`);
        
        this.notificationSocket.onopen = () => {
            console.log('Notification WebSocket connected');
        };

        this.notificationSocket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            this.showNotification(notification);
        };

        this.notificationSocket.onclose = () => {
            console.log('Notification WebSocket disconnected');
            setTimeout(() => this.connectNotificationWebSocket(), 5000);
        };
    }

    // Helper Methods
    async makeRequest(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${this.adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message);
        }
        
        return data.data;
    }

    updateRealTimeMetrics(metrics) {
        // Update UI với real-time metrics
        document.getElementById('ordersLast24h').textContent = metrics.ordersLast24h;
        document.getElementById('revenueLast24h').textContent = this.formatCurrency(metrics.revenueLast24h);
        document.getElementById('peakHour').textContent = metrics.peakHour;
        document.getElementById('activeUsers').textContent = metrics.activeUsersOnline;
        
        // Update hourly chart
        this.updateHourlyChart(metrics.hourlyOrders);
    }

    showNotification(notification) {
        // Show toast notification
        this.createToast(notification.title, notification.message, notification.type);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    createToast(title, message, type) {
        // Implementation for toast notification
        console.log(`[${type}] ${title}: ${message}`);
    }

    updateHourlyChart(hourlyData) {
        // Update chart với data mới
        if (this.hourlyChart) {
            this.hourlyChart.data.datasets[0].data = hourlyData.map(h => h.orderCount);
            this.hourlyChart.update();
        }
    }

    disconnect() {
        if (this.dashboardSocket) {
            this.dashboardSocket.close();
        }
        if (this.notificationSocket) {
            this.notificationSocket.close();
        }
    }
}
```

### 2. Dashboard Component Implementation

```javascript
class DashboardComponent {
    constructor() {
        this.dashboardManager = new DashboardManager();
        this.charts = {};
        this.refreshInterval = null;
    }

    async init() {
        try {
            // Load initial data
            await this.loadDashboardData();
            
            // Setup WebSocket connections
            this.dashboardManager.connectDashboardWebSocket();
            this.dashboardManager.connectNotificationWebSocket();
            
            // Setup charts
            this.initCharts();
            
            // Setup auto refresh for non-real-time data
            this.setupAutoRefresh();
            
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
        }
    }

    async loadDashboardData() {
        // Load basic stats
        const stats = await this.dashboardManager.getDashboardStats();
        this.updateStatsCards(stats);
        
        // Load recent orders
        const recentOrders = await this.dashboardManager.getRecentOrders(10);
        this.updateRecentOrdersTable(recentOrders);
        
        // Load top products
        const topProducts = await this.dashboardManager.getTopProducts(10);
        this.updateTopProductsChart(topProducts);
        
        // Load advanced metrics for last 30 days
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const advancedMetrics = await this.dashboardManager.getAdvancedMetrics(startDate, endDate);
        this.updateAdvancedMetrics(advancedMetrics);
    }

    updateStatsCards(stats) {
        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('pendingOrders').textContent = stats.pendingOrders;
        document.getElementById('totalProducts').textContent = stats.totalProducts;
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('totalRevenue').textContent = this.formatCurrency(stats.totalRevenue);
        document.getElementById('todayRevenue').textContent = this.formatCurrency(stats.todayRevenue);
        document.getElementById('monthlyRevenue').textContent = this.formatCurrency(stats.monthlyRevenue);
    }

    updateRecentOrdersTable(orders) {
        const tbody = document.getElementById('recentOrdersTable');
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.orderCode}</td>
                <td>${order.customerName}</td>
                <td>${this.formatCurrency(order.totalAmount)}</td>
                <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>${new Date(order.createdAt).toLocaleString('vi-VN')}</td>
            </tr>
        `).join('');
    }

    updateAdvancedMetrics(metrics) {
        // Update metrics display
        document.getElementById('averageOrderValue').textContent = this.formatCurrency(metrics.averageOrderValue);
        document.getElementById('revenueGrowthRate').textContent = `${metrics.revenueGrowthRate.toFixed(1)}%`;
        document.getElementById('conversionRate').textContent = `${metrics.conversionRate.toFixed(1)}%`;
        document.getElementById('activeCustomers').textContent = metrics.activeCustomers;
        
        // Update daily revenue chart
        this.updateDailyRevenueChart(metrics.dailyRevenue);
        
        // Update category performance chart
        this.updateCategoryChart(metrics.topCategories);
        
        // Update customer segments chart
        this.updateCustomerSegmentsChart(metrics.customerSegments);
    }

    initCharts() {
        // Initialize Chart.js charts
        this.charts.dailyRevenue = new Chart(document.getElementById('dailyRevenueChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: [],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });

        this.charts.hourlyOrders = new Chart(document.getElementById('hourlyOrdersChart'), {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
                datasets: [{
                    label: 'Số đơn hàng',
                    data: [],
                    backgroundColor: '#10B981'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        this.charts.topProducts = new Chart(document.getElementById('topProductsChart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Số lượng bán',
                    data: [],
                    backgroundColor: '#8B5CF6'
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });

        this.charts.customerSegments = new Chart(document.getElementById('customerSegmentsChart'), {
            type: 'doughnut',
            data: {
                labels: ['High Value', 'Medium Value', 'Low Value'],
                datasets: [{
                    data: [],
                    backgroundColor: ['#EF4444', '#F59E0B', '#10B981']
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    updateDailyRevenueChart(dailyRevenue) {
        this.charts.dailyRevenue.data.labels = dailyRevenue.map(d => d.date);
        this.charts.dailyRevenue.data.datasets[0].data = dailyRevenue.map(d => d.revenue);
        this.charts.dailyRevenue.update();
    }

    updateTopProductsChart(topProducts) {
        this.charts.topProducts.data.labels = topProducts.slice(0, 10).map(p => p.productName);
        this.charts.topProducts.data.datasets[0].data = topProducts.slice(0, 10).map(p => p.quantitySold);
        this.charts.topProducts.update();
    }

    updateCategoryChart(categories) {
        // Implementation for category performance chart
    }

    updateCustomerSegmentsChart(segments) {
        this.charts.customerSegments.data.datasets[0].data = [
            segments.highValueCustomers,
            segments.mediumValueCustomers,
            segments.lowValueCustomers
        ];
        this.charts.customerSegments.update();
    }

    setupAutoRefresh() {
        // Refresh non-real-time data every 5 minutes
        this.refreshInterval = setInterval(async () => {
            try {
                await this.loadDashboardData();
            } catch (error) {
                console.error('Auto refresh failed:', error);
            }
        }, 5 * 60 * 1000);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.dashboardManager.disconnect();
        
        // Destroy charts
        Object.values(this.charts).forEach(chart => chart.destroy());
    }
}
```

### 3. Usage Example

```javascript
// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', async () => {
    const dashboard = new DashboardComponent();
    await dashboard.init();
    
    // Cleanup when page unloads
    window.addEventListener('beforeunload', () => {
        dashboard.destroy();
    });
});
```

---

## HTML TEMPLATE EXAMPLE

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <div class="container mx-auto px-4 py-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Tổng Đơn Hàng</h3>
                <p class="text-3xl font-bold text-gray-900" id="totalOrders">-</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Đơn Hàng Chờ</h3>
                <p class="text-3xl font-bold text-orange-600" id="pendingOrders">-</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Tổng Sản Phẩm</h3>
                <p class="text-3xl font-bold text-blue-600" id="totalProducts">-</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Tổng Người Dùng</h3>
                <p class="text-3xl font-bold text-green-600" id="totalUsers">-</p>
            </div>
        </div>

        <!-- Revenue Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Tổng Doanh Thu</h3>
                <p class="text-2xl font-bold text-green-600" id="totalRevenue">-</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Doanh Thu Hôm Nay</h3>
                <p class="text-2xl font-bold text-blue-600" id="todayRevenue">-</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Doanh Thu Tháng</h3>
                <p class="text-2xl font-bold text-purple-600" id="monthlyRevenue">-</p>
            </div>
        </div>

        <!-- Real-time Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Đơn Hàng 24h</h3>
                <p class="text-2xl font-bold text-blue-600" id="ordersLast24h">-</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Doanh Thu 24h</h3>
                <p class="text-xl font-bold text-green-600" id="revenueLast24h">-</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">Giờ Cao Điểm</h3>
                <p class="text-2xl font-bold text-orange-600" id="peakHour">-</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-sm font-medium text-gray-500">User Online</h3>
                <p class="text-2xl font-bold text-red-600" id="activeUsers">-</p>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Doanh Thu Theo Ngày</h3>
                <canvas id="dailyRevenueChart"></canvas>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Đơn Hàng Theo Giờ</h3>
                <canvas id="hourlyOrdersChart"></canvas>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Top Sản Phẩm</h3>
                <canvas id="topProductsChart"></canvas>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold mb-4">Phân Khúc Khách Hàng</h3>
                <canvas id="customerSegmentsChart"></canvas>
            </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold">Đơn Hàng Gần Đây</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mã Đơn Hàng
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Khách Hàng
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tổng Tiền
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng Thái
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ngày Tạo
                            </th>
                        </tr>
                    </thead>
                    <tbody id="recentOrdersTable" class="bg-white divide-y divide-gray-200">
                        <!-- Dynamic content -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script src="dashboard.js"></script>
</body>
</html>
```

---

## ERROR HANDLING

### Common Error Responses

```javascript
const DashboardErrorHandler = {
    handleError(error, context = '') {
        console.error(`Dashboard Error [${context}]:`, error);
        
        switch (error.status) {
            case 401:
                // Token expired, redirect to login
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
                break;
                
            case 403:
                this.showError('Bạn không có quyền truy cập tính năng này');
                break;
                
            case 404:
                this.showError('Không tìm thấy dữ liệu');
                break;
                
            case 500:
                this.showError('Lỗi server, vui lòng thử lại sau');
                break;
                
            default:
                this.showError('Có lỗi xảy ra, vui lòng thử lại');
        }
    },
    
    showError(message) {
        // Implementation for showing error to user
        alert(message);
    }
};
```

---

## PERFORMANCE OPTIMIZATION

### 1. Caching Strategy

```javascript
class DashboardCache {
    constructor() {
        this.cache = new Map();
        this.cacheTime = 5 * 60 * 1000; // 5 minutes
    }
    
    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    get(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTime) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }
    
    clear() {
        this.cache.clear();
    }
}
```

### 2. Data Aggregation

```javascript
class DataAggregator {
    static aggregateMetrics(metrics) {
        return {
            summary: {
                totalRevenue: metrics.reduce((sum, m) => sum + m.revenue, 0),
                totalOrders: metrics.reduce((sum, m) => sum + m.orders, 0),
                averageValue: metrics.length > 0 
                    ? metrics.reduce((sum, m) => sum + m.revenue, 0) / metrics.length 
                    : 0
            },
            trends: this.calculateTrends(metrics),
            insights: this.generateInsights(metrics)
        };
    }
    
    static calculateTrends(metrics) {
        // Implementation for trend calculation
        return {
            revenueGrowth: 0,
            orderGrowth: 0,
            customerGrowth: 0
        };
    }
    
    static generateInsights(metrics) {
        // Implementation for generating insights
        return [];
    }
}
```

---

## SECURITY CONSIDERATIONS

### 1. JWT Token Management

```javascript
class TokenManager {
    static getToken() {
        return localStorage.getItem('adminToken');
    }
    
    static setToken(token) {
        localStorage.setItem('adminToken', token);
    }
    
    static removeToken() {
        localStorage.removeItem('adminToken');
    }
    
    static isTokenValid(token) {
        if (!token) return false;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch (e) {
            return false;
        }
    }
    
    static refreshTokenIfNeeded() {
        const token = this.getToken();
        if (!this.isTokenValid(token)) {
            // Redirect to login or refresh token
            window.location.href = '/admin/login';
        }
    }
}
```

### 2. Input Validation

```javascript
class InputValidator {
    static validateDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format');
        }
        
        if (start > end) {
            throw new Error('Start date must be before end date');
        }
        
        if (end > new Date()) {
            throw new Error('End date cannot be in the future');
        }
        
        return true;
    }
    
    static sanitizeInput(input) {
        return input.toString()
            .replace(/[<>]/g, '')
            .trim()
            .substring(0, 1000);
    }
}
```

---

## NOTES

1. **WebSocket Reconnection**: Implement automatic reconnection với exponential backoff
2. **Data Refresh**: Combine WebSocket real-time data với periodic REST API calls
3. **Chart Performance**: Sử dụng chart animations sparingly cho better performance  
4. **Mobile Responsive**: Ensure dashboard works well trên mobile devices
5. **Accessibility**: Add proper ARIA labels và keyboard navigation
6. **Analytics**: Consider adding Google Analytics hoặc custom tracking
7. **Export Features**: Implement export to PDF/Excel functionality
8. **Alerting**: Add threshold-based alerts cho critical metrics
9. **Internationalization**: Support multiple languages nếu cần
10. **Dark Mode**: Consider implementing dark/light theme toggle

Hướng dẫn này cung cấp framework hoàn chỉnh để implement một dashboard analytics mạnh mẽ với WebSocket real-time updates cho ứng dụng e-commerce.
