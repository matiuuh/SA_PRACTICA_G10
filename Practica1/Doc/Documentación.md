# Documentacion de la Practica 1: FilmStars

Integrantes:

| Nombre completo                | Carnet    |
| ------------------------------ | --------- |
| Chacon Trampe Juan Esteban     | 202300431 |
| Diego Noriega Mateo Estuardo   | 202203009 |
| Hernandez Flores Daniel Andree | 202300512 |
| Lopez Leveron Estiben Yair     | 202204578 |
| Pablo Sosof Jens Jeremy        | 202102771 |

## Indice


### Requerimientos del sistema

- [Requerimientos funcionales](./RF/RF.md)
- [Requerimientos no funcionales](./RNF/RNF.md)

### Modelo de Casos de Uso

- [Casos de uso](./CasosDeUso/casosDeUso.md)

### Vista de Arquitectura 4+1

- [Vistas 4+1](./Vistas4+1/Vistas_4+1.md)

### Diagramas Estructurales, Comportamentales y Persistencia

- [Diagrama de arquitectura general](./Diagramas_Estructurales/Diagrama_Arquitectura_General.md)
- [Diagrama de componentes](./Diagramas_Estructurales/Diagrama_Componentes.md)
- [Diagrama de actividades](./Diagramas_Actividades/Diagramas.md)
- [Diagrama de secuencia](./Diagramas_Estructurales/Diagrama_Secuencia.md)
- [Diagramas entidad relacion](./ER/DiagramasER.md)

## Introduccion

En esta practica se desarrollo una pagina web para la gestion de venta de boletos de la empresa **FilmStars**. El sistema permite a los usuarios consultar la cartelera de peliculas por ubicacion, seleccionar asientos de forma interactiva en tiempo real, procesar pagos y recibir boletos digitales con numero de confirmacion.

El proyecto esta construido sobre una arquitectura orientada a servicios (SOA) con patron de microservicios, donde cada dominio del negocio opera como un servicio independiente con su propia base de datos PostgreSQL. La comunicacion entre servicios combina REST/HTTPS para operaciones sincronicas y **RabbitMQ** como broker de mensajeria para el procesamiento asincrono de reservaciones, pagos y generacion de boletos, garantizando durabilidad de transacciones incluso ante fallos del sistema.

El frontend estará desarrollado con **React + Vite**, el backend con **Node.js y NestJS**, y toda la infraestructura esta contenedorizada con **Docker**, lo que permite despliegue tanto local como en la nube. Un **API Gateway centralizado** actua como unico punto de entrada, gestionando el enrutamiento, la autenticacion con JWT y el control de acceso.

Los actores principales del sistema son el **Cliente**, que realiza reservas y compras, el **Sistema de pagos**, que procesa las transacciones financieras, y el **Administrador**, que gestiona la cartelera, funciones y salas.

Este archivo funciona como indice principal de la documentacion. Desde aqui se puede acceder a cada uno de los documentos del proyecto.

## Justificacion de tecnologias

### Lenguaje: TypeScript
TypeScript se utilizo en todos los servicios (frontend y backend) porque su sistema de tipos estaticos detecta errores en tiempo de compilacion, lo cual es critico en un sistema distribuido donde los contratos entre servicios deben ser precisos. Reduce bugs de integracion y facilita el mantenimiento del codigo.

### Runtime: Node.js
Node.js es el entorno de ejecucion elegido para el backend por su modelo de I/O no bloqueante, ideal para servicios que manejan multiples solicitudes concurrentes como reservas y pagos. Su ecosistema npm/pnpm provee librerias maduras para JWT, ORM, mensajeria y HTTP.

### Framework backend: NestJS
NestJS estructura el codigo en modulos, controladores y servicios siguiendo convenciones de inyeccion de dependencias similares a Angular. Esto garantiza consistencia entre los cinco microservicios del proyecto, facilita las pruebas unitarias y permite aplicar guards y decoradores para autenticacion y autorizacion de forma declarativa.

### Framework frontend: React + Vite
React permite construir interfaces reactivas basadas en componentes reutilizables. Vite reemplaza a webpack con un servidor de desarrollo instantaneo basado en ESModules nativos y un build de produccion optimizado con Rollup, reduciendo significativamente los tiempos de compilacion.

### ORM: TypeORM
TypeORM permite definir el esquema de base de datos directamente en TypeScript mediante decoradores, eliminando SQL manual para operaciones CRUD. Sus migraciones y sincronizacion automatica simplifican la gestion de las cinco bases de datos PostgreSQL independientes del proyecto.

