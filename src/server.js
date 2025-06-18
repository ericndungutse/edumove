import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import express from 'express';
import swaggerDocs from './swagger/swaggerDocs.js';

const PORT = process.env.PORT || 3000;

async function init() {
  const nodeEnv = process.env.NODE_ENV;
  const devDb = process.env.LIVE_DB_URI;

  // Node_ENV = dev and no devDb
  if (nodeEnv === 'development' && !devDb) {
    throw new Error('Development DATABASE URI missing!');
  }

  try {
    let databaseUrl = devDb;

    await mongoose.connect(databaseUrl);
    swaggerDocs(app);
    app.listen(PORT, () => {
      console.log('🔢 Database connection successful!');
      console.log(`🚀 Server running on port ${PORT}...`);
    });
  } catch (error) {
    console.error('ERROR 🔥', error);
  }
}

init();
