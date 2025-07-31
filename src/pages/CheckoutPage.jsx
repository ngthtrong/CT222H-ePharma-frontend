import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Stack,
  List,
  ListItem,
  ListItemText,
  Switch,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI } from '../api/orderApi';
import { addressAPI } from '../api/addressApi';
import { formatCurrency } from '../utils/formatters';
import { useSnackbar } from '../hooks/useSnackbar';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: cartItems, totalAmount, totalItems, clearCart } = useCart();
  const { snackbar, hideSnackbar, showSuccess, showError } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  
  // Form states
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [notes, setNotes] = useState('');
  
  // Custom address form
  const [customAddress, setCustomAddress] = useState({
    recipientName: user?.name || '',
    phoneNumber: user?.phone || '',
    street: '',
    ward: '',
    city: '',
    saveAsNewAddress: false,
    setAsDefault: false,
  });

  const steps = ['Địa chỉ giao hàng', 'Phương thức thanh toán', 'Xác nhận đơn hàng'];

  const paymentMethods = [
    { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)', description: 'Thanh toán bằng tiền mặt khi nhận hàng' },
    { value: 'MOMO', label: 'Ví điện tử MoMo', description: 'Thanh toán qua ví điện tử MoMo' },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản qua ngân hàng' },
  ];

  useEffect(() => {
    // Redirect if cart is empty
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    
    fetchAddresses();
  }, [cartItems, navigate]);

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getUserAddresses();
      if (response.data.success) {
        const userAddresses = response.data.data || [];
        setAddresses(userAddresses);
        
        // Auto-select default address
        const defaultAddress = userAddresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleCustomAddressChange = (field, value) => {
    setCustomAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Address validation
        if (useCustomAddress) {
          return customAddress.recipientName && 
                 customAddress.phoneNumber && 
                 customAddress.street && 
                 customAddress.ward && 
                 customAddress.city;
        }
        return selectedAddressId || addresses.length === 0;
      case 1: // Payment validation
        return paymentMethod;
      case 2: // Final validation
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      showError('Vui lòng điền đầy đủ thông tin');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      
      // If using custom address and user wants to save it, save the address first
      if (useCustomAddress && customAddress.saveAsNewAddress) {
        try {
          const addressToSave = {
            recipientName: customAddress.recipientName,
            phoneNumber: customAddress.phoneNumber,
            street: customAddress.street,
            ward: customAddress.ward,
            city: customAddress.city,
            isDefault: customAddress.setAsDefault
          };
          
          const saveAddressResponse = await addressAPI.addAddress(addressToSave);
          if (saveAddressResponse.data.success) {
            showSuccess('Địa chỉ mới đã được lưu vào danh sách địa chỉ của bạn');
            // Refresh addresses list
            await fetchAddresses();
          }
        } catch (error) {
          console.error('Error saving address:', error);
          showError('Không thể lưu địa chỉ mới, nhưng đơn hàng vẫn sẽ được tạo');
        }
      }
      
      // Prepare order data
      const orderData = {
        paymentMethod,
        notes: notes || null,
      };

      // Add address information
      if (useCustomAddress) {
        orderData.customShippingAddress = {
          recipientName: customAddress.recipientName,
          phoneNumber: customAddress.phoneNumber,
          street: customAddress.street,
          ward: customAddress.ward,
          city: customAddress.city
        };
      } else if (selectedAddressId) {
        orderData.selectedAddressId = selectedAddressId;
      }
      // If no address is selected and no custom address, use default address

      const response = await orderAPI.createOrder(orderData);
      
      if (response.data.success) {
        const order = response.data.data;
        showSuccess('Đặt hàng thành công!');
        
        // Clear cart after successful order
        await clearCart();
        
        // Navigate to order detail or success page
        navigate(`/orders/${order.orderCode}`, { 
          state: { 
            orderCreated: true, 
            orderData: order 
          } 
        });
      } else {
        showError(response.data.message || 'Không thể tạo đơn hàng');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      showError('Lỗi khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate shipping fee (simplified)
  const shippingFee = totalAmount >= 500000 ? 0 : 30000;
  const finalTotal = totalAmount + shippingFee;

  const renderAddressStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Chọn địa chỉ giao hàng
      </Typography>
      
      {addresses.length > 0 && (
        <>
          <FormControlLabel
            control={
              <Switch
                checked={!useCustomAddress}
                onChange={(e) => setUseCustomAddress(!e.target.checked)}
              />
            }
            label="Sử dụng địa chỉ đã lưu"
          />
          
          {!useCustomAddress && (
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel>Chọn địa chỉ</InputLabel>
              <Select
                value={selectedAddressId}
                label="Chọn địa chỉ"
                onChange={(e) => setSelectedAddressId(e.target.value)}
              >
                {addresses.map((address) => (
                  <MenuItem key={address.id} value={address.id}>
                    <Box>
                      <Typography variant="subtitle2">
                        {address.recipientName} - {address.phoneNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[address.street, address.ward, address.city].filter(Boolean).join(', ')}
                      </Typography>
                      {address.isDefault && (
                        <Typography variant="caption" color="primary"> (Mặc định)</Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </>
      )}

      {(useCustomAddress || addresses.length === 0) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {addresses.length === 0 ? 'Thêm địa chỉ giao hàng' : 'Địa chỉ giao hàng mới'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên người nhận"
                value={customAddress.recipientName}
                onChange={(e) => handleCustomAddressChange('recipientName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={customAddress.phoneNumber}
                onChange={(e) => handleCustomAddressChange('phoneNumber', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ cụ thể"
                value={customAddress.street}
                onChange={(e) => handleCustomAddressChange('street', e.target.value)}
                placeholder="Số nhà, tên đường..."
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phường/Xã"
                value={customAddress.ward}
                onChange={(e) => handleCustomAddressChange('ward', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tỉnh/Thành phố"
                value={customAddress.city}
                onChange={(e) => handleCustomAddressChange('city', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={customAddress.saveAsNewAddress}
                    onChange={(e) => handleCustomAddressChange('saveAsNewAddress', e.target.checked)}
                  />
                }
                label="Lưu làm địa chỉ mới"
              />
            </Grid>
            {customAddress.saveAsNewAddress && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={customAddress.setAsDefault}
                      onChange={(e) => handleCustomAddressChange('setAsDefault', e.target.checked)}
                    />
                  }
                  label="Đặt làm địa chỉ mặc định"
                />
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );

  const renderPaymentStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Chọn phương thức thanh toán
      </Typography>
      
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          {paymentMethods.map((method) => (
            <FormControlLabel
              key={method.value}
              value={method.value}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle2">{method.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {method.description}
                  </Typography>
                </Box>
              }
              sx={{ mb: 1, alignItems: 'flex-start' }}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <TextField
        fullWidth
        label="Ghi chú cho đơn hàng (tùy chọn)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        multiline
        rows={3}
        placeholder="Ghi chú về thời gian giao hàng, yêu cầu đặc biệt..."
        sx={{ mt: 2 }}
      />
    </Box>
  );

  const renderConfirmStep = () => {
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    const finalAddress = useCustomAddress ? customAddress : selectedAddress;
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Xác nhận đơn hàng
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Order items */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Sản phẩm đã đặt ({totalItems} sản phẩm)
              </Typography>
              <List>
                {cartItems.map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={item.productName}
                      secondary={`Số lượng: ${item.quantity} x ${formatCurrency(item.price)}`}
                    />
                    <Typography variant="subtitle2">
                      {formatCurrency(item.quantity * item.price)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Address */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Địa chỉ giao hàng
              </Typography>
              {finalAddress ? (
                <Box>
                  <Typography variant="body2">
                    <strong>{finalAddress.recipientName}</strong> - {finalAddress.phoneNumber}
                  </Typography>
                  <Typography variant="body2">
                    {[finalAddress.street, finalAddress.ward, finalAddress.city].filter(Boolean).join(', ')}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sử dụng địa chỉ mặc định
                </Typography>
              )}
            </Paper>

            {/* Payment method */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Phương thức thanh toán
              </Typography>
              <Typography variant="body2">
                {paymentMethods.find(m => m.value === paymentMethod)?.label}
              </Typography>
              {notes && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ghi chú: {notes}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Order summary */}
            <Paper sx={{ p: 2, position: 'sticky', top: 100 }}>
              <Typography variant="subtitle1" gutterBottom>
                Tóm tắt đơn hàng
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tạm tính:</Typography>
                <Typography>{formatCurrency(totalAmount)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography>{formatCurrency(shippingFee)}</Typography>
              </Box>
              {shippingFee === 0 && (
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 1 }}>
                  Miễn phí vận chuyển cho đơn hàng từ 500.000đ
                </Typography>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Tổng cộng:</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(finalTotal)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderAddressStep();
      case 1:
        return renderPaymentStep();
      case 2:
        return renderConfirmStep();
      default:
        return 'Unknown step';
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cart')}
          color="primary"
        >
          Quay lại giỏ hàng
        </Button>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        Đặt hàng
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3 }}>
        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Quay lại
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleCreateOrder}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <ShoppingBagIcon />}
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!validateStep(activeStep)}
            >
              Tiếp tục
            </Button>
          )}
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={hideSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CheckoutPage;
