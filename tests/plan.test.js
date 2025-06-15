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
  let adminToken;
  let transporterToken;
  let schoolToken;
  let authorityUser;
  let adminUser;
  let transporterUser;
  let schoolUser;
  const validDestinations = ['Huye', 'Musanze', 'Rwamagana', 'Kayonza', 'Ngoma'];

  beforeEach(async () => {
    // Create test users with unique emails
    const timestamp = Date.now();

    // Create authority user
    authorityUser = new User({
      name: 'Authority User',
      email: `authority${timestamp}@test.com`,
      phoneNumber: `+250780111${timestamp}`,
      password: 'Test@123',
      role: 'authority',
    });
    await authorityUser.save();

    // Create admin user
    adminUser = new User({
      name: 'Admin User',
      email: `admin${timestamp}@test.com`,
      phoneNumber: `+250780222${timestamp}`,
      password: 'Test@123',
      role: 'admin',
    });
    await adminUser.save();

    // Create transporter user
    transporterUser = new User({
      name: 'Transporter User',
      email: `transporter${timestamp}@test.com`,
      phoneNumber: `+250780333${timestamp}`,
      password: 'Test@123',
      role: 'transporter',
    });
    await transporterUser.save();

    // Create school user
    schoolUser = new User({
      name: 'School User',
      email: `school${timestamp}@test.com`,
      phoneNumber: `+250780444${timestamp}`,
      password: 'Test@123',
      role: 'school',
    });
    await schoolUser.save();

    // Generate auth tokens
    const authorityRes = await request(app).post('/api/v1/auth/signin').send({
      email: authorityUser.email,
      password: 'Test@123',
    });
    authorityToken = authorityRes.body.token;

    const adminRes = await request(app).post('/api/v1/auth/signin').send({
      email: adminUser.email,
      password: 'Test@123',
    });
    adminToken = adminRes.body.token;

    const transporterRes = await request(app).post('/api/v1/auth/signin').send({
      email: transporterUser.email,
      password: 'Test@123',
    });
    transporterToken = transporterRes.body.token;

    const schoolRes = await request(app).post('/api/v1/auth/signin').send({
      email: schoolUser.email,
      password: 'Test@123',
    });
    schoolToken = schoolRes.body.token;

    // Create a test plan with valid destinations
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    testPlan = new Plan({
      date: today,
      destinations: [validDestinations[0], validDestinations[1]], // Huye and Musanze
    });
    await testPlan.save();
  });

  describe('GET /api/v1/plans', () => {
    it('should get all plans without authentication', async () => {
      const response = await request(app).get('/api/v1/plans');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].destinations).toEqual(
        expect.arrayContaining([validDestinations[0], validDestinations[1]])
      );
    });
  });

  describe('GET /api/v1/plans/:id', () => {
    it('should get a plan by id without authentication', async () => {
      const response = await request(app).get(`/api/v1/plans/${testPlan._id}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testPlan._id.toString());
      expect(response.body.destinations).toEqual(expect.arrayContaining([validDestinations[0], validDestinations[1]]));
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
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day
      const newPlan = {
        date: today.toISOString(),
        destinations: [validDestinations[2], validDestinations[3]], // Rwamagana and Kayonza
      };

      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${authorityToken}`)
        .send(newPlan);

      expect(response.status).toBe(201);
      expect(response.body.destinations).toEqual(expect.arrayContaining([validDestinations[2], validDestinations[3]]));

      // Verify plan was created in database
      const createdPlan = await Plan.findById(response.body._id);
      expect(createdPlan).toBeTruthy();
      expect(createdPlan.destinations).toEqual(expect.arrayContaining([validDestinations[2], validDestinations[3]]));
    });

    it('should return 401 if no token provided', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newPlan = {
        date: today.toISOString(),
        destinations: [validDestinations[0], validDestinations[1]],
      };

      const response = await request(app).post('/api/v1/plans').send(newPlan);

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not authority', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newPlan = {
        date: today.toISOString(),
        destinations: [validDestinations[0], validDestinations[1]],
      };

      // Test with admin token
      const adminResponse = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPlan);
      expect(adminResponse.status).toBe(403);

      // Test with transporter token
      const transporterResponse = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${transporterToken}`)
        .send(newPlan);
      expect(transporterResponse.status).toBe(403);

      // Test with school token
      const schoolResponse = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${schoolToken}`)
        .send(newPlan);
      expect(schoolResponse.status).toBe(403);
    });

    it('should return 401 if token is invalid', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newPlan = {
        date: today.toISOString(),
        destinations: [validDestinations[0], validDestinations[1]],
      };

      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', 'Bearer invalid-token')
        .send(newPlan);

      expect(response.status).toBe(401);
    });

    it('should return 400 if request body is invalid', async () => {
      const invalidPlan = {
        // Missing required date field
        destinations: [validDestinations[0], validDestinations[1]],
      };

      const response = await request(app)
        .post('/api/v1/plans')
        .set('Authorization', `Bearer ${authorityToken}`)
        .send(invalidPlan);

      expect(response.status).toBe(400);
    });

    it('should return 400 if destinations are invalid', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const invalidPlan = {
        date: today.toISOString(),
        destinations: ['InvalidDestination', 'AnotherInvalid'],
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const planToDelete = new Plan({
        date: today,
        destinations: [validDestinations[0], validDestinations[1]],
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
      // Test with admin token
      const adminResponse = await request(app)
        .delete(`/api/v1/plans/${testPlan._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminResponse.status).toBe(403);

      // Test with transporter token
      const transporterResponse = await request(app)
        .delete(`/api/v1/plans/${testPlan._id}`)
        .set('Authorization', `Bearer ${transporterToken}`);
      expect(transporterResponse.status).toBe(403);

      // Test with school token
      const schoolResponse = await request(app)
        .delete(`/api/v1/plans/${testPlan._id}`)
        .set('Authorization', `Bearer ${schoolToken}`);
      expect(schoolResponse.status).toBe(403);
    });

    it('should return 401 if token is invalid', async () => {
      const response = await request(app)
        .delete(`/api/v1/plans/${testPlan._id}`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
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
