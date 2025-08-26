// src/swagger.js
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'KarenFlix Backend API',
            version: '1.0.0',
            description: 'Documentación de la API para KarenFlix Backend',
        },
        servers: [
            {
                url: 'http://localhost:4000/api/v1',
                description: 'Servidor local',
            }
        ],
    },
    apis: ['./src/routes/*.js'], // Archivos donde documentas tus endpoints con JSDoc
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Exporta una función para usarla en app.js
export default (app, route = '/') => {
    app.use(route, swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    console.log(`📄 Documentación Swagger disponible en: http://localhost:4000${route}`);
};
