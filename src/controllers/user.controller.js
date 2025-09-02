import User from '../models/User.js';
import mongoose from 'mongoose';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responses.js';
import validatePassword from '../middlewares/passwordValidation.js';
import validateMongoId from '../middlewares/validateMongoId.js';

// Obtener todos los usuarios con paginación
export const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filtros opcionales
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }
        if (req.query.search) {
            filter.$or = [
                { username: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        return paginatedResponse(res, users, total, page, limit, 'Usuarios obtenidos exitosamente');
    } catch (error) {
        next(error);
    }
};

// Obtener un usuario por ID
export const getUserById = [
    validateMongoId,
    async (req, res, next) => {
        try {
            const { id } = req.params;

            const user = await User.findById(id).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
];

// Actualizar un usuario (solo administradores pueden cambiar todos los campos)
export const updateUser = [
    validateMongoId,
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Solo los administradores pueden cambiar la contraseña a través de este endpoint
            // Los usuarios normales deben usar /change-password
            if (updates.password && req.user.role !== 'admin') {
                delete updates.password;
            }

            // Actualizar el usuario
            const user = await User.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                data: user
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'El usuario o email ya existe'
                });
            }
            next(error);
        }
    }
];

// Eliminar un usuario
export const deleteUser = [
    validateMongoId,
    async (req, res, next) => {
        try {
            const { id } = req.params;

            const user = await User.findByIdAndDelete(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
];

// Cambiar contraseña
export const changePassword = [
    validatePassword,
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { currentPassword, newPassword } = req.body;

            // Verificar que el ID existe
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario es requerido'
                });
            }

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
            }

            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña actual es requerida'
                });
            }

            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar la contraseña actual
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña actual es incorrecta'
                });
            }

            // Actualizar la contraseña (se hashea automáticamente)
            user.password = newPassword;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    }
];

// Actualizar datos limitados del usuario (solo username para usuarios normales)
export const updateUserSelf = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Verificar que el ID existe
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario es requerido'
            });
        }

        // Validar formato del ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        // Verificar que el usuario solo puede editar sus propios datos
        if (req.user._id.toString() !== id) {
            return res.status(403).json({
                success: false,
                message: 'Solo puedes editar tus propios datos'
            });
        }

        // Solo permitir actualizar username
        const allowedUpdates = ['username'];
        const filteredUpdates = {};
        
        allowedUpdates.forEach(key => {
            if (updates[key] !== undefined) {
                filteredUpdates[key] = updates[key];
            }
        });

        // Verificar que hay algo que actualizar
        if (Object.keys(filteredUpdates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay campos válidos para actualizar'
            });
        }

        // Actualizar el usuario
        const user = await User.findByIdAndUpdate(
            id,
            filteredUpdates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Datos actualizados exitosamente',
            data: user
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'El nombre de usuario ya existe'
            });
        }
        next(error);
    }
};