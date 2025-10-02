
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Grid, CircularProgress, Alert, Button, CardMedia, TextField } from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { productsAPI } from '../services/api'; // Assuming productsAPI exists for fetching single product
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const getFullImageUrl = (imagePath) => {
  // With Cloudinary, the imagePath is already a full URL.
  return imagePath || '';
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await productsAPI.getProduct(id); // Changed to productsAPI.getProduct
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product details:", err);
        setError(err.response?.data?.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress color="primary" />
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

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Product not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          {/* Product Image - For now, display the first image. Later, we can add a carousel. */}
          <CardMedia
            component="img"
            sx={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 2, boxShadow: 3 }}
            image={getFullImageUrl(product.images[0]?.url)}
            alt={product.name}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontFamily: 'Georgia, serif' }}>
            {product.name}
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom sx={{ mt: 2 }}>
            {product.price.toFixed(2)} DH
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 3, fontFamily: 'Georgia, serif' }}>
            {product.description}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>Brand:</Typography> {product.brand}
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>Category:</Typography> {product.category}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 4, gap: 2 }}>
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1 }}
              sx={{ width: 100, '& fieldset': { borderRadius: 2 } }}
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              sx={{ borderRadius: 2 }}
            >
              Add to Cart
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;
