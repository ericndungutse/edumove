import express from 'express';
import { createSchedule, getAllSchedules } from '../controller/schedule.controller.js';
import { protect } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Slot:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           example: "08:00 AM"
 *         slots:
 *           type: integer
 *           example: 40
 *         busNumber:
 *           type: string
 *           example: "BUS-123"
 *         expectedArrivalTime:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T10:00:00Z"
 *     Schedule:
 *       type: object
 *       required:
 *         - plan
 *         - departure
 *         - destination
 *         - price
 *         - transporter
 *         - timeSlots
 *       properties:
 *         _id:
 *           type: string
 *         plan:
 *           type: string
 *           description: The plan ID
 *         departure:
 *           type: string
 *         destination:
 *           type: string
 *         price:
 *           type: number
 *         transporter:
 *           type: string
 *           description: The transporter (user) ID
 *         timeSlots:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Slot'
 *       example:
 *         _id: 60c72b2f9b1e8e001c8e4b8b
 *         plan: 60c72b2f9b1e8e001c8e4b8a
 *         departure: "Kigali"
 *         destination: "Huye"
 *         price: 2000
 *         transporter: 60c72b2f9b1e8e001c8e4b8c
 *         timeSlots: [{ time: "08:00 AM", slots: 40, busNumber: "BUS-123", expectedArrivalTime: "2024-06-01T10:00:00Z" }]
 */
/**
 * @swagger
 * /api/v1/schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Schedule'
 *     responses:
 *       201:
 *         description: The created schedule
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Bad request
 *   get:
 *     summary: Get all schedules
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: List of all schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 */

router.post('/', protect, restrictTo('transporter'), createSchedule);
router.get('/', getAllSchedules);

export default router;
