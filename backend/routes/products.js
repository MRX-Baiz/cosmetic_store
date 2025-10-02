const express = require('express');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const cloudinary = require('../config/cloudinaryConfig');
const multer = require('multer');

const router = express.Router();

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, sort = 'createdAt' } = req.query;
    const query = { isActive: true };

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add search filter
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .sort(sort === 'price-low' ? { price: 1 } : 
            sort === 'price-high' ? { price: -1 } : 
            sort === 'rating' ? { 'rating.average': -1 } : 
            { createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('reviews.user', 'name');

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .limit(8)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('Create product request received');
    console.log('*** Backend Product Create - Initial Request Data ***');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    const productData = req.body;
    
    // Handle image upload if a new image is provided
    if (req.file) {
      console.log('Image file received:', req.file.originalname, req.file.mimetype);
      try {
        const result = await cloudinary.uploader.upload(req.file.buffer.toString('base64'), {
          folder: 'cosmetic-store-products',
        });
        console.log('Cloudinary upload result:', result);
        // Ensure images is an array before pushing
        if (!productData.images) {
          productData.images = [];
        }
        productData.images.push({ url: result.secure_url, alt: productData.name || 'Product Image', type: 'image' });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        // Optionally, handle this error more gracefully, e.g., send a client-side error
      }
    }
    
    console.log('Product data after image processing:', productData);
    const product = new Product(productData);
    await product.save();

    console.log('Product created successfully:', product);
    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('*** Backend Product Update - Initial Request Data ***');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    const productData = req.body;
    
    // Handle image upload if a new image is provided
    if (req.file) {
      console.log('Image file received for update:', req.file.originalname, req.file.mimetype);
      try {
        const result = await cloudinary.uploader.upload(req.file.buffer.toString('base64'), {
          folder: 'cosmetic-store-products',
        });
        console.log('Cloudinary update upload result:', result);
        // To update, we replace the first image or add a new one if no images exist
        if (!productData.images) {
          productData.images = [];
        }
        if (productData.images.length > 0) {
          productData.images[0] = { url: result.secure_url, alt: productData.name || 'Product Image', type: 'image' };
        } else {
          productData.images.push({ url: result.secure_url, alt: productData.name || 'Product Image', type: 'image' });
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary update upload error:', cloudinaryError);
        // Optionally, handle this error more gracefully
      }
    }
    
    console.log('Product data after image processing for update:', productData);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review (authenticated users)
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add review
    product.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    // Update rating average
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating.average = totalRating / product.reviews.length;
    product.rating.count = product.reviews.length;

    await product.save();

    res.status(201).json({
      message: 'Review added successfully',
      review: product.reviews[product.reviews.length - 1]
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
