import express from 'express';
import { createSchedule, getAllSchedules } from '../controller/schedule.controller.js';
import { protect } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router({ mergeParams: true });

router.post('/', protect, restrictTo('transporter'), createSchedule);
router.get('/', getAllSchedules);

export default router;
