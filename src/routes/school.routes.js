import express from 'express';
import { createSchool, getAllSchools } from '../controller/user.controller.js';
import { protect } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';
const router = express.Router();

router.post('/', protect, restrictTo('admin'), createSchool);
router.get('/', getAllSchools);

export default router;
