# BeautyStore - Cosmetic Store Web Application

A full-stack e-commerce web application for a cosmetic store built with React, Express.js, and MongoDB.

## Features

### User Features
- **Landing Page**: Beautiful homepage with featured products showcase
- **Product Browsing**: Browse products with search, filtering, and sorting
- **User Authentication**: Sign up and login functionality
- **Shopping Cart**: Add/remove products, update quantities
- **Order Management**: Place orders and track order history
- **User Profile**: Manage personal information and preferences

### Admin Features
- **Admin Dashboard**: Overview of store statistics
- **Product Management**: Add, edit, delete products with image uploads
- **Order Management**: View and update order statuses
- **User Management**: Manage customer accounts
- **Inventory Tracking**: Monitor product stock levels

## Tech Stack

### Frontend
- React 18
- Material-UI (MUI) for UI components
- React Router for navigation
- Axios for API calls
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd cosmetic-store
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/cosmetic-store
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm start
```

### 4. Database Setup
Make sure MongoDB is running on your system. The application will automatically create the necessary collections when you start using it.

## Usage

### Starting the Application

1. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

2. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm start
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Creating an Admin Account

1. Go to the registration page
2. Select "Admin" as the account type
3. Complete the registration process
4. You'll now have admin access to the admin panel

### Default Admin Account
You can also create an admin account directly in the database or through the registration form.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - Get all products (with pagination, filtering, search)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)
- `POST /api/products/:id/reviews` - Add product review

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders` - Get all orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `PUT /api/orders/:id/cancel` - Cancel order

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Project Structure

```
cosmetic-store/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── uploads/         # File uploads
│   └── index.js         # Server entry point
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── package.json
└── README.md
```

## Features in Development

- [ ] Product detail page with reviews
- [ ] Checkout process with payment integration
- [ ] Order tracking and status updates
- [ ] User profile management
- [ ] Admin dashboard with analytics
- [ ] Product image upload and management
- [ ] Email notifications
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Advanced search and filtering

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@beautystore.com or create an issue in the repository.
