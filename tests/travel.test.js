import request from 'supertest';
import app from '../src/app.js';
import Travel from '../src/model/travel.model.js';
import Schedule from '../src/model/schedule.model.js';
import { User } from '../src/model/user.model.js';
import mongoose from 'mongoose';

let transporterToken, transporterId, scheduleId, travelId;
let testDate, testPlanId;

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(process.env.TEST_DB_URI);

  // Create a transporter user and get a token
  const transporter = new User({
    name: 'Test Transporter',
    email: 'transporter@test.com',
    phoneNumber: '+250780000000',
    password: 'Test@123',
    role: 'transporter',
  });
  await transporter.save();
  transporterId = transporter._id;

  const res = await request(app).post('/api/v1/auth/signin').send({
    email: 'transporter@test.com',
    password: 'Test@123',
  });
  transporterToken = res.body.token;

  // Create test date and plan ID
  // Use UTC date to avoid timezone issues
  const now = new Date();
  testDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  testPlanId = new mongoose.Types.ObjectId();

  // Create a schedule
  const schedule = new Schedule({
    plan: testPlanId,
    departure: 'Kigali',
    destination: 'Huye',
    price: 5000,
    transporter: transporterId,
    timeSlots: [
      {
        time: '07:00 AM',
        slots: 40,
        busNumber: 'KT-001',
        expectedArrivalTime: testDate,
      },
    ],
  });
  await schedule.save();
  scheduleId = schedule._id;

  // Create multiple travel records with different destinations and times
  const travels = [
    {
      travelDetails: {
        plan: {
          date: testDate,
          id: testPlanId,
        },
        departure: 'Kigali',
        destination: 'Huye',
        price: 5000,
        transporter: {
          id: transporterId,
          name: 'Test Transporter',
          contact: '+250780000000',
          bussNumber: 'KT-001',
        },
        schedule: scheduleId,
        departureTime: '07:00 AM',
        expectedArrivalTime: testDate,
      },
      guardian: {
        name: 'Test Guardian 1',
        email: 'guardian1@test.com',
        phoneNumber: '+250780000001',
        address: 'Test Address 1',
      },
      student: {
        name: 'Test Student 1',
      },
      school: new mongoose.Types.ObjectId(),
      status: 'Pending',
    },
    {
      travelDetails: {
        plan: {
          date: testDate,
          id: testPlanId,
        },
        departure: 'Kigali',
        destination: 'Musanze',
        price: 6000,
        transporter: {
          id: transporterId,
          name: 'Test Transporter',
          contact: '+250780000000',
          bussNumber: 'KT-002',
        },
        schedule: scheduleId,
        departureTime: '08:00 AM',
        expectedArrivalTime: testDate,
      },
      guardian: {
        name: 'Test Guardian 2',
        email: 'guardian2@test.com',
        phoneNumber: '+250780000002',
        address: 'Test Address 2',
      },
      student: {
        name: 'Test Student 2',
      },
      school: new mongoose.Types.ObjectId(),
      status: 'Pending',
    },
  ];

  // Save all travel records
  for (const travelData of travels) {
    const travel = new Travel(travelData);
    await travel.save();
    if (!travelId) travelId = travel._id; // Save the first travel ID for other tests
  }
});

afterAll(async () => {
  // Clear test data and close the database connection
  await Travel.deleteMany({});
  await Schedule.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Travel Endpoints', () => {
  describe('GET /api/v1/travels - Fetch All Travels', () => {
    test('should fetch all travels for transporter', async () => {
      const res = await request(app).get('/api/v1/travels').set('Authorization', `Bearer ${transporterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toBeGreaterThan(0);
    });

    test('should filter travels by destination', async () => {
      const res = await request(app)
        .get('/api/v1/travels?destination=Huye')
        .set('Authorization', `Bearer ${transporterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toBe(1);
      expect(res.body.data[0].travelDetails.destination).toBe('Huye');
    });

    test('should filter travels by date', async () => {
      // Format date as YYYY-MM-DD
      const dateStr = testDate.toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/v1/travels?date=${dateStr}`)
        .set('Authorization', `Bearer ${transporterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toBe(2); // Both travels are on the same date

      // Compare dates in UTC
      const responseDate = new Date(res.body.data[0].travelDetails.plan.date);
      expect(responseDate.getUTCFullYear()).toBe(testDate.getUTCFullYear());
      expect(responseDate.getUTCMonth()).toBe(testDate.getUTCMonth());
      expect(responseDate.getUTCDate()).toBe(testDate.getUTCDate());
    });

    test('should filter travels by time slot', async () => {
      const res = await request(app)
        .get('/api/v1/travels?timeSlot=07:00 AM')
        .set('Authorization', `Bearer ${transporterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toBe(1);
      expect(res.body.data[0].travelDetails.departureTime).toBe('07:00 AM');
    });

    test('should combine multiple filters', async () => {
      const dateStr = testDate.toISOString().split('T')[0];
      const res = await request(app)
        .get(`/api/v1/travels?destination=Huye&date=${dateStr}&timeSlot=07:00 AM`)
        .set('Authorization', `Bearer ${transporterToken}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toBe(1);
      expect(res.body.data[0].travelDetails.destination).toBe('Huye');
      expect(res.body.data[0].travelDetails.departureTime).toBe('07:00 AM');

      // Compare dates in UTC
      const responseDate = new Date(res.body.data[0].travelDetails.plan.date);
      expect(responseDate.getUTCFullYear()).toBe(testDate.getUTCFullYear());
      expect(responseDate.getUTCMonth()).toBe(testDate.getUTCMonth());
      expect(responseDate.getUTCDate()).toBe(testDate.getUTCDate());
    });
  });

  test('GET /api/v1/travels/:travelNumber - Fetch Travel by Travel Number', async () => {
    const travel = await Travel.findOne();
    const res = await request(app).get(`/api/v1/travels/${travel.travelNumber}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('travelNumber', travel.travelNumber);
  });

  test('PATCH /api/v1/travels/:travelNumber/boarding - Confirm Boarding', async () => {
    const travel = await Travel.findOne();
    const res = await request(app)
      .patch(`/api/v1/travels/${travel.travelNumber}/boarding`)
      .set('Authorization', `Bearer ${transporterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.travel).toHaveProperty('status', 'Boarded');
  });

  test('PUT /api/v1/travels/:id - Update Travel', async () => {
    const res = await request(app).put(`/api/v1/travels/${travelId}`).send({
      status: 'Cancelled',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'Cancelled');
  });

  test('DELETE /api/v1/travels/:id - Delete Travel', async () => {
    const res = await request(app).delete(`/api/v1/travels/${travelId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Travel deleted successfully');
  });
});
