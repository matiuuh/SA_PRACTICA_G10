

# Diagrama de Arquitectura General

## Introduccion

La arquitectura general de FilmStars se presenta en dos vistas complementarias:

- Una arquitectura sincronica, enfocada en el flujo principal de solicitudes entre usuario, frontend, API Gateway, microservicios y bases de datos.
- Una arquitectura asincronica, enfocada en el procesamiento desacoplado de reservas, tickets y pagos mediante RabbitMQ y workers especializados.

Ambos diagramas representan la solucion desplegada sobre Google Cloud Platform y muestran la separacion de responsabilidades por servicio y por dominio de datos.

---

## Arquitectura Sincronica

![Diagrama de Arquitectura General - Sincrona](<imagenes/Practica1-Arquitectura-Sincrónica.drawio.svg>)

### Descripcion

La vista sincronica representa el flujo principal de atencion de solicitudes en tiempo real. Los actores `Usuario` y `Admin` acceden al sistema mediante HTTPS y utilizan el frontend desarrollado con `React + Vite`.

El frontend se comunica con el `API Gateway` construido con `NestJS` a traves de `HTTPS / REST`. Este gateway centraliza el acceso a los servicios internos y enruta las peticiones hacia los microservicios correspondientes.

Los microservicios mostrados en esta vista son:

- Servicio Auth / Usuarios
- Servicio de Funciones
- Servicio de Reservas
- Servicio de Pagos
- Servicio de Localidades

Cada servicio se comunica mediante `REST + JWT`, lo que permite mantener autenticacion y autorizacion centralizadas. El API Gateway valida el token JWT y los servicios verifican permisos antes de procesar cada solicitud.

En esta vista, el `Servicio de Localidades` centraliza la informacion de ciudades y cines disponible dentro de la plataforma, por lo que forma parte del flujo sincronico de consulta junto con funciones, reservas y pagos.

La persistencia se encuentra separada por dominio en `PostgreSQL - Cloud SQL`:

- PostgreSQL Auth / Usuarios
- PostgreSQL Funciones
- PostgreSQL Reservas
- PostgreSQL Pagos
- PostgreSQL Localidades

El acceso desde los microservicios hacia sus bases de datos se realiza mediante `SQL`, manteniendo aislamiento entre dominios y favoreciendo mantenibilidad, seguridad y escalabilidad.

### Flujo principal

1. Usuario o Admin accede al frontend por HTTPS.
2. El frontend envia solicitudes al API Gateway por HTTPS / REST.
3. El API Gateway valida JWT y enruta la solicitud al microservicio correspondiente.
4. Cada microservicio consulta o actualiza su base de datos PostgreSQL asociada.

---

## Arquitectura Asincronica

![Diagrama de Arquitectura General - Asincrona](<imagenes/Practica1-Arquitectura-Asicronica.drawio.png>)

### Descripcion

La vista asincronica representa los procesos que no requieren una respuesta inmediata al usuario y que se ejecutan mediante mensajeria. En esta arquitectura, el `Servicio de Reservas` publica eventos en `RabbitMQ`, que actua como broker de mensajeria y administra `exchanges`, `queues` y `DLQ`.

Los eventos generados por las reservas se distribuyen hacia colas especializadas:

- `cola_tickets`
- `cola_reservas`
- `cola_pagos`

Estas colas son consumidas por un conjunto de procesos asincronos o workers:

- Worker Tickets: genera el boleto final
- Worker Reservas: confirma o expira asientos
- Worker Pagos: procesa pagos

Los workers interactuan con `PostgreSQL - Cloud SQL` para actualizar el estado de reservas, asientos, tickets y pagos. En el diagrama se muestran especificamente las bases:

- PostgreSQL Reservas / Asientos
- PostgreSQL Pagos

Adicionalmente, el `Worker Pagos` realiza una solicitud al `Servicio de Pagos`, y este consume externamente el servicio de `Pago Simulado` mediante `HTTPS`. Una vez completado el proceso, el pago queda registrado en la base de datos correspondiente.

El `Servicio de Localidades` no aparece en esta vista asincronica porque no participa directamente en el procesamiento de eventos de reservas, tickets o pagos.

### Flujo principal

1. El Servicio de Reservas publica el evento `ReservaCreada` en RabbitMQ.
2. RabbitMQ distribuye mensajes hacia `cola_tickets`, `cola_reservas` y `cola_pagos`.
3. Cada worker consume su cola y ejecuta su tarea especifica.
4. Los workers actualizan la informacion en PostgreSQL segun el dominio afectado.
5. El Worker Pagos solicita el procesamiento al Servicio de Pagos.
6. El Servicio de Pagos consume el servicio externo de Pago Simulado y registra el resultado en PostgreSQL Pagos.

---

## Relacion entre ambas vistas

La arquitectura sincronica y la asincronica no se contradicen, sino que se complementan:

- La vista sincronica describe la atencion inmediata de solicitudes del sistema.
- La vista asincronica describe los procesos internos desacoplados que continúan despues de ciertos eventos del dominio.

En conjunto, ambas muestran una arquitectura orientada a servicios, con separacion por dominios, autenticacion basada en JWT, persistencia distribuida en PostgreSQL y soporte de mensajeria mediante RabbitMQ para operaciones de mayor desacoplamiento.

link de archivo crudo de diagrama de arquitectura en draw.io

[Diagrama de Arquitectura](https://app.diagrams.net/#G1MppILJLtfuZoiN-tyD_ywHO-iltpBi4f)


[Volver a Documentacion](../Documentación.md)
