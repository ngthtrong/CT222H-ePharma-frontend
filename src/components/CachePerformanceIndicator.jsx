import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  CloudDone as CloudDoneIcon,
  Memory as MemoryIcon,
} from '@mui/icons-material';

/**
 * Component hiển thị thông tin performance cache và API
 */
const CachePerformanceIndicator = ({ 
  isValid, 
  lastUpdated, 
  loading, 
  totalCategories = 0,
  cachedCounts = 0,
  useBatchAPI = true // Tham số mới để theo dõi việc sử dụng batch API
}) => {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Chưa cập nhật';
    
    const now = Date.now();
    const timeDiff = now - timestamp;
    const minutes = Math.floor(timeDiff / (60 * 1000));
    
    if (minutes < 1) return 'vừa cập nhật';
    if (minutes < 60) return `${minutes} phút trước`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  const getPerformanceScore = () => {
    if (!isValid) return { score: 0, color: 'error', label: 'Cần cập nhật' };
    
    const timeDiff = Date.now() - lastUpdated;
    const minutes = Math.floor(timeDiff / (60 * 1000));
    
    // Điểm cộng nếu sử dụng batch API
    const batchAPIBonus = useBatchAPI ? 20 : 0;
    
    let baseScore = 0;
    if (minutes < 5) baseScore = 100;
    else if (minutes < 15) baseScore = 80;
    else if (minutes < 60) baseScore = 60;
    else baseScore = 30;
    
    const finalScore = Math.min(100, baseScore + batchAPIBonus);
    
    if (finalScore >= 90) return { score: finalScore, color: 'success', label: 'Tuyệt vời' };
    if (finalScore >= 70) return { score: finalScore, color: 'success', label: 'Tốt' };
    if (finalScore >= 50) return { score: finalScore, color: 'warning', label: 'Khá' };
    return { score: finalScore, color: 'warning', label: 'Nên cập nhật' };
  };

  const performance = getPerformanceScore();

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2, 
        borderColor: performance.color === 'success' ? 'success.main' : 'warning.main',
        backgroundColor: performance.color === 'success' ? 'success.50' : 'warning.50'
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SpeedIcon color={performance.color} />
            <Typography variant="subtitle2" color={`${performance.color}.main`}>
              Cache Performance: {performance.label}
            </Typography>
            
            {isValid && (
              <Chip 
                icon={<CloudDoneIcon />}
                label="Hoạt động" 
                size="small" 
                color={performance.color}
                variant="outlined"
              />
            )}
            
            {loading && (
              <Chip 
                label="Đang cập nhật..." 
                size="small" 
                color="primary"
              />
            )}
          </Stack>

          <IconButton 
            size="small" 
            onClick={() => setExpanded(!expanded)}
            sx={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>

        <Box sx={{ mt: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={performance.score} 
            color={performance.color}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                📅 Cập nhật cuối: {formatTime(lastUpdated)}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                📊 Số danh mục: {totalCategories}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                💾 Đã cache: {cachedCounts} số liệu
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                ⚡ API tối ưu: {useBatchAPI ? 'Sử dụng endpoint batch (/admin/categories/product-counts)' : 'Fallback individual calls'}
              </Typography>
              
              {useBatchAPI && (
                <Typography variant="caption" color="success.main">
                  🎯 Tối ưu hóa: 1 API call thay vì {totalCategories} calls riêng lẻ
                </Typography>
              )}
              
              {isValid && useBatchAPI && (
                <Box sx={{ 
                  p: 1, 
                  bgcolor: 'success.50', 
                  borderRadius: 1, 
                  border: '1px solid',
                  borderColor: 'success.200'
                }}>
                  <Typography variant="caption" color="success.dark">
                    🚀 <strong>Performance tối ưu:</strong> Giảm {Math.floor(((totalCategories - 1) / totalCategories) * 100)}% API calls nhờ batch endpoint & intelligent cache
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default CachePerformanceIndicator;
