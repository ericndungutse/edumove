import express from 'express';
import {
  createTravel,
  getAllTravels,
  updateTravel,
  deleteTravel,
  confirmBoarding,
  getTravelByTravelNumber,
  markArrivedAtDestination,
} from '../controller/travel.controller.js';
import { protect } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Travel:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         travelDetails:
 *           type: object
 *           properties:
 *             plan:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date
 *                 id:
 *                   type: string
 *             departure:
 *               type: string
 *             destination:
 *               type: string
 *             price:
 *               type: number
 *             transporter:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 contact:
 *                   type: string
 *                 bussNumber:
 *                   type: string
 *             schedule:
 *               type: string
 *             departureTime:
 *               type: string
 *             expectedArrivalTime:
 *               type: string
 *               format: date-time
 *             paymentDetails:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     ref:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     client:
 *                       type: string
 *                     provider:
 *                       type: string
 *                     status:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *         guardian:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             phoneNumber:
 *               type: string
 *             address:
 *               type: string
 *         student:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *         school:
 *           type: string
 *         status:
 *           type: string
 *         travelNumber:
 *           type: string
 *       example:
 *         _id: 60c72b2f9b1e8e001c8e4b8d
 *         travelDetails:
 *           plan:
 *             date: 2024-06-01
 *             id: 60c72b2f9b1e8e001c8e4b8a
 *           departure: Kigali
 *           destination: Huye
 *           price: 2000
 *           transporter:
 *             id: 60c72b2f9b1e8e001c8e4b8c
 *             name: John Doe
 *             contact: 0780000000
 *             bussNumber: BUS-123
 *           schedule: 60c72b2f9b1e8e001c8e4b8b
 *           departureTime: "08:00 AM"
 *           expectedArrivalTime: "2024-06-01T10:00:00Z"
 *           paymentDetails:
 *             data:
 *               ref: "PAY-123"
 *               amount: 2000
 *               client: "Jane Doe"
 *               provider: "mtn"
 *               status: "pending"
 *               created_at: "2024-06-01T07:00:00Z"
 *         guardian:
 *           name: Jane Doe
 *           email: jane@example.com
 *           phoneNumber: 0781111111
 *           address: Kigali
 *         student:
 *           name: Student Name
 *         school: 60c72b2f9b1e8e001c8e4b8e
 *         status: Pending
 *         travelNumber: TR-123456-7890
 */

/**
 * @swagger
 * /api/v1/travels:
 *   post:
 *     summary: Create a new travel record
 *     tags: [Travels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Travel'
 *     responses:
 *       201:
 *         description: The created travel record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Travel'
 *       400:
 *         description: Bad request
 *   get:
 *     summary: Get all travel records by only transporter or school
 *     tags: [Travels]
 *     security:
 *       - bearerAuth: []
 *     description: Requires role of transporter or school.
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district/city
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by travel date
 *       - in: query
 *         name: timeFrom
 *         schema:
 *           type: string
 *         description: Filter by departure time (from)
 *       - in: query
 *         name: timeTo
 *         schema:
 *           type: string
 *         description: Filter by departure time (to)
 *     responses:
 *       200:
 *         description: List of all travels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Travel'
 */
/**
 * @swagger
 * /api/v1/travels/{travelNumber}:
 *   get:
 *     summary: Get a travel record by travel number
 *     tags: [Travels]
 *     parameters:
 *       - in: path
 *         name: travelNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: The travel number
 *     responses:
 *       200:
 *         description: The travel record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Travel'
 *       404:
 *         description: Travel not found
 */
/**
 * @swagger
 * /api/v1/travels/{id}:
 *   put:
 *     summary: Update a travel record by ID
 *     tags: [Travels]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The travel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Travel'
 *     responses:
 *       200:
 *         description: The updated travel record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Travel'
 *       404:
 *         description: Travel not found
 *   delete:
 *     summary: Delete a travel record by ID
 *     tags: [Travels]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The travel ID
 *     responses:
 *       200:
 *         description: Travel deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Travel deleted
 *       404:
 *         description: Travel not found
 */
/**
 * @swagger
 * /api/v1/travels/{travelNumber}/boarding:
 *   patch:
 *     summary: Confirm boarding for a travel record by transporter
 *     tags: [Travels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: travelNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: The travel number
 *     responses:
 *       200:
 *         description: Boarding confirmed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Travel'
 *       404:
 *         description: Travel not found
 */
/**
 * @swagger
 * /api/v1/travels/{scheduleId}/arrived-at-destination:
 *   patch:
 *     summary: Mark a travel as arrived at destination
 *     tags: [Travels]
 *     security:
 *       - bearerAuth: []
 *     description: Requires role of transporter.
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         schema:
 *           type: string
 *         required: true
 *         description: The schedule ID
 *     responses:
 *       200:
 *         description: Marked as arrived at destination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Travel'
 *       404:
 *         description: Travel not found
 */

router.post('/', createTravel);

// Optional query parameters:
// - district: Filter by departure or destination district/city (case insensitive)
// - date: Filter by travel date (YYYY-MM-DD)
// - timeFrom: Filter by departure time (e.g., "08:00 AM")
// - timeTo: Filter by departure time (e.g., "05:00 PM")
router.get('/', protect, restrictTo('transporter', 'school'), getAllTravels);
router.get('/:travelNumber', getTravelByTravelNumber);
router.put('/:id', updateTravel);
router.delete('/:id', deleteTravel);
router.patch('/:travelNumber/boarding', protect, confirmBoarding);
router.patch('/:scheduleId/arrived-at-destination', protect, restrictTo('transporter'), markArrivedAtDestination);

export default router;
