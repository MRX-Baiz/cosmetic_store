import React, { useContext, useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Grid, Card, CardContent, Divider, List, ListItem, ListItemText, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Alert } from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { ordersAPI } from '../services/api';

const Checkout = () => {
  const { items, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('whatsapp'); // Default to WhatsApp for now
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.name || '',
        address: typeof user.address === 'string' ? user.address : '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const calculateSubtotal = () => {
    return items ? items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0) : 0;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 50 ? 0 : 10; // Free shipping over $50
  };

  const calculateTotal = () => {
    return (calculateSubtotal() + calculateTax() + calculateShipping()).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!items || items.length === 0) {
      setError('Your cart is empty.');
      setLoading(false);
      return;
    }

    try {
      const orderItems = items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        image: item.product.images[0]?.url || '',
        price: item.product.price,
      }));

      const orderData = {
        items: orderItems,
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod,
        subtotal: calculateSubtotal().toFixed(2),
        tax: calculateTax().toFixed(2),
        shipping: calculateShipping().toFixed(2),
        total: calculateTotal(),
      };

      console.log('Order data being sent:', orderData);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await ordersAPI.createOrder(orderData, config);
      console.log('Order created:', data);

      // If paymentMethod is 'whatsapp', generate file and open WhatsApp
      if (paymentMethod === 'whatsapp') {
        const orderFileContent = generateOrderFile(data.order); // Pass the order object from the API response
        
        // Trigger file download
        const blob = new Blob([orderFileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order_${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Prepare WhatsApp message
        const whatsappMessage = 
          `Hello, I'd like to confirm my order.\nOrder ID: ${data.order._id}\n\nOrder Summary:\n` +
          `Subtotal: ${data.order.subtotal} DH\n` +
          `Tax (8%): ${data.order.tax} DH\n` +
          `Shipping: ${data.order.shipping} DH\n` +
          `Total: ${data.order.total.toFixed(2)} DH\n\n` +
          `Shipping Address: ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}, ${shippingAddress.country}\nItems: ${orderItems.map(item => `${item.name} (x${item.quantity})`).join(', ')}`;
        const whatsappUrl = `https://wa.me/+212621561796?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
      } else if (paymentMethod === 'paypal') {
        // Handle PayPal payment logic here
        console.log('Proceeding with PayPal payment...');
        alert('Integrating with PayPal (Coming soon!)');
      } else if (paymentMethod === 'card') {
        // Handle credit card payment logic here
        console.log('Proceeding with card payment...');
        alert('Integrating with Payment Card (Coming Soon!)');
      }
      
      clearCart();
      navigate('/orders');
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Order failed to create.');
    } finally {
      setLoading(false);
    }
  };

  const generateOrderFile = (order) => {
    const { items: orderItems, shippingAddress, subtotal, tax, shipping, total } = order;
    let fileContent = '--- Order Details ---\n\n';

    fileContent += `Date: ${new Date().toLocaleString()}\n\n`;

    fileContent += 'Shipping Address:\n';
    fileContent += `  Full Name: ${shippingAddress.fullName}\n`;
    fileContent += `  Address: ${shippingAddress.address}\n`;
    fileContent += `  City: ${shippingAddress.city}\n`;
    fileContent += `  Postal Code: ${shippingAddress.postalCode}\n`;
    fileContent += `  Country: ${shippingAddress.country}\n`;
    fileContent += `  Phone: ${shippingAddress.phone}\n\n`;

    fileContent += 'Order Items:\n';
    orderItems.forEach(item => {
      fileContent += `  - ${item.product.name} (Quantity: ${item.quantity}, Price: ${item.price.toFixed(2)} DH)\n`;
    });
    fileContent += '\n';

    fileContent += `Subtotal: ${subtotal} DH\n`;
    fileContent += `Tax (8%): ${tax} DH\n`;
    fileContent += `Shipping: ${shipping} DH\n`;
    fileContent += `Total Price: ${total.toFixed(2)} DH\n\n`;
    fileContent += '---------------------\n';

    // Return the content, do not trigger download here
    return fileContent;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Shipping Address Form */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Shipping Address
            </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleAddressChange}
                      fullWidth
                    required
                  />
                </Grid>
                  <Grid item xs={12} sm={6}>
                  <TextField
                      label="Phone Number"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleAddressChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                      label="Address"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleAddressChange}
                    fullWidth
                    required
                  />
                </Grid>
                  <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      fullWidth
                    required
                  />
                </Grid>
                  <Grid item xs={12} sm={6}>
                  <TextField
                      label="Postal Code"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleAddressChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                      label="Country"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleAddressChange}
                    fullWidth
                      required
                  />
                </Grid>
              </Grid>
            </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
              <List>
                {items ? items.map((item) => (
                  <ListItem key={item.product._id} dense>
                      <ListItemText
                      primary={`${item.product.name} x ${item.quantity}`}
                      secondary={`Price: ${item.product.price.toFixed(2)} DH`}
                    />
                    <Typography variant="body2">
                      {(item.quantity * item.product.price).toFixed(2)} DH
                    </Typography>
                  </ListItem>
                )) : (
                  <ListItem>
                    <ListItemText primary="Your cart is empty." />
                    </ListItem>
                )}
                </List>
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Subtotal:</Typography>
                <Typography>{calculateSubtotal().toFixed(2)} DH</Typography>
                </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Tax (8%):</Typography>
                <Typography>{calculateTax().toFixed(2)} DH</Typography>
                </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Shipping:</Typography>
                <Typography>
                  {calculateShipping() === 0 ? 'FREE' : `${calculateShipping().toFixed(2)} DH`}
                </Typography>
                </Box>
              
              {calculateSubtotal() < 50 && (
                <Alert severity="info" sx={{ my: 2 }}>
                  Add ${(50 - calculateSubtotal()).toFixed(2)} more for free shipping!
                </Alert>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">{calculateTotal()} DH</Typography>
                </Box>
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
              <FormControl component="fieldset" sx={{ mt: 3, width: '100%' }}>
                <FormLabel component="legend">Payment Method</FormLabel>
                <RadioGroup
                  aria-label="payment method"
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <FormControlLabel
                    value="whatsapp"
                    control={<Radio />}
                    label="Complete via WhatsApp"
                  />
                  <FormControlLabel
                    value="paypal"
                    control={<Radio />}
                    label="PayPal"
                  />
                  <FormControlLabel
                    value="card"
                    control={<Radio disabled />}
                    label="Payment Card (Coming Soon)"
                  />
                </RadioGroup>
              </FormControl>
                  <Button
                variant="contained"
                color="primary"
                    fullWidth
                sx={{ mt: 3 }}
                onClick={handleSubmit}
                disabled={loading || (!items || items.length === 0)}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
                  </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
