import User from '../models/User.js';
import mongoose from 'mongoose';

// Datos de usuarios de prueba
const usersData = [
    {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // Se hasheará automáticamente
        roles: ['admin', 'user']
    },
    {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        roles: ['user']
    },
    {
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'password456',
        roles: ['user']
    },
    {
        username: 'moderator',
        email: 'mod@example.com',
        password: 'mod12345',
        roles: ['user']
    }
];

// Función para crear usuarios de prueba
export const seedUsers = async () => {
    try {
        // Limpiar la colección de usuarios existentes
        await User.deleteMany({});
        console.log('✅ Colección de usuarios limpiada');

        // Crear usuarios de prueba
        for (const userData of usersData) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ Usuario creado: ${userData.username} (${userData.email})`);
        }

        console.log('🎉 Seeding de usuarios completado exitosamente');
        console.log(`📊 Total usuarios creados: ${usersData.length}`);
        
        // Mostrar información de los usuarios creados
        const createdUsers = await User.find().select('-password');
        console.log('\n📋 Usuarios en la base de datos:');
        createdUsers.forEach(user => {
            console.log(`- ${user.username} (${user.email}) - Roles: ${user.roles.join(', ')}`);
        });
        
    } catch (error) {
        console.error('❌ Error durante el seeding de usuarios:', error);
        throw error;
    }
};

// Función para ejecutar el seeder directamente
export const runUserSeeder = async () => {
    try {
        if (!mongoose.connection.readyState) {
            console.error('❌ No hay conexión a la base de datos');
            return;
        }

        await seedUsers();
    } catch (error) {
        console.error('❌ Error ejecutando el seeder:', error);
    }
};

// Si se ejecuta directamente este archivo
if (import.meta.url === `file://${process.argv[1]}`) {
    // Configurar conexión a la base de datos si no está conectada
    if (!mongoose.connection.readyState) {
        const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/karenflix';
        
        mongoose.connect(DB_URI)
            .then(() => {
                console.log('🔗 Conectado a MongoDB');
                return runUserSeeder();
            })
            .then(() => {
                console.log('✅ Seeder completado');
                process.exit(0);
            })
            .catch((error) => {
                console.error('❌ Error:', error);
                process.exit(1);
            });
    } else {
        runUserSeeder()
            .then(() => {
                console.log('✅ Seeder completado');
                process.exit(0);
            })
            .catch((error) => {
                console.error('❌ Error:', error);
                process.exit(1);
            });
    }
}