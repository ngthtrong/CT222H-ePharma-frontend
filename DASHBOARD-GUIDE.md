# Dashboard Guide

## Tổng quan

Dashboard cung cấp các tính năng analytics và báo cáo toàn diện cho hệ thống e-commerce. Bao gồm metrics theo thời gian thực, báo cáo chi tiết, và khả năng xuất Excel.

## 🎯 Các tính năng chính

### 1. Advanced Dashboard Metrics
- **Revenue Growth**: Tăng trưởng doanh thu theo thời gian
- **Conversion Rate**: Tỷ lệ chuyển đổi từ visitor thành customer
- **Customer Segmentation**: Phân khúc khách hàng theo giá trị
- **Category Performance**: Hiệu suất theo danh mục sản phẩm
- **Top Products**: Sản phẩm bán chạy nhất

### 2. Real-time Analytics
- **Live Updates**: Cập nhật metrics theo thời gian thực
- **WebSocket Connection**: Kết nối thời gian thực qua WebSocket
- **Auto Refresh**: Tự động làm mới dữ liệu mỗi 30 giây

### 3. Export Functionality
- **Excel Export**: Xuất báo cáo dưới dạng Excel (.xlsx)
- **Customizable Reports**: Báo cáo có thể tùy chỉnh theo thời gian
- **Professional Formatting**: Định dạng chuyên nghiệp với charts và styling

## 📊 API Endpoints

### Base URL
```
http://localhost:8081/api/reports
```

### 1. Advanced Dashboard Metrics

#### GET `/advanced-dashboard`
Lấy metrics dashboard nâng cao

**Parameters:**
- `startDate` (optional): Ngày bắt đầu (yyyy-MM-dd)
- `endDate` (optional): Ngày kết thúc (yyyy-MM-dd)

**Example Request:**
```bash
GET /api/reports/advanced-dashboard?startDate=2024-01-01&endDate=2024-12-31
```

**Response:**
```json
{
  "totalRevenue": 1250000.0,
  "revenueGrowthRate": 15.5,
  "totalOrders": 450,
  "conversionRate": 12.8,
  "averageOrderValue": 2777.78,
  "customerSegmentation": {
    "vip": 25,
    "regular": 180,
    "new": 95
  },
  "categoryPerformance": [
    {
      "categoryName": "Electronics",
      "revenue": 650000.0,
      "orders": 180,
      "conversionRate": 15.2
    }
  ],
  "topProducts": [
    {
      "productId": "prod123",
      "productName": "iPhone 15 Pro",
      "revenue": 180000.0,
      "quantitySold": 60,
      "conversionRate": 18.5
    }
  ],
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

### 2. Real-time Metrics

#### GET `/real-time-metrics`
Lấy metrics thời gian thực

**Response:**
```json
{
  "timestamp": "2024-12-28T10:30:00",
  "activeUsers": 45,
  "todayRevenue": 25000.0,
  "todayOrders": 12,
  "conversionRate": 8.5,
  "topSellingProduct": {
    "productId": "prod456",
    "productName": "MacBook Pro M3",
    "todaySales": 8
  }
}
```

### 3. Excel Export

#### GET `/export/revenue-excel`
Xuất báo cáo doanh thu dưới dạng Excel

**Parameters:**
- `startDate` (optional): Ngày bắt đầu
- `endDate` (optional): Ngày kết thúc

**Example Request:**
```bash
GET /api/reports/export/revenue-excel?startDate=2024-01-01&endDate=2024-12-31
```

**Response:** File Excel (.xlsx) được tải xuống

#### GET `/export/product-performance-excel`
Xuất báo cáo hiệu suất sản phẩm dưới dạng Excel

**Example Request:**
```bash
GET /api/reports/export/product-performance-excel?startDate=2024-01-01&endDate=2024-12-31
```

## 🔄 WebSocket Real-time Updates

### Connection Setup

#### JavaScript Example:
```javascript
// Kết nối WebSocket
const socket = new SockJS('http://localhost:8081/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
    console.log('Connected: ' + frame);
    
    // Subscribe to real-time analytics
    stompClient.subscribe('/topic/analytics', function (message) {
        const metrics = JSON.parse(message.body);
        updateDashboard(metrics);
    });
});

