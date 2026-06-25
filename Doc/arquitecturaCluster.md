# Arquitectura del Clúster K3s

## Distribución física del clúster

### Nodos

El clúster se despliega en **un único nodo maestro** sobre una instancia EC2 en AWS. K3s combina
el plano de control (API Server, Scheduler, Controller Manager) y el plano de datos en el mismo proceso, lo que lo hace apto para entornos de práctica y desarrollo
donde no se requiere alta disponibilidad del propio clúster.

| Nodo | Rol | Instancia EC2 | IP Pública | Sistema Operativo |
|------|-----|--------------|-----------|-------------------|
| `ip-172-31-24-43` | master + worker | t3.medium | 98.84.183.129 | Ubuntu 22.04 LTS |

**Recursos físicos del nodo:**

| Recurso | Disponible |
|---------|-----------|
| vCPU | 2 |
| RAM | 4 GB |
| Almacenamiento | EBS 20 GB + PVCs dinámicos |
| Red | Hasta 5 Gbps |

---

## Namespaces

El clúster usa dos namespaces activos:

| Namespace | Propósito | Quién lo gestiona |
|-----------|-----------|------------------|
| `filmstars` | Todos los microservicios, bases de datos, RabbitMQ e Ingress resources de la aplicación | Pipeline CI/CD |
| `ingress-nginx` | Pods del Ingress Controller | Instalación manual / pipeline |
| `kube-system` | Componentes internos de K3s | K3s automático |

El aislamiento por namespace garantiza que los recursos de la aplicación no colisionen con los del sistema, y permite aplicar políticas de acceso por entorno en el futuro.

---

## Pods y asignación de recursos

Todos los pods de la aplicación corren en el namespace `filmstars`.
Los recursos se definen con `requests` y `limits`.

### Microservicios de aplicación

| Pod | Lenguaje / Framework | Réplicas | CPU Request | CPU Limit | RAM Request | RAM Limit |
|-----|---------------------|----------|------------|-----------|-------------|-----------|
| `auth-service` | TypeScript / NestJS 11 | 1 | 100m | 500m | 128 Mi | 512 Mi |
| `localidades-service` | TypeScript / NestJS 11 | 1 | 100m | 500m | 128 Mi | 512 Mi |
| `funciones-service` | TypeScript / NestJS 11 | 1 | 100m | 500m | 128 Mi | 512 Mi |
| `reservas-service` | TypeScript / NestJS 11 | 1 | 100m | 500m | 128 Mi | 512 Mi |
| `pagos-service` | TypeScript / NestJS 11 | 1 | 100m | 500m | 128 Mi | 512 Mi |
| `escaneo-service` | TypeScript / NestJS 11 | 1 | 50m | 250m | 64 Mi | 256 Mi |
| `api-gateway` | TypeScript / NestJS 10 + Express | 1 | 100m | 500m | 128 Mi | 256 Mi |
| `frontend` | TypeScript / React + Vite (servido por nginx) | 1 | 50m | 200m | 64 Mi | 128 Mi |

### 3.2 Infraestructura

| Pod | Imagen | Réplicas | CPU Request | CPU Limit | RAM Request | RAM Limit |
|-----|--------|----------|------------|-----------|-------------|-----------|
| `rabbitmq` | rabbitmq:3-management | 1 | 100m | 500m | 128 Mi | 256 Mi |
| `postgres-auth` | postgres:15-alpine | 1 | 100m | 500m | 256 Mi | 512 Mi |
| `postgres-localidades` | postgres:15-alpine | 1 | 100m | 500m | 256 Mi | 512 Mi |
| `postgres-funciones` | postgres:15-alpine | 1 | 100m | 500m | 256 Mi | 512 Mi |
| `postgres-reservas` | postgres:15-alpine | 1 | 100m | 500m | 256 Mi | 512 Mi |
| `postgres-pagos` | postgres:15-alpine | 1 | 100m | 500m | 256 Mi | 512 Mi |

### Consumo total del nodo

| | CPU Requests | CPU Limits | RAM Requests | RAM Limits |
|-|-------------|-----------|-------------|-----------|
| **Apps** | 700m | 3.450m | 896 Mi | 3.200 Mi |
| **Infra** | 600m | 3.000m | 1.408 Mi | 2.816 Mi |
| **Total aplicación** | **1.300m (65%)** | 6.450m | **2.304 Mi (56%)** | 6.016 Mi |
| **Disponible en nodo** | 2.000m | 2.000m | 4.096 Mi | 4.096 Mi |


---

## Mapeo de microservicios, Pods e interacción con herramientas perimetrales

### Ingress Controller 

