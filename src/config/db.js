import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/KarenFlix';

    if (isConnected) return mongoose.connection;

    if (process.env.NODE_ENV === 'production') {
        mongoose.set('autoIndex', false);
    }

    await mongoose.connect(uri, {
        maxPoolSize: parseInt(process.env.DB_MAX_POOL || '10', 10),
        minPoolSize: parseInt(process.env.DB_MIN_POOL || '0', 10),
        serverSelectionTimeoutMS: parseInt(process.env.DB_SRV_TIMEOUT || '10000', 10),
        socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT || '45000', 10),
        retryWrites: true,
    });

    isConnected = true;

    mongoose.connection.on('connected', () => console.log('✅ MongoDB conectado'));
    mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err));
    mongoose.connection.on('disconnected', () => {
        isConnected = false;
        console.warn('⚠️ MongoDB desconectado');
    });

    return mongoose.connection;
}