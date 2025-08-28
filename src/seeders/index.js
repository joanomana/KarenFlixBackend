import { seedMedia } from './media.js';
import { seedUsers } from './user.js';
import { seedReviews } from './review.js'; 
/**
 * Ejecuta todos los seeders de la aplicación
 * Solo ejecuta si no existen datos previos
 */
export const runAllSeeders = async () => {

try {
        console.log('🌱 Iniciando proceso de seeding...');
        
        // Lista de seeders disponibles
        const seeders = [
            {
                name: 'Users',
                seeder: seedUsers,
                description: 'Crear usuarios de prueba'
            },
            {
                name: 'Media',
                seeder: seedMedia,
                description: 'Crear medios de prueba'
            },
            {
                name: 'Reviews',
                seeder: seedReviews,
                description: 'Crear reviews de prueba'
            }
        ];
        console.log(`📋 Seeders disponibles: ${seeders.length}`);
        
        // Ejecutar cada seeder
        for (const { name, seeder, description } of seeders) {
            try {
                console.log(`\n🔄 Ejecutando seeder: ${name}`);
                console.log(`📝 ${description}`);
                
                await seeder();
                
                console.log(`✅ Seeder ${name} completado`);
            } catch (error) {
                console.error(`❌ Error en seeder ${name}:`, error.message);
                // Continúa con el siguiente seeder en caso de error
            }
        }
        
        console.log('\n🎉 Proceso de seeding completado');
        
    } catch (error) {
        console.error('❌ Error durante el proceso de seeding:', error);
        throw error;
    }
};

/**
 * Ejecuta seeders específicos por nombre
 * @param {string[]} seederNames - Array con nombres de seeders a ejecutar
 */
export const runSpecificSeeders = async (seederNames = []) => {
    try {
        console.log('🌱 Iniciando seeders específicos...');
        
        const availableSeeders = {
            'users': seedUsers
            // Agregar más seeders aquí:
            // 'movies': seedMovies,
        };
        
        for (const seederName of seederNames) {
            const seeder = availableSeeders[seederName.toLowerCase()];
            
            if (!seeder) {
                console.warn(`⚠️  Seeder '${seederName}' no encontrado`);
                continue;
            }
            
            console.log(`\n🔄 Ejecutando seeder: ${seederName}`);
            await seeder();
            console.log(`✅ Seeder ${seederName} completado`);
        }
        
        console.log('\n🎉 Seeders específicos completados');
        
    } catch (error) {
        console.error('❌ Error ejecutando seeders específicos:', error);
        throw error;
    }
};
