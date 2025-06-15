import express from 'express';
import { createTransporter, getAllTransporters } from '../controller/user.controller.js';
import { protect } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';
import travelRouter from './travel.routes.js';

const router = express.Router();
router.use('/:transporterId/travels', travelRouter);

// Route to create a transporter
router.post('/', protect, restrictTo('admin'), createTransporter);
router.get('/', getAllTransporters);

export default router;