function updateDashboard(metrics) {
    document.getElementById('activeUsers').textContent = metrics.activeUsers;
    document.getElementById('todayRevenue').textContent = metrics.todayRevenue;
    document.getElementById('todayOrders').textContent = metrics.todayOrders;
    document.getElementById('conversionRate').textContent = metrics.conversionRate + '%';
}
```

## 📈 Frontend Integration

### HTML Dashboard Example:

```html
<!DOCTYPE html>
<html>
<head>
    <title>E-commerce Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .dashboard-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
        }
        
        .metric-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #007bff;
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #007bff;
        }
        
        .metric-label {
            color: #666;
            margin-top: 5px;
        }
        
        .growth-positive {
            color: #28a745;
        }
        
        .growth-negative {
            color: #dc3545;
        }
        
        .export-button {
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px;
        }
        
        .export-button:hover {
            background: #218838;
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <div class="metric-card">
            <div class="metric-value" id="totalRevenue">Loading...</div>
            <div class="metric-label">Total Revenue</div>
            <div id="revenueGrowth" class="growth-positive">+15.5%</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-value" id="totalOrders">Loading...</div>
            <div class="metric-label">Total Orders</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-value" id="conversionRate">Loading...</div>
            <div class="metric-label">Conversion Rate</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-value" id="activeUsers">Loading...</div>
            <div class="metric-label">Active Users (Real-time)</div>
        </div>
        
        <div class="metric-card">
            <div class="metric-value" id="averageOrderValue">Loading...</div>
            <div class="metric-label">Average Order Value</div>
        </div>
        
        <div class="metric-card">
            <canvas id="categoryChart" width="400" height="200"></canvas>
            <div class="metric-label">Category Performance</div>
        </div>
    </div>
    
    <div style="text-align: center; margin: 20px;">
        <button class="export-button" onclick="exportRevenueReport()">
            📊 Export Revenue Report
        </button>
        <button class="export-button" onclick="exportProductReport()">
            📈 Export Product Performance
        </button>
    </div>

    <script>
        let stompClient = null;
        
        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            loadDashboardData();
            connectWebSocket();
        });
        
        // Load initial dashboard data
        async function loadDashboardData() {
            try {
                const response = await fetch('/api/reports/advanced-dashboard');
                const data = await response.json();
                
                document.getElementById('totalRevenue').textContent = 
                    '$' + data.totalRevenue.toLocaleString();
                document.getElementById('totalOrders').textContent = 
                    data.totalOrders.toLocaleString();
                document.getElementById('conversionRate').textContent = 
                    data.conversionRate.toFixed(1) + '%';
                document.getElementById('averageOrderValue').textContent = 
                    '$' + data.averageOrderValue.toFixed(2);
                
                // Update growth indicator
                const growthElement = document.getElementById('revenueGrowth');
                growthElement.textContent = 
                    (data.revenueGrowthRate >= 0 ? '+' : '') + 
                    data.revenueGrowthRate.toFixed(1) + '%';
                growthElement.className = data.revenueGrowthRate >= 0 ? 
                    'growth-positive' : 'growth-negative';
                
                // Create category performance chart
                createCategoryChart(data.categoryPerformance);
                
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }
        
        // WebSocket connection for real-time updates
        function connectWebSocket() {
            const socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);
            
            stompClient.connect({}, function (frame) {
                console.log('Connected to WebSocket: ' + frame);
                
                stompClient.subscribe('/topic/analytics', function (message) {
                    const metrics = JSON.parse(message.body);
                    updateRealTimeMetrics(metrics);
                });
            });
        }
        
        // Update real-time metrics
        function updateRealTimeMetrics(metrics) {
            document.getElementById('activeUsers').textContent = metrics.activeUsers;
            
            // Add pulsing animation for real-time data
            const activeUsersElement = document.getElementById('activeUsers');
            activeUsersElement.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                activeUsersElement.style.animation = '';
            }, 500);
        }
        
        // Create category performance chart
        function createCategoryChart(categoryData) {
            const ctx = document.getElementById('categoryChart').getContext('2d');
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: categoryData.map(cat => cat.categoryName),
                    datasets: [{
                        data: categoryData.map(cat => cat.revenue),
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    legend: {
                        position: 'bottom'
                    }
                }
            });
        }
        
        // Export functions
        function exportRevenueReport() {
            window.open('/api/reports/export/revenue-excel', '_blank');
        }
        
        function exportProductReport() {
            window.open('/api/reports/export/product-performance-excel', '_blank');
        }
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    </script>
</body>
</html>
```

## 🔧 Configuration

### Application Properties
```properties
# WebSocket Configuration
spring.websocket.allowed-origins=*
spring.websocket.sockjs.enabled=true

