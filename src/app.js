import express from 'express';
import planRoutes from './routes/plan.routes.js';
import transporterRoute from './routes/transporter.routes.js';
import travelRouter from './routes/travel.routes.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';

const app = express();
app.use(express.json()); // Middleware to parse JSON

// Use the travel plan routes
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/transporters', transporterRoute);
app.use('/api/v1/travels', travelRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);

export default app;
