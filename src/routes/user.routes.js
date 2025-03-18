import express from 'express';
import { createUser, getAllUsers } from '../controller/user.controller.js';
import { protect } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

router.post('/', protect, restrictTo('admin'), createUser);
router.get('/', protect, restrictTo('admin'), getAllUsers);

export default router;
