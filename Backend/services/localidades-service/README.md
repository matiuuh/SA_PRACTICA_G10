# localidades-service

Servicio encargado de las ubicaciones fisicas del negocio.

## Responsabilidades

- gestion de ciudades
- gestion de cines
- consulta de ubicacion para que el frontend pueda filtrar funciones

La gestion de salas pertenece a `funciones-service`, que relaciona cada sala
con un cine mediante `id_cine_externo`.

## Endpoints base

- `GET /api/localidades/ciudades`
- `GET /api/localidades/ciudades/:id/cines`
- `POST /api/localidades/ciudades`
- `POST /api/localidades/cines`

## Base de datos

Este servicio sigue el script `05-ER_LOCALIDADES.sql`:

- `ciudades`
- `cines`

