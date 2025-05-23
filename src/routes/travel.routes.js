import express from 'express';
import {
  createTravel,
  getAllTravels,
  updateTravel,
  deleteTravel,
  confirmBoarding,
  getTravelByTravelNumber,
} from '../controller/travel.controller.js';
import { protect } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

router.post('/', createTravel);
router.get('/', protect, restrictTo('transporter'), getAllTravels);
router.get('/:travelNumber', getTravelByTravelNumber);
router.put('/:id', updateTravel);
router.delete('/:id', deleteTravel);
router.patch('/:travelNumber/boarding', protect, confirmBoarding);

export default router;
