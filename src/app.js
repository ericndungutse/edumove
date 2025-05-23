import express from 'express';
import cors from 'cors';
import planRoutes from './routes/plan.routes.js';
import transporterRoute from './routes/transporter.routes.js';
import travelRouter from './routes/travel.routes.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import scheduleRouter from './routes/schedule.routes.js';
import schooRoutes from './routes/school.routes.js';
const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(cors());

// Use the travel plan routes
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/transporters', transporterRoute);
app.use('/api/v1/travels', travelRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/schedules', scheduleRouter);
app.use('/api/v1/schools', schooRoutes);

export default app;
