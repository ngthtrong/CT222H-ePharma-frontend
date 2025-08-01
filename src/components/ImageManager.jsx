import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Paper,
  Divider,
  Tooltip,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  DragIndicator as DragIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';

const ImageManager = ({ images = [], onChange, maxImages = 5 }) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Xử lý thêm hình ảnh từ URL
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    
    // Kiểm tra URL có hợp lệ không
    try {
      new URL(newImageUrl);
    } catch {
      alert('URL không hợp lệ. Vui lòng nhập URL hình ảnh đúng định dạng.');
      return;
    }

    if (images.length >= maxImages) {
      alert(`Chỉ được phép tối đa ${maxImages} hình ảnh.`);
      return;
    }

    const updatedImages = [...images, newImageUrl];
    onChange(updatedImages);
    setNewImageUrl('');
    setOpenDialog(false);
  };

  // Xử lý xóa hình ảnh
  const handleDeleteImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onChange(updatedImages);
  };

  // Xử lý di chuyển hình ảnh lên đầu (làm hình chính)
  const handleMakePrimary = (index) => {
    if (index === 0) return; // Đã là hình chính
    
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(index, 1);
    updatedImages.unshift(movedImage);
    onChange(updatedImages);
  };

  // Xử lý kéo thả (drag & drop)
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updatedImages = [...images];
    const [draggedImage] = updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(dropIndex, 0, draggedImage);
    
    onChange(updatedImages);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Xử lý xem trước hình ảnh
  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewDialog(true);
  };

  // Validate image URL
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const urlLower = url.toLowerCase();
    
    // Check for common image hosting services
    const imageHosts = ['cloudinary.com', 'imgur.com', 'unsplash.com', 'pexels.com', 'pixabay.com'];
    const hasImageHost = imageHosts.some(host => url.includes(host));
    
    // Check for image extensions
    const hasImageExtension = imageExtensions.some(ext => urlLower.includes(ext));
    
    // Valid if URL is from image hosting service OR has image extension
    return hasImageHost || hasImageExtension;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="primary">
          Hình ảnh sản phẩm
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={images.length >= maxImages}
          size="small"
        >
          Thêm hình ảnh
        </Button>
      </Box>

      {/* Hiển thị thông tin */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {images.length}/{maxImages} hình ảnh
          {images.length > 0 && ' • Hình đầu tiên sẽ là hình chính'}
        </Typography>
      </Box>

      {/* Danh sách hình ảnh */}
      {images.length > 0 ? (
        <Grid container spacing={2}>
          {images.map((imageUrl, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  position: 'relative',
                  border: index === 0 ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                  cursor: 'move',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                {/* Badge hình chính */}
                {index === 0 && (
                  <Chip
                    label="Hình chính"
                    color="primary"
                    size="small"
                    icon={<StarIcon />}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1,
                      fontSize: '0.7rem',
                    }}
                  />
                )}

                {/* Drag indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: 1,
                    padding: 0.5,
                  }}
                >
                  <DragIcon sx={{ color: 'white', fontSize: 16 }} />
                </Box>

                <CardMedia
                  component="img"
                  height="150"
                  image={imageUrl}
                  alt={`Hình ảnh ${index + 1}`}
                  sx={{
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5',
                  }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04NSA2MEM4NSA1Ny43OTA5IDg2Ljc5MDkgNTYgODkgNTZIMTExQzExMy4yMDkgNTYgMTE1IDU3Ljc5MDkgMTE1IDYwVjkwQzExNSA5Mi4yMDkxIDExMy4yMDkgOTQgMTExIDk0SDg5Qzg2Ljc5MDkgOTQgODUgOTIuMjA5MSA4NSA5MFY2MFoiIGZpbGw9IiNEOUQ5RDkiLz4KPHBhdGggZD0iTTk1IDcwQzk1IDcyLjc2MTQgOTIuNzYxNCA3NSA5MCA3NUM4Ny4yMzg2IDc1IDg1IDcyLjc2MTQgODUgNzBDODUgNjcuMjM4NiA4Ny4yMzg2IDY1IDkwIDY1QzkyLjc2MTQgNjUgOTUgNjcuMjM4NiA5NSA3MFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik05MCA4Nkw5NSA4MEwxMDAgODJMMTA1IDc2TDExMCA4NlY5MEg5MFY4NloiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTA1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkzhu5lpIHRhaSDhuqNuaDwvdGV4dD4KPC9zdmc+';
                  }}
                />

                <CardActions sx={{ padding: 1, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Xem trước">
                      <IconButton
                        size="small"
                        onClick={() => handlePreview(imageUrl)}
                      >
                        <PreviewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {index !== 0 && (
                      <Tooltip title="Đặt làm hình chính">
                        <IconButton
                          size="small"
                          onClick={() => handleMakePrimary(index)}
                        >
                          <StarBorderIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  <Tooltip title="Xóa hình ảnh">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteImage(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          sx={{
            padding: 4,
            textAlign: 'center',
            backgroundColor: '#fafafa',
            border: '2px dashed #e0e0e0',
          }}
        >
          <ImageIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Chưa có hình ảnh nào
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Nhấn "Thêm hình ảnh" để bắt đầu thêm hình ảnh cho sản phẩm
          </Typography>
        </Paper>
      )}

      {/* Dialog thêm hình ảnh */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon />
            Thêm hình ảnh từ URL
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="URL hình ảnh"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              fullWidth
              placeholder="https://example.com/image.jpg"
              helperText="Nhập URL của hình ảnh. Hỗ trợ các định dạng: JPG, PNG, GIF, WebP"
              InputProps={{
                startAdornment: <LinkIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />

            {/* Preview image nếu URL hợp lệ */}
            {newImageUrl && isValidImageUrl(newImageUrl) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Xem trước:
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Box
                    component="img"
                    src={newImageUrl}
                    alt="Preview"
                    sx={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      e.target.style.display = 'block';
                    }}
                  />
                  <Chip
                    label="Preview"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* Warning nếu URL không hợp lệ */}
            {newImageUrl && !isValidImageUrl(newImageUrl) && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="warning" sx={{ borderRadius: 1 }}>
                  URL này có thể không phải là hình ảnh hợp lệ. Vui lòng kiểm tra lại.
                </Alert>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Gợi ý nguồn hình ảnh miễn phí:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip 
                label="Unsplash.com" 
                size="small" 
                variant="outlined"
                onClick={() => window.open('https://unsplash.com', '_blank')}
                sx={{ cursor: 'pointer' }}
              />
              <Chip 
                label="Pexels.com" 
                size="small" 
                variant="outlined"
                onClick={() => window.open('https://pexels.com', '_blank')}
                sx={{ cursor: 'pointer' }}
              />
              <Chip 
                label="Pixabay.com" 
                size="small" 
                variant="outlined"
                onClick={() => window.open('https://pixabay.com', '_blank')}
                sx={{ cursor: 'pointer' }}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleAddImage}
            variant="contained"
            disabled={!newImageUrl.trim() || !isValidImageUrl(newImageUrl)}
          >
            Thêm hình ảnh
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem trước hình ảnh */}
      <Dialog 
        open={previewDialog} 
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Xem trước hình ảnh</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          <Box
            component="img"
            src={previewImage}
            alt="Preview"
            sx={{
              width: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: 1,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageManager;
