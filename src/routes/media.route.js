import express from 'express';
import { suggestMedia, createMediaAdmin, approveMedia, rejectMedia, updateMedia, deleteMedia, listMedia } from '../controllers/media.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { validateMediaSuggestion, validateMediaCreateAdmin, validateMediaUpdateAdmin } from '../middlewares/validation.js';
import { listMediaPublic, listMediaRanking, listMediaPopular, listMediaByCategory } from '../controllers/media.controller.js';

const router = express.Router();

// Sugerencia de usuarios (requiere login)
router.post('/suggest', authenticateToken, validateMediaSuggestion, suggestMedia);

// Crear un nuevo título (solo administradores)
// Crea películas/series/anime directamente con estado "approved" //funciona
router.post('/', authenticateToken, requireAdmin, validateMediaCreateAdmin, createMediaAdmin);


// Listar títulos (solo administradores)
// Permite filtrar por status, type o búsqueda (ej. ?status=pending&type=movie&q=harry)
// Todos los títulos (máx. 100):
// http://localhost:4000/api/v1/media

// Solo pendientes:
// http://localhost:4000/api/v1/media?status=pending

// Solo películas aprobadas:
// http://localhost:4000/api/v1/media?status=approved&type=movie

// Búsqueda por título (ej. “Dune”):
// http://localhost:4000/api/v1/media?q=dune
router.get('/', authenticateToken, requireAdmin, listMedia); //funciona


// Editar un título existente (solo administradores)
// Actualiza campos como título, descripción, año, categoría, imagen, etc.
router.put('/:id', authenticateToken, requireAdmin, validateMediaUpdateAdmin, updateMedia); //funciona


// Eliminar un título existente (solo administradores)
// Borra un documento de la colección Media por su ID
router.delete('/:id', authenticateToken, requireAdmin, deleteMedia); //funciona

// Aprobar una sugerencia pendiente (solo administradores)
// Cambia el estado de un título a "approved" y guarda quién lo aprobó
router.put('/:id/approve', authenticateToken, requireAdmin, approveMedia); //funciona

// Rechazar una sugerencia pendiente (solo administradores)
// Cambia el estado de un título a "rejected" (puede opcionalmente registrar un motivo)
router.put('/:id/reject', authenticateToken, requireAdmin, rejectMedia); //funciona


// Public preview endpoints (approved only)
// GET /api/v1/media/public?type=movie&q=dark&page=1&limit=12&sort=-metrics.weightedScore
// GET /api/v1/media/ranking?page=1&limit=12
// GET /api/v1/media/popular?page=1&limit=12
// GET /api/v1/media/category/ciencia-ficcion?page=1&limit=12&sort=-year

router.get('/public', listMediaPublic);
router.get('/ranking', listMediaRanking);
router.get('/popular', listMediaPopular);
router.get('/category/:slug', listMediaByCategory);

export default router;