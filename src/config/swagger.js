import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'KarenFlix API',
        version: '1.0.0',
        description: 'API para reseñas y rankings de películas, animes y series geek.',
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 4001}/api/v1`,
            description: 'Local',
        },
        {
            url: `http://${process.env.HOST || '34.45.41.209'}:${process.env.PORT || 4001}/api/v1`,
            description: 'Servidor',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'ID único del usuario' },
                    username: { type: 'string', minLength: 3, maxLength: 30, example: 'johndoe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login exitoso' },
                    data: {
                        type: 'object',
                        properties: {
                            user: { $ref: '#/components/schemas/User' },
                            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                            expiresIn: { type: 'string', example: '7d' },
                        },
                    },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Error message' },
                },
            },
            Media: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'ID único del título' },
                    title: { type: 'string', example: 'Dune' },
                    description: { type: 'string', example: 'Película de ciencia ficción.' },
                    category: { type: 'string', example: 'Ciencia Ficción' },
                    year: { type: 'integer', example: 2021 },
                    image: { type: 'string', format: 'uri', example: 'https://ejemplo.com/dune.jpg' },
                    status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'approved' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Review: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                    media: { $ref: '#/components/schemas/Media' },
                    comment: { type: 'string', example: '¡Excelente película!' },
                    rating: { type: 'integer', minimum: 1, maximum: 10, example: 9 },
                    likes: { type: 'integer', example: 5 },
                    dislikes: { type: 'integer', example: 1 },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    },
};

const options = {
    swaggerDefinition,
    apis: [path.join(__dirname, '../routes/*.js')],
};

export const swaggerSpec = swaggerJSDoc(options);
