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

### Complete API Reference Table

| Method | Endpoint | Description | Authentication | Request Body | Response |
|--------|----------|-------------|----------------|--------------|----------|
| POST | `/api/auth/user/register` | Register a new user with phone number | No | `{ "name": "string", "phone": "string" }` | `{ "message": "string", "phone": "string", "otp": "string" }` |
| POST | `/api/auth/verify-otp` | Verify OTP for user registration | No | `{ "phone": "string", "otp": "string" }` | `{ "message": "string", "user": "object", "token": "string" }` |
| POST | `/api/auth/resend-otp` | Resend OTP to user's phone | No | `{ "phone": "string" }` | `{ "message": "string", "phone": "string" }` |
| POST | `/api/auth/user/login` | Login existing user | No | `{ "phone": "string" }` | `{ "message": "string" }` |
| POST | `/auth/authority/login` | Login for authorities/scientists | No | `{ "email": "string", "password": "string" }` | `{ "message": "string" }` |
| POST | `/auth/auth/register` | Register new scientist/authority | No | `{ "name": "string", "email": "string", "password": "string", "organization": "string" }` | `{ "message": "string" }` |
| POST | `/user/submit/report` | Submit incident report | Yes (JWT) | `{ "text": "string", "image_url": "string", "video_url": "string", "lat": "number", "lon": "number" }` | `{ "message": "string", "data": "object" }` |

### Authentication Endpoints

#### User Registration & Verification
- **POST** `/api/auth/user/register` - Register a new user with phone number
- **POST** `/api/auth/verify-otp` - Verify OTP for user registration  
- **POST** `/api/auth/resend-otp` - Resend OTP to user's phone
- **POST** `/api/auth/user/login` - Login existing user

#### Authority/Scientist Authentication
- **POST** `/auth/authority/login` - Login for authorities/scientists
- **POST** `/auth/auth/register` - Register new scientist/authority

### Protected Endpoints

#### Report Submission
- **POST** `/user/submit/report` - Submit incident report (Rate limited: 5 requests per 10 minutes)

### Request/Response Examples

#### User Registration
```bash
POST /api/auth/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "1234567890"
}
```

#### OTP Verification
```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "1234567890",
  "otp": "123456"
}
```

#### Report Submission
```bash
POST /user/submit/report
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "text": "Incident description",
  "image_url": "https://example.com/image.jpg",
  "video_url": "https://example.com/video.mp4",
  "lat": 12.9716,
  "lon": 77.5946
}
```

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
