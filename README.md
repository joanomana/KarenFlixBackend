# 🎬 KarenFlix Backend API

## 📋 Descripción

**KarenFlix Backend** es una API REST completa para un sistema de reseñas y rankings de películas, animes y series. Diseñado para la comunidad geek, permite a los usuarios descubrir, reseñar y rankear contenido audiovisual con un sistema robusto de autenticación y autorización.

## Autores

- Joan Sebastian Omaña Suarez
- David Adolfo Gomez Uribe

## ✨ Características Principales

- 🔐 **Autenticación JWT** con refresh tokens
- 👥 **Sistema de roles** (usuario/admin)
- 🎭 **Gestión de contenido multimedia** (películas, series, anime)
- ⭐ **Sistema de reseñas y ratings**
- 🛡️ **Seguridad robusta** con rate limiting y validaciones
- 📖 **Documentación completa** con Swagger UI
- 🌱 **Sistema de seeders** automático
- 🚀 **Arquitectura escalable** y modular

## 🛠️ Stack Tecnológico

### **Backend Core**
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Base de datos:** MongoDB (conexión nativa)

### **Autenticación & Seguridad**
- **JWT:** jsonwebtoken para tokens de acceso
- **Hash:** bcryptjs para contraseñas
- **Passport.js:** estrategias de autenticación
- **Helmet:** headers de seguridad HTTP
- **Rate Limiting:** express-rate-limit

### **Validación & Documentación**
- **Validación:** express-validator
- **API Docs:** Swagger UI + swagger-jsdoc
- **CORS:** control de acceso entre dominios

### **Utilidades**
- **Variables entorno:** dotenv
- **Versionado semántico:** semver

## 🚀 Instalación y Configuración

### **Prerrequisitos**
```bash
Node.js >= 16.0.0
MongoDB >= 5.0
npm >= 8.0.0
```

### **1. Clonar el repositorio**
```bash
git clone https://github.com/joanomana/KarenFlixBackend.git
cd KarenFlixBackend
```

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Configurar variables de entorno**
```bash
# Crear archivo .env
cp .env.example .env
```

**Variables de entorno requeridas:**
```env
# Servidor
PORT=4000
NODE_ENV=development
HOST=0.0.0.0

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/karenflix

# JWT Secrets
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_aqui_123456789
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=tu_clave_refresh_token_secreta
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting (opcional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Base de datos configuración (opcional)
DB_MAX_POOL=10
DB_MIN_POOL=0
DB_SRV_TIMEOUT=10000
DB_SOCKET_TIMEOUT=45000
```

### **4. Iniciar la aplicación**
```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm start

# Solo ejecutar seeders
npm run seed
```

## 📁 Estructura del Proyecto

```
KarenFlixBackend/
├── 📁 src/
│   ├── 📁 config/           # Configuraciones del sistema
│   │   ├── db.js           # Conexión a MongoDB
│   │   ├── passport.js     # Configuración de Passport.js
│   │   └── swagger.js      # Configuración de Swagger
│   ├── 📁 controllers/     # Lógica de negocio
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   └── media.controller.js
│   ├── 📁 middlewares/     # Middlewares personalizados
│   │   ├── auth.js         # Autenticación y autorización
│   │   ├── validation.js   # Validaciones de entrada
│   │   ├── rateLimiter.js  # Rate limiting
│   │   ├── errorHandler.js # Manejo de errores
│   │   └── passwordValidation.js
│   ├── 📁 models/          # Modelos de datos
│   │   ├── User.js         # Modelo de usuarios
│   │   └── Media.js        # Modelo de contenido multimedia
│   ├── 📁 routes/          # Definición de rutas API
│   │   ├── auth.route.js   # Rutas de autenticación
│   │   ├── user.route.js   # Rutas de usuarios
│   │   └── media.route.js  # Rutas de contenido
│   ├── 📁 services/        # Servicios de negocio
│   │   ├── user.service.js
│   │   └── media.service.js
│   ├── 📁 utils/           # Utilidades y helpers
│   │   ├── jwt.js          # Utilidades JWT
│   │   ├── responses.js    # Respuestas estandarizadas
│   │   └── seederUtils.js  # Utilidades para seeders
│   └── 📁 seeders/         # Scripts de población de datos
│       ├── index.js        # Coordinador de seeders
│       ├── user.js         # Datos de usuarios de prueba
│       └── media.js        # Datos de contenido de prueba
├── 📄 app.js              # Configuración principal de Express
├── 📄 server.js           # Punto de entrada del servidor
└── 📄 package.json        # Dependencias y scripts
```

