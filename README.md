# E-commerce API

A RESTful API for e-commerce applications built with Node.js, Express, and Prisma.

## Features

- 🛍️ Product Management
- 🔐 User Authentication & Authorization
- 🛒 Shopping Cart Functionality
- 💳 Secure Checkout Process (via Midtrans)
- 👤 User Management
- 🔑 JWT-based Authentication
- 📊 Admin Dashboard Routes

## Tech Stack

- Node.js
- Express.js
- Prisma (ORM)
- JWT for authentication
- Bcrypt for password hashing
- Midtrans Payment Gateway (in progress..)
- CORS enabled

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm
- A running database (supported by Prisma)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nadhirdhanu/ecommerce-api.git
   cd ecommerce-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables (create a .env file):
   ```env
   DATABASE_URL="your-database-url"
   JWT_SECRET="your-jwt-secret"
   MIDTRANS_SERVER_KEY="your-midtrans-key"
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Testing

The project includes a visual testing interface for API endpoints.

1. Run the test environment:
   ```bash
   ./start-test.sh
   ```
   This will:
   - Install dependencies if needed
   - Start the API server
   - Open the test interface

2. Access the test interface at `test-frontend.html` in your browser to test various API endpoints.

## API Endpoints

### Authentication
- POST `/auth/register` - Register a new user
- POST `/auth/login` - Login user

### Products
- GET `/products` - Get all products
- GET `/products/:id` - Get single product
- POST `/products` - Create product (Admin)
- PUT `/products/:id` - Update product (Admin)
- DELETE `/products/:id` - Delete product (Admin)

### Cart
- GET `/cart` - View cart
- POST `/cart` - Add to cart
- PUT `/cart/:id` - Update cart item
- DELETE `/cart/:id` - Remove from cart

### Checkout
- POST `/checkout` - Process checkout
- GET `/checkout/status/:id` - Check payment status

### Admin
- Various admin-specific routes for managing the platform

## Project Structure

```
src/
├── app.js           # Express app configuration
├── index.js         # Application entry point
├── routes/          # API routes
├── services/        # Business logic
├── middleware/      # Custom middleware
├── utils/          # Utility functions
└── db/             # Database configuration
```

## Error Handling

The API implements centralized error handling through middleware, providing consistent error responses across all endpoints.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
