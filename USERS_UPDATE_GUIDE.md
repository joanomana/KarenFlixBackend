# Guía de Actualización de Usuarios

## 🔒 Validaciones de Contraseña Aplicadas en TODOS los casos:

Las validaciones de contraseña se aplican consistentemente en:
- ✅ **Creación desde seeder**
- ✅ **Creación desde endpoint** 
- ✅ **Actualización por administrador**
- ✅ **Cambio de contraseña por usuario**

### Requisitos de contraseña:
- **Mínimo 6 caracteres**
- **Al menos una letra minúscula (a-z)**
- **Al menos una letra mayúscula (A-Z)**  
- **Al menos un número (0-9)**

## Rutas disponibles para actualización de usuarios:

### 1. Actualización de perfil por usuario normal
**Endpoint:** `PATCH /api/v1/users/:id/update-profile`
**Autenticación:** Token de usuario (solo puede editar sus propios datos)
**Campos permitidos:** 
- `username` (opcional)

**Ejemplo de uso:**
```bash
curl -X PATCH http://localhost:4000/api/v1/users/USER_ID/update-profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "nuevo_nombre_usuario"}'
```

**Restricciones:**
- Solo puede cambiar su propio perfil
- Solo puede cambiar el username
- No puede cambiar email ni rol

### 2. Cambio de contraseña (usuarios y admin)
**Endpoint:** `PATCH /api/v1/users/:id/change-password`
**Autenticación:** Token de usuario (puede cambiar su propia contraseña o admin puede cambiar cualquiera)

**Ejemplo de uso:**
```bash
curl -X PATCH http://localhost:4000/api/v1/users/USER_ID/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password_actual",
    "newPassword": "NuevaPassword123"
  }'
```

### 3. Actualización completa (solo administradores)
**Endpoint:** `PUT /api/v1/users/:id`
**Autenticación:** Token de administrador
**Campos permitidos:**
- `username`
- `email` 
- `role`
- `password` (opcional)

**Ejemplo de uso:**
```bash
curl -X PUT http://localhost:4000/api/v1/users/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nuevo_usuario",
    "email": "nuevo@email.com",
    "role": "admin"
  }'
```

## Usuarios de prueba creados:

- **Admin:** admin@example.com / admin123
- **Usuario normal:** johndoe john@example.com / password123
- **Usuario normal:** janedoe jane@example.com / password456
- **Usuario normal:** moderator mod@example.com / mod12345

## Flujo de trabajo recomendado:

1. **Para usuarios normales:** Usar `/update-profile` para cambiar username y `/change-password` para cambiar contraseña
2. **Para administradores:** Usar las rutas completas para gestionar cualquier aspecto de los usuarios
