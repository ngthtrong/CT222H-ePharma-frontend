import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Circle as UnreadIcon,
  CheckCircle as ReadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNotifications } from '../hooks/useNotifications';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  getNotificationTypeColor,
  getNotificationTypeIcon,
} from '../api/notificationApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationPage = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    markAsRead, 
    refresh 
  } = useNotifications();

  const [filterType, setFilterType] = useState('ALL');
  const [filterRead, setFilterRead] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [viewDialog, setViewDialog] = useState({ open: false, notification: null });

  const getTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: vi 
      });
    } catch {
      return 'Không rõ';
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setViewDialog({ open: true, notification });
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = filteredNotifications.filter(n => !n.isRead);
    await Promise.all(
      unreadNotifications.map(notification => 
        markAsRead(notification.id)
      )
    );
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by type
    if (filterType !== 'ALL' && notification.type !== filterType) {
      return false;
    }

    // Filter by read status
    if (filterRead === 'READ' && !notification.isRead) {
      return false;
    }
    if (filterRead === 'unread' && notification.isRead) {
      return false;
    }

    // Filter by search text
    if (searchText && !notification.title.toLowerCase().includes(searchText.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" color="primary" gutterBottom>
            🔔 Thông báo của tôi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng: {notifications.length} • Chưa đọc: {unreadCount}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refresh}
          disabled={loading}
        >
          Làm mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Tìm kiếm thông báo..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Loại</InputLabel>
              <Select
                value={filterType}
                label="Loại"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="ALL">Tất cả</MenuItem>
                {Object.entries(NOTIFICATION_TYPE_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {getNotificationTypeIcon(key)} {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterRead}
                label="Trạng thái"
                onChange={(e) => setFilterRead(e.target.value)}
              >
                <MenuItem value="ALL">Tất cả</MenuItem>
                <MenuItem value="unread">Chưa đọc</MenuItem>
                <MenuItem value="read">Đã đọc</MenuItem>
              </Select>
            </FormControl>

            {unreadCount > 0 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<ReadIcon />}
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {notifications.length === 0 ? 'Chưa có thông báo nào' : 'Không tìm thấy thông báo phù hợp'}
            </Typography>
            {searchText && (
              <Button onClick={() => setSearchText('')}>
                Xóa bộ lọc
              </Button>
            )}
          </CardContent>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                    borderLeft: notification.isRead ? 'none' : `4px solid`,
                    borderLeftColor: notification.isRead ? 'transparent' : 'primary.main',
                    '&:hover': {
                      backgroundColor: notification.isRead ? 'action.hover' : 'action.selected',
                    },
                    py: 2,
                  }}
                >
                  <ListItemIcon>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontSize="1.5rem">
                        {getNotificationTypeIcon(notification.type)}
                      </Typography>
                      {!notification.isRead && (
                        <UnreadIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                      )}
                    </Box>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                            color: notification.isRead ? 'text.primary' : 'primary.main',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={NOTIFICATION_TYPE_LABELS[notification.type]}
                          color={getNotificationTypeColor(notification.type)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            mb: 1,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getTimeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewDialog({ open: true, notification });
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                
                {index < filteredNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Card>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, notification: null })}
        maxWidth="sm"
        fullWidth
      >
        {viewDialog.notification && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>{getNotificationTypeIcon(viewDialog.notification.type)}</Typography>
                <Typography variant="h6">
                  {viewDialog.notification.title}
                </Typography>
                <Chip
                  size="small"
                  label={viewDialog.notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                  color={viewDialog.notification.isRead ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {viewDialog.notification.message}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={NOTIFICATION_TYPE_LABELS[viewDialog.notification.type]}
                  color={getNotificationTypeColor(viewDialog.notification.type)}
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(viewDialog.notification.createdAt).toLocaleString('vi-VN')}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog({ open: false, notification: null })}>
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default NotificationPage;
