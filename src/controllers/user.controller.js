import User from '../models/User.js';
import mongoose from 'mongoose';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responses.js';

// Obtener todos los usuarios con paginación
export const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filtros opcionales
        const filter = {};
        if (req.query.role) {
            filter.roles = { $in: [req.query.role] };
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
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

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
};

// Crear un nuevo usuario
export const createUser = async (req, res, next) => {
    try {
        const { username, email, password, roles } = req.body;

        // Validar campos requeridos
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email y password son requeridos'
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El usuario o email ya existe'
            });
        }

        // Crear el usuario (la contraseña se hashea automáticamente con el middleware pre('save'))
        const user = new User({
            username,
            email,
            password,
            roles: roles || ['user']
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                roles: user.roles,
                createdAt: user.createdAt
            }
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
};

// Actualizar un usuario
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        // No permitir actualizar la contraseña a través de este endpoint
        if (updates.password) {
            delete updates.password;
        }

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
};

// Eliminar un usuario
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

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
};

// Cambiar contraseña
export const changePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña actual y la nueva son requeridas'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
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
};