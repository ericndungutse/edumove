import express from 'express';
import {
  createTravel,
  getAllTravels,
  getTravelById,
  updateTravel,
  deleteTravel,
} from '../controller/travel.controller.js';

const router = express.Router();

router.post('/', createTravel);
router.get('/', getAllTravels);
router.get('/:id', getTravelById);
router.put('/:id', updateTravel);
router.delete('/:id', deleteTravel);

export default router;
