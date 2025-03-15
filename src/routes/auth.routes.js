import { Router } from 'express';
import { signin } from '../controller/auth.controller.js';

const router = Router();

router.post('/signin', signin);

export default router;
