import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Card, CardContent, List, ListItem, ListItemText, CardMedia, Stepper, Step, StepLabel, Paper, Divider, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Visibility, LocalShipping, Refresh } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_BASE_URL}${url}`;
};

const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const getActiveStep = (status) => {
  const index = orderStatuses.indexOf(status);
  return index === -1 ? 0 : index;
};

const Orders = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Adjust breakpoint as needed

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await ordersAPI.getMyOrders(null, config);
        setOrders(data.orders);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(err.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: 'Georgia, serif' }}>
        My Orders
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && orders.length === 0 && (
        <Alert severity="info" sx={{ mt: 4 }}>
          You haven't placed any orders yet.
        </Alert>
      )}

      {!loading && !error && orders.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {orders.map((order) => (
            <Grid item xs={12} sm={6} md={4} key={order._id}>
              <Card raised sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onClick={() => navigate(`/orders/${order._id}`)} style={{ cursor: 'pointer' }}>
                <CardContent>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Georgia, serif' }}>
                      Order #{order.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Georgia, serif' }}>
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1, borderColor: '#eee' }} />

                  <Box sx={{ width: '100%', mb: 2 }}>
                    <Stepper activeStep={getActiveStep(order.orderStatus)} alternativeLabel sx={{ '& .MuiStepLabel-label': { fontFamily: 'Georgia, serif' } }}>
                      {orderStatuses.map((label) => (
                        <Step key={label}>
                          <StepLabel>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  </Box>

                  {order.orderStatus === 'cancelled' && order.cancelReason && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2, fontFamily: 'Georgia, serif' }}>
                      Order Cancelled: {order.cancelReason}
                    </Alert>
                  )}

                  <Divider sx={{ my: 1, borderColor: '#eee' }} />

                  {/* Product Preview Row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mr: 2, fontFamily: 'Georgia, serif' }}>Products:</Typography>
                    {order.items.slice(0, 3).map((item) => (
                      <Box key={item._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                        <CardMedia
                          component="img"
                          sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                          image={getFullImageUrl(item.product.images[0]?.url)}
                          alt={item.product.name}
                        />
                        <Typography variant="caption" noWrap sx={{ maxWidth: 60, fontFamily: 'Georgia, serif' }}>
                          {item.product.name}
                        </Typography>
                      </Box>
                    ))}
                    {order.items.length > 3 && (
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 1, fontFamily: 'Georgia, serif' }}>
                        +{order.items.length - 3} more
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 1, borderColor: '#eee' }} />

                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mt: 2, mb: 2, gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: 'Georgia, serif' }}>Total: {order.total.toFixed(2)} DH</Typography>
                    <Box display="flex" gap={1} flexDirection={{ xs: 'column', md: 'row' }} width={{ xs: '100%', md: 'auto' }}>
                      <Button variant="outlined" startIcon={<Visibility />} onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order._id}`); }} sx={{ fontFamily: 'Georgia, serif' }} fullWidth={isMobile}>
                        View Details
                      </Button>
                      <Button variant="contained" startIcon={<LocalShipping />} onClick={(e) => e.stopPropagation()} sx={{ fontFamily: 'Georgia, serif' }} fullWidth={isMobile}>
                        Track Package
                      </Button>
                      <Button variant="text" startIcon={<Refresh />} onClick={(e) => e.stopPropagation()} sx={{ fontFamily: 'Georgia, serif' }} fullWidth={isMobile}>
                        Reorder
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Orders;
