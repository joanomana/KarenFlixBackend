import express from 'express';
import { suggestMedia } from '../controllers/media.controller.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateMediaSuggestion } from '../middlewares/validation.js';

const router = express.Router();

// Sugerir un nuevo título (movie|anime|series)
router.post('/suggest', authenticateToken, validateMediaSuggestion, suggestMedia);

export default router;