# Analytics Configuration
analytics.realtime.broadcast-interval=30000
analytics.realtime.cleanup-interval=300000

# Export Configuration
export.excel.temp-directory=temp/exports
export.excel.max-file-size=10MB
```

## 📊 Metrics Explained

### Revenue Growth Rate
Tính theo công thức:
```
Growth Rate = ((Current Period Revenue - Previous Period Revenue) / Previous Period Revenue) × 100
```

### Conversion Rate
Tính theo công thức:
```
Conversion Rate = (Number of Orders / Number of Unique Visitors) × 100
```

### Customer Segmentation
- **VIP**: Khách hàng có tổng giá trị đơn hàng > 1,000,000 VND
- **Regular**: Khách hàng có tổng giá trị đơn hàng từ 100,000 - 1,000,000 VND
- **New**: Khách hàng mới hoặc có tổng giá trị đơn hàng < 100,000 VND

## 🚀 Testing

### Using Postman

1. **Import Collection**: Import file `postman-api-testing.json`

2. **Test Basic Dashboard**:
   ```
   GET {{baseUrl}}/api/reports/advanced-dashboard
   ```

3. **Test with Date Range**:
   ```
   GET {{baseUrl}}/api/reports/advanced-dashboard?startDate=2024-01-01&endDate=2024-12-31
   ```

4. **Test Excel Export**:
   ```
   GET {{baseUrl}}/api/reports/export/revenue-excel
   ```

### Using cURL

```bash
# Get advanced dashboard metrics
curl -X GET "http://localhost:8081/api/reports/advanced-dashboard" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Export revenue report
curl -X GET "http://localhost:8081/api/reports/export/revenue-excel?startDate=2024-01-01&endDate=2024-12-31" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -o revenue_report.xlsx
```

## 🛠️ Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Kiểm tra CORS configuration
   - Đảm bảo SockJS enabled
   - Verify WebSocket endpoint `/ws`

2. **Excel Export Error**
   - Kiểm tra Apache POI dependencies
   - Verify temp directory permissions
   - Check memory usage for large exports

3. **Performance Issues**
   - Enable database indexing cho date fields
   - Optimize queries với pagination
   - Consider caching for frequently accessed data

### Performance Optimization

1. **Database Indexes**:
   ```javascript
   // MongoDB indexes for better performance
   db.orders.createIndex({ "createdAt": 1 })
   db.orders.createIndex({ "status": 1, "createdAt": 1 })
   db.products.createIndex({ "category": 1, "createdAt": 1 })
   ```

2. **Caching Strategy**:
   - Cache dashboard metrics for 5 minutes
   - Cache category performance for 15 minutes
   - Use Redis for session-based caching

3. **Pagination**:
   - Limit top products to 10 items
   - Paginate large datasets
   - Use cursor-based pagination for real-time data

## 📚 References

- [Spring WebSocket Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#websocket)
- [Apache POI Documentation](https://poi.apache.org/components/spreadsheet/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [SockJS Documentation](https://github.com/sockjs/sockjs-client)

## 🔄 Version History

- **v1.0**: Initial dashboard implementation
- **v1.1**: Added real-time WebSocket analytics
- **v1.2**: Enhanced Excel export with charts
- **v1.3**: Added customer segmentation and category performance

---

**Last Updated**: December 28, 2024  
**Author**: Development Team  
**Version**: 1.3
