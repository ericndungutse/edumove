import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User, Transporter, School } from '../src/model/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

describe('Auth Routes', () => {
  // Setup before tests run
  beforeAll(async () => {
    console.log('RUNNING AUTH ROUTES INTEGRATION TESTS');

    // Connect to test database
    const dbUrl = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/edumove_test';
    await mongoose.connect(dbUrl);

    // Clear users collection
    await User.deleteMany({});
    await Transporter.deleteMany({});
    await School.deleteMany({});

    // Create test users for auth tests
    await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!',
      phoneNumber: '+250780000000',
      role: 'user',
    });

    await Transporter.create({
      name: 'Test Transporter',
      email: 'transporter@example.com',
      password: 'Password123!',
      phoneNumber: '+250780000001',
      areaOfOperations: ['Kigali', 'Huye'],
    });

    await School.create({
      name: 'Test School',
      email: 'school@example.com',
      password: 'Password123!',
      phoneNumber: '+250780000002',
      district: 'Gasabo',
      sector: 'Kacyiru',
      cell: 'Kamatamu',
      village: 'Kamutwa',
    });
  }, 30000); // Increase timeout to 30 seconds

  // Clean up after tests
  afterAll(async () => {
    await User.deleteMany({});
    await Transporter.deleteMany({});
    await School.deleteMany({});
    await mongoose.connection.close();
  });

  // Login tests
  describe('POST /api/v1/auth/signin', () => {
    it('should login a regular user with valid credentials', async () => {
      const credentials = {
        email: 'testuser@example.com',
        password: 'Password123!',
      };

      const response = await request(app).post('/api/v1/auth/signin').send(credentials);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', credentials.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should login a transporter with valid credentials', async () => {
      const credentials = {
        email: 'transporter@example.com',
        password: 'Password123!',
      };

      const response = await request(app).post('/api/v1/auth/signin').send(credentials);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('token');
      expect(response.body.data.user.role).toBe('transporter');
    });

    it('should login a school with valid credentials', async () => {
      const credentials = {
        email: 'school@example.com',
        password: 'Password123!',
      };

      const response = await request(app).post('/api/v1/auth/signin').send(credentials);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('token');
      expect(response.body.data.user.role).toBe('school');
    });

    it('should return 401 with invalid credentials', async () => {
      const invalidCredentials = {
        email: 'testuser@example.com',
        password: 'WrongPassword123!',
      };

      const response = await request(app).post('/api/v1/auth/signin').send(invalidCredentials);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Email or password is incorrect');
    });

    it('should return 400 if email or password is missing', async () => {
      const incompleteCredentials = {
        email: 'testuser@example.com',
        // Missing password
      };

      const response = await request(app).post('/api/v1/auth/signin').send(incompleteCredentials);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 if user does not exist', async () => {
      const nonExistentUser = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      const response = await request(app).post('/api/v1/auth/signin').send(nonExistentUser);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });
  });
});
