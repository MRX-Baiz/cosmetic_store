const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
require('dotenv').config();

const viewData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmetic-store');
    console.log('Connected to MongoDB\n');

    // View Users
    console.log('👥 USERS:');
    console.log('='.repeat(50));
    const users = await User.find({}).select('-password');
    console.log(`Total Users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log('');
    });

    // View Products
    console.log('\n🛍️  PRODUCTS:');
    console.log('='.repeat(50));
    const products = await Product.find({});
    console.log(`Total Products: ${products.length}`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price}`);
      console.log(`   Brand: ${product.brand} | Category: ${product.category}`);
      console.log(`   Stock: ${product.stock} | Featured: ${product.isFeatured ? 'Yes' : 'No'}`);
      console.log(`   Rating: ${product.rating?.average || 0}/5 (${product.rating?.count || 0} reviews)`);
      console.log('');
    });

    // View Orders
    console.log('\n📦 ORDERS:');
    console.log('='.repeat(50));
    const orders = await Order.find({}).populate('user', 'name email').populate('items.product', 'name');
    console.log(`Total Orders: ${orders.length}`);
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order.orderNumber}`);
      console.log(`   Customer: ${order.user?.name} (${order.user?.email})`);
      console.log(`   Status: ${order.orderStatus} | Payment: ${order.paymentStatus}`);
      console.log(`   Total: $${order.total} | Items: ${order.items.length}`);
      console.log(`   Created: ${order.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    console.log(`👥 Total Users: ${users.length}`);
    console.log(`👑 Admin Users: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`👤 Regular Users: ${users.filter(u => u.role === 'user').length}`);
    console.log(`🛍️  Total Products: ${products.length}`);
    console.log(`⭐ Featured Products: ${products.filter(p => p.isFeatured).length}`);
    console.log(`📦 Total Orders: ${orders.length}`);
    console.log(`💰 Total Revenue: $${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error viewing data:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the script
viewData();

