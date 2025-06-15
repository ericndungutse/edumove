import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User, Transporter } from '../src/model/user.model.js';
import Plan from '../src/model/plan.model.js';
import Schedule from '../src/model/schedule.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

describe('Schedule Routes Integration Tests', () => {
  let testPlan;
  let testSchedule;
  let transporterToken;
  let adminToken;
  let authorityToken;
  let schoolToken;
  let transporterUser;
  let adminUser;
  let authorityUser;
  let schoolUser;
  const validDestinations = ['Huye', 'Musanze', 'Rwamagana', 'Kayonza', 'Ngoma'];

  // Setup before tests run
  beforeAll(async () => {
    // Connect to test database
    const testDbUri = process.env.TEST_DB_URI;
    await mongoose.connect(testDbUri);
  });

  // Clean up before each test
  beforeEach(async () => {
    // Clear relevant collections
    await User.deleteMany({});
    await Plan.deleteMany({});
    await Schedule.deleteMany({});

    // Create test users with unique emails
    const timestamp = Date.now();

    // Create transporter user
    transporterUser = new User({
      name: 'Transporter User',
      email: `transporter${timestamp}@test.com`,
      phoneNumber: `+250780111${timestamp}`,
      password: 'Test@123',
      role: 'transporter',
    });
    await transporterUser.save();

    // Create admin user
    adminUser = new User({
      name: 'Admin User',
      email: `admin${timestamp}@test.com`,
      phoneNumber: `+250780222${timestamp}`,
      password: 'Test@123',
      role: 'admin',
    });
    await adminUser.save();

    // Create authority user
    authorityUser = new User({
      name: 'Authority User',
      email: `authority${timestamp}@test.com`,
      phoneNumber: `+250780333${timestamp}`,
      password: 'Test@123',
      role: 'authority',
    });
    await authorityUser.save();

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
    const transporterRes = await request(app).post('/api/v1/auth/signin').send({
      email: transporterUser.email,
      password: 'Test@123',
    });
    transporterToken = transporterRes.body.token;

    const adminRes = await request(app).post('/api/v1/auth/signin').send({
      email: adminUser.email,
      password: 'Test@123',
    });
    adminToken = adminRes.body.token;

    const authorityRes = await request(app).post('/api/v1/auth/signin').send({
      email: authorityUser.email,
      password: 'Test@123',
    });
    authorityToken = authorityRes.body.token;

    const schoolRes = await request(app).post('/api/v1/auth/signin').send({
      email: schoolUser.email,
      password: 'Test@123',
    });
    schoolToken = schoolRes.body.token;

    // Create a test plan
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    testPlan = new Plan({
      date: today,
      destinations: [validDestinations[0], validDestinations[1]], // Huye and Musanze
    });
    await testPlan.save();

    // Create a test schedule
    testSchedule = new Schedule({
      plan: testPlan._id,
      departure: 'Kigali',
      destination: validDestinations[0], // Huye
      price: 5000,
      transporter: transporterUser._id,
      timeSlots: [
        {
          departureTime: '07:00 AM',
          busNumber: 'RAA 123A',
          expectedArrival: '09:00 AM',
        },
      ],
    });
    await testSchedule.save();
  });

  // Clean up after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await Plan.deleteMany({});
    await Schedule.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/v1/schedules', () => {
    it('should get all schedules without authentication', async () => {
      const response = await request(app).get('/api/v1/schedules');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].destination).toBe(validDestinations[0]);
    });

    it('should filter schedules by destination', async () => {
      const response = await request(app).get(`/api/v1/schedules?destination=${validDestinations[0]}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].destination).toBe(validDestinations[0]);
    });
  });

  describe('GET /api/v1/schedules/:id', () => {
    it('should get a schedule by id without authentication', async () => {
      const response = await request(app).get(`/api/v1/schedules/${testSchedule._id}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testSchedule._id.toString());
      expect(response.body.destination).toBe(validDestinations[0]);
    });

    it('should return 404 if schedule not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/v1/schedules/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Schedule not found');
    });
  });

  describe('POST /api/v1/schedules', () => {
    it('should create a new schedule when user is transporter', async () => {
      const newSchedule = {
        plan: testPlan._id,
        departure: 'Kigali',
        destination: validDestinations[1], // Musanze
        price: 6000,
        timeSlots: [
          {
            departureTime: '08:00 AM',
            busNumber: 'RAA 456B',
            expectedArrival: '10:00 AM',
          },
        ],
      };

      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${transporterToken}`)
        .send(newSchedule);

      expect(response.status).toBe(201);
      expect(response.body.destination).toBe(validDestinations[1]);
      expect(response.body.transporter).toBe(transporterUser._id.toString());

      // Verify schedule was created in database
      const createdSchedule = await Schedule.findById(response.body._id);
      expect(createdSchedule).toBeTruthy();
      expect(createdSchedule.destination).toBe(validDestinations[1]);
    });

    it('should return 401 if no token provided', async () => {
      const newSchedule = {
        plan: testPlan._id,
        departure: 'Kigali',
        destination: validDestinations[1],
        price: 6000,
        timeSlots: [
          {
            departureTime: '08:00 AM',
            busNumber: 'RAA 456B',
            expectedArrival: '10:00 AM',
          },
        ],
      };

      const response = await request(app).post('/api/v1/schedules').send(newSchedule);

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not transporter', async () => {
      const newSchedule = {
        plan: testPlan._id,
        departure: 'Kigali',
        destination: validDestinations[1],
        price: 6000,
        timeSlots: [
          {
            departureTime: '08:00 AM',
            busNumber: 'RAA 456B',
            expectedArrival: '10:00 AM',
          },
        ],
      };

      // Test with admin token
      const adminResponse = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSchedule);
      expect(adminResponse.status).toBe(403);

      // Test with authority token
      const authorityResponse = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${authorityToken}`)
        .send(newSchedule);
      expect(authorityResponse.status).toBe(403);

      // Test with school token
      const schoolResponse = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${schoolToken}`)
        .send(newSchedule);
      expect(schoolResponse.status).toBe(403);
    });

    it('should return 401 if token is invalid', async () => {
      const newSchedule = {
        plan: testPlan._id,
        departure: 'Kigali',
        destination: validDestinations[1],
        price: 6000,
        timeSlots: [
          {
            departureTime: '08:00 AM',
            busNumber: 'RAA 456B',
            expectedArrival: '10:00 AM',
          },
        ],
      };

      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', 'Bearer invalid-token')
        .send(newSchedule);

      expect(response.status).toBe(401);
    });

    it('should return 400 if request body is invalid', async () => {
      const invalidSchedule = {
        // Missing required fields
        departure: 'Kigali',
        destination: validDestinations[1],
      };

      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${transporterToken}`)
        .send(invalidSchedule);

      expect(response.status).toBe(400);
    });

    it('should return 400 if destination is not in plan', async () => {
      const invalidSchedule = {
        plan: testPlan._id,
        departure: 'Kigali',
        destination: validDestinations[2], // Rwamagana (not in plan)
        price: 6000,
        timeSlots: [
          {
            departureTime: '08:00 AM',
            busNumber: 'RAA 456B',
            expectedArrival: '10:00 AM',
          },
        ],
      };

      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${transporterToken}`)
        .send(invalidSchedule);

      expect(response.status).toBe(400);
    });

    it('should return 400 if time slot is invalid', async () => {
      const invalidSchedule = {
        plan: testPlan._id,
        departure: 'Kigali',
        destination: validDestinations[1],
        price: 6000,
        timeSlots: [
          {
            departureTime: 'invalid-time',
            busNumber: 'RAA 456B',
            expectedArrival: '10:00 AM',
          },
        ],
      };

      const response = await request(app)
        .post('/api/v1/schedules')
        .set('Authorization', `Bearer ${transporterToken}`)
        .send(invalidSchedule);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/schedules/:id', () => {
    it('should delete a schedule when user is authority', async () => {
      // Create a schedule to delete
      const scheduleToDelete = new Schedule({
        plan: testPlan._id,
        departure: 'Kigali',
        destination: validDestinations[0],
        price: 5000,
        transporter: transporterUser._id,
        timeSlots: [
          {
            time: '07:00 AM',
            slots: 30,
            busNumber: 'BUS001',
            expectedArrivalTime: new Date(new Date().setHours(10, 0, 0, 0)),
          },
        ],
      });
      await scheduleToDelete.save();

      const response = await request(app)
        .delete(`/api/v1/schedules/${scheduleToDelete._id}`)
        .set('Authorization', `Bearer ${authorityToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Schedule deleted');

      // Verify schedule was deleted from database
      const deletedSchedule = await Schedule.findById(scheduleToDelete._id);
      expect(deletedSchedule).toBeNull();
    });

    it('should return 401 if no token provided', async () => {
      const response = await request(app).delete(`/api/v1/schedules/${new mongoose.Types.ObjectId()}`);

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not authority', async () => {
      const response = await request(app)
        .delete(`/api/v1/schedules/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${transporterToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 if schedule not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/v1/schedules/${nonExistentId}`)
        .set('Authorization', `Bearer ${authorityToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Schedule not found');
    });
  });
});
