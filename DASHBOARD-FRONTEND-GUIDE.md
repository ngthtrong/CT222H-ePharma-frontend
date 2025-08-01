# Dashboard API Guide for Frontend Team

## 📋 Overview
Dashboard API đã được **hoàn toàn cập nhật** sau khi loại bỏ WebSocket. Frontend giờ sử dụng REST endpoints với manual refresh pattern để lấy dữ liệu dashboard.

## 🔧 Technical Information
- **Base URL**: `http://localhost:8081/api/v1`
- **Authentication**: Bearer Token (ADMIN role required)
- **Content-Type**: `application/json`
- **Method**: REST API calls thay vì WebSocket

---

## 📡 API Endpoints

### 1. 📊 Dashboard Statistics (Main Endpoint)
**Endpoint chính để lấy toàn bộ dữ liệu dashboard**

```http
GET /admin/dashboard/stats
Authorization: Bearer {admin_token}
```

#### 📤 Response Structure:
```json
{
  "success": true,
  "message": "Lấy thống kê dashboard thành công",
  "data": {
    "totalRevenue": 318000.0,
    "revenueGrowthRate": 0.0,
    "totalOrders": 9,
    "averageOrderValue": 0.0,
    "conversionRate": 180.0,
    "revenueMetrics": [
      {
        "date": "2025-07-26",
        "revenue": 0.0
      },
      {
        "date": "2025-07-27",
        "revenue": 0.0
      },
      {
        "date": "2025-07-28", 
        "revenue": 0.0
      },
      {
        "date": "2025-07-29",
        "revenue": 0.0
      },
      {
        "date": "2025-07-30",
        "revenue": 0.0
      },
      {
        "date": "2025-07-31",
        "revenue": 0.0
      },
      {
        "date": "2025-08-01",
        "revenue": 318000.0
      }
    ],
    "categoryPerformance": [
      {
        "categoryName": "Unknown Category",
        "totalSold": 10,
        "revenue": 318000.0
      }
    ],
    "customerSegments": {
      "highValueCustomers": 0,
      "mediumValueCustomers": 1,
      "lowValueCustomers": 2
    },
    "topProducts": [
      {
        "productId": "688cb55a8e867f518abe187e",
        "productName": "Kem dưỡng da ban đêm",
        "productImage": null,
        "quantitySold": 10,
        "revenue": 318000.0,
        "categoryName": null
      }
    ],
    "recentOrders": [
      {
        "orderId": "688cf5f856643afcddec39cf",
        "orderCode": "ORD17540684722071957",
        "customerName": "Unknown Customer",
        "totalAmount": 1059150.0,
        "status": "PENDING",
        "createdAt": "2025-08-01T17:14:32.564+00:00"
      }
    ],
    "lastUpdated": "2025-08-01T18:44:27.234+00:00"
  }
}
```

---

### 2. 🔄 Dashboard Refresh
**Endpoint để làm mới dữ liệu dashboard theo cách thủ công**

```http
POST /admin/dashboard/refresh
Authorization: Bearer {admin_token}
```

#### 📤 Response:
Trả về cùng format như endpoint `/stats` nhưng với dữ liệu được tính toán lại mới nhất.

#### 💡 Use Case:
- Khi user click nút "Làm mới" trên dashboard
- Để force update dữ liệu real-time

---

### 3. 📋 Recent Orders Only
**Endpoint riêng để lấy danh sách đơn hàng gần đây**

```http
GET /admin/dashboard/recent-orders
Authorization: Bearer {admin_token}
```

#### 📤 Response:
```json
{
  "success": true,
  "message": "Lấy danh sách đơn hàng gần đây thành công",
  "data": [
    {
      "orderId": "688cf5f856643afcddec39cf",
      "orderCode": "ORD17540684722071957",
      "customerName": "Unknown Customer", 
      "totalAmount": 1059150.0,
      "status": "PENDING",
      "createdAt": "2025-08-01T17:14:32.564+00:00"
    }
    // ... up to 10 recent orders
  ]
}
```

---

### 4. 🏆 Top Products Only
**Endpoint riêng để lấy sản phẩm bán chạy**

```http
GET /admin/dashboard/top-products
Authorization: Bearer {admin_token}
```

