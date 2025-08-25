import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { connectDB } from './src/config/db.js';
import { runAllSeeders } from './src/seeders/index.js';

const PORT = Number(process.env.PORT || 4000);
const HOST = 'localhost';

async function start() {
    await connectDB();   
    await runAllSeeders();    

    const server = http.createServer(app);
    server.listen(PORT, HOST, () => {
        console.log(`🚀 API escuchando en http://${HOST}:${PORT}`);
    });

    server.on('error', (err) => {
        console.error('❌ Error del servidor:', err);
        process.exit(1);
    });

    const shutdown = (signal) => {
        console.log(`📴 Recibido ${signal}, cerrando servidor HTTP...`);
        server.close(() => process.exit(0));
    };
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
    }

    start().catch((err) => {
    console.error('Fallo al iniciar:', err);
    process.exit(1);
});