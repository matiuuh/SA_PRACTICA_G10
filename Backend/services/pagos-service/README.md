# pagos-service

Servicio encargado del flujo de pagos y transacciones.

## Responsabilidades

- gestion de metodos de pago
- control de estados de pago
- registro de pagos por reserva externa
- registro de transacciones

## Endpoints base

- `GET /api/pagos/metodos`
- `GET /api/pagos/reserva/:id`
- `GET /api/pagos/:id`
- `POST /api/pagos/metodos`
- `POST /api/pagos/estados`
- `POST /api/pagos`
- `POST /api/pagos/:id/aprobar`
- `POST /api/pagos/:id/rechazar`

## Base de datos

Este servicio sigue el script `04-ER_PAGOS.sql`:

- `metodos_pago`
- `estado_pago`
- `pagos`
- `transacciones`
