import express from 'express';
import { createTransporter, getAllTransporters } from '../controller/user.controller.js';
import { protect } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';
import travelRouter from './travel.routes.js';
import scheduleRouter from './schedule.routes.js';

const router = express.Router();
router.use('/:transporterId/schedules', scheduleRouter);

/**
 * @swagger
 * components:
 *   schemas:
 *     Transporter:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phoneNumber
 *         - password
 *         - areaOfOperations
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         password:
 *           type: string
 *           writeOnly: true
 *         areaOfOperations:
 *           type: array
 *           items:
 *             type: string
 *       example:
 *         _id: 60c72b2f9b1e8e001c8e4b91
 *         name: Transporter Name
 *         email: transporter@example.com
 *         phoneNumber: 0780000002
 *         password: Password123
 *         areaOfOperations: ["Kigali", "Huye"]
 */
/**
 * @swagger
 * /api/v1/transporters:
 *   post:
 *     summary: Create a new transporter
 *     tags: [Transporters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transporter'
 *     responses:
 *       201:
 *         description: The created transporter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transporter'
 *       400:
 *         description: Bad request
 *   get:
 *     summary: Get all transporters
 *     tags: [Transporters]
 *     responses:
 *       200:
 *         description: List of all transporters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transporter'
 */

// Route to create a transporter
router.post('/', protect, restrictTo('admin'), createTransporter);
router.get('/', getAllTransporters);

export default router;
