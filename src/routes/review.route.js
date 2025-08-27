import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { validateCreateReview } from '../middlewares/validation.review.js';
import { createReview } from '../controllers/review.controller.js';

const router = express.Router();

// RUTA ÚNICA DE REVIEWS 
router.post('/', authenticateToken, validateCreateReview, createReview);

export default router;
