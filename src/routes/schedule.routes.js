import express from 'express';
import { createSchedule } from '../controller/schedule.controller.js';
import { protect } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

router.post('/', protect, restrictTo('transporter'), createSchedule);

export default router;
