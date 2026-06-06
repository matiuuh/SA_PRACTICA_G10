# auth-service

Base inicial para el servicio de autenticacion y usuarios de la Practica 2.

## Responsabilidades

- registro de usuarios
- inicio de sesion
- hash de contrasenas
- emision y validacion de JWT
- consulta basica de usuarios y roles

## Estructura sugerida

- `src/auth`: login, JWT, guards y estrategias
- `src/users`: usuarios, roles y registro
- `test`: pruebas del servicio

## Archivos que luego puedes crear

- `src/main.ts`
- `src/app.module.ts`
- `src/auth/auth.module.ts`
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/users/users.module.ts`
- `src/users/users.controller.ts`
- `src/users/users.service.ts`
