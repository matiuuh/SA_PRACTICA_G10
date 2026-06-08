# localidades-service

Servicio encargado de las ubicaciones fisicas del negocio.

## Responsabilidades

- gestion de ciudades
- gestion de cines
- gestion de salas
- consulta de ubicacion para que el frontend pueda filtrar funciones

## Endpoints base

- `GET /api/localidades/ciudades`
- `GET /api/localidades/ciudades/:id/cines`
- `GET /api/localidades/cines/:id/salas`
- `POST /api/localidades/ciudades`
- `POST /api/localidades/cines`
- `POST /api/localidades/salas`

## Base de datos

Este servicio sigue el script `05-ER_LOCALIDADES.sql`:

- `ciudades`
- `cines`
- `salas`

