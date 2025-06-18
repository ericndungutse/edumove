import express from 'express';
import { createSchool, getAllSchools } from '../controller/user.controller.js';
import { protect } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     School:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phoneNumber
 *         - password
 *         - district
 *         - sector
 *         - cell
 *         - village
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         password:
 *           type: string
 *           writeOnly: true
 *         district:
 *           type: string
 *         sector:
 *           type: string
 *         cell:
 *           type: string
 *         village:
 *           type: string
 *       example:
 *         _id: 60c72b2f9b1e8e001c8e4b90
 *         name: School Name
 *         email: school@example.com
 *         phoneNumber: 0780000001
 *         password: Password123
 *         district: Kigali
 *         sector: Nyarugenge
 *         cell: Kiyovu
 *         village: Village1
 */
/**
 * @swagger
 * /api/v1/schools:
 *   post:
 *     summary: Create a new school
 *     tags: [Schools]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/School'
 *     responses:
 *       201:
 *         description: The created school
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/School'
 *       400:
 *         description: Bad request
 *   get:
 *     summary: Get all schools
 *     tags: [Schools]
 *     responses:
 *       200:
 *         description: List of all schools
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/School'
 */

router.post('/', protect, restrictTo('admin'), createSchool);
router.get('/', getAllSchools);

export default router;
