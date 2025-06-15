import request from 'supertest';
import app from '../src/app.js';
import Travel from '../src/model/travel.model.js';
import Schedule from '../src/model/schedule.model.js';
import { User } from '../src/model/user.model.js';
import mongoose from 'mongoose';

let transporterToken, transporterId, scheduleId, travelId;

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

  // Create a schedule
  const schedule = new Schedule({
    plan: new mongoose.Types.ObjectId(),
    departure: 'Kigali',
    destination: 'Huye',
    price: 5000,
    transporter: transporterId,
    timeSlots: [
      {
        time: '07:00 AM',
        slots: 40,
        busNumber: 'KT-001',
        expectedArrivalTime: new Date(),
      },
    ],
  });
  await schedule.save();
  scheduleId = schedule._id;

  // Create a travel record
  const travel = new Travel({
    travelDetails: {
      plan: {
        date: new Date(),
        id: new mongoose.Types.ObjectId(),
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
      expectedArrivalTime: new Date(),
    },
    guardian: {
      name: 'Test Guardian',
      email: 'guardian@test.com',
      phoneNumber: '+250780000001',
      address: 'Test Address',
    },
    student: {
      name: 'Test Student',
    },
    school: new mongoose.Types.ObjectId(),
    status: 'Pending',
  });
  await travel.save();
  travelId = travel._id;
});

afterAll(async () => {
  // Clear test data and close the database connection
  await Travel.deleteMany({});
  await Schedule.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Travel Endpoints', () => {
  test('GET /api/v1/travels - Fetch All Travels', async () => {
    const res = await request(app).get('/api/v1/travels').set('Authorization', `Bearer ${transporterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.results).toBeGreaterThan(0);
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
