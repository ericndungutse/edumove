import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to the test database
beforeAll(async () => {
  const testDbUri = process.env.TEST_DB_URI;
  if (!testDbUri) {
    throw new Error('TEST_DB_URI is not defined in environment variables');
  }
  await mongoose.connect(testDbUri);
});

// Clear all collections before each test
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
