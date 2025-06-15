import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/model/user.model.js';
import Plan from '../src/model/plan.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

describe('Plan Routes Integration Tests', () => {
  let testPlan;
  let authorityToken;
  let nonAuthorityToken;
  let authorityUser;
  let regularUser;

  // Setup before tests run
  beforeAll(async () => {
    // Connect to test database
    const testDbUri = process.env.TEST_DB_URI;
    await mongoose.connect(testDbUri);
    // Clear relevant collections
    await User.deleteMany({});
    await Plan.deleteMany({});

    // Create test users
    authorityUser = new User({
      name: 'Authority User',
      email: 'authority@test.com',
      phoneNumber: '+250780111222',
      password: 'Test@123',
      role: 'authority',
    });
    await authorityUser.save();

    regularUser = new User({
      name: 'Regular User',
      email: 'regular@test.com',
      phoneNumber: '+250780333444',
      password: 'Test@123',
      role: 'transporter',
    });
    await regularUser.save();

    // Generate auth tokens
    authorityToken = jwt.sign({ id: authorityUser._id, role: authorityUser.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    nonAuthorityToken = jwt.sign({ id: regularUser._id, role: regularUser.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Create a test plan
    testPlan = new Plan({
      date: new Date(),
      destinations: ['Kigali', 'Huye'],
    });
    await testPlan.save();
  });

  // Clean up after tests
  afterAll(async () => {
    await User.deleteMany({});
    await Plan.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/v1/plans', () => {
    it('should get all plans', async () => {
      const response = await request(app).get('/api/v1/plans');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/plans/:id', () => {
    it('should get a plan by id', async () => {
      const response = await request(app).get(`/api/v1/plans/${testPlan._id}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testPlan._id.toString());
      expect(response.body.destinations).toEqual(expect.arrayContaining(['Kigali', 'Huye']));
    });

    it('should return 404 if plan not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/v1/plans/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Travel plan not found');
    });
  });

  describe('POST /api/v1/plans', () => {
    it('should create a new plan when user is authority', async () => {
      const newPlan = {
        date: new Date().toISOString(),
        destinations: ['Rubavu', 'Musanze'],
      };

      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${authorityToken}`)
        .send(newPlan);

      expect(response.status).toBe(201);
      expect(response.body.destinations).toEqual(expect.arrayContaining(['Rubavu', 'Musanze']));

      // Verify plan was created in database
      const createdPlan = await Plan.findById(response.body._id);
      expect(createdPlan).toBeTruthy();
      expect(createdPlan.destinations).toEqual(expect.arrayContaining(['Rubavu', 'Musanze']));
    });

    it('should return 401 if no token provided', async () => {
      const newPlan = {
        date: new Date().toISOString(),
        destinations: ['Nyagatare', 'Gatsibo'],
      };

      const response = await request(app).post('/api/v1/plans').send(newPlan);

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not authority', async () => {
      const newPlan = {
        date: new Date().toISOString(),
        destinations: ['Nyagatare', 'Gatsibo'],
      };

      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${nonAuthorityToken}`)
        .send(newPlan);

      expect(response.status).toBe(403);
    });

    it('should return 400 if request body is invalid', async () => {
      const invalidPlan = {
        // Missing required date field
        destinations: ['Nyagatare', 'Gatsibo'],
      };

      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${authorityToken}`)
        .send(invalidPlan);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/plans/:id', () => {
    it('should delete a plan when user is authority', async () => {
      // Create a plan to delete
      const planToDelete = new Plan({
        date: new Date(),
        destinations: ['Cyangugu', 'Kibuye'],
      });
      await planToDelete.save();

      const response = await request(app)
        .delete(`/api/v1/plans/${planToDelete._id}`)
        .set('Authorization', `Bearer ${authorityToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Plan deleted');

      // Verify plan was deleted from database
      const deletedPlan = await Plan.findById(planToDelete._id);
      expect(deletedPlan).toBeNull();
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app).delete(`/api/v1/plans/${testPlan._id}`);

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not authority', async () => {
      const response = await request(app)
        .delete(`/api/v1/plans/${testPlan._id}`)
        .set('Authorization', `Bearer ${nonAuthorityToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 if plan not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/plans/${nonExistentId}`)
        .set('Authorization', `Bearer ${authorityToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Travel plan not found');
    });
  });
});