## � API Endpoints

**Base URL:** `http://localhost:4000/api/v1`

### **🔐 Autenticación (`/auth`)**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Registrar nuevo usuario | ❌ |
| `POST` | `/auth/login` | Iniciar sesión | ❌ |
| `POST` | `/auth/refresh-token` | Renovar token de acceso | ❌ |
| `GET` | `/auth/profile` | Obtener perfil del usuario | ✅ JWT |
| `POST` | `/auth/logout` | Cerrar sesión | ✅ JWT |

### **👥 Gestión de Usuarios (`/users`)**

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `GET` | `/users` | Listar todos los usuarios (paginado) | 🔴 Admin |
| `GET` | `/users/{id}` | Obtener usuario por ID | 🟡 Propietario/Admin |
| `PUT` | `/users/{id}` | Actualizar usuario completo | 🔴 Admin |
| `DELETE` | `/users/{id}` | Eliminar usuario | 🔴 Admin |
| `PATCH` | `/users/{id}/update-profile` | Actualizar perfil propio | 🟡 Propietario |
| `PATCH` | `/users/{id}/change-password` | Cambiar contraseña | 🟡 Propietario/Admin |

### **🎬 Gestión de Contenido (`/media`)**

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| `POST` | `/media/suggest` | Sugerir nuevo contenido | ✅ Usuario |
| `POST` | `/media` | Crear contenido aprobado | 🔴 Admin |
| `GET` | `/media` | Listar contenido (admin) | 🔴 Admin |
| `PUT` | `/media/{id}` | Actualizar contenido | 🔴 Admin |
| `DELETE` | `/media/{id}` | Eliminar contenido | 🔴 Admin |
| `PUT` | `/media/{id}/approve` | Aprobar sugerencia | 🔴 Admin |
| `PUT` | `/media/{id}/reject` | Rechazar sugerencia | 🔴 Admin |

### **🌐 Endpoints Públicos (`/media/public`)**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/media/public` | Contenido público aprobado | ❌ |
| `GET` | `/media/public/{id}` | Detalle de contenido | ❌ |
| `GET` | `/media/ranking` | Ranking por puntuación | ❌ |
| `GET` | `/media/popular` | Contenido popular | ❌ |
| `GET` | `/media/category/{slug}` | Contenido por categoría | ❌ |

## 🧪 Ejemplos de Uso

### **🔐 Autenticación**

**Registro de usuario:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "60d5ecb74b14b84f17c7b8a1",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-09-01T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### **👥 Gestión de Usuarios**

**Obtener perfil (autenticado):**
```bash
curl -X GET http://localhost:4000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Actualizar perfil propio:**
```bash
curl -X PATCH http://localhost:4000/api/v1/users/USER_ID/update-profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "nuevo_username"}'
```

**Cambiar contraseña:**
```bash
curl -X PATCH http://localhost:4000/api/v1/users/USER_ID/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Password123",
    "newPassword": "NewPassword456"
  }'
```

### **🎬 Contenido Multimedia**

**Sugerir nuevo contenido:**
```bash
curl -X POST http://localhost:4000/api/v1/media/suggest \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dune",
    "type": "movie",
    "description": "Épica película de ciencia ficción",
    "category": "Ciencia Ficción",
    "year": 2021,
    "imageUrl": "https://example.com/dune.jpg"
  }'