#### 📤 Response:
```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm bán chạy thành công",
  "data": [
    {
      "productId": "688cb55a8e867f518abe187e",
      "productName": "Kem dưỡng da ban đêm",
      "productImage": null,
      "quantitySold": 10,
      "revenue": 318000.0,
      "categoryName": null
    }
    // ... up to 10 top products
  ]
}
```

---

## 📊 Data Field Explanations

### 🏢 Main Business Metrics
| Field | Type | Description | Calculation |
|-------|------|-------------|-------------|
| `totalRevenue` | Number | Tổng doanh thu 30 ngày gần nhất | Chỉ tính orders có status "COMPLETED" |
| `revenueGrowthRate` | Number | Tỷ lệ tăng trưởng doanh thu (%) | So sánh với 30 ngày trước đó |
| `totalOrders` | Number | Tổng số đơn hàng 30 ngày | Tất cả status orders |
| `averageOrderValue` | Number | Giá trị trung bình mỗi đơn | totalRevenue / totalOrders |
| `conversionRate` | Number | Tỷ lệ chuyển đổi (%) | (totalOrders / totalUsers) * 100 |

### 📈 Chart Data
| Field | Type | Description |
|-------|------|-------------|
| `revenueMetrics` | Array | Doanh thu 7 ngày gần nhất theo ngày |
| `categoryPerformance` | Array | Top 10 categories theo doanh thu |
| `customerSegments` | Object | Phân khúc khách hàng (high/medium/low) |

### 📋 List Data  
| Field | Type | Description |
|-------|------|-------------|
| `topProducts` | Array | Top 10 sản phẩm bán chạy (theo quantity) |
| `recentOrders` | Array | 10 đơn hàng gần đây nhất |

---

## 🚨 Error Handling

### Common HTTP Status Codes:

#### ❌ 401 Unauthorized
```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "data": null
}
```
**Cause**: Token missing, invalid, or expired

