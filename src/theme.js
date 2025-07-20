import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a51a2', // Xanh lá cây đậm, sang trọng
    },
    secondary: {
      main: '#ff9800', // Cam cho các điểm nhấn, khuyến mãi, giỏ hàng
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#FFFFFF', // Nền chính là trắng
      paper: '#F5F5F5', // Nền phụ cho card, section
    },
    text: {
      primary: '#212B36', // Đen đậm cho tiêu đề
      secondary: '#637381', // Xám cho văn bản phụ
    },
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 700,
    },
    body1: {
      // Cấu hình mặc định cho body1
    },
  },
});

export default theme;
