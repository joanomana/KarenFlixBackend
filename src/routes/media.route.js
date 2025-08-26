import express from 'express';
import { suggestMedia, createMediaAdmin, approveMedia, rejectMedia, updateMedia, deleteMedia, listMedia } from '../controllers/media.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { validateMediaSuggestion, validateMediaCreateAdmin, validateMediaUpdateAdmin } from '../middlewares/validation.js';

const router = express.Router();

// Sugerencia de usuarios (requiere login)
router.post('/suggest', authenticateToken, validateMediaSuggestion, suggestMedia);

// Crear un nuevo título (solo administradores)
// Crea películas/series/anime directamente con estado "approved"
router.post('/', authenticateToken, requireAdmin, validateMediaCreateAdmin, createMediaAdmin);

// Listar títulos (solo administradores)
// Permite filtrar por status, type o búsqueda (ej. ?status=pending&type=movie&q=harry)
router.get('/', authenticateToken, requireAdmin, listMedia);

// Editar un título existente (solo administradores)
// Actualiza campos como título, descripción, año, categoría, imagen, etc.
router.put('/:id', authenticateToken, requireAdmin, validateMediaUpdateAdmin, updateMedia);

// Eliminar un título existente (solo administradores)
// Borra un documento de la colección Media por su ID
router.delete('/:id', authenticateToken, requireAdmin, deleteMedia);

// Aprobar una sugerencia pendiente (solo administradores)
// Cambia el estado de un título a "approved" y guarda quién lo aprobó
router.put('/:id/approve', authenticateToken, requireAdmin, approveMedia);

// Rechazar una sugerencia pendiente (solo administradores)
// Cambia el estado de un título a "rejected" (puede opcionalmente registrar un motivo)
router.put('/:id/reject', authenticateToken, requireAdmin, rejectMedia);

export default router;
