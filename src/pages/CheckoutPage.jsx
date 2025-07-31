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
import { getLocalStorage, setLocalStorage } from '../utils/localStorage';

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
    recipientName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
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

  useEffect(() => {
    // Auto-select default address when addresses are loaded
    if (addresses.length > 0 && !selectedAddressId && !useCustomAddress) {
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else {
        // If no default address, select the first one
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses, selectedAddressId, useCustomAddress]);

  useEffect(() => {
    // Update custom address when user data changes
    if (user) {
      setCustomAddress(prev => ({
        ...prev,
        recipientName: prev.recipientName || user.fullName || '',
        phoneNumber: prev.phoneNumber || user.phoneNumber || ''
      }));
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      // Lấy địa chỉ từ localStorage thay vì API
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const userAddresses = userData.addresses || [];
        
        // Transform data structure to match expected format
        const formattedAddresses = userAddresses.map((address, index) => ({
          id: address.id || `addr_${index}_${Date.now()}`,
          recipientName: address.recipientName || userData.fullName || '',
          phoneNumber: address.phoneNumber || userData.phoneNumber || '',
          street: address.street || address.address || '',
          ward: address.ward || '',
          city: address.city || address.province || '',
          district: address.district || '', // Optional field
          isDefault: address.isDefault || false
        }));
        
        setAddresses(formattedAddresses);
        
        if (formattedAddresses.length === 0) {
          setUseCustomAddress(true);
        }
      } else {
        // Fallback: try to get from API if localStorage doesn't have user data
        try {
          const response = await addressAPI.getUserAddresses();
          if (response.data && response.data.success) {
            const userAddresses = response.data.data || [];
            setAddresses(userAddresses);
          }
        } catch (apiError) {
          console.error('Error fetching addresses from API:', apiError);
          showError('Không thể tải danh sách địa chỉ');
        }
      }
    } catch (error) {
      console.error('Error fetching addresses from localStorage:', error);
      showError('Không thể tải danh sách địa chỉ');
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
          return customAddress.recipientName.trim() && 
                 customAddress.phoneNumber.trim() && 
                 customAddress.street.trim() && 
                 customAddress.ward.trim() && 
                 customAddress.city.trim();
        }
        return selectedAddressId || (addresses.length === 0 && !useCustomAddress);
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
      let errorMessage = 'Vui lòng điền đầy đủ thông tin';
      if (activeStep === 0) {
        if (useCustomAddress) {
          errorMessage = 'Vui lòng điền đầy đủ thông tin địa chỉ giao hàng';
        } else if (!selectedAddressId) {
          errorMessage = 'Vui lòng chọn địa chỉ giao hàng';
        }
      } else if (activeStep === 1 && !paymentMethod) {
        errorMessage = 'Vui lòng chọn phương thức thanh toán';
      }
      showError(errorMessage);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      let savedAddressId = null;
      
      // If using custom address and user wants to save it, save the address first
      if (useCustomAddress && customAddress.saveAsNewAddress) {
        try {
          const addressToSave = {
            recipientName: customAddress.recipientName.trim(),
            phoneNumber: customAddress.phoneNumber.trim(),
            address: customAddress.street.trim(), // Use 'address' field for API compatibility
            street: customAddress.street.trim(),
            ward: customAddress.ward.trim(),
            city: customAddress.city.trim(),
            province: customAddress.city.trim(), // Map city to province for compatibility
            isDefault: customAddress.setAsDefault
          };
          
          // Try to save to API first
          try {
            const saveAddressResponse = await addressAPI.addAddress(addressToSave);
            if (saveAddressResponse.data && saveAddressResponse.data.success) {
              savedAddressId = saveAddressResponse.data.data?.id;
              showSuccess('Địa chỉ mới đã được lưu vào danh sách địa chỉ của bạn');
            }
          } catch (apiError) {
            console.warn('API save failed, saving to localStorage only:', apiError);
          }
          
          // Always update localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            const newAddress = {
              id: savedAddressId || `addr_new_${Date.now()}`,
              ...addressToSave
            };
            
            // Add new address to user data
            if (!userData.addresses) {
              userData.addresses = [];
            }
            
            // If setting as default, remove default from other addresses
            if (customAddress.setAsDefault) {
              userData.addresses.forEach(addr => {
                addr.isDefault = false;
              });
            }
            
            userData.addresses.push(newAddress);
            localStorage.setItem('user', JSON.stringify(userData));
            
            if (!savedAddressId) {
              showSuccess('Địa chỉ mới đã được lưu vào danh sách địa chỉ của bạn');
            }
          }
          
          // Refresh addresses list
          await fetchAddresses();
        } catch (error) {
          console.error('Error saving address:', error);
          showError('Không thể lưu địa chỉ mới, nhưng đơn hàng vẫn sẽ được tạo');
        }
      }
      
      // Prepare order data
      const orderData = {
        paymentMethod,
        notes: notes?.trim() || null,
      };

      // Add address information
      if (useCustomAddress) {
        if (savedAddressId) {
          // Use the newly saved address
          orderData.selectedAddressId = savedAddressId;
        } else {
          // Use custom address for this order only
          orderData.customShippingAddress = {
            recipientName: customAddress.recipientName.trim(),
            phoneNumber: customAddress.phoneNumber.trim(),
            street: customAddress.street.trim(),
            ward: customAddress.ward.trim(),
            city: customAddress.city.trim()
          };
        }
      } else if (selectedAddressId) {
        orderData.selectedAddressId = selectedAddressId;
      }
      // If no address is selected and no custom address, backend will use default address

      const response = await orderAPI.createOrder(orderData);
      
      if (response.data && response.data.success) {
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
      
      {addresses.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Địa chỉ đã lưu ({addresses.length} địa chỉ)
          </Typography>
          <Grid container spacing={2}>
            {addresses.map((address) => (
              <Grid size={12} key={address.id}>
                <Card 
                  variant={selectedAddressId === address.id && !useCustomAddress ? "outlined" : "elevation"}
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedAddressId === address.id && !useCustomAddress ? 2 : 1,
                    borderColor: selectedAddressId === address.id && !useCustomAddress ? 'primary.main' : 'grey.300',
                    backgroundColor: selectedAddressId === address.id && !useCustomAddress ? 'primary.50' : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.50'
                    }
                  }}
                  onClick={() => {
                    setSelectedAddressId(address.id);
                    setUseCustomAddress(false);
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {address.recipientName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {address.phoneNumber}
                        </Typography>
                        <Typography variant="body2">
                          {[address.street, address.ward, address.district, address.city].filter(Boolean).join(', ')}
                        </Typography>
                        {address.isDefault && (
                          <Typography variant="caption" 
                            sx={{ 
                              color: 'primary.main', 
                              backgroundColor: 'primary.100',
                              px: 1, 
                              py: 0.5, 
                              borderRadius: 1,
                              display: 'inline-block',
                              mt: 1
                            }}
                          >
                            Địa chỉ mặc định
                          </Typography>
                        )}
                      </Box>
                      <Radio
                        checked={selectedAddressId === address.id && !useCustomAddress}
                        onChange={() => {
                          setSelectedAddressId(address.id);
                          setUseCustomAddress(false);
                        }}
                        sx={{ mt: -1 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">HOẶC</Typography>
          </Divider>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Bạn chưa có địa chỉ đã lưu. Vui lòng nhập địa chỉ giao hàng bên dưới.
        </Alert>
      )}

      <Card 
        variant={useCustomAddress ? "outlined" : "elevation"}
        sx={{ 
          cursor: 'pointer',
          border: useCustomAddress ? 2 : 1,
          borderColor: useCustomAddress ? 'primary.main' : 'grey.300',
          backgroundColor: useCustomAddress ? 'primary.50' : 'background.paper',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.50'
          }
        }}
        onClick={() => setUseCustomAddress(true)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: useCustomAddress ? 2 : 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {addresses.length === 0 ? 'Thêm địa chỉ giao hàng' : 'Sử dụng địa chỉ mới'}
            </Typography>
            <Radio
              checked={useCustomAddress}
              onChange={() => setUseCustomAddress(true)}
            />
          </Box>
          
          {useCustomAddress && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Tên người nhận *"
                    value={customAddress.recipientName}
                    onChange={(e) => handleCustomAddressChange('recipientName', e.target.value)}
                    required
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Số điện thoại *"
                    value={customAddress.phoneNumber}
                    onChange={(e) => handleCustomAddressChange('phoneNumber', e.target.value)}
                    required
                    size="small"
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ cụ thể *"
                    value={customAddress.street}
                    onChange={(e) => handleCustomAddressChange('street', e.target.value)}
                    placeholder="Số nhà, tên đường..."
                    required
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phường/Xã *"
                    value={customAddress.ward}
                    onChange={(e) => handleCustomAddressChange('ward', e.target.value)}
                    required
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Tỉnh/Thành phố *"
                    value={customAddress.city}
                    onChange={(e) => handleCustomAddressChange('city', e.target.value)}
                    required
                    size="small"
                  />
                </Grid>
                
                {addresses.length > 0 && (
                  <>
                    <Grid size={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={customAddress.saveAsNewAddress}
                            onChange={(e) => handleCustomAddressChange('saveAsNewAddress', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">Lưu vào danh sách địa chỉ của tôi</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Địa chỉ này sẽ được lưu để sử dụng cho các đơn hàng tiếp theo
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                    {customAddress.saveAsNewAddress && (
                      <Grid size={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={customAddress.setAsDefault}
                              onChange={(e) => handleCustomAddressChange('setAsDefault', e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">Đặt làm địa chỉ mặc định</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Địa chỉ này sẽ được chọn tự động cho các đơn hàng tiếp theo
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
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
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Order items */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Sản phẩm đã đặt ({totalItems} sản phẩm)
              </Typography>
              <List>
                {cartItems.map((item, index) => {
                  // Use discountedPrice if available, otherwise use productPrice
                  const effectivePrice = item.discountedPrice || item.productPrice;
                  
                  return (
                    <ListItem key={index} divider sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {item.productName}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              Đơn giá: {formatCurrency(effectivePrice)}
                            </Typography>
                            {item.discountedPrice && item.discountedPrice < item.productPrice && (
                              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                Giá gốc: {formatCurrency(item.productPrice)}
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                              Số lượng: {item.quantity}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(item.subtotal)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Thành tiền
                        </Typography>
                      </Box>
                    </ListItem>
                  );
                })}
                
                {/* Summary row */}
                <ListItem sx={{ px: 0, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Tổng tiền hàng:
                      </Typography>
                    }
                  />
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totalAmount)}
                  </Typography>
                </ListItem>
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
                    {[finalAddress.street, finalAddress.ward, finalAddress.district, finalAddress.city].filter(Boolean).join(', ')}
                  </Typography>
                  {useCustomAddress && customAddress.saveAsNewAddress && (
                    <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                      * Địa chỉ này sẽ được lưu vào danh sách địa chỉ của bạn
                      {customAddress.setAsDefault && ' và đặt làm địa chỉ mặc định'}
                    </Typography>
                  )}
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

          <Grid size={{ xs: 12, md: 4 }}>
            {/* Order summary */}
            <Paper sx={{ p: 2, position: 'sticky', top: 100 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Tóm tắt đơn hàng
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tổng tiền hàng ({totalItems} sản phẩm):</Typography>
                <Typography sx={{ fontWeight: 'medium' }}>{formatCurrency(totalAmount)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography sx={{ fontWeight: 'medium' }}>
                  {shippingFee === 0 ? (
                    <Box component="span" sx={{ color: 'success.main' }}>
                      Miễn phí
                    </Box>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </Typography>
              </Box>
              
              {shippingFee === 0 && (
                <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 2, fontStyle: 'italic' }}>
                  🎉 Miễn phí vận chuyển cho đơn hàng từ 500.000đ
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tổng thanh toán:</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(finalTotal)}
                </Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                (Đã bao gồm VAT nếu có)
              </Typography>
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
