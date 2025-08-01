# 🔧 WebSocket Configuration Guide

## WebSocket Real-time Features

The Advanced Analytics Dashboard includes real-time features via WebSocket connections. However, these are optional and the dashboard works perfectly in offline mode.

### Environment Configuration

Create a `.env.local` file in the project root to configure WebSocket behavior:

```bash
# Disable WebSocket if backend doesn't support it
VITE_DISABLE_WEBSOCKET=true

# Configure API base URL
VITE_API_URL=http://localhost:8081/api/v1
```

### WebSocket Endpoints

If your backend supports WebSocket, the frontend will attempt to connect to:
- Primary: `ws://localhost:8081/ws-analytics`
- Fallback: `ws://localhost:8081/ws`
- Alternative: `ws://localhost:8080/ws-analytics`
- Alternative: `ws://localhost:8080/ws`

### Features with WebSocket

✅ **Real-time metrics updates**
✅ **Live order notifications**
✅ **Active user count**
✅ **Revenue updates**

### Features without WebSocket

✅ **All dashboard analytics (HTTP API)**
✅ **Advanced charts and visualizations**
✅ **Export functionality (Excel/PDF)**
✅ **Date range filtering**
✅ **All admin management features**

## Backend WebSocket Implementation

If you want to implement WebSocket on your backend, refer to `ADVANCED-ANALYTICS-API-GUIDE.md` for the expected topics and message formats:

- `/topic/realtime-metrics`
- `/topic/order-updates`
- `/topic/revenue-updates`
- `/topic/active-users`

## Troubleshooting

### WebSocket Connection Errors

If you see WebSocket errors in the console:

1. **Expected behavior**: If your backend doesn't have WebSocket, these errors are normal
2. **Solution**: Set `VITE_DISABLE_WEBSOCKET=true` in `.env.local`
3. **Dashboard still works**: All features except real-time updates work via HTTP APIs

### Real-time Updates Not Working

1. Check if `VITE_DISABLE_WEBSOCKET=true` is set
2. Verify your backend has WebSocket endpoints configured
3. Check browser console for connection logs
4. Use the Admin Token Debugger at `/admin/debug` to test API connectivity

## Performance Notes

- WebSocket disabled = Better performance for development
- Dashboard loads faster without connection attempts
- All data is still fresh via HTTP API calls
- Real-time updates are nice-to-have, not essential