```

**Contenido público (sin autenticación):**
```bash
# Listar contenido aprobado
curl -X GET "http://localhost:4000/api/v1/media/public?page=1&limit=10&type=movie"

# Obtener ranking
curl -X GET "http://localhost:4000/api/v1/media/ranking?page=1&limit=10"

# Contenido por categoría
curl -X GET "http://localhost:4000/api/v1/media/category/ciencia-ficcion"
```

## �️ Seguridad Implementada

### **🔒 Autenticación**
- **JWT tokens** con expiración configurable
- **Refresh tokens** para renovación automática
- **Hashing seguro** de contraseñas con bcrypt (12 rounds)
- **Validación robusta** de credenciales

### **⚡ Rate Limiting**
```javascript
// Límites implementados
General: 100 requests / 15 minutos
Autenticación: 10 intentos / 15 minutos
Registro: 5 registros / hora
Cambio contraseña: 3 cambios / hora
```

### **🔐 Validaciones de Contraseña**
- **Mínimo 6 caracteres**
- **Al menos una minúscula (a-z)**
- **Al menos una mayúscula (A-Z)**
- **Al menos un número (0-9)**

### **🛡️ Middlewares de Seguridad**
- **Helmet:** Headers de seguridad HTTP
- **CORS:** Control de acceso entre dominios
- **MongoDB injection** protection
- **XSS protection**
- **Validación de ObjectIds**

## 👥 Sistema de Roles y Permisos

### **🟢 Usuario Normal (`user`)**
- ✅ Ver contenido público
- ✅ Sugerir nuevo contenido
- ✅ Actualizar su propio perfil
- ✅ Cambiar su propia contraseña
- ✅ Ver su propio perfil

### **🔴 Administrador (`admin`)**
- ✅ **Todos los permisos de usuario normal +**
- ✅ Gestionar usuarios (CRUD completo)
- ✅ Aprobar/rechazar sugerencias de contenido
- ✅ Gestionar contenido multimedia (CRUD)
- ✅ Ver estadísticas y métricas
- ✅ Acceso a panel administrativo

## 🌱 Sistema de Seeders

### **Ejecución Automática**
El sistema ejecuta seeders automáticamente al iniciar:
- ✅ **Verificación inteligente:** Solo crea datos si no existen
- ✅ **Sin duplicados:** Evita datos repetidos
- ✅ **Datos de prueba:** Usuarios y contenido inicial

### **Usuarios de Prueba Creados**
```javascript
// Administrador
admin@example.com / Admin123

// Usuarios normales
john@example.com / Password123
jane@example.com / Password456
mod@example.com / Mod12345
```

### **Scripts Disponibles**
```bash
# Ejecutar todos los seeders
npm run seed

# Solo seeders de usuarios
node src/seeders/user.js

# Solo seeders de contenido
node src/seeders/media.js
```

## 📖 Documentación de la API

### **Swagger UI**
La documentación completa está disponible en:
```
http://localhost:4000/api/v1/docs
```

### **Características de la Documentación**
- 📋 **Esquemas detallados** para todos los endpoints
- 🧪 **Ejemplos listos para usar** en cada ruta
- 🔐 **Autenticación integrada** en la interfaz
- ✅ **Validaciones documentadas** con patrones y restricciones
- 🎯 **Códigos de respuesta** completos con ejemplos
- 🔍 **Filtros y parámetros** de búsqueda documentados

## � Códigos de Respuesta HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| `200` | ✅ Éxito | Operación completada exitosamente |
| `201` | ✅ Creado | Recurso creado exitosamente |
| `400` | ❌ Bad Request | Datos de entrada inválidos |
| `401` | 🔒 Unauthorized | Token ausente o inválido |
| `403` | 🚫 Forbidden | Sin permisos suficientes |
| `404` | 🔍 Not Found | Recurso no encontrado |
| `409` | ⚠️ Conflict | Recurso ya existe (duplicado) |
| `422` | 📝 Unprocessable | Error de validación |
| `429` | ⏰ Too Many Requests | Rate limit excedido |
| `500` | 💥 Internal Error | Error interno del servidor |

## � Formato de Respuestas

### **Respuesta Exitosa**
```json
{
  "success": true,
  "message": "Operación completada exitosamente",
  "data": {
    "user": {
      "id": "60d5ecb74b14b84f17c7b8a1",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### **Respuesta de Error**
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    {
      "field": "password",
      "message": "La contraseña debe contener al menos una mayúscula"
    }
  ]
}
```

### **Respuesta Paginada**
```json
{
  "success": true,
  "message": "Datos obtenidos exitosamente",
  "data": [...],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🧪 Testing

### **Health Check**
```bash
curl http://localhost:4000/health
```

**Respuesta:**
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-09-01T10:30:00.000Z",
  "db": 1,
  "uptime": 3600.5,
  "version": "1.0.0",
  "environment": "development"
}
```

### **Estados de Conexión DB**
- `0` = Desconectado
- `1` = Conectado ✅
- `2` = Conectando
- `3` = Desconectando

## 🔧 Scripts de Desarrollo

```bash
# Desarrollo con hot reload
npm run dev

# Producción
npm start

# Ejecutar todos los seeders
npm run seed

# Verificar salud del servidor
curl http://localhost:4000/health

# Ver logs en tiempo real (desarrollo)
tail -f logs/app.log
```

## 🌐 Deployment

### **Variables de Producción**
```env
NODE_ENV=production
PORT=80
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/karenflix
JWT_SECRET=clave_super_secreta_produccion
CORS_ORIGIN=https://karenflix.com
```

### **Consideraciones de Producción**
- ✅ **HTTPS obligatorio** en producción
- ✅ **Variables de entorno seguras**
- ✅ **Rate limiting ajustado**
- ✅ **Logs estructurados**
- ✅ **Monitoreo de salud**

## 🚀 Roadmap y Funcionalidades

### **✅ Implementado**
- Sistema de autenticación completo
- Gestión de usuarios con roles
- CRUD de contenido multimedia
- Sistema de sugerencias
- Documentación Swagger completa
- Rate limiting y seguridad
- Seeders automáticos

### **🔄 En Desarrollo**
- [ ] Sistema de reseñas y ratings
- [ ] Algoritmo de ranking ponderado
- [ ] Sistema de likes/dislikes
- [ ] Categorías dinámicas
- [ ] Búsqueda avanzada

### **🔮 Próximas Funcionalidades**
- [ ] Tests unitarios e integración
- [ ] Subida de imágenes (Cloudinary)
- [ ] Notificaciones en tiempo real
- [ ] Cache con Redis
- [ ] Métricas y analytics
- [ ] API de terceros (TMDB, IMDB)

## 🤝 Contribución

### **Flujo de Trabajo**
1. **Fork** el repositorio
2. **Crear rama:** `git checkout -b feature/nueva-funcionalidad`
3. **Commit:** `git commit -am 'Añade nueva funcionalidad'`
4. **Push:** `git push origin feature/nueva-funcionalidad`
5. **Pull Request** con descripción detallada

### **Estándares de Código**
- ✅ **ES Modules** (import/export)
- ✅ **Async/await** para operaciones asíncronas
- ✅ **Validaciones robustas** en todos los endpoints
- ✅ **Manejo de errores** centralizado
- ✅ **Documentación** en cada función
- ✅ **Nombres descriptivos** para variables y funciones

### **🏗️ Principios SOLID Implementados**

#### **📌 Single Responsibility Principle (SRP)**
- **Controladores:** Cada controlador tiene una única responsabilidad
  - `auth.controller.js` → Solo maneja autenticación
  - `user.controller.js` → Solo maneja gestión de usuarios
  - `media.controller.js` → Solo maneja contenido multimedia
- **Middlewares especializados:**
  - `auth.js` → Solo autenticación y autorización
  - `validation.js` → Solo validaciones de entrada
  - `rateLimiter.js` → Solo limitación de velocidad
  - `errorHandler.js` → Solo manejo de errores
- **Servicios:** Cada servicio encapsula lógica específica de dominio
  - `user.service.js` → Lógica de negocio de usuarios
  - `media.service.js` → Lógica de negocio de contenido

#### **📌 Open/Closed Principle (OCP)**
- **Middlewares extensibles:** Nuevos middlewares se pueden agregar sin modificar existentes
- **Validaciones modulares:** Nuevas validaciones se agregan como nuevas funciones
- **Rate limiters configurables:** Diferentes limiters para distintos endpoints
- **Sistema de respuestas:** `responses.js` permite agregar nuevos tipos sin modificar existentes

#### **📌 Liskov Substitution Principle (LSP)**
- **Middlewares intercambiables:** Todos los middlewares siguen la misma interfaz `(req, res, next)`
- **Controladores consistentes:** Todos siguen el patrón `async (req, res, next)`
- **Servicios estáticos:** Métodos de servicio intercambiables con misma signatura

#### **📌 Interface Segregation Principle (ISP)**
- **Middlewares específicos:** Cada middleware tiene una interfaz mínima y específica
  - `authenticateToken` → Solo autenticación
  - `requireAdmin` → Solo verificación de rol admin
  - `requireOwnershipOrAdmin` → Solo verificación de propiedad
- **Servicios segregados:** UserService no depende de funcionalidades que no usa
- **Utilidades separadas:** JWT, respuestas y validaciones en módulos independientes

#### **📌 Dependency Inversion Principle (DIP)**
- **Inyección de dependencias:** Controladores dependen de abstracciones (servicios)
- **Configuración externa:** Variables de entorno para configuraciones
- **Modelos desacoplados:** Uso de servicios en lugar de acceso directo a modelos
- **Middlewares como abstracciones:** Lógica de autenticación abstraída del controlador

## � Enlaces y Recursos

### **📚 Documentación y Testing**
- 🌐 **Swagger UI:** [`http://localhost:4000/api/v1/docs`](http://localhost:4000/api/v1/docs)
- 📮 **Colección Postman:** [🔗 Importar Collection de Postman](https://documenter.getpostman.com/view/42985627/2sB3HgQiJJ)
- 📹 **Video Explicativo:** [🎥 Ver explicación del proyecto](https://www.tiktok.com/@davidgomez071/video/7545314048234032440)

### **🔗 Repositorios Relacionados**
- 🎨 **Frontend React:** [🔗 KarenFlix Frontend](https://github.com/joanomana/karenflixfrontend/tree/c78be754e7953d29df38871f0750edeef8562f36)
- 🛠️ **Backend API:** [🔗 Este repositorio](https://github.com/joanomana/KarenFlixBackend)

### **🌐 Enlaces Útiles**
- 📖 **API Base URL:** `http://localhost:4000/api/v1`
- 🏥 **Health Check:** `http://localhost:4000/health`
- 📊 **Swagger Docs:** `http://localhost:4000/api/v1/docs`
- 📊 **Docs:** `https://drive.google.com/drive/folders/1Aq-BI09Flr5jnBQ97J4-VP7qCPq3L7sI?usp=sharing)`

---

## �📞 Soporte y Contacto

- � **Email:** [contacto@karenflix.com]
- 🐛 **Issues:** [GitHub Issues](https://github.com/joanomana/KarenFlixBackend/issues)
- 📚 **Documentación:** `http://localhost:4000/api/v1/docs`
- 🌐 **API Base:** `http://localhost:4000/api/v1`

---

## 📄 Licencia

Este proyecto está bajo la **Licencia ISC**.

## 📈 Estado del Proyecto

```
🟢 Activo en desarrollo
📊 Versión: 1.0.0
🔧 Mantenimiento: Activo
📝 Documentación: Completa
🧪 Tests: En desarrollo
```

---

**Desarrollado con ❤️ para la comunidad geek**