El Ingress Controller corre en el namespace `ingress-nginx` como un pod de sistema.
Es el **único punto de entrada de tráfico externo** al clúster. En release publica
el sitio con TLS usando `https://<ip-publica>.sslip.io`, sin requerir un dominio
comprado, y aplica las siguientes reglas de enrutamiento:

```
Tráfico externo: https://<ip-publica>.sslip.io
    │
    ├─ GET /socket.io/* → Service: reservas-service:3004 (WebSockets)
    ├─ GET /api/*       → Service: api-gateway:3006
    └─ GET /            → Service: frontend:80   (archivos estáticos React)
```

El prefijo `/api` se preserva porque el API Gateway enruta sus microservicios a partir
de rutas como `/api/auth`, `/api/funciones` y `/api/reservas`.

Ningún microservicio backend tiene un Ingress propio; toda comunicación externa
pasa obligatoriamente por este único controlador.

### API Gateway

**Pod:** `api-gateway` | **Framework:** NestJS 10 + Express | **Puerto:** 3006

El API Gateway actúa como fachada SOA. Sus responsabilidades son:

- Validar el JWT en el header `Authorization` antes de reenviar la solicitud.
- Hacer proxy reverso HTTP hacia el microservicio correspondiente usando su DNS interno de Kubernetes.
- Centralizar el manejo de CORS para el frontend.

**Tabla de enrutamiento interno del API Gateway:**

| Ruta recibida | Microservicio destino | DNS interno K8s | Puerto |
|--------------|----------------------|-----------------|--------|
| `/auth/*` | auth-service | `auth-service.filmstars.svc.cluster.local` | 3001 |
| `/localidades/*` | localidades-service | `localidades-service.filmstars.svc.cluster.local` | 3002 |
| `/funciones/*` | funciones-service | `funciones-service.filmstars.svc.cluster.local` | 3003 |
| `/reservas/*` | reservas-service | `reservas-service.filmstars.svc.cluster.local` | 3004 |
| `/pagos/*` | pagos-service | `pagos-service.filmstars.svc.cluster.local` | 3005 |
| `/escaneo/*` | escaneo-service | `escaneo-service.filmstars.svc.cluster.local` | 3007 |

### Microservicios — detalle por pod

#### `auth-service` TypeScript / NestJS 11
- **Responsabilidad:** Registro y autenticación de usuarios. Emisión y verificación de JWT.
- **Interacción perimetral:** Recibe solicitudes desde el api-gateway. No consume otros microservicios.
- **Persistencia:** PostgreSQL propio `postgres-auth`, base de datos `auth_service`).
- **Comunicación:** Solo HTTP síncrono entrante.

#### `localidades-service` (TypeScript / NestJS 11
- **Responsabilidad:** Gestión de salas de cine y mapa de asientos.
- **Interacción perimetral:** Recibe solicitudes desde el api-gateway. No consume otros microservicios.
- **Persistencia:** PostgreSQL propio como `postgres-localidades`, base de datos `localidades_service`.
- **Comunicación:** Solo HTTP síncrono entrante.

#### `funciones-service` TypeScript / NestJS 11
- **Responsabilidad:** Cartelera, horarios y estado de asientos por función.
- **Interacción perimetral:** Recibe solicitudes desde el api-gateway Y desde `reservas-service` (llamada HTTP interna síncrona para bloquear/liberar asientos).
- **Persistencia:** PostgreSQL propio `postgres-funciones`, base de datos `funciones_db`.
- **Comunicación:** HTTP síncrono entrante (gateway + reservas).

#### `reservas-service` TypeScript / NestJS 11 + WebSockets
- **Responsabilidad:** Selección de asientos y creación de reservas. Coordinación del flujo de compra.
- **Interacción perimetral:**
  - Recibe solicitudes desde el api-gateway.
  - Llama a `funciones-service:3003` vía HTTP para validar y marcar asientos.
  - Publica eventos en RabbitMQ (cola `reserva_confirmada`) para desencadenar el pago.
- **Persistencia:** PostgreSQL propio `postgres-reservas`, base de datos `reservas_service`.
- **Comunicación:** HTTP síncrono saliente + AMQP asíncrono saliente.

#### `pagos-service` TypeScript / NestJS 11
- **Responsabilidad:** Procesamiento de transacciones de pago. Generación del comprobante/boleto.
- **Interacción perimetral:**
  - Recibe solicitudes desde el api-gateway.
  - Consume eventos de RabbitMQ publicados por `reservas-service`.
- **Persistencia:** PostgreSQL propio (`postgres-pagos`, base de datos `pagos_service`).
- **Comunicación:** AMQP asíncrono entrante + HTTP síncrono entrante.

