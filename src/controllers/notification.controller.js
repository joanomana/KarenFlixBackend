import Notification  from '../models/Notification.js';
import User from '../models/User.js'
import Media from '../models/Media.js'
import Review from '../models/Review.js'

// Función para crear notificación cuando se crea una reseña
export const createNotificationForReview = async (reviewId, userId, mediaId) => {
    try {
        const user = await User.findById(userId);
        console.log(user)
        if (!user) return;

        const media = await Media.findById(mediaId);
        console.log(media)

        const message = `El usuario ${user.username} agregó una reseña a la media ${media.title}`;
        

        const notification = new Notification({
            reviewId,
            userId,
            mediaId,
            message
        });

        await notification.save();
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Obtener todas las notificaciones (orden cronológico)
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('userId', 'name email')
            .populate('reviewId')
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener notificaciones',
            error: error.message
        });
    }
};

// Cambiar estado de una notificación específica
export const updateNotificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pendiente', 'leida'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido. Debe ser "pendiente" o "leida"'
            });
        }

        const notification = await Notification.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('userId', 'name email');

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar notificación',
            error: error.message
        });
    }
};

// Obtener notificaciones por estado
export const getNotificationsByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        if (!['pendiente', 'leida'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido. Debe ser "pendiente" o "leida"'
            });
        }

        const notifications = await Notification.find({ status })
            .populate('userId', 'name email')
            .populate('reviewId')
            .sort({ createdAt: -1 })
            .exec();

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener notificaciones',
            error: error.message
        });
    }
};

