# 7. Vista de Componentes (Vista de Desarrollo)

## Introduccion

La vista de componentes ilustra el sistema desde la perspectiva del desarrollador y se enfoca en la organizacion de los modulos de software, interfaces de comunicacion y dependencias entre servicios.

La plataforma **FilmStars** fue disenada bajo una arquitectura orientada a servicios (**SOA**), utilizando componentes independientes desacoplados mediante comunicacion sincrona REST y mensajeria asincrona con RabbitMQ. Algunos servicios gestionan su propia persistencia en PostgreSQL segun su dominio funcional.

---

## Componentes Principales del Sistema

El sistema contiene los siguientes componentes principales:

1. Frontend Web  
2. API Gateway  
3. Servicio de Autenticacion  
4. Servicio de Funciones  
5. Servicio de Reservas y Asientos  
6. Servicio de Pagos  
7. Servicio de Notificaciones  
8. RabbitMQ Broker  
9. Bases de datos PostgreSQL por dominio  

---

## Comunicacion entre Componentes

Los componentes se comunican mediante APIs REST para operaciones sincronas y mediante RabbitMQ para procesos asincronos relacionados con reservas y pagos. La persistencia se distribuye en bases de datos PostgreSQL asociadas a dominios especificos del sistema.

### Comunicacion sincrona
- Frontend -> API Gateway
- API Gateway -> Microservicios

### Comunicacion asincrona
- Reservation Service -> RabbitMQ -> Payment Service

### Persistencia
- Servicio de Autenticacion -> Base de Datos Usuarios
- Servicio de Funciones -> Base de Datos Funciones
- Servicio de Reservas -> Base de Datos Reservaciones
- Servicio de Pagos -> Base de Datos Pagos
- Servicio de Notificaciones -> Base de Datos Notificaciones

---

## Tecnologias Utilizadas

| Categoria | Tecnologia |
|---|---|
| Frontend | React / Vite |
| Backend | Express / NestJS |
| Comunicacion | REST API |
| Mensajeria | RabbitMQ |
| Base de Datos | PostgreSQL |
| Seguridad | JWT |

---

## Diagrama de Componentes

![Diagrama de Componentes](<imagenes/Vista de Componentes.png>)
---

## Explicacion del Diagrama

El frontend web funciona como punto de interaccion principal para los usuarios del sistema FilmStars. Todas las solicitudes son enviadas hacia el API Gateway mediante REST API.

El API Gateway centraliza el acceso hacia los distintos microservicios, permitiendo desacoplamiento y separacion de responsabilidades.

Cada servicio implementa un dominio especifico:
- Auth Service administra autenticacion y sesiones.
- Function Service administra salas y horarios.
- Reservation Service administra reservas y seleccion de asientos.
- Payment Service procesa pagos simulados.
- Notification Service envia correos electronicos y notificaciones.

Los procesos criticos relacionados con reservas y pagos utilizan RabbitMQ como broker de mensajeria para garantizar procesamiento asincrono, tolerancia a fallos y manejo adecuado de concurrencia. En el diagrama, el flujo asincrono principal conecta el Servicio de Reservas y Asientos con el Servicio de Pagos a traves del broker.

El diagrama muestra persistencia separada para usuarios, funciones, reservaciones, pagos y notificaciones mediante bases de datos PostgreSQL dedicadas segun el dominio de cada servicio. Ademas, el Servicio de Pagos consume una pasarela de pago simulada mediante REST API y el Servicio de Notificaciones se integra con un proveedor de email mediante SMTP o API.