#### `escaneo-service` TypeScript / NestJS 11
- **Responsabilidad:** Autenticar al operador y coordinar la validación de códigos QR leídos por cámara.
- **Interacción perimetral:** Recibe solicitudes desde el API Gateway y consume el endpoint interno protegido de `reservas-service`.
- **Persistencia:** No posee base de datos; la transacción del boleto pertenece al dominio de Reservas.
- **Comunicación:** HTTP síncrono entrante y saliente. La llamada interna usa `INTERNAL_SERVICE_TOKEN`.

#### `frontend` TypeScript / React 18 + Vite — servido por nginx
- **Responsabilidad:** Interfaz de usuario. SPA que corre completamente en el navegador del cliente.
- **Interacción perimetral:** El pod solo sirve archivos estáticos. Las llamadas a la API las hace el **navegador del usuario** directamente al Ingress (`/api/*`), no el pod.
- **URL del API Gateway:** en release no se bakea una IP pública; el navegador usa el mismo origen seguro del frontend y envía las solicitudes a `/api/*` por medio del Ingress.

---

## Diagrama de interacción perimetral

```
Internet
    │
    │  HTTP :80
    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Ingress Controller (nginx) — namespace: ingress-nginx                   │
│  / → frontend | /api/* → api-gateway (strip /api)                       │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ namespace: filmstars
              ┌──────────────┴──────────────┐
              ▼                             ▼
        [frontend:80]              [api-gateway:3006]
        (nginx/React)                      │
                           ┌───────────────┼────────────────┐
                           ▼               ▼                ▼
                    [auth:3001]   [localidades:3002]  [funciones:3003]
                                                           ▲
                           ┌───────────────────────────────┘
                           │ HTTP sync (validar asiento)
                           ▼
                    [reservas:3004] ──AMQP──► [rabbitmq:5672] ──AMQP──► [pagos:3005]
                           │                                                  │
                           ▼                                                  ▼
                   [postgres-reservas]                              [postgres-pagos]

     [postgres-auth]   [postgres-localidades]   [postgres-funciones]
           ▲                    ▲                        ▲
     [auth:3001]      [localidades:3002]          [funciones:3003]
```

---

## Almacenamiento persistente

Cada base de datos PostgreSQL tiene su propio `PersistentVolumeClaim` aprovisionado
dinámicamente por el StorageClass `local-path` de K3s (almacenamiento en disco del nodo).

| PVC | Tamaño | Montado en | Ruta en el pod |
|-----|--------|-----------|----------------|
| `pvc-postgres-auth` | 5 Gi | `postgres-auth` | `/var/lib/postgresql/data` |
| `pvc-postgres-localidades` | 5 Gi | `postgres-localidades` | `/var/lib/postgresql/data` |
| `pvc-postgres-funciones` | 5 Gi | `postgres-funciones` | `/var/lib/postgresql/data` |
| `pvc-postgres-reservas` | 5 Gi | `postgres-reservas` | `/var/lib/postgresql/data` |
| `pvc-postgres-pagos` | 5 Gi | `postgres-pagos` | `/var/lib/postgresql/data` |

**Total de almacenamiento persistente reservado:** 25 Gi

---

## Gestión de configuración y secretos

| Objeto K8s | Nombre | Contenido |
|-----------|--------|-----------|
| ConfigMap | `filmstars-config` | URLs de servicios internos, puertos, nombre de usuario DB, TTL de JWT |
| ConfigMap | `auth-service-config` | Puerto 3001, DB_HOST, DB_NAME específicos del servicio |
| ConfigMap | `localidades-service-config` | Puerto 3002, DB_HOST, DB_NAME |
| ConfigMap | `funciones-service-config` | Puerto 3003, DB_HOST, DB_NAME |
| ConfigMap | `reservas-service-config` | Puerto 3004, DB_HOST, DB_NAME |
| ConfigMap | `pagos-service-config` | Puerto 3005, DB_HOST, DB_NAME |
| ConfigMap | `escaneo-service-config` | Puerto 3007 |
| ConfigMap | `api-gateway-config` | Puerto 3006 |
| Secret | `filmstars-secrets` | POSTGRES_PASSWORD, JWT_SECRET, RABBITMQ_USER, RABBITMQ_PASS, INTERNAL_SERVICE_TOKEN |
| Secret | `registry-credentials` | Credenciales de acceso al registry privado Zot (imagePullSecret) |

Ningún Deployment contiene variables de entorno con valores sensibles hardcodeados.
Toda información sensible se inyecta en tiempo de ejecución mediante `secretKeyRef`.

[Volver al índice principal de la documentación](./Documentación.md)
