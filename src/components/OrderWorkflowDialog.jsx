import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useOrderIcons } from '../hooks/useOrderIcons';
import { ORDER_STATUSES, getAvailableStatuses, getStatusTransitionAction } from '../utils/orderWorkflow';

const OrderWorkflowDialog = ({ open, onClose, currentStatus = 'PENDING' }) => {
  const { getOrderStatusIcon } = useOrderIcons();

  // Define workflow steps
  const workflowSteps = [
    { status: 'PENDING', label: 'Đơn hàng mới' },
    { status: 'PROCESSING', label: 'Đang xử lý' },
    { status: 'SHIPPED', label: 'Đã giao vận' },
    { status: 'COMPLETED', label: 'Hoàn thành' }
  ];

  const getCurrentStepIndex = () => {
    return workflowSteps.findIndex(step => step.status === currentStatus);
  };

  const getStepStatus = (stepStatus) => {
    const currentIndex = getCurrentStepIndex();
    const stepIndex = workflowSteps.findIndex(step => step.status === stepStatus);
    
    if (currentStatus === 'CANCELLED') {
      return stepIndex <= currentIndex ? 'error' : 'disabled';
    }
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon />
          <Typography variant="h6">
            Quy trình xử lý đơn hàng
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Trạng thái hiện tại
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip
              label={ORDER_STATUSES[currentStatus]?.label}
              color={ORDER_STATUSES[currentStatus]?.color}
              icon={getOrderStatusIcon(currentStatus)}
              size="medium"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {ORDER_STATUSES[currentStatus]?.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Workflow Stepper */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quy trình xử lý
          </Typography>
          <Stepper 
            activeStep={getCurrentStepIndex()} 
            orientation="vertical"
            sx={{ mt: 2 }}
          >
            {workflowSteps.map((step, index) => {
              const stepStatus = getStepStatus(step.status);
              
              return (
                <Step 
                  key={step.status}
                  completed={stepStatus === 'completed'}
                  active={stepStatus === 'active'}
                >
                  <StepLabel
                    StepIconComponent={() => (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: stepStatus === 'completed' ? 'success.main' : 
                               stepStatus === 'active' ? 'primary.main' :
                               stepStatus === 'error' ? 'error.main' : 'grey.300',
                        color: 'white'
                      }}>
                        {stepStatus === 'completed' ? <CheckIcon fontSize="small" /> :
                         stepStatus === 'error' ? <CancelIcon fontSize="small" /> :
                         getOrderStatusIcon(step.status)}
                      </Box>
                    )}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        {step.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ORDER_STATUSES[step.status]?.description}
                      </Typography>
                    </Box>
                  </StepLabel>
                  
                  <StepContent>
                    <Box sx={{ pl: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {ORDER_STATUSES[step.status]?.description}
                      </Typography>
                    </Box>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Available Actions */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Hành động có thể thực hiện
          </Typography>
          
          {getAvailableStatuses(currentStatus).length > 0 ? (
            <List dense>
              {getAvailableStatuses(currentStatus).map((nextStatus) => {
                const action = getStatusTransitionAction(currentStatus, nextStatus);
                
                return (
                  <ListItem key={nextStatus} sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getOrderStatusIcon(currentStatus)}
                        <ArrowIcon fontSize="small" />
                        {getOrderStatusIcon(nextStatus)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {action?.label || `Chuyển sang ${ORDER_STATUSES[nextStatus]?.label}`}
                          </Typography>
                          <Chip 
                            label={ORDER_STATUSES[nextStatus]?.label}
                            color={ORDER_STATUSES[nextStatus]?.color}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={action?.description}
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {currentStatus === 'COMPLETED' 
                  ? 'Đơn hàng đã hoàn thành. Không thể thực hiện thêm hành động nào.'
                  : currentStatus === 'CANCELLED'
                  ? 'Đơn hàng đã bị hủy. Không thể thực hiện thêm hành động nào.'
                  : 'Không có hành động nào có thể thực hiện.'
                }
              </Typography>
            </Paper>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Business Rules */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Quy tắc nghiệp vụ
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Đơn hàng PENDING"
                secondary="Có thể chuyển sang PROCESSING (xác nhận) hoặc CANCELLED (hủy)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Đơn hàng PROCESSING"
                secondary="Có thể chuyển sang SHIPPED (giao vận) hoặc CANCELLED (hủy)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Đơn hàng SHIPPED"
                secondary="Chỉ có thể chuyển sang COMPLETED (hoàn thành)"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Đơn hàng COMPLETED/CANCELLED"
                secondary="Trạng thái cuối, không thể thay đổi"
              />
            </ListItem>
          </List>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderWorkflowDialog;
