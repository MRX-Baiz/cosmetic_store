import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  ShoppingCart,
  People,
  Inventory,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  LocalShipping,
  CheckCircle,
  Pending,
  Cancel,
  Add,
  Edit,
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productsAPI, ordersAPI, usersAPI } from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        productsResponse,
        ordersResponse,
        usersResponse,
        recentOrdersResponse,
        recentUsersResponse,
      ] = await Promise.all([
        productsAPI.getProducts({ limit: 1000 }),
        ordersAPI.getAllOrders({ limit: 1000 }),
        usersAPI.getUsers({ limit: 1000 }),
        ordersAPI.getAllOrders({ limit: 5 }),
        usersAPI.getUsers({ limit: 5 }),
      ]);

      const products = productsResponse.data.products || productsResponse.data;
      const orders = ordersResponse.data.orders || ordersResponse.data;
      const users = usersResponse.data.users || usersResponse.data;

      // Calculate statistics
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter(order => 
        ['pending', 'confirmed', 'processing'].includes(order.orderStatus)
      ).length;
      const lowStockProducts = products.filter(product => product.stock < 10);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalRevenue,
        pendingOrders,
        lowStockProducts: lowStockProducts.length,
      });

      setRecentOrders(recentOrdersResponse.data.orders || recentOrdersResponse.data);
      setRecentUsers(recentUsersResponse.data.users || recentUsersResponse.data);
      setLowStockProducts(lowStockProducts);

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
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

  if (loading) {
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
            Admin Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Welcome back! Here's what's happening with your store.
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchDashboardData} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalProducts}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Inventory />
                </Avatar>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/admin/products')}>
                Manage
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalOrders}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <ShoppingCart />
                </Avatar>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/admin/orders')}>
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalUsers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/admin/users')}>
                Manage
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${stats.totalRevenue.toFixed(2)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Orders
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.pendingOrders}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <Pending />
                </Avatar>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/admin/orders?status=pending')}>
                Review
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Low Stock
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.lowStockProducts}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light' }}>
                  <TrendingDown />
                </Avatar>
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/admin/products')}>
                Restock
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin/products')}
              sx={{ backgroundColor: '#e91e63', '&:hover': { backgroundColor: '#ad1457' } }}
            >
              Add Product
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate('/admin/products')}
            >
              Manage Products
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => navigate('/admin/orders')}
            >
              View Orders
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<People />}
              onClick={() => navigate('/admin/users')}
            >
              Manage Users
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Orders</Typography>
              <Button size="small" onClick={() => navigate('/admin/orders')}>
                View All
              </Button>
            </Box>
            <List>
              {recentOrders.slice(0, 5).map((order, index) => (
                <React.Fragment key={order._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {getStatusIcon(order.orderStatus)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Order #${order.orderNumber}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {order.user?.name || 'Unknown User'} • ${order.total}
                          </Typography>
                          <Chip
                            label={order.orderStatus}
                            size="small"
                            color={getStatusColor(order.orderStatus)}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentOrders.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Users</Typography>
              <Button size="small" onClick={() => navigate('/admin/users')}>
                View All
              </Button>
            </Box>
            <List>
              {recentUsers.slice(0, 5).map((user, index) => (
                <React.Fragment key={user._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                          <Chip
                            label={user.role}
                            size="small"
                            color={user.role === 'admin' ? 'primary' : 'default'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentUsers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            ⚠️ Low Stock Alert
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The following products are running low on stock:
          </Typography>
          <Grid container spacing={1}>
            {lowStockProducts.slice(0, 6).map((product) => (
              <Grid item key={product._id}>
                <Chip
                  label={`${product.name} (${product.stock} left)`}
                  size="small"
                  sx={{ bgcolor: 'white', color: 'error.main' }}
                />
              </Grid>
            ))}
          </Grid>
          {lowStockProducts.length > 6 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              ...and {lowStockProducts.length - 6} more products
            </Typography>
          )}
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 2, bgcolor: 'white', color: 'error.main' }}
            onClick={() => navigate('/admin/products')}
          >
            Manage Stock
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default AdminDashboard;
