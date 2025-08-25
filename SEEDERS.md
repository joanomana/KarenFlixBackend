# Sistema de Seeders - KarenFlix Backend

## Descripción

El sistema de seeders de KarenFlix Backend está diseñado para verificar automáticamente si ya existen datos en la base de datos antes de crear nuevos datos. Si los datos ya existen, el seeder no hace nada, evitando duplicados.

## Estructura

```
src/seeders/
├── index.js         # Seeder principal que coordina todos los seeders
├── user.js          # Seeder específico para usuarios
└── [futuros]        # Aquí se agregarán más seeders (películas, categorías, etc.)
```

## Funcionalidad Principal

### ✅ Verificación Automática
- **Verifica si ya existen datos** antes de crear nuevos
- **No hace nada si ya hay datos** (evita duplicados)
- **Solo crea datos si la colección está vacía**

### 🔄 Ejecución Automática
El sistema se ejecuta automáticamente al iniciar el servidor (`npm start` o `npm run dev`)

### 📋 Scripts Disponibles

```bash
# Ejecutar todos los seeders (solo si no hay datos)
npm run seed

# Ejecutar solo el seeder de usuarios
npm run seed:users

# Forzar el seeding (limpia y recrea todos los datos)
npm run seed:force
```

## Uso en el Código

### Importar el seeder principal
```javascript
import { runAllSeeders } from './src/seeders/index.js';

// En server.js
await runAllSeeders();
```

### Importar seeders específicos
```javascript
import { seedUsers, seedUsersForce } from './src/seeders/user.js';

// Seeder normal (solo si no hay datos)
await seedUsers();

// Seeder forzado (limpia y recrea)
await seedUsersForce();
```

## Agregar Nuevos Seeders

### 1. Crear el archivo del seeder

```javascript
// src/seeders/movies.js
import Movie from '../models/Movie.js';

export const seedMovies = async () => {
    try {
        // Verificar si ya existen películas
        const existingMoviesCount = await Movie.countDocuments();
        
        if (existingMoviesCount > 0) {
            console.log(`ℹ️  Ya existen ${existingMoviesCount} películas en la base de datos`);
            console.log('⏭️  Saltando seeding de películas (datos ya existen)');
            return;
        }
        
        console.log('🔄 No se encontraron películas existentes, procediendo con el seeding...');

        // Datos de prueba
        const moviesData = [
            { title: 'Movie 1', genre: 'Action', year: 2023 },
            { title: 'Movie 2', genre: 'Drama', year: 2024 }
        ];

        // Crear películas
        for (const movieData of moviesData) {
            const movie = new Movie(movieData);
            await movie.save();
            console.log(`✅ Película creada: ${movieData.title}`);
        }

        console.log('🎉 Seeding de películas completado exitosamente');
        
    } catch (error) {
        console.error('❌ Error durante el seeding de películas:', error);
        throw error;
    }
};
```

### 2. Actualizar el seeder principal

```javascript
// src/seeders/index.js
import { seedUsers } from './user.js';
import { seedMovies } from './movies.js'; // ← Agregar import

export const runAllSeeders = async () => {
    try {
        const seeders = [
            {
                name: 'Users',
                seeder: seedUsers,
                description: 'Crear usuarios de prueba'
            },
            {
                name: 'Movies',           // ← Agregar nuevo seeder
                seeder: seedMovies,
                description: 'Crear películas de prueba'
            }
        ];
        // ... resto del código
    }
}
```

### 3. Actualizar scripts en package.json

```json
{
  "scripts": {
    "seed:movies": "node src/seeders/movies.js"
  }
}
```

## Ventajas del Sistema

1. **🛡️ Seguro**: No duplica datos existentes
2. **🚀 Automático**: Se ejecuta al iniciar el servidor
3. **🔧 Flexible**: Permite ejecutar seeders individuales
4. **📈 Escalable**: Fácil agregar nuevos seeders
5. **🔄 Desarrollo**: Opción de forzar recreación para testing

## Estados de los Seeders

- **✅ Completado**: Datos creados exitosamente
- **ℹ️ Saltado**: Datos ya existen, no se hace nada
- **❌ Error**: Problema durante la ejecución
- **🔄 Ejecutando**: Seeder en proceso

## Logs del Sistema

El sistema proporciona logs detallados:

```
🌱 Iniciando proceso de seeding...
📋 Seeders disponibles: 1

🔄 Ejecutando seeder: Users
📝 Crear usuarios de prueba
ℹ️  Ya existen 4 usuarios en la base de datos
⏭️  Saltando seeding de usuarios (datos ya existen)
✅ Seeder Users completado

🎉 Proceso de seeding completado
```
