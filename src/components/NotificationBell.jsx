import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  ListItemIcon,
  ListItemText,
  MenuList,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as UnreadIcon,
  CheckCircle as ReadIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNotifications } from '../hooks/useNotifications';
import { getNotificationTypeColor, getNotificationTypeIcon } from '../api/notificationApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationBell = () => {
  const { notifications, unreadCount, loading, markAsRead, refresh } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const bellRef = useRef(null);
  const navigate = useNavigate();
  
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    // TODO: Navigate to related content if needed
    // Based on notification.type and notification.relatedId
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    await Promise.all(
      unreadNotifications.map(notification => 
        markAsRead(notification.id)
      )
    );
  };

  const getTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: vi 
      });
    } catch {
      return 'Vừa xong';
    }
  };

  // Lấy 10 thông báo mới nhất
  const recentNotifications = notifications.slice(0, 10);

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton
          ref={bellRef}
          color="inherit"
          onClick={handleOpen}
          sx={{
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: 18,
                minWidth: 18,
              },
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1,
            '& .MuiMenuItem-root': {
              whiteSpace: 'normal',
              alignItems: 'flex-start',
              padding: 1.5,
            },
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1, backgroundColor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="primary">
              Thông báo
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {unreadCount > 0 && (
                <Chip
                  size="small"
                  label={`${unreadCount} chưa đọc`}
                  color="error"
                  variant="outlined"
                />
              )}
              <IconButton size="small" onClick={refresh} disabled={loading}>
                {loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <ClearIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Content */}
        {loading && notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Đang tải...
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Chưa có thông báo nào
            </Typography>
          </Box>
        ) : (
          <MenuList sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
            {recentNotifications.map((notification, index) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                  borderLeft: notification.isRead ? 'none' : `3px solid`,
                  borderLeftColor: notification.isRead ? 'transparent' : 'primary.main',
                  '&:hover': {
                    backgroundColor: notification.isRead ? 'action.hover' : 'action.selected',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography fontSize="1.2rem">
                      {getNotificationTypeIcon(notification.type)}
                    </Typography>
                    {!notification.isRead && (
                      <UnreadIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                    )}
                  </Box>
                </ListItemIcon>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: notification.isRead ? 'normal' : 'bold',
                      color: notification.isRead ? 'text.primary' : 'primary.main',
                      mb: 0.5,
                    }}
                  >
                    {notification.title}
                  </Typography>
                  
                  <Typography
                    component="div"
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 0.5,
                    }}
                  >
                    {notification.message}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      size="small"
                      label={notification.type}
                      color={getNotificationTypeColor(notification.type)}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                    <Typography component="span" variant="caption" color="text.secondary">
                      {getTimeAgo(notification.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </MenuList>
        )}

        {/* Footer */}
        {notifications.length > 0 && [
          <Divider key="divider" />,
          <Box key="footer" sx={{ p: 1 }}>
            <Button
              fullWidth
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              startIcon={<ReadIcon />}
              sx={{ mb: 1 }}
            >
              Đánh dấu tất cả đã đọc
            </Button>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              onClick={() => {
                handleClose();
                navigate('/notifications');
              }}
            >
              Xem tất cả thông báo
            </Button>
          </Box>
        ]}
      </Menu>
    </>
  );
};

export default NotificationBell;
