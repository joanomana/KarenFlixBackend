import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importar middlewares
import { errorHandler } from './src/middlewares/errorHandler.js';
import { generalLimiter } from './src/middlewares/rateLimiter.js';
import passport from './src/config/passport.js';

// Importar rutas
import authRoutes from './src/routes/auth.route.js';
import userRoutes from './src/routes/user.route.js';
import mediaRoutes from './src/routes/media.route.js';

// Configurar Swagger
import swaggerSetup from './src/config/swagger.js';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares de seguridad
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
app.use(generalLimiter);

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Inicializar Passport
app.use(passport.initialize());

// Healthcheck
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: mongoose.connection.readyState, // 0=disconnected,1=connected,2=connecting,3=disconnecting
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rutas principales
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/media', mediaRoutes);

// Configurar Swagger en /api/v1/docs
swaggerSetup(app, '/api/v1/docs');

// Ruta para manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

// Manejo de errores centralizado
app.use(errorHandler);


    
export default app;