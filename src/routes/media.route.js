import express from 'express';
import { suggestMedia, createMediaAdmin, approveMedia, rejectMedia, updateMedia, deleteMedia, listMedia } from '../controllers/media.controller.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { validateMediaSuggestion, validateMediaCreateAdmin, validateMediaUpdateAdmin } from '../middlewares/validation.js';
import { listMediaPublic, listMediaRanking, listMediaPopular, listMediaByCategory } from '../controllers/media.controller.js';

const router = express.Router();

/**
 * @swagger
 * /media/suggest:
 *   post:
 *     summary: Sugerir un nuevo título (usuario autenticado)
 *     description: Permite a los usuarios sugerir una nueva película, serie o anime. El estado inicial será "pending".
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - year
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Dune"
 *               type:
 *                 type: string
 *                 example: "movie"
 *               description:
 *                 type: string
 *                 example: "Película de ciencia ficción."
 *               category:
 *                 type: string
 *                 example: "Ciencia Ficción"
 *               year:
 *                 type: integer
 *                 example: 2021
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://ejemplo.com/dune.jpg"
 *     responses:
 *       201:
 *         description: Sugerencia enviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sugerencia enviada"
 *                 media:
 *                   $ref: '#/components/schemas/Media'
 *       409:
 *         description: Título duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/suggest', authenticateToken, validateMediaSuggestion, suggestMedia);

/**
 * @swagger
 * /media:
 *   post:
 *     summary: Crear un nuevo título (solo administradores)
 *     description: Permite a los administradores crear directamente un título aprobado.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Media'
 *     responses:
 *       201:
 *         description: Título creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 media:
 *                   $ref: '#/components/schemas/Media'
 *       409:
 *         description: Título duplicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, requireAdmin, validateMediaCreateAdmin, createMediaAdmin);


/**
 * @swagger
 * /media:
 *   get:
 *     summary: Listar títulos (solo administradores)
 *     description: Permite listar títulos filtrando por status, type o búsqueda por título. Máximo 100 resultados.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filtrar por estado
 *         example: "approved"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrar por tipo (movie, serie, anime)
 *         example: "movie"
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Búsqueda por título
 *         example: "Dune"
 *     responses:
 *       200:
 *         description: Lista de títulos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Media'
 */
router.get('/', authenticateToken, requireAdmin, listMedia);


/**
 * @swagger
 * /media/{id}:
 *   put:
 *     summary: Editar un título existente (solo administradores)
 *     description: Actualiza los campos de un título por su ID.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del título
 *         example: "64e8b2f2c2a4e2b1d8f1a2c3"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Media'
 *     responses:
 *       200:
 *         description: Título actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Actualizado"
 *                 media:
 *                   $ref: '#/components/schemas/Media'
 *       404:
 *         description: Título no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authenticateToken, requireAdmin, validateMediaUpdateAdmin, updateMedia);


/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Eliminar un título existente (solo administradores)
 *     description: Borra un título por su ID.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del título
 *         example: "64e8b2f2c2a4e2b1d8f1a2c3"
 *     responses:
 *       204:
 *         description: Título eliminado exitosamente (sin contenido)
 *       404:
 *         description: Título no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteMedia);

/**
 * @swagger
 * /media/{id}/approve:
 *   put:
 *     summary: Aprobar una sugerencia pendiente (solo administradores)
 *     description: Cambia el estado de un título a "approved" y guarda quién lo aprobó.
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del título
 *         example: "64e8b2f2c2a4e2b1d8f1a2c3"
 *     responses:
 *       200:
 *         description: Título aprobado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Aprobado"
 *                 media:
 *                   $ref: '#/components/schemas/Media'
 *       404:
 *         description: Título no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/approve', authenticateToken, requireAdmin, approveMedia);

/**
 * @swagger
 * /media/{id}/reject:
 *   put:
 *     summary: Rechazar una sugerencia pendiente (solo administradores)
 *     description: Cambia el estado de un título a "rejected".
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del título
 *         example: "64e8b2f2c2a4e2b1d8f1a2c3"
 *     responses:
 *       200:
 *         description: Título rechazado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rechazado"
 *                 media:
 *                   $ref: '#/components/schemas/Media'
 *       404:
 *         description: Título no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/reject', authenticateToken, requireAdmin, rejectMedia);


// Public preview endpoints (approved only)
// GET /api/v1/media/public?type=movie&q=dark&page=1&limit=12&sort=-metrics.weightedScore
// GET /api/v1/media/ranking?page=1&limit=12
// GET /api/v1/media/popular?page=1&limit=12
// GET /api/v1/media/category/ciencia-ficcion?page=1&limit=12&sort=-year

router.get('/public', listMediaPublic);
router.get('/public/:idOrSlug', getMediaPublicByIdOrSlug);
router.get('/ranking', listMediaRanking);
router.get('/popular', listMediaPopular);
router.get('/category/:slug', listMediaByCategory);

export default router;