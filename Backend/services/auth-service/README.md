# auth-service

Servicio de autenticacion y sesion para la Practica 2.

## Incluye

- registro de usuarios
- inicio de sesion
- hash de contrasenas con `bcrypt`
- emision y validacion de `JWT`
- consulta basica de usuarios y roles
- entidades alineadas con `01-ER_USUARIOS.sql`

## Endpoints base

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/users/:id`

## Variables de entorno

Revisa `.env.example` para configurar:

- puerto
- conexion a PostgreSQL
- secreto JWT
- rol por defecto
