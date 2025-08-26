import User from '../models/User.js';
import mongoose from 'mongoose';

// Datos de usuarios de prueba
const usersData = [
    {
        username: 'admin',
        email: 'admin@example.com',
        password: 'Admin123', // Se hasheará automáticamente
        role: 'admin'
    },
    {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'user'
    },
    {
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'Password456',
        role: 'user'
    },
    {
        username: 'moderator',
        email: 'mod@example.com',
        password: 'Mod12345',
        role: 'user'
    }
];

// Función para crear usuarios de prueba
export const seedUsers = async () => {
    try {
        // Verificar si ya existen usuarios en la base de datos
        const existingUsersCount = await User.countDocuments();
        
        if (existingUsersCount > 0) {
            console.log(`ℹ️  Ya existen ${existingUsersCount} usuarios en la base de datos`);
            return;
        }
        
        console.log('🔄 Procediendo con el seeding de usuarios...');

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
            console.log(`- ${user.username} (${user.email}) - Rol: ${user.role}`);
        });
        
    } catch (error) {
        console.error('❌ Error durante el seeding de usuarios:', error);
        throw error;
    }
};

// Función para forzar el seeding (limpia y recrea los datos)
export const seedUsersForce = async () => {
    try {
        console.log('🔄 Forzando seeding de usuarios...');
        
        // Limpiar la colección de usuarios existentes
        await User.deleteMany({});
        console.log('✅ Colección de usuarios limpiada');

        // Crear usuarios de prueba
        for (const userData of usersData) {
            const user = new User(userData);
            await user.save();
            console.log(`✅ Usuario creado: ${userData.username} (${userData.email})`);
        }

        console.log('🎉 Seeding forzado de usuarios completado exitosamente');
        console.log(`📊 Total usuarios creados: ${usersData.length}`);
        
        // Mostrar información de los usuarios creados
        const createdUsers = await User.find().select('-password');
        console.log('\n📋 Usuarios en la base de datos:');
        createdUsers.forEach(user => {
            console.log(`- ${user.username} (${user.email}) - Rol: ${user.role}`);
        });
        
    } catch (error) {
        console.error('❌ Error durante el seeding forzado de usuarios:', error);
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