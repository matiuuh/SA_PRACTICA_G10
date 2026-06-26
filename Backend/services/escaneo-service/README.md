# escaneo-service

Microservicio de control de acceso de FilmStars. Recibe el código QR leído por
la cámara, autentica que el operador sea administrador y delega la mutación
transaccional del boleto a `reservas-service` mediante un endpoint interno.

## Endpoints

- `GET /api/escaneo/health`
- `POST /api/escaneo/validar` (JWT de administrador)

## Variables

- `PORT` (por defecto `3007`)
- `JWT_SECRET`
- `RESERVAS_SERVICE_URL`
- `INTERNAL_SERVICE_TOKEN`
