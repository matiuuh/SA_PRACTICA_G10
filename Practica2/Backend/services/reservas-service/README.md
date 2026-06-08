# reservas-service

Servicio encargado del flujo de reservas y boletos.

## Responsabilidades

- gestion de asientos por funcion
- creacion de reservas temporales
- confirmacion de reservas
- emision de boletos

## Endpoints base

- `GET /api/reservas/funciones/:id/asientos`
- `GET /api/reservas/:id`
- `GET /api/reservas/boletos/:id`
- `POST /api/reservas/asientos`
- `POST /api/reservas/estados`
- `POST /api/reservas`
- `POST /api/reservas/:id/confirmar`

## Base de datos

Este servicio sigue el script `03-ER_RESERVAS.sql`:

- `asientos`
- `estado_reserva`
- `reservas`
- `reserva_detalle`
- `boletos`

