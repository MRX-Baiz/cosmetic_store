import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Card, CardContent, CardMedia, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_BASE_URL}${url}`;
};

const OrderDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      console.log('Fetching order details for ID:', id);
      console.log('Auth token present:', !!token);
      if (!token) {
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
        const { data } = await ordersAPI.getOrder(id, config);
        setOrder(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError(err.response?.data?.message || 'Failed to load order details.');
        console.error('Order details API error:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, token]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Order not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Order Details #{order.orderNumber}
      </Typography>

      <Grid container spacing={4}>
        {/* Order Summary */}
        <Grid item xs={12}>
          <Card raised sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Products</Typography>
              <List>
                {order.items.map((item) => (
                  <ListItem key={item.product._id} alignItems="flex-start">
                    <CardMedia
                      component="img"
                      sx={{ width: 80, height: 80, borderRadius: 1, mr: 2, flexShrink: 0 }}
                      image={getFullImageUrl(item.product.images[0]?.url)}
                      alt={item.product.name}
                    />
                    <ListItemText
                      primary={item.product.name}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Quantity: {item.quantity}
                          </Typography>
                          {` — Unit Price: ${item.price.toFixed(2)} DH`}
                        </React.Fragment>
                      }
                    />
                    <Typography variant="body1">Subtotal: {(item.quantity * item.price).toFixed(2)} DH</Typography>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">{order.total.toFixed(2)} DH</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping Information */}
        <Grid item xs={12} sm={6}>
          <Card raised sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Shipping Information</Typography>
              <Typography variant="body1"><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</Typography>
              <Typography variant="body1"><strong>Delivery Method:</strong> Standard Shipping</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Information */}
        <Grid item xs={12} sm={6}>
          <Card raised sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Payment Information</Typography>
              <Typography variant="body1"><strong>Method:</strong> {order.paymentMethod}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {order.orderStatus === 'cancelled' && order.cancelReason && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ width: '100%' }}>
              Order Cancelled: {order.cancelReason}
            </Alert>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default OrderDetails;
