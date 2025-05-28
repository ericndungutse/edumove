# EduMove

A Node.js backend application for managing educational movement and transportation services.

## Description

EduMove is a RESTful API service built with Express.js and MongoDB, designed to facilitate educational transportation management. The application handles user authentication, payment processing, and various educational transportation-related operations.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- PayPack for payment processing
- Resend for email services
- Express Validator for input validation
- CORS enabled

## Project Structure

```
edumove/
├── src/
│   ├── app.js           # Express app configuration
│   ├── server.js        # Server entry point
│   ├── controller/      # Route controllers
│   ├── model/          # MongoDB models
│   ├── routes/         # API routes
│   ├── middlewares/    # Custom middleware functions
│   └── utils/          # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance
- PayPack account (for payments)
- Resend account (for emails)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd edumove
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```
   - Update the values in `.env` with your actual configuration:
   ```
   PORT=<your-port>
   MONGODB_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   PAYPACK_API_KEY=<your-paypack-api-key>
   RESEND_API_KEY=<your-resend-api-key>
   ```

### Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```