#### ❌ 403 Forbidden  
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập",
  "data": null
}
```
**Cause**: User không có ADMIN role

#### ❌ 500 Internal Server Error
```json
{
  "success": false,
  "message": "Lỗi khi lấy thống kê dashboard: Database connection failed",
  "data": null
}
```
**Cause**: Server-side errors (database, service issues)

---

## 💻 Frontend Implementation Examples

### 📱 React/Next.js Example

```javascript
import { useState, useEffect } from 'react';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load dashboard data
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setLastUpdated(result.data.lastUpdated);
      } else {
        console.error('Dashboard error:', result.message);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/dashboard/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        setLastUpdated(result.data.lastUpdated);
        // Show success notification
        showNotification('Dashboard đã được cập nhật thành công');
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="refresh-controls">
          <span>Cập nhật lần cuối: {formatDate(lastUpdated)}</span>
          <button onClick={refreshDashboard} disabled={loading}>
            {loading ? 'Đang làm mới...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      
      {dashboardData && (
        <>
          <MetricsCards data={dashboardData} />
          <ChartsSection data={dashboardData} />
          <TablesSection data={dashboardData} />
        </>
      )}
    </div>
  );
};
```

### 🔄 Auto-refresh Implementation (Optional)

```javascript
// Auto refresh every 5 minutes
useEffect(() => {
  const interval = setInterval(() => {
    if (!loading) {
      loadDashboard(); // Silent refresh
    }
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(interval);
}, [loading]);
```

---

## 🎨 UI Components Recommendations

### 📊 Dashboard Layout Structure

```
Dashboard Header
├── Title: "Dashboard"
├── Last Updated: "Cập nhật lần cuối: 01/08/2025 18:44"
└── Refresh Button: "Làm mới" [with loading state]

Main Metrics Cards Row
├── Total Revenue Card [with growth indicator]
├── Total Orders Card [with growth indicator]  
├── Average Order Value Card [with growth indicator]
└── Conversion Rate Card

Charts Section
├── Revenue Trend Chart (7 days line chart)
├── Category Performance Chart (bar chart)
└── Customer Segments Chart (pie chart)

Data Tables Section
├── Top Products Table (10 items)
└── Recent Orders Table (10 items)
```

### 🎯 Specific Component Guidelines

#### 💳 Metrics Cards
- **Format currency**: `1.059.150 ₫` hoặc `1,059,150 VND`
- **Growth indicators**: 
  - Green `+12.5% ↗` for positive growth
  - Red `-5.2% ↘` for negative growth
  - Gray `0.0%` for no change

#### 📈 Charts
- **Revenue Chart**: Line chart với 7 data points từ `revenueMetrics`
- **Category Chart**: Horizontal bar chart từ `categoryPerformance`
- **Segments Chart**: Donut chart từ `customerSegments`

#### 📋 Tables
- **Orders Table**: Sortable by date, amount, status
- **Products Table**: Sortable by quantity sold, revenue
- **Status Colors**:
  - `PENDING`: Orange `#FF9500`
  - `COMPLETED`: Green `#00C851`
  - `CANCELLED`: Red `#FF4444`
  - `PROCESSING`: Blue `#007BFF`
  - `SHIPPED`: Purple `#6610F2`

---

## 🔧 Performance & UX Best Practices

### 💾 Caching Strategy
```javascript
// Cache dashboard data for 2 minutes
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
let cachedData = null;
let cacheTimestamp = null;

const getCachedDashboardData = () => {
  if (cachedData && cacheTimestamp && 
      (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    return cachedData;
  }
  return null;
};
```

### ⚡ Loading States
```javascript
// Different loading states for better UX
const [loadingStates, setLoadingStates] = useState({
  initial: true,     // First load
  refreshing: false, // Manual refresh
  background: false  // Auto refresh
});
```

### 🛡️ Error Boundaries
```javascript
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Dashboard có lỗi xảy ra</h2>
          <button onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🧪 Testing & Debugging

### 🔍 Testing Commands
```bash
# Test main dashboard endpoint
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:8081/api/v1/admin/dashboard/stats

# Test refresh endpoint
curl -X POST \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:8081/api/v1/admin/dashboard/refresh

# Test recent orders
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:8081/api/v1/admin/dashboard/recent-orders

# Test top products  
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:8081/api/v1/admin/dashboard/top-products
```

### 🐛 Debug Checklist
- [ ] Token có valid và chưa expired?
- [ ] User có ADMIN role?
- [ ] Backend container có đang chạy? (`docker ps`)
- [ ] Database connection có stable?
- [ ] Check backend logs: `docker logs backend-app`

---

## 🔄 Migration from WebSocket Version

### ❌ Removed Features
1. Real-time WebSocket connections
2. Automatic data push notifications  
3. `/admin/dashboard/connect-websocket` endpoint
4. Live update indicators

### ✅ New Features  
1. Manual refresh functionality
2. Consolidated dashboard stats endpoint
3. Better error handling
4. Client-side caching support
5. Last updated timestamp display

### 📝 Required Frontend Changes
1. **Remove**: WebSocket connection code
2. **Remove**: Real-time event listeners
3. **Add**: Manual refresh button
4. **Add**: Loading states for API calls
5. **Add**: Error handling for network failures
6. **Add**: Last updated timestamp display
7. **Update**: Data fetching logic to use REST endpoints

---

## 📞 Support & Troubleshooting

### 🆘 Common Issues

**Issue**: "Token không hợp lệ"
- **Solution**: Check token expiration and regenerate if needed

**Issue**: "Bạn không có quyền truy cập"  
- **Solution**: Verify user has ADMIN role in database

**Issue**: "Dashboard data is empty"
- **Solution**: Check if there are orders in database with COMPLETED status

**Issue**: "500 Internal Server Error"
- **Solution**: Check backend logs and database connection

### 📋 Health Check
```bash
# Check if backend is running
curl http://localhost:8081/actuator/health

# Check database connection
docker logs backend-app | grep "MongoDB"
```

---

## 🎯 Summary for Frontend Team

### 🔥 Priority Implementation Order:
1. **Implement main dashboard stats endpoint** (`/stats`)
2. **Add manual refresh functionality** (`/refresh`)  
3. **Create responsive dashboard layout**
4. **Add proper loading and error states**
5. **Implement auto-refresh (optional)**
6. **Add detailed tables** (recent orders, top products)

### 🎨 UI/UX Focus Areas:
- **Clear loading indicators** during data fetching
- **Prominent refresh button** with last updated time
- **Responsive layout** for mobile devices
- **Error handling** with user-friendly messages
- **Performance** with client-side caching

### 📱 Mobile Considerations:
- Stack metrics cards vertically
- Make charts swipeable/scrollable
- Optimize table layouts for small screens
- Use collapsible sections for better space usage

---

**Generated on**: August 2, 2025  
**Backend Version**: Without WebSocket  
**API Base URL**: `http://localhost:8081/api/v1`
