import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
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
  Switch,
  FormControlLabel,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  Inventory,
  TrendingDown,
  CloudUpload,
  Image,
  VideoFile,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { productsAPI } from '../../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    stock: '',
    sku: '',
    features: '',
    ingredients: '',
    size: '',
    weight: '',
    color: '',
    isActive: true,
    isFeatured: false,
    tags: '',
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  const categories = [
    'skincare',
    'makeup',
    'haircare',
    'fragrance',
    'tools',
    'accessories'
  ];

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter, stockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const response = await productsAPI.getProducts(params);
      let productsData = response.data.products || response.data;

      // Apply stock filter on frontend
      if (stockFilter === 'low') {
        productsData = productsData.filter(product => product.stock < 10);
      } else if (stockFilter === 'out') {
        productsData = productsData.filter(product => product.stock === 0);
      }

      setProducts(productsData);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        category: product.category || '',
        brand: product.brand || '',
        stock: product.stock || '',
        sku: product.sku || '',
        features: product.features?.join(', ') || '',
        ingredients: product.ingredients?.join(', ') || '',
        size: product.size || '',
        weight: product.weight || '',
        color: product.color || '',
        isActive: product.isActive !== false,
        isFeatured: product.isFeatured || false,
        tags: product.tags?.join(', ') || '',
      });
      
      // Load existing primary image into preview state
      if (product.images && product.images.length > 0) {
        setImagePreviewUrl(product.images[0].url);
      } else {
        setImagePreviewUrl('');
      }
      setSelectedImageFile(null); // No file object for existing images unless re-uploaded
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        brand: '',
        stock: '',
        sku: '',
        features: '',
        ingredients: '',
        size: '',
        weight: '',
        color: '',
        isActive: true,
        isFeatured: false,
        tags: '',
      });
      setSelectedImageFile(null);
      setImagePreviewUrl('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setSelectedImageFile(null);
    setImagePreviewUrl('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl(editingProduct?.images?.[0]?.url || ''); // Revert to existing if available
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productFormData = new FormData();

      // Append all form data fields
      Object.keys(formData).forEach(key => {
        // Handle array fields (features, ingredients, tags)
        if (['features', 'ingredients', 'tags'].includes(key)) {
          productFormData.append(key, formData[key] ? formData[key].split(',').map(f => f.trim()).filter(Boolean).join(',') : '');
        } else if (key === 'price' || key === 'originalPrice' || key === 'stock') {
          productFormData.append(key, parseFloat(formData[key]) || '');
        } else {
          productFormData.append(key, formData[key]);
        }
      });

      // Append the selected image file
      if (selectedImageFile) {
        productFormData.append('image', selectedImageFile);
      } else if (editingProduct && imagePreviewUrl && !imagePreviewUrl.startsWith('blob:')) {
        // If no new file selected but there's an existing image URL, we might need to send it
        // to ensure it's not removed if the backend expects an 'image' field to always be present.
        // However, with `multer.single('image')`, if no file is sent, req.file will be undefined.
        // The backend should handle update gracefully if no new image is provided.
        // For now, we only send 'image' if a new file is selected.
        // To keep existing images without re-uploading, the backend `products.js` needs to be robust.
        // Our current backend `products.js` handles this by only processing `req.file` if it exists.
      }

      console.log('Submitting product FormData:', productFormData);
      
      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct._id, productFormData);
      } else {
        await productsAPI.createProduct(productFormData);
      }

      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      setError('Failed to save product: ' + (err.response?.data?.message || err.message));
      console.error('Error saving product:', err);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.deleteProduct(productId);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'error' };
    if (stock < 10) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
  };

  if (loading && products.length === 0) {
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
            Manage Products
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Add, edit, and manage your product inventory
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#e91e63', '&:hover': { backgroundColor: '#ad1457' } }}
        >
          Add Product
        </Button>
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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={stockFilter}
                label="Stock Status"
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <MenuItem value="all">All Stock</MenuItem>
                <MenuItem value="low">Low Stock</MenuItem>
                <MenuItem value="out">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={fetchProducts}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <TableRow key={product._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <CardMedia
                        component="img"
                        sx={{ width: 50, height: 50, mr: 2, borderRadius: 1 }}
                        image={product.images?.[0]?.url || '/placeholder-image.jpg'}
                        alt={product.name}
                      />
                      <Box>
                        <Typography variant="subtitle2" noWrap>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.brand}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.category}
                      size="small"
                      sx={{
                        backgroundColor: '#f8bbd9',
                        color: '#e91e63',
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
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
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {product.stock}
                      </Typography>
                      {product.stock < 10 && (
                        <Tooltip title="Low Stock">
                          <TrendingDown color="warning" fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={stockStatus.label}
                      size="small"
                      color={stockStatus.color}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.isFeatured ? 'Yes' : 'No'}
                      size="small"
                      color={product.isFeatured ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="info">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Product">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(product._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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

      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Original Price (Optional)"
                  name="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleInputChange}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Features (comma-separated)"
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="e.g., Cruelty-free, Vegan, Paraben-free"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ingredients (comma-separated)"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleInputChange}
                  placeholder="e.g., Hyaluronic Acid, Vitamin C, Retinol"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma-separated)"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., bestseller, new, limited-edition"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Product Media
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    onChange={handleImageFileChange}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      disabled={false} // No longer 'uploading' in a separate step
                      sx={{ mb: 2 }}
                    >
                      {selectedImageFile ? 'Change Image' : 'Upload Image'}
                    </Button>
                  </label>
                  {imagePreviewUrl && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <img
                        src={imagePreviewUrl}
                        alt="Product Preview"
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '1px solid #ddd'
                        }}
                      />
                      <Typography variant="body2">{selectedImageFile?.name || 'Existing Image'}</Typography>
                      <IconButton size="small" color="error" onClick={() => {
                        setSelectedImageFile(null);
                        setImagePreviewUrl('');
                        // Clear the file input visually as well
                        const fileInput = document.getElementById('file-upload');
                        if (fileInput) fileInput.value = '';
                      }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                    Upload a single product image (JPG, PNG).
                  </Typography>
                </Box>

                {/* Display uploaded files */}
                {/* Removed multi-file display logic */}
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        name="isActive"
                      />
                    }
                    label="Active"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        name="isFeatured"
                      />
                    }
                    label="Featured"
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default AdminProducts;
