# Advanced Analytics & Reporting API Guide

## Overview
This guide covers the advanced analytics and reporting features including advanced dashboard metrics, real-time analytics, and Excel/PDF export capabilities.

## New Endpoints

### Advanced Dashboard Analytics

#### Get Advanced Dashboard Metrics
```
GET /api/v1/admin/analytics/dashboard
```

**Parameters:**
- `startDate` (required): Start date in format `yyyy-MM-dd`
- `endDate` (required): End date in format `yyyy-MM-dd`

**Response:**
```json
{
  "success": true,
  "message": "Advanced dashboard metrics retrieved successfully",
  "data": {
    "totalRevenue": 15000.50,
    "totalOrders": 125,
    "averageOrderValue": 120.00,
    "revenueGrowthRate": 15.5,
    "conversionRate": 3.2,
    "activeCustomers": 45,
    "topCategories": [
      {
        "categoryName": "Electronics",
        "totalSold": 150,
        "revenue": 8500.00
      }
    ],
    "dailyRevenue": [
      {
        "date": "2024-01-01",
        "revenue": 500.00
      }
    ],
    "customerSegments": {
      "highValueCustomers": 9,
      "mediumValueCustomers": 13,
      "lowValueCustomers": 23
    },
    "inventoryTurnover": 2.5,
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Real-Time Metrics
```
GET /api/v1/admin/analytics/realtime
```

**Response:**
```json
{
  "success": true,
  "message": "Real-time metrics retrieved successfully",
  "data": {
    "ordersLast24h": 12,
    "revenueLast24h": 1500.00,
    "hourlyOrders": [
      {
        "hour": "00:00",
        "orderCount": 2
      },
      {
        "hour": "01:00",
        "orderCount": 0
      }
    ],
    "peakHour": "14:00",
    "activeUsersOnline": 25,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Export Endpoints

#### Excel Export

**Revenue Report to Excel**
```
GET /api/v1/admin/reports/revenue/export/excel
```
Parameters: `startDate`, `endDate`, `reportType` (optional)
Returns: Excel file download

**Product Performance to Excel**
```
GET /api/v1/admin/reports/products/export/excel
```
Parameters: `startDate`, `endDate`
Returns: Excel file download

**Order Statistics to Excel**
```
GET /api/v1/admin/reports/orders/export/excel
```
Parameters: `startDate`, `endDate`
Returns: Excel file download

**User Analytics to Excel**
```
GET /api/v1/admin/reports/users/export/excel
```
Parameters: `startDate`, `endDate`
Returns: Excel file download

#### PDF Export

**Revenue Report to PDF**
```
GET /api/v1/admin/reports/revenue/export/pdf
```
Parameters: `startDate`, `endDate`, `reportType` (optional)
Returns: PDF file download

**Product Performance to PDF**
```
GET /api/v1/admin/reports/products/export/pdf
```
Parameters: `startDate`, `endDate`
Returns: PDF file download

**Order Statistics to PDF**
```
GET /api/v1/admin/reports/orders/export/pdf
```
Parameters: `startDate`, `endDate`
Returns: PDF file download

**User Analytics to PDF**
```
GET /api/v1/admin/reports/users/export/pdf
```
Parameters: `startDate`, `endDate`
Returns: PDF file download

## WebSocket Real-Time Analytics

### Connection
Connect to WebSocket endpoint: `/ws-analytics`

### Topics

#### Real-Time Metrics Updates
**Topic:** `/topic/realtime-metrics`
**Frequency:** Every 30 seconds
**Data:**
```json
{
  "ordersLast24h": 12,
  "revenueLast24h": 1500.00,
  "hourlyOrders": [...],
  "peakHour": "14:00",
  "activeUsersOnline": 25,
  "timestamp": 1642249800000
}
```

#### Order Updates
**Topic:** `/topic/order-updates`
**Triggered:** When orders are created/updated
**Data:**
```json
{
  "eventType": "ORDER_CREATED",
  "data": {
    "orderId": "order123",
    "amount": 150.00,
    "status": "PENDING"
  },
  "timestamp": 1642249800000
}
```

#### Revenue Updates
**Topic:** `/topic/revenue-updates`
**Triggered:** When revenue changes
**Data:**
```json
{
  "revenue": 15000.50,
  "period": "daily",
  "timestamp": 1642249800000
}
```

#### Active Users Count
**Topic:** `/topic/active-users`
**Triggered:** When users connect/disconnect
**Data:**
```json
{
  "count": 25,
  "timestamp": 1642249800000
}
```

## JavaScript Client Example

```javascript
// Connect to WebSocket
const socket = new SockJS('/ws-analytics');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
    console.log('Connected: ' + frame);
    
    // Subscribe to real-time metrics
    stompClient.subscribe('/topic/realtime-metrics', function (message) {
        const metrics = JSON.parse(message.body);
        updateDashboard(metrics);
    });
    
    // Subscribe to order updates
    stompClient.subscribe('/topic/order-updates', function (message) {
        const update = JSON.parse(message.body);
        handleOrderUpdate(update);
    });
    
    // Subscribe to active users count
    stompClient.subscribe('/topic/active-users', function (message) {
        const data = JSON.parse(message.body);
        updateActiveUsersDisplay(data.count);
    });
});

function updateDashboard(metrics) {
    document.getElementById('orders-24h').textContent = metrics.ordersLast24h;
    document.getElementById('revenue-24h').textContent = '$' + metrics.revenueLast24h.toFixed(2);
    document.getElementById('active-users').textContent = metrics.activeUsersOnline;
    
    // Update hourly chart
    updateHourlyChart(metrics.hourlyOrders);
}
```

## Authentication
All endpoints require admin authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

Common error codes:
- `400`: Invalid date range
- `401`: Unauthorized
- `403`: Forbidden (non-admin user)
- `500`: Internal server error

## Features Implemented

### ✅ Advanced Dashboard Metrics
- Revenue growth rate calculation
- Customer conversion rates
- Category performance analysis
- Daily revenue trends
- Customer segmentation
- Inventory turnover metrics

### ✅ Export Reports to Excel/PDF
- Revenue reports export
- Product performance export
- Order statistics export
- User analytics export
- Professional formatting with headers and styling

### ✅ Real-Time Analytics
- WebSocket-based real-time updates
- Live order notifications
- Active user tracking
- Automatic metrics broadcasting
- Connection management

### Additional Features
- Automatic cleanup of stale WebSocket connections
- Comprehensive error handling
- Professional Excel/PDF formatting
- Growth rate calculations
- Customer segmentation analysis
- Hourly order distribution
- Peak hour identification

## Usage Tips

1. **Date Ranges**: Use reasonable date ranges to avoid performance issues
2. **WebSocket**: Implement proper connection handling and reconnection logic
3. **Export**: Large exports may take time, consider adding loading indicators
4. **Real-time**: Implement debouncing for frequent updates to avoid UI performance issues
5. **Error Handling**: Always implement proper error handling for all API calls
