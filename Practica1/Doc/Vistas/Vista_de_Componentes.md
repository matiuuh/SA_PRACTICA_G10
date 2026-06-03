

# 7. Vista de Componentes (Vista de Desarrollo)

## Introduccion

La vista de componentes presenta el sistema FilmStars desde la perspectiva del desarrollo. Su objetivo es mostrar como se organizan los modulos de software, como se separan las responsabilidades por capas y de que forma se comunican los componentes principales de la solucion.

En esta vista se incluyen dos representaciones complementarias:

- Un diagrama de paquetes, que organiza el sistema en capas de UI, logica de negocio e infraestructura.
- Un diagrama de componentes, que muestra los servicios concretos, sus dependencias y la relacion con bases de datos y sistemas externos.

---

## Diagrama de Paquetes

El diagrama de paquetes organiza la solucion en tres niveles principales:

### 1. Capa UI

Contiene la interfaz de usuario del sistema:

- Frontend Web (React + Vite)

Esta capa utiliza interfaces de control para invocar la logica de negocio y representar la informacion al usuario final.

### 2. Logica de negocio

Contiene los servicios que implementan las reglas principales del sistema:

- Servicio de autenticacion
- Servicio de funciones
- Servicio de localidades
- Servicio de reservaciones
- Servicio de pagos

Esta capa concentra los procesos del dominio y solicita servicios tecnicos a la capa de infraestructura cuando requiere mensajeria, seguridad o acceso a datos.

### 3. Infraestructura

Contiene componentes de soporte tecnico reutilizados por la logica de negocio:

- `rabbitmq-client`
- `postgresql-driver`
- `jwt-library`

Esta capa abstrae detalles de comunicacion, persistencia y seguridad para mantener desacoplados los servicios de negocio.

---

## Componentes Principales del Sistema

El diagrama de componentes detalla los siguientes elementos principales:

1. Frontend Web (React + Vite)
2. API Gateway
3. Servicio de Autenticacion
4. Servicio de Funciones, Salas / Horarios
5. Servicio de Localidades
6. Servicio de Reservas
7. Servicio de Pagos
8. RabbitMQ Broker
9. Pasarela de Pago Simulado
10. Bases de datos PostgreSQL por dominio

---

## Comunicacion entre Componentes

La arquitectura combina comunicacion sincrona mediante REST/HTTPS y comunicacion asincrona mediante RabbitMQ.

### Comunicacion sincrona

- Frontend Web -> API Gateway mediante REST/HTTPS
- API Gateway -> Servicio de Autenticacion
- API Gateway -> Servicio de Funciones, Salas / Horarios
- API Gateway -> Servicio de Localidades
- API Gateway -> Servicio de Reservas
- API Gateway -> Servicio de Pagos
- Servicio de Funciones, Salas / Horarios -> Servicio de Localidades para consultar ciudad/cine
- Servicio de Reservas -> Servicio de Funciones, Salas / Horarios para consultar funciones disponibles
- Servicio de Pagos -> Pasarela de Pago Simulado mediante REST API

### Comunicacion asincrona

- Servicio de Reservas -> RabbitMQ Broker
- RabbitMQ Broker -> Servicio de Pagos

Este flujo asincrono permite desacoplar el proceso de reserva del procesamiento del pago, mejorando la tolerancia a fallos y el manejo de operaciones concurrentes.

### Persistencia

Cada servicio mantiene su propia base de datos PostgreSQL segun su dominio:

- Servicio de Autenticacion -> Base de Datos de usuarios
- Servicio de Funciones, Salas / Horarios -> Base de Datos de funciones
- Servicio de Localidades -> Base de Datos de localidades
- Servicio de Reservas -> Base de Datos de reservaciones
- Servicio de Pagos -> Base de Datos de pagos

---

## Tecnologias Utilizadas

| Categoria | Tecnologia |
|---|---|
| Frontend | React + Vite |
| Backend | Microservicios / API REST |
| Integracion | API Gateway |
| Comunicacion sincrona | REST / HTTPS |
| Comunicacion asincrona | RabbitMQ |
| Base de datos | PostgreSQL |
| Seguridad | JWT |

---

## Diagrama de Componentes

![!\[!\\[Diagrama de Componentes\\](imagenes/Vista_Componentes.png)\](imagenes/Vista_Componentes.png)](img/Vista_Componentes.png)

---

## Explicacion del Diagrama

El frontend web actua como punto de entrada para los usuarios del sistema y canaliza las solicitudes hacia el API Gateway. Este gateway expone las APIs REST y centraliza la comunicacion con los servicios internos.

El Servicio de Autenticacion administra el acceso al sistema y el manejo de tokens JWT. El Servicio de Funciones, Salas / Horarios se encarga de la informacion relacionada con cartelera, salas y horarios disponibles. El Servicio de Localidades centraliza la informacion geografica del sistema, especificamente ciudades y cines. El Servicio de Reservas gestiona el registro de reservaciones y consulta las funciones disponibles antes de confirmar una operacion. El Servicio de Pagos procesa los pagos y consume una pasarela de pago simulada por medio de una API externa.

Ademas, el Servicio de Funciones, Salas / Horarios consulta al Servicio de Localidades para obtener la relacion entre ciudades y cines disponible dentro de la plataforma. Esta separacion mantiene desacoplada la informacion geografica respecto de la logica de cartelera.

El broker RabbitMQ sirve como mecanismo de integracion asincrona entre reservas y pagos. Este desacoplamiento evita dependencias temporales estrictas entre ambos servicios y facilita la escalabilidad del sistema.

Finalmente, el diagrama muestra una estrategia de persistencia separada por dominio, donde cada servicio conserva autonomia sobre sus datos en PostgreSQL. Esta separacion favorece el aislamiento, la mantenibilidad y la evolucion independiente de los componentes.

[Volver a Documentacion](../Documentación.md)
