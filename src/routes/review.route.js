import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { validateCreateReview } from '../middlewares/validation.review.js';
import { createReview } from '../controllers/review.controller.js';

const router = express.Router();

// Crear reseña para un media específico
router.post('/media/:id/reviews', authenticateToken, validateCreateReview, createReview);

export default router;
