import express from 'express';
import { getNotifications,updateNotificationStatus, getNotificationsByStatus} from '../controllers/notification.controller.js'

const router = express.Router();

// Obtener todas las notificaciones
router.get('/', getNotifications);

// Obtener notificaciones por estado
router.get('/status/:status', getNotificationsByStatus);

// Actualizar estado de una notificación específica
router.patch('/:id/status', updateNotificationStatus);

export default router;