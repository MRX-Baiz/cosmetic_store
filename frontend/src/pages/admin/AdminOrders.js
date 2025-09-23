import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment,
  Pagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  Edit,
  LocalShipping,
  CheckCircle,
  Pending,
  Cancel,
  ExpandMore,
  Refresh,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { ordersAPI } from '../../services/api';

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    paymentStatus: searchParams.get('paymentStatus') || 'all',
  });

  const [updateData, setUpdateData] = useState({
    orderStatus: '',
    paymentStatus: '',
    trackingNumber: '',
    notes: '',
    cancelReason: '',
  });

  const orderStatuses = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ];

  const paymentStatuses = [
    'pending',
    'paid',
    'failed',
    'refunded'
  ];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
      };

      if (filters.status !== 'all') params.status = filters.status;
      if (filters.paymentStatus !== 'all') params.paymentStatus = filters.paymentStatus;

      const response = await ordersAPI.getAllOrders(params);
      setOrders(response.data.orders || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all') {
        newSearchParams.set(k, v);
      }
    });
    setSearchParams(newSearchParams);
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setUpdateData({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber || '',
      notes: order.notes || '',
      cancelReason: order.cancelReason || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrder = async () => {
    try {
      const dataToSend = { ...updateData };
      // Only send cancelReason if status is cancelled
      if (dataToSend.orderStatus !== 'cancelled') {
        delete dataToSend.cancelReason;
      }
      await ordersAPI.updateOrderStatus(selectedOrder._id, dataToSend);
      handleCloseDialog();
      fetchOrders();
    } catch (err) {
      setError('Failed to update order');
      console.error('Error updating order:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'pending': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle />;
      case 'shipped': return <LocalShipping />;
      case 'processing': return <Pending />;
      case 'cancelled': return <Cancel />;
      default: return <Pending />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Manage Orders
          </Typography>
          <Typography variant="h6" color="text.secondary">
            View and manage customer orders
          </Typography>
        </Box>
        <Tooltip title="Refresh Orders">
          <IconButton onClick={fetchOrders} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search orders..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Order Status</InputLabel>
              <Select
                value={filters.status}
                label="Order Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {orderStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={filters.paymentStatus}
                label="Payment Status"
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              >
                <MenuItem value="all">All Payment Statuses</MenuItem>
                {paymentStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={fetchOrders}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders List */}
      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Order #{order.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customer: {order.user?.name || 'Unknown'} • {order.user?.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {formatDate(order.createdAt)}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1} alignItems="center">
                    <Chip
                      icon={getStatusIcon(order.orderStatus)}
                      label={order.orderStatus}
                      color={getStatusColor(order.orderStatus)}
                      size="small"
                    />
                    <Chip
                      label={order.paymentStatus}
                      color={order.paymentStatus === 'paid' ? 'success' : 'default'}
                      size="small"
                    />
                    <Tooltip title="Update Order">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(order)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Shipping Address:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.shippingAddress?.name}<br />
                      {order.shippingAddress?.street}<br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                      {order.shippingAddress?.country}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Order Summary:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal: ${order.subtotal}<br />
                      Tax: ${order.tax}<br />
                      Shipping: ${order.shipping}<br />
                      <strong>Total: ${order.total}</strong>
                    </Typography>
                  </Grid>
                </Grid>

                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">
                      Order Items ({order.items?.length || 0})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {order.items?.map((item, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={item.product?.name || 'Unknown Product'}
                              secondary={`Quantity: ${item.quantity} • Price: $${item.price}`}
                            />
                          </ListItem>
                          {index < order.items.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                {order.trackingNumber && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tracking Information:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tracking Number: {order.trackingNumber}
                    </Typography>
                  </Box>
                )}

                {order.notes && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Notes:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Update Order Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Order #{selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Order Status</InputLabel>
                <Select
                  value={updateData.orderStatus}
                  label="Order Status"
                  onChange={(e) => setUpdateData(prev => ({ ...prev, orderStatus: e.target.value }))}
                >
                  {orderStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={updateData.paymentStatus}
                  label="Payment Status"
                  onChange={(e) => setUpdateData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                >
                  {paymentStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tracking Number"
                value={updateData.trackingNumber}
                onChange={(e) => setUpdateData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                placeholder="Enter tracking number if shipped"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={updateData.notes}
                onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={3}
                placeholder="Add any notes about this order"
              />
            </Grid>
            {updateData.orderStatus === 'cancelled' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cancellation Reason"
                  value={updateData.cancelReason}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, cancelReason: e.target.value }))}
                  multiline
                  rows={3}
                  placeholder="Enter reason for cancellation"
                  required
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateOrder} variant="contained">
            Update Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrders;
