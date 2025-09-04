
import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import {
    validateCreateReview,
    validateUpdateReview,
} from '../middlewares/validation.review.js';
import {
    createReview,
    updateReview,
    deleteReview,
    reactionReview, listReviewsPublic
} from '../controllers/review.controller.js';

import {exportData} from "../controllers/export.controller.js" 

const router = express.Router();

router.get('/:id', exportData);


export default router;