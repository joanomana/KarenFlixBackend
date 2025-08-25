# KarenFlix Backend - Sistema de Reseñas de Películas y Series

## 📋 Descripción

Sistema backend para una aplicación de reseñas y rankings de películas, animes y series geek. Desarrollado con Node.js, Express, MongoDB y JWT para autenticación.

## ✨ Características

- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Autorización basada en roles** (usuario/admin)
- ✅ **Rate limiting** para prevenir abuso
- ✅ **Validaciones robustas** con express-validator
- ✅ **Seguridad mejorada** con helmet y bcrypt
- ✅ **Manejo de errores centralizado**
- ✅ **Arquitectura modular y escalable**
- ✅ **Documentación con Swagger** (próximamente)

## 🛠️ Tecnologías

- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de datos:** MongoDB con Mongoose
- **Autenticación:** JWT + Passport.js + bcrypt
- **Validación:** express-validator
- **Seguridad:** helmet, express-rate-limit
- **Documentación:** swagger-ui-express

## 🚀 Instalación

### Prerrequisitos
- Node.js >= 16.0.0
- MongoDB >= 5.0
- npm o yarn

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone <tu-repositorio>
   cd KarenFlixBackend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus valores:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/karenflix
   JWT_SECRET=tu_super_secreto_jwt_aqui
   JWT_EXPIRES_IN=7d
   ```

4. **Iniciar MongoDB** (si es local)

5. **Ejecutar la aplicación:**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## 📚 API Endpoints

### Base URL: `http://localhost:3000/api/v1`

### 🔐 Autenticación (`/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/refresh-token` | Renovar token | No |
| GET | `/auth/profile` | Obtener perfil | Sí |
| PUT | `/auth/profile` | Actualizar perfil | Sí |
| POST | `/auth/logout` | Cerrar sesión | Sí |

### 👥 Usuarios (`/users`) - Solo Admin

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Listar usuarios | Admin |
| GET | `/users/:id` | Obtener usuario | Owner/Admin |
| POST | `/users` | Crear usuario | Admin |
| PUT | `/users/:id` | Actualizar usuario | Owner/Admin |
| DELETE | `/users/:id` | Eliminar usuario | Admin |
| PATCH | `/users/:id/change-password` | Cambiar contraseña | Owner/Admin |

## 🧪 Ejemplos de Uso

### Registro de Usuario
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "Password123"
  }'
```

### Acceder a Perfil (con token)
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer tu_jwt_token_aqui"
```

## 🔧 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `MONGODB_URI` | URI de MongoDB | `mongodb://localhost:27017/karenflix` |
| `JWT_SECRET` | Secreto para JWT | `tu_super_secreto_jwt` |
| `JWT_EXPIRES_IN` | Expiración del JWT | `7d` |
| `JWT_REFRESH_SECRET` | Secreto para refresh token | `otro_secreto` |
| `JWT_REFRESH_EXPIRES_IN` | Expiración refresh token | `30d` |
| `CORS_ORIGIN` | Origen permitido por CORS | `http://localhost:3001` |

## 📁 Estructura del Proyecto

```
src/
├── config/          # Configuraciones (DB, Passport, etc.)
├── controllers/     # Lógica de controladores
├── middlewares/     # Middlewares personalizados
├── models/          # Modelos de Mongoose
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── utils/           # Utilidades y helpers
└── seeders/         # Scripts para poblar la DB
```

## 🗂️ Seeders

Para poblar la base de datos con datos de prueba:

```bash
node src/seeders/user.js
```

**Usuarios de prueba creados:**
- Admin: `admin@example.com` / `admin123`
- Usuario: `john@example.com` / `password123`

## 🛡️ Seguridad

- **Bcrypt:** Hashing seguro de contraseñas
- **JWT:** Tokens seguros con expiración
- **Rate Limiting:** Protección contra ataques de fuerza bruta
- **Helmet:** Headers de seguridad HTTP
- **CORS:** Control de acceso entre dominios
- **Validación:** Sanitización de inputs

## 🚦 Rate Limits

- **General:** 100 requests/15 min
- **Auth:** 10 intentos/15 min
- **Registro:** 5 registros/hora
- **Contraseña:** 3 cambios/hora

## 🔄 Estados HTTP

- **200:** Éxito
- **201:** Creado exitosamente
- **400:** Datos inválidos
- **401:** No autenticado
- **403:** Sin permisos
- **404:** Recurso no encontrado
- **409:** Conflicto (ej. usuario ya existe)
- **429:** Demasiadas peticiones
- **500:** Error interno del servidor

## 🧑‍💻 Desarrollo

### Scripts disponibles:
```bash
npm run dev      # Modo desarrollo con nodemon
npm start        # Modo producción
npm test         # Ejecutar tests (por implementar)
```

### Comandos útiles:
```bash
# Ver logs en tiempo real
npm run dev

# Verificar salud del servidor
curl http://localhost:3000/health

# Ejecutar seeders
node src/seeders/user.js
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -am 'Añade nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Contacto

- **Proyecto:** KarenFlix Backend
- **Repositorio Frontend:** [Enlace al repo del frontend]

---

## 🔮 Próximas Funcionalidades

- [ ] CRUD de películas/series
- [ ] Sistema de reseñas y ratings  
- [ ] Sistema de likes/dislikes
- [ ] Categorías y filtros
- [ ] Rankings ponderados
- [ ] Documentación Swagger completa
- [ ] Tests unitarios e integración
- [ ] Subida de imágenes
- [ ] Notificaciones
- [ ] Cache con Redis
