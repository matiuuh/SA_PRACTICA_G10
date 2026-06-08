
## Como levantar los servicios

### Requisitos previos
- Docker Desktop instalado y corriendo
- En Docker Desktop → Settings → Docker Engine, agregar `"dns": ["8.8.8.8", "8.8.4.4"]` si hay problemas de red en el build

### Levantar todo con Docker Compose (recomendado)

Desde la carpeta `Practica2/`:

```bash
# Primera vez o cuando haya cambios en el codigo
docker compose up --build

# Ejecuciones posteriores (sin rebuild)
docker compose up

# En segundo plano
docker compose up -d
```

Esto levanta automaticamente en el orden correcto: bases de datos → RabbitMQ → microservicios → API Gateway → frontend.

### URLs de acceso

| Recurso | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3006 |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |

### Verificar que todo esta vivo

```bash
# Health check del gateway y servicios
curl http://localhost:3006/health
curl http://localhost:3006/api/auth/health
curl http://localhost:3006/api/localidades/health
curl http://localhost:3006/api/funciones/health
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker compose logs -f

# Un servicio especifico
docker compose logs -f api-gateway
docker compose logs -f auth-service
```

### Detener los servicios

```bash
# Detener sin borrar volumenes (conserva datos de BD)
docker compose down

# Detener y borrar volumenes (resetea todas las BDs)
docker compose down -v
```

### Desarrollo local (sin Docker)

Para correr un servicio individualmente durante desarrollo:

```bash
# Desde la carpeta del servicio (ej: localidades-service)
pnpm install
pnpm start:dev
```

El frontend en modo desarrollo:
```bash
cd frontend
pnpm install
pnpm dev
```

> **Nota:** en modo desarrollo el frontend apunta al API Gateway en `http://localhost:3006` por defecto. Asegurate de que los demas servicios esten corriendo (via Docker o localmente).


[Volver a Documentacion](../Documentación.md)