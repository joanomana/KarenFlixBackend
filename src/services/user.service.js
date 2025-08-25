import User from '../models/User.js';

export class UserService {
    
    // Autenticar usuario por email/username y contraseña
    static async authenticateUser(identifier, password) {
        try {
            // Buscar por email o username
            const user = await User.findOne({
                $or: [
                    { email: identifier },
                    { username: identifier }
                ]
            });

            if (!user) {
                return {
                    success: false,
                    message: 'Credenciales inválidas'
                };
            }

            // Comparar la contraseña usando el método del modelo
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Credenciales inválidas'
                };
            }

            return {
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles,
                    isAdmin: user.isAdmin()
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Crear usuario con validaciones adicionales
    static async createUser(userData) {
        try {
            const { username, email, password, roles } = userData;

            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                return {
                    success: false,
                    message: 'El usuario o email ya existe'
                };
            }

            // Crear nuevo usuario
            const user = new User({
                username,
                email,
                password, // Se hashea automáticamente en el middleware
                roles: roles || ['user']
            });

            await user.save();

            return {
                success: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles,
                    createdAt: user.createdAt
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por ID sin contraseña
    static async getUserById(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            return user;
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por email
    static async getUserByEmail(email) {
        try {
            const user = await User.findOne({ email }).select('-password');
            return user;
        } catch (error) {
            throw error;
        }
    }

    // Actualizar último login
    static async updateLastLogin(userId) {
        try {
            await User.findByIdAndUpdate(userId, {
                lastLogin: new Date()
            });
        } catch (error) {
            throw error;
        }
    }

    // Verificar si un usuario tiene un rol específico
    static async userHasRole(userId, role) {
        try {
            const user = await User.findById(userId);
            return user ? user.hasRole(role) : false;
        } catch (error) {
            throw error;
        }
    }

    // Obtener todos los usuarios con paginación
    static async getAllUsers(page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            
            const users = await User.find()
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
            
            const total = await User.countDocuments();
            
            return {
                users,
                total,
                page,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            throw error;
        }
    }
}