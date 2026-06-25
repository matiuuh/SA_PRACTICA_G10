# reservas-service

Servicio encargado del flujo de reservas y boletos.

## Responsabilidades

- gestion de asientos por funcion
- creacion de reservas temporales
- confirmacion de reservas
- emision de boletos
- estados operativos de asientos y boletos
- auditoria de uso de boletos

## Endpoints base

- `GET /api/reservas/funciones/:id/asientos`
- `GET /api/reservas/:id`
- `GET /api/reservas/boletos/:id`
- `GET /api/reservas/mis-boletos?page=1&limit=10`
- `GET /api/reservas/admin/boletos?identificador=&pelicula=&fechaDesde=&fechaHasta=&estado=`
- `POST /api/reservas/internal/boletos/validar-escaneo` (solo `escaneo-service`)
- `POST /api/reservas/boletos/:id/validar-manualmente`
- `GET /api/reservas/boletos/:id/descargar`
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

Los asientos usan los estados `DISPONIBLE`, `RESERVADO` y `EN_USO`.
Los boletos usan los estados `VALIDO` y `USADO`.

Para una base de datos ya creada, se debe aplicar:

```bash
psql "$DATABASE_URL" -f db/migrations/001_ticket_access_control.sql
psql "$DATABASE_URL" -f db/migrations/002_ticket_historical_snapshot.sql
psql "$DATABASE_URL" -f db/migrations/003_ticket_history_indexes.sql
psql "$DATABASE_URL" -f db/migrations/004_admin_ticket_search_indexes.sql
```

`FUNCIONES_SERVICE_URL` configura el origen de los datos históricos de función,
película y sala guardados al emitir un boleto.
