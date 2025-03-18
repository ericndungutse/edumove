import express from 'express';
import { createPlan, deletePlan, getAllPlans, getPlanById } from '../controller/plan.controller.js';
import { protect } from '../middlewares/authentication.js';

const router = express.Router();

// Routes for Travel Plans
router.post('/', protect, createPlan); // Create a new travel plan
router.get('/', getAllPlans); // Get all travel plans
router.get('/:id', getPlanById); // Get a single travel plan by ID
router.delete('/:id', protect, deletePlan); // Delete a travel plan by ID

export default router;
