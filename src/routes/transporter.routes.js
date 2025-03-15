import express from 'express';
import { createTransporter, getAllTransporters } from '../controller/user.controller.js';

const router = express.Router();

// Route to create a transporter
router.post('/', createTransporter);
router.get('/', getAllTransporters);

export default router;
