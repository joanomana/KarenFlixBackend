import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Función auxiliar para generar JWT
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
            issuer: 'KarenFlix-API',
            audience: 'KarenFlix-Users'
        }
    );
};

// Función auxiliar para generar refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
            issuer: 'KarenFlix-API',
            audience: 'KarenFlix-Users'
        }
    );
};

// Registro de usuario
export const register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

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

        // Crear nuevo usuario
        const user = new User({
            username,
            email,
            password,
            role: role || 'user'
        });

        await user.save();

        // Generar tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                },
                token,
                refreshToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        });
    } catch (error) {
        next(error);
    }
};

// Login de usuario
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario solo por email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isAdmin: user.isAdmin()
                },
                token,
                refreshToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        });
    } catch (error) {
        next(error);
    }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token requerido'
            });
        }

        // Verificar refresh token
        const decoded = jwt.verify(
            refreshToken, 
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        // Verificar que el usuario existe
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no válido'
            });
        }

        // Generar nuevo token
        const newToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Token renovado exitosamente',
            data: {
                token: newToken,
                refreshToken: newRefreshToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expirado'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token inválido'
            });
        }
        next(error);
    }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isAdmin: user.isAdmin(),
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Actualizar perfil del usuario autenticado
export const updateProfile = async (req, res, next) => {
    try {
        const { username, email } = req.body;
        const updates = {};

        if (username) updates.username = username;
        if (email) updates.email = email;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
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
            message: 'Perfil actualizado exitosamente',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    isAdmin: user.isAdmin(),
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'El username o email ya existe'
            });
        }
        next(error);
    }
};

// Logout (invalidar token - opcional, depende de la implementación del frontend)
export const logout = async (req, res, next) => {
    try {
        // En una implementación más avanzada, aquí se agregaría el token a una blacklist
        res.status(200).json({
            success: true,
            message: 'Logout exitoso'
        });
    } catch (error) {
        next(error);
    }
};

export default {
    register,
    login,
    refreshToken,
    getProfile,
    updateProfile,
    logout
};
