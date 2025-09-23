import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Rating,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  Star,
  ShoppingCart,
  LocalShipping,
  Security,
  Support,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import ProductMediaCarousel from '../components/ProductMediaCarousel';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [promotionalProducts, setPromotionalProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featuredResponse, allProductsResponse] = await Promise.all([
          productsAPI.getFeaturedProducts(),
          productsAPI.getProducts({ limit: 20 })
        ]);
        
        setFeaturedProducts(featuredResponse.data);
        
        const allProducts = allProductsResponse.data.products || allProductsResponse.data;
        
        // Filter promotional products (products with originalPrice > price)
        const promotional = allProducts.filter(product => 
          product.originalPrice && product.originalPrice > product.price
        );
        setPromotionalProducts(promotional.slice(0, 8));
        
        // Filter best sellers (products with high ratings or featured)
        const bestSellers = allProducts
          .filter(product => product.rating?.average >= 4 || product.isFeatured)
          .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        setBestSellers(bestSellers.slice(0, 8));
        
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const features = [
    {
      icon: <LocalShipping />,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50',
    },
    {
      icon: <Security />,
      title: 'Secure Payment',
      description: '100% secure payment processing',
    },
    {
      icon: <Support />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #e91e63 0%, #f8bbd9 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Discover Your Beauty
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
            Premium cosmetics and skincare products for every beauty need
          </Typography>
          
          <Paper
            component="form"
            onSubmit={handleSearch}
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              maxWidth: 500,
              mx: 'auto',
              backgroundColor: 'rgba(255,255,255,0.9)',
            }}
          >
            <TextField
              fullWidth
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              variant="standard"
              sx={{ ml: 1, flex: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#e91e63',
                '&:hover': { backgroundColor: '#ad1457' },
              }}
            >
              Search
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box textAlign="center">
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '50%',
                    backgroundColor: '#f8bbd9',
                    color: '#e91e63',
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Promotions du Moment Section */}
      <Box sx={{ backgroundColor: '#fff3e0', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ color: '#e65100' }}>
            🎉 Promotions du Moment
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 2 }}>
            Nos Promotions folles !!! UTIQUES OFFICIELLES
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            Découvrez nos offres exceptionnelles sur les meilleurs produits de beauté
          </Typography>

          {loading ? (
            <Box textAlign="center" py={4}>
              <Typography>Chargement des promotions...</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {promotionalProducts.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box sx={{ height: 200, cursor: 'pointer' }} onClick={() => navigate(`/products/${product._id}`)}>
                      <ProductMediaCarousel 
                        media={product.images || []} 
                        height={200}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h3">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.brand}
                      </Typography>
                      <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                        <Rating
                          value={product.rating?.average || 0}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({product.rating?.count || 0})
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" color="error" fontWeight="bold">
                          ${product.price}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                        >
                          ${product.originalPrice}
                        </Typography>
                        <Chip
                          label={`-${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%`}
                          color="error"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        Voir Détails
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleAddToCart(product)}
                        sx={{
                          backgroundColor: '#e91e63',
                          '&:hover': { backgroundColor: '#ad1457' },
                        }}
                      >
                        Ajouter
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/products')}
              sx={{
                borderColor: '#e65100',
                color: '#e65100',
                '&:hover': {
                  borderColor: '#bf360c',
                  backgroundColor: 'rgba(230, 81, 0, 0.04)',
                },
              }}
            >
              Voir Toutes les Promotions
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Best Sellers Section */}
      <Box sx={{ backgroundColor: '#f3e5f5', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ color: '#7b1fa2' }}>
            ⭐ Best Sellers
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            Nos produits les plus vendus et les mieux notés
          </Typography>

          {loading ? (
            <Box textAlign="center" py={4}>
              <Typography>Chargement des best sellers...</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {bestSellers.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box sx={{ height: 200, cursor: 'pointer' }} onClick={() => navigate(`/products/${product._id}`)}>
                      <ProductMediaCarousel 
                        media={product.images || []} 
                        height={200}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h3">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.brand}
                      </Typography>
                      <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                        <Rating
                          value={product.rating?.average || 0}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({product.rating?.count || 0})
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${product.price}
                        {product.originalPrice && (
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary' }}
                          >
                            ${product.originalPrice}
                          </Typography>
                        )}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        Voir Détails
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleAddToCart(product)}
                        sx={{
                          backgroundColor: '#e91e63',
                          '&:hover': { backgroundColor: '#ad1457' },
                        }}
                      >
                        Ajouter
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/products')}
              sx={{
                borderColor: '#7b1fa2',
                color: '#7b1fa2',
                '&:hover': {
                  borderColor: '#4a148c',
                  backgroundColor: 'rgba(123, 31, 162, 0.04)',
                },
              }}
            >
              Voir Tous les Best Sellers
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ backgroundColor: '#fafafa', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Produits Vedettes
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            Découvrez nos produits de beauté les plus populaires
          </Typography>

          {loading ? (
            <Box textAlign="center" py={4}>
              <Typography>Loading featured products...</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {featuredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box sx={{ height: 200 }}>
                      <ProductMediaCarousel 
                        media={product.images || []} 
                        height={200}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h3">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.brand}
                      </Typography>
                      <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                        <Rating
                          value={product.rating?.average || 0}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({product.rating?.count || 0})
                        </Typography>
                      </Box>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${product.price}
                        {product.originalPrice && (
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary' }}
                          >
                            ${product.originalPrice}
                          </Typography>
                        )}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleAddToCart(product)}
                        sx={{
                          backgroundColor: '#e91e63',
                          '&:hover': { backgroundColor: '#ad1457' },
                        }}
                      >
                        Add to Cart
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/products')}
              sx={{
                borderColor: '#e91e63',
                color: '#e91e63',
                '&:hover': {
                  borderColor: '#ad1457',
                  backgroundColor: 'rgba(233, 30, 99, 0.04)',
                },
              }}
            >
              View All Products
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f8bbd9 0%, #e91e63 100%)',
          color: 'white',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Start Shopping?
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, opacity: 0.9 }}>
            Join thousands of satisfied customers and discover your perfect beauty routine
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
            sx={{
              backgroundColor: 'white',
              color: '#e91e63',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
              },
            }}
          >
            Shop Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
