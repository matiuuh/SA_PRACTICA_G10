# Guía de Levantamiento del Proyecto FilmStars

Esta guía describe cómo levantar el proyecto de forma local, tanto el frontend como cada microservicio del backend de manera individual, y también mediante Docker Compose para levantar toda la infraestructura de un solo golpe.

---

## Prerrequisitos

| Herramienta | Versión mínima recomendada |
| ----------- | -------------------------- |
| Node.js     | 20.x                       |
| pnpm        | 9.x                        |
| Docker      | 24.x                       |
| Docker Compose | v2.x (plugin integrado) |

---

## 1. Variables de entorno

Antes de levantar cualquier componente copia el archivo de ejemplo y ajusta los valores:

```bash
cp .env.example .env
```

Las variables mínimas requeridas en `.env` para el modo Docker Compose son:

```env
DOCKERHUB_USERNAME=<tu_usuario_dockerhub>
VITE_API_GATEWAY_URL=http://localhost:3006
```

---

## 2. Levantar el Frontend (modo desarrollo)

El frontend está desarrollado con **React + Vite** y usa **pnpm** como gestor de paquetes.

```bash
# Desde la raíz del proyecto
cd frontend

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

El servidor de desarrollo quedará disponible en: **http://localhost:5173**

> **Nota:** asegúrate de que `VITE_API_GATEWAY_URL` apunte al API Gateway correcto (por defecto `http://localhost:3006`).

---

## 3. Levantar el Backend (modo desarrollo)

El backend está compuesto por cinco microservicios independientes construidos con **NestJS**. Cada uno tiene su propio `package.json` y se levanta de forma independiente.

Los servicios disponibles y sus puertos son:

| Servicio              | Directorio                                  | Puerto |
| --------------------- | ------------------------------------------- | ------ |
| `auth-service`        | `Backend/services/auth-service`             | 3001   |
| `localidades-service` | `Backend/services/localidades-service`      | 3002   |
| `funciones-service`   | `Backend/services/funciones-service`        | 3003   |
| `reservas-service`    | `Backend/services/reservas-service`         | 3004   |
| `pagos-service`       | `Backend/services/pagos-service`            | 3005   |
| `api-gateway`         | `api-gateway/`                              | 3006   |

### Pasos para levantar un servicio individualmente

```bash
# Ejemplo con auth-service (repetir para cada servicio)
cd Backend/services/auth-service

# Instalar dependencias
pnpm install

# Iniciar en modo watch (desarrollo)
pnpm start:dev
```

> **Nota:** los servicios que usan RabbitMQ (`reservas-service`, `pagos-service`) necesitan que el broker esté corriendo. Puedes levantarlo de forma aislada con Docker:
> ```bash
> docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
> ```

> **Nota:** cada microservicio necesita una instancia de PostgreSQL con la base de datos correspondiente. Se recomienda usar Docker Compose para la infraestructura de bases de datos al desarrollar localmente.

---

## 4. Levantar con Docker Compose (infraestructura completa)

El archivo `docker-compose.yml` en la raíz del proyecto orquesta **todos** los servicios: bases de datos PostgreSQL, RabbitMQ, los cinco microservicios, el API Gateway y el frontend.

### 4.1 Primera vez (build de imágenes)

```bash
# Desde la raíz del proyecto
docker compose up --build
```

### 4.2 Ejecuciones posteriores

```bash
docker compose up
```

### 4.3 Modo background (detached)

```bash
docker compose up -d
```

### 4.4 Ver logs de un servicio específico

```bash
docker compose logs -f <nombre_servicio>
# Ejemplo:
docker compose logs -f api-gateway
```

### 4.5 Detener todos los servicios

```bash
docker compose down
```

### 4.6 Detener y eliminar volúmenes (reset completo de bases de datos)

```bash
docker compose down -v
```

### Servicios expuestos tras levantar Docker Compose

| Servicio              | URL local                      |
| --------------------- | ------------------------------ |
| Frontend              | http://localhost:5173          |
| API Gateway           | http://localhost:3006          |
| auth-service          | http://localhost:3001          |
| localidades-service   | http://localhost:3002          |
| funciones-service     | http://localhost:3003          |
| reservas-service      | http://localhost:3004          |
| pagos-service         | http://localhost:3005          |
| RabbitMQ Management   | http://localhost:15672         |

> **Credenciales RabbitMQ por defecto:** usuario `guest` / contraseña `guest`

---

## 5. Docker Compose por VM (despliegue distribuido)

Para despliegues en múltiples máquinas virtuales se proveen archivos separados:

| Archivo                    | Descripción                              |
| -------------------------- | ---------------------------------------- |
| `docker-compose.vm1.yml`   | Infraestructura (bases de datos, RabbitMQ) |
| `docker-compose.vm2.yml`   | Microservicios de backend                |
| `docker-compose.vm3.yml`   | API Gateway y Frontend                   |

```bash
# En cada VM ejecutar su archivo correspondiente
docker compose -f docker-compose.vm1.yml up -d
docker compose -f docker-compose.vm2.yml up -d
docker compose -f docker-compose.vm3.yml up -d
```
