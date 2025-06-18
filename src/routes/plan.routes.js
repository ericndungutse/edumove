import express from 'express';
import { createPlan, deletePlan, getAllPlans, getPlanById } from '../controller/plan.controller.js';
import { protect } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       required:
 *         - date
 *         - destinations
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the plan
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the travel plan
 *         destinations:
 *           type: array
 *           items:
 *             type: string
 *           description: List of destinations/sites/districts
 *       example:
 *         _id: 60c72b2f9b1e8e001c8e4b8a
 *         date: 2024-06-01
 *         destinations: ["Kigali", "Huye"]
 */

/**
 * @swagger
 * /api/v1/plans:
 *   post:
 *     summary: Create a new travel plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plan'
 *     responses:
 *       201:
 *         description: The created plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plan'
 *       400:
 *         description: Bad request
 *   get:
 *     summary: Get all travel plans
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: List of all plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plan'
 */

// Routes for Travel Plans
router.post('/', protect, restrictTo('authority'), createPlan); // Create a new travel plan
router.get('/', getAllPlans); // Get all travel plans
router.get('/:id', getPlanById); // Get a single travel plan by ID
router.delete('/:id', protect, restrictTo('authority'), deletePlan); // Delete a travel plan by ID

/**
 * @swagger
 * /api/v1/plans/{id}:
 *   get:
 *     summary: Get a travel plan by ID
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The plan ID
 *     responses:
 *       200:
 *         description: The plan data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plan'
 *       404:
 *         description: Plan not found
 *   delete:
 *     summary: Delete a travel plan by ID
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The plan ID
 *     responses:
 *       200:
 *         description: Plan deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Plan deleted
 *       404:
 *         description: Plan not found
 */

export default router;
