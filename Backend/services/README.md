# Servicios Backend

Esta carpeta agrupa los servicios del backend con enfoque SOA.

## Servicios

- `auth-service`
- `localidades-service`
- `funciones-service`
- `reservas-service`
- `pagos-service`
- `escaneo-service`

## Convencion sugerida

Cada servicio puede tener su propia estructura NestJS, su propia base de datos y su propio `Dockerfile`.

## Docker Compose

En `Practica2/Backend/docker-compose.yml` se levanta una base inicial para:

- `auth-service` con `auth-db`
- `localidades-service` con `localidades-db`

Comando sugerido:

`docker compose up --build`