### Base de datos: PostgreSQL
Cada microservicio tiene su propia instancia PostgreSQL, siguiendo el patron Database-per-Service de la arquitectura de microservicios. PostgreSQL provee transacciones ACID, soporte para UUID como clave primaria y un tipado fuerte compatible con TypeORM.

### Broker de mensajeria: RabbitMQ
RabbitMQ actua como intermediario asincrono entre `reservas-service` y `pagos-service`. Cuando se crea una reserva, se publica un evento en la cola; el servicio de pagos lo consume independientemente. Esto desacopla ambos servicios, garantiza que los mensajes no se pierdan ante fallos temporales (durabilidad de colas) y permite procesar pagos sin bloquear la respuesta al cliente.

---

## Principios SOLID aplicados

### S — Single Responsibility Principle
Cada clase tiene una unica razon de cambio. En NestJS esto se refleja en la separacion entre `Controller` (maneja HTTP), `Service` (logica de negocio) y `Repository` (acceso a datos). Por ejemplo, `LocalidadesController` solo enruta peticiones; `LocalidadesService` contiene toda la logica de ciudades, cines y salas.

### O — Open/Closed Principle
Los guards de autenticacion (`JwtAuthGuard`, `RolesGuard`) estan disenados para extenderse sin modificarse. Agregar un nuevo rol al sistema solo requiere usar el decorador `@Roles('NUEVO_ROL')` en el endpoint correspondiente, sin tocar la implementacion del guard.

### L — Liskov Substitution Principle
Las estrategias de Passport (`JwtStrategy`) implementan la interfaz `PassportStrategy`. Cualquier nueva estrategia de autenticacion (OAuth, API Key) puede sustituir o coexistir con la actual sin romper el sistema, ya que todos los guards dependen de la abstraccion `AuthGuard` y no de la implementacion concreta.

### I — Interface Segregation Principle
Los DTOs de cada servicio son especificos a su operacion: `CreateCiudadDto`, `CreateCineDto` y `CreateSalaDto` son interfaces separadas. Ningun cliente esta forzado a depender de campos que no necesita, a diferencia de tener un unico DTO generico de localidad.

### D — Dependency Inversion Principle
Los servicios de NestJS reciben sus dependencias por inyeccion de constructor. `LocalidadesService` no instancia su repositorio directamente; NestJS lo inyecta. Esto permite sustituir implementaciones en pruebas sin cambiar el codigo del servicio.

---

## Arquitectura orientada a servicios (SOA)

El sistema implementa SOA mediante un conjunto de microservicios independientes, cada uno responsable de un dominio de negocio delimitado:

| Servicio | Dominio | Puerto |
|---|---|---|
| `auth-service` | Autenticacion y usuarios | 3001 |
| `localidades-service` | Ciudades, cines y salas | 3002 |
| `funciones-service` | Peliculas, funciones y cartelera | 3003 |
| `reservas-service` | Reservas de asientos | 3004 |
| `pagos-service` | Procesamiento de pagos | 3005 |
| `api-gateway` | Punto de entrada unico | 3006 |

**Principios SOA aplicados:**

- **Bajo acoplamiento:** cada servicio expone una API REST bien definida y no comparte base de datos con otros.
- **Alta cohesion:** cada servicio agrupa unicamente la logica relacionada a su dominio.
- **Abstraccion:** el API Gateway es el unico punto de contacto para el frontend; los servicios internos son transparentes para el cliente.
- **Reusabilidad:** `auth-service` es consumido por cualquier servicio que requiera validar tokens JWT, sin duplicar logica de autenticacion.
- **Comunicacion mixta:** REST sincrono para operaciones de lectura/escritura inmediata, y RabbitMQ asincrono para flujos de reserva-pago que pueden tolerar latencia.

---

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

---

## Conclusiones

1. La arquitectura de microservicios permitirá al sistema escalar de forma independiente los modulos con mayor demanda, como reservaciones y pagos, lo que hace al sistema mas flexible y resistente ante cargas elevadas.

2. El uso de RabbitMQ como broker de mensajeria garantiza que las transacciones criticas no se pierdan ante fallos, desacoplando el procesamiento de pagos, reservas y boletos de manera segura.

3. La contenedorizacion con Docker simplifica tanto el desarrollo local como el despliegue en la nube, asegurando que el sistema funcione de forma consistente en cualquier entorno sin cambios en el codigo.
