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

router.post('/', createTravel);

// Optional query parameters:
// - district: Filter by departure or destination district/city (case insensitive)
// - date: Filter by travel date (YYYY-MM-DD)
// - timeFrom: Filter by departure time (e.g., "08:00 AM")
// - timeTo: Filter by departure time (e.g., "05:00 PM")
router.get('/', protect, restrictTo('transporter'), getAllTravels);
router.get('/:travelNumber', getTravelByTravelNumber);
router.put('/:id', updateTravel);
router.delete('/:id', deleteTravel);
router.patch('/:travelNumber/boarding', protect, confirmBoarding);
router.patch('/:scheduleId/arrived-at-destination', protect, restrictTo('transporter'), markArrivedAtDestination);

export default router;
