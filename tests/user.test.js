import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User, Transporter, School } from '../src/model/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

describe('User Routes Integration Tests', () => {
  let adminToken;
  let transporterToken;
  let schoolToken;
  let authorityToken;
  let adminId;
  let transporterId;
  let schoolId;
  let authorityId;

  beforeEach(async () => {
    // Create test users with unique emails
    const timestamp = Date.now();

    // Create admin user
    const admin = new User({
      name: 'Test Admin',
      email: `admin${timestamp}@test.com`,
      phoneNumber: `+250780000${timestamp}`,
      password: 'Test@123',
      role: 'admin',
    });
    await admin.save();
    adminId = admin._id;

    // Create transporter user
    const transporter = new Transporter({
      name: 'Test Transporter',
      email: `transporter${timestamp}@test.com`,
      phoneNumber: `+250780001${timestamp}`,
      password: 'Test@123',
      role: 'transporter',
      areaOfOperations: ['Huye', 'Musanze', 'Rwamagana'],
    });
    await transporter.save();
    transporterId = transporter._id;

    // Create school user
    const school = new School({
      name: 'Test School',
      email: `school${timestamp}@test.com`,
      phoneNumber: `+250780002${timestamp}`,
      password: 'Test@123',
      role: 'school',
      district: 'Kigali',
      sector: 'Gasabo',
      cell: 'Kacyiru',
      village: 'Kacyiru',
    });
    await school.save();
    schoolId = school._id;

    // Create authority user
    const authority = new User({
      name: 'Test Authority',
      email: `authority${timestamp}@test.com`,
      phoneNumber: `+250780003${timestamp}`,
      password: 'Test@123',
      role: 'authority',
    });
    await authority.save();
    authorityId = authority._id;

    // Generate auth tokens
    const adminRes = await request(app).post('/api/v1/auth/signin').send({
      email: admin.email,
      password: 'Test@123',
    });
    adminToken = adminRes.body.token;

    const transporterRes = await request(app).post('/api/v1/auth/signin').send({
      email: transporter.email,
      password: 'Test@123',
    });
    transporterToken = transporterRes.body.token;

    const schoolRes = await request(app).post('/api/v1/auth/signin').send({
      email: school.email,
      password: 'Test@123',
    });
    schoolToken = schoolRes.body.token;

    const authorityRes = await request(app).post('/api/v1/auth/signin').send({
      email: authority.email,
      password: 'Test@123',
    });
    authorityToken = authorityRes.body.token;
  });

  // Clean up after tests
  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/v1/users', () => {
    it('should get all users when authenticated as admin', async () => {
      const response = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app).get('/api/v1/users');
      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      // Test with transporter token
      const transporterResponse = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${transporterToken}`);
      expect(transporterResponse.status).toBe(403);

      // Test with school token
      const schoolResponse = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${schoolToken}`);
      expect(schoolResponse.status).toBe(403);

      // Test with authority token
      const authorityResponse = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authorityToken}`);
      expect(authorityResponse.status).toBe(403);
    });

    it('should return 401 if token is invalid', async () => {
      const response = await request(app).get('/api/v1/users').set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user when authenticated as admin', async () => {
      const timestamp = Date.now();
      const newUser = {
        name: 'New User',
        email: `new${timestamp}@test.com`,
        phoneNumber: `+250780777${timestamp}`,
        password: 'Test@123',
        role: 'school',
        district: 'Kigali',
        sector: 'Gasabo',
        cell: 'Kacyiru',
        village: 'Kacyiru',
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newUser.name);
      expect(response.body.email).toBe(newUser.email);
      expect(response.body.role).toBe(newUser.role);

      // Verify user was created in database
      const createdUser = await User.findOne({ email: newUser.email });
      expect(createdUser).toBeTruthy();
      expect(createdUser.name).toBe(newUser.name);
    });

    it('should return 401 if no token provided', async () => {
      const timestamp = Date.now();
      const newUser = {
        name: 'New User',
        email: `new2${timestamp}@test.com`,
        phoneNumber: `+250780999${timestamp}`,
        password: 'Test@123',
        role: 'school',
        district: 'Kigali',
        sector: 'Gasabo',
        cell: 'Kacyiru',
        village: 'Kacyiru',
      };

      const response = await request(app).post('/api/v1/users').send(newUser);
      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      const timestamp = Date.now();
      const newUser = {
        name: 'New User',
        email: `new3${timestamp}@test.com`,
        phoneNumber: `+250780111${timestamp}`,
        password: 'Test@123',
        role: 'school',
        district: 'Kigali',
        sector: 'Gasabo',
        cell: 'Kacyiru',
        village: 'Kacyiru',
      };

      // Test with transporter token
      const transporterResponse = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${transporterToken}`)
        .send(newUser);
      expect(transporterResponse.status).toBe(403);

      // Test with school token
      const schoolResponse = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${schoolToken}`)
        .send(newUser);
      expect(schoolResponse.status).toBe(403);

      // Test with authority token
      const authorityResponse = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authorityToken}`)
        .send(newUser);
      expect(authorityResponse.status).toBe(403);
    });

    it('should return 401 if token is invalid', async () => {
      const timestamp = Date.now();
      const newUser = {
        name: 'New User',
        email: `new4${timestamp}@test.com`,
        phoneNumber: `+250780222${timestamp}`,
        password: 'Test@123',
        role: 'school',
        district: 'Kigali',
        sector: 'Gasabo',
        cell: 'Kacyiru',
        village: 'Kacyiru',
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', 'Bearer invalid-token')
        .send(newUser);
      expect(response.status).toBe(401);
    });

    it('should return 400 if request body is invalid', async () => {
      const invalidUser = {
        // Missing required fields
        name: 'Invalid User',
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUser);

      expect(response.status).toBe(400);
    });

    it('should return 400 if email already exists', async () => {
      const timestamp = Date.now();
      const existingEmail = `existing${timestamp}@test.com`;

      // Create a user first
      const existingUser = new User({
        name: 'Existing User',
        email: existingEmail,
        phoneNumber: `+250780333${timestamp}`,
        password: 'Test@123',
        role: 'school',
        district: 'Kigali',
        sector: 'Gasabo',
        cell: 'Kacyiru',
        village: 'Kacyiru',
      });
      await existingUser.save();

      // Try to create another user with the same email
      const newUser = {
        name: 'New User',
        email: existingEmail,
        phoneNumber: `+250780444${timestamp}`,
        password: 'Test@123',
        role: 'school',
        district: 'Kigali',
        sector: 'Gasabo',
        cell: 'Kacyiru',
        village: 'Kacyiru',
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email already exists');
    });
  });
});
