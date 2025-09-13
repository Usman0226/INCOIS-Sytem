# INCOIS System Backend

A Node.js backend application for user authentication with OTP verification.

## Features

- User registration with phone number
- OTP-based authentication
- JWT token-based authorization
- MongoDB database integration
- Protected routes with middleware

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/incois-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
```

3. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body**: `{ "name": "John Doe", "phone": "1234567890" }`
- **Response**: Returns OTP (in development) or success message

#### Verify OTP
- **POST** `/api/auth/verify-otp`
- **Body**: `{ "phone": "1234567890", "otp": "123456" }`
- **Response**: Returns JWT token and user data

#### Resend OTP
- **POST** `/api/auth/resend-otp`
- **Body**: `{ "phone": "1234567890" }`
- **Response**: Returns new OTP (in development)

#### Get User Profile (Protected)
- **GET** `/api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Returns user profile data

### Health Check

#### Server Status
- **GET** `/health`
- **Response**: Returns server status and timestamp

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Server port (default: 3000)

## Database Schema

### User Model
```javascript
{
  name: String (required),
  phone: String (required, unique),
  otp: String,
  otpExpires: Date,
  isVerified: Boolean (default: false),
  createdAt: Date
}
```

## Security Notes

- OTP expires after 10 minutes
- JWT tokens expire after 7 days
- In production, implement proper SMS service for OTP delivery
- Use strong JWT secrets in production
- Implement rate limiting for OTP requests
