# Diagrama de Arquitectura General

## Introduccion

El diagrama de arquitectura general presenta la organizacion de la solucion en sus entornos de despliegue, mostrando la separacion de responsabilidades entre la capa de presentacion, la capa de servicios, la mensajeria asincrona y la capa de persistencia. La arquitectura contempla un despliegue sobre AWS distribuido en maquinas virtuales EC2 y un despliegue local sobre `localhost`, ambos ejecutados mediante Docker Compose para facilitar el despliegue, administracion y aislamiento de los contenedores.

Esta vista permite comprender como los usuarios y administradores acceden al sistema, como las solicitudes son recibidas por el frontend y el API Gateway, y como posteriormente se enrutan hacia los servicios especializados del backend. Cada microservicio mantiene una responsabilidad concreta dentro del dominio del sistema, lo que favorece la escalabilidad, mantenibilidad y separacion de datos.

La arquitectura general se presenta en dos vistas complementarias:

- **Arquitectura sincronica:** describe la comunicacion directa entre frontend, API Gateway, microservicios y bases de datos.
- **Arquitectura asincronica:** describe el procesamiento desacoplado mediante RabbitMQ, colas y workers especializados.

---

## Arquitectura Sincrona en AWS

![Diagrama de Arquitectura General - Sincrona AWS](<img/Diagrama de Arquitectura Sincrono AWS.png>)

### Descripcion

El diagrama sincrono en AWS representa el flujo principal de solicitudes que requieren una respuesta inmediata para el usuario. En esta vista, el sistema se divide en tres maquinas virtuales EC2, separando la capa de presentacion, la capa de servicios y la capa de persistencia.

La `Maquina Virtual 3 EC2 AWS` contiene la capa de entrada al sistema. En esta instancia se ejecuta el `Frontend` desarrollado con `React + Vite`, utilizado por usuarios y administradores, junto con el `API Gateway`, desarrollado con `NestJS`. El frontend envia solicitudes al gateway mediante `HTTP / REST + JWT`, permitiendo transportar la autenticacion del usuario en cada peticion.

La `Maquina Virtual 2 EC2 AWS` contiene los microservicios principales del backend:

- Servicio Auth / Usuarios
- Servicio de Funciones
- Servicio Reservas
- Servicio Pagos
- Servicio de Localidades

El API Gateway se comunica con estos servicios mediante `REST HTTP + JWT`, centralizando el acceso al backend y delegando cada solicitud al servicio responsable del dominio correspondiente.

La `Maquina Virtual 1 EC2 AWS` contiene la capa de persistencia. En esta instancia se ejecutan bases de datos `PostgreSQL` separadas por dominio:

- PostgreSQL Auth / Usuarios
- PostgreSQL Funciones
- PostgreSQL Reservas
- PostgreSQL Pagos
- PostgreSQL Localidades

Cada microservicio se conecta unicamente a su base de datos correspondiente mediante `TCP`, manteniendo aislamiento entre dominios y evitando dependencias directas entre esquemas de datos.

### Flujo principal

1. El Usuario o Administrador accede al sistema por HTTP desde el navegador.
2. La solicitud llega al Frontend desplegado en la Maquina Virtual 3.
3. El Frontend envia peticiones al API Gateway utilizando HTTP / REST con JWT.
4. El API Gateway valida y enruta la solicitud hacia el microservicio correspondiente en la Maquina Virtual 2.
5. El microservicio procesa la operacion y se comunica con su base de datos PostgreSQL en la Maquina Virtual 1 mediante TCP.
6. La respuesta regresa al API Gateway y posteriormente al Frontend para mostrar el resultado al usuario.

---

## Arquitectura Sincrona en Localhost

![Diagrama de Arquitectura General - Sincrona Localhost](<img/Diagrama de Arquitctura sincrona LOCAL.png>)

### Descripcion

El diagrama sincrono en `localhost` representa la misma organizacion funcional del sistema, pero ejecutada en un entorno local. A diferencia del despliegue en AWS, todos los componentes se encuentran dentro de una unica maquina local y son administrados por Docker Compose.

En este entorno, los actores `Usuario` y `Administrador` acceden al sistema mediante HTTP desde el navegador. La solicitud llega al `Frontend` desarrollado con `React + Vite`, que se ejecuta como un contenedor dentro del entorno local.

El frontend se comunica con el `API Gateway` mediante `HTTP / REST + JWT`. El gateway centraliza las solicitudes, valida el contexto de autenticacion y redirige cada peticion hacia el microservicio correspondiente.

Los microservicios se ejecutan en contenedores independientes dentro del mismo `localhost`:

- Servicio Auth / Usuarios
- Servicio de Funciones
- Servicio Reservas
- Servicio Pagos
- Servicio de Localidades

Cada servicio se comunica con su base de datos PostgreSQL correspondiente mediante `TCP`. Aunque todo se ejecuta en una sola maquina local, se mantiene la separacion logica por dominios, permitiendo simular el comportamiento distribuido del sistema y facilitar pruebas de integracion antes del despliegue en AWS.

Las bases de datos tambien se ejecutan como contenedores independientes:

- PostgreSQL Auth / Usuarios
- PostgreSQL Funciones
- PostgreSQL Reservas
- PostgreSQL Pagos
- PostgreSQL Localidades

### Flujo principal

1. El Usuario o Administrador accede al sistema local mediante HTTP.
2. El Frontend recibe la interaccion y envia la solicitud al API Gateway mediante HTTP / REST + JWT.
3. El API Gateway enruta la peticion hacia el microservicio responsable.
4. El microservicio procesa la operacion dentro de su dominio.
5. El microservicio consulta o actualiza su base de datos PostgreSQL mediante TCP.
6. La respuesta retorna al API Gateway y finalmente al Frontend.

---

## Arquitectura Asincrona en AWS

![Diagrama de Arquitectura General - Asincrona AWS](<img/Diagrama de Arquitctura ASincrona AWS.png>)

### Descripcion

El diagrama asincrono en AWS representa los procesos internos que no dependen de una respuesta inmediata al usuario y que pueden ejecutarse de forma desacoplada. Esta vista mantiene la separacion por maquinas virtuales EC2, pero agrega un broker de mensajeria y procesos consumidores para atender tareas relacionadas con reservas, boletos y pagos.

La `Maquina Virtual 3 EC2 AWS` mantiene la capa de entrada del sistema. El `Frontend React + Vite` recibe las acciones del usuario o administrador y se comunica con el `API Gateway` mediante `HTTP / REST + JWT`. Desde este punto se originan operaciones como la creacion de reservas o solicitudes de pago.

La `Maquina Virtual 2 EC2 AWS` concentra el procesamiento asincrono. En esta instancia se despliega `RabbitMQ` como broker de mensajeria, encargado de recibir eventos y distribuirlos hacia colas especificas. Tambien se ejecutan consumidores o workers que procesan tareas en segundo plano:

- `Worker Tickets`: genera el boleto final asociado a una reserva.
- `Worker Reservas`: confirma o expira asientos segun el estado de la operacion.
- `Worker Pagos`: procesa solicitudes de pago y coordina el resultado con el servicio correspondiente.

RabbitMQ organiza los mensajes en colas separadas, como `cola_tickets`, `cola_reservas` y `cola_pagos`, permitiendo que cada proceso consuma solamente los eventos que le corresponden. Esto reduce el acoplamiento entre servicios y mejora la tolerancia a fallos, ya que los mensajes pueden mantenerse en cola hasta que el consumidor los procese.

En la misma maquina se encuentran microservicios `NestJS` relacionados con reservas y pagos. El `Servicio Reserva` registra o actualiza la informacion de reservas, mientras que el `Servicio de Pagos` procesa la solicitud de pago y se comunica mediante HTTP con el servicio de `Pago Simulado`.

La maquina de persistencia contiene bases de datos `PostgreSQL` para los dominios involucrados en el flujo asincrono:

- PostgreSQL Reservas
- PostgreSQL Pagos

Los servicios y workers actualizan estas bases mediante `TCP`, registrando reservas, cambios de estado, boletos generados y resultados de pago.

### Flujo principal

1. El Usuario o Administrador inicia una operacion desde el Frontend.
2. El Frontend envia la solicitud al API Gateway mediante HTTP / REST + JWT.
3. El API Gateway comunica la operacion al backend y se publica el evento correspondiente en RabbitMQ.
4. RabbitMQ distribuye los mensajes hacia `cola_tickets`, `cola_reservas` y `cola_pagos`.
5. Cada worker consume su cola y ejecuta el proceso que le corresponde.
6. El Worker Tickets genera el boleto final y actualiza la reserva.
7. El Worker Reservas confirma o expira los asientos segun el resultado del flujo.
8. El Worker Pagos solicita el procesamiento al Servicio de Pagos.
9. El Servicio de Pagos consume el servicio de Pago Simulado y registra el resultado en PostgreSQL Pagos.
10. Los cambios finales quedan persistidos en las bases de datos de Reservas y Pagos.

### Componentes principales

- **RabbitMQ:** broker de mensajeria encargado de recibir y distribuir eventos.
- **Colas asincronas:** separan los mensajes por tipo de proceso, como tickets, reservas y pagos.
- **Workers:** consumidores que ejecutan tareas en segundo plano sin bloquear la solicitud principal.
- **Servicio Reserva:** registra y actualiza el estado de las reservas.
- **Servicio de Pagos:** coordina el procesamiento del pago y registra su resultado.
- **PostgreSQL Reservas y Pagos:** almacenan el estado final de las operaciones asincronas.
- **Docker Compose:** administra los contenedores desplegados en cada maquina virtual.

---

## Arquitectura Asincrona en Localhost

![Diagrama de Arquitectura General - Asincrona Localhost](<img/Diagrama de Arquitectura Sincrono LOCAL.png>)

### Descripcion

El diagrama asincrono en `localhost` representa el procesamiento desacoplado del sistema ejecutado en una sola maquina local. Todos los componentes se levantan mediante `docker-compose.yaml`, manteniendo contenedores separados para frontend, API Gateway, RabbitMQ, workers, microservicios y bases de datos.

En este entorno, el `Usuario` y el `Administrador` acceden al `Frontend React + Vite` mediante HTTP. El frontend envia las solicitudes al `API Gateway` utilizando `HTTP / REST + JWT`, conservando el mismo mecanismo de comunicacion y autenticacion usado en los demas entornos.

El API Gateway publica o coordina las operaciones que requieren procesamiento en segundo plano hacia `RabbitMQ`, que actua como broker de mensajeria. RabbitMQ recibe los eventos y los distribuye en colas especializadas:

- `cola_tickets`
- `cola_reservas`
- `cola_pagos`

Los consumidores asincronos procesan cada cola de forma independiente. El `Worker Tickets` genera el boleto final, el `Worker Reservas` confirma o expira asientos, y el `Worker Pagos` procesa la solicitud de pago. Esta separacion permite ejecutar tareas internas sin bloquear directamente la respuesta principal del sistema.

En el mismo entorno local se ejecutan los microservicios `NestJS` relacionados con el flujo asincrono. El `Servicio Reserva` registra la reserva y actualiza su estado, mientras que el `Servicio de Pagos` recibe la solicitud de pago, se comunica con el servicio de `Pago Simulado` mediante HTTP y registra el resultado.

La persistencia local se mantiene en contenedores PostgreSQL independientes para los dominios involucrados:

- PostgreSQL Reservas
- PostgreSQL Pagos

Aunque todos los servicios se ejecutan sobre `localhost`, el diagrama conserva la separacion logica entre mensajeria, consumidores, microservicios y bases de datos. Esto permite validar localmente el comportamiento asincrono antes de desplegarlo en AWS.

### Flujo principal

1. El Usuario o Administrador inicia una operacion desde el Frontend local.
2. El Frontend envia la solicitud al API Gateway mediante HTTP / REST + JWT.
3. El API Gateway publica o coordina el evento hacia RabbitMQ.
4. RabbitMQ distribuye el mensaje hacia la cola correspondiente.
5. Los workers consumen los mensajes y ejecutan las tareas asincronas.
6. El Worker Tickets genera el boleto final y actualiza la reserva.
7. El Worker Reservas confirma o expira asientos.
8. El Worker Pagos solicita el procesamiento al Servicio de Pagos.
9. El Servicio de Pagos se comunica con Pago Simulado y registra el resultado en PostgreSQL Pagos.
10. Los estados finales quedan almacenados en PostgreSQL Reservas y PostgreSQL Pagos.

---

## Relacion entre ambas vistas

La arquitectura sincronica y la asincronica se complementan dentro del sistema. La vista sincronica explica el flujo inmediato de atencion de solicitudes, mientras que la vista asincronica muestra como se delegan procesos internos a colas y workers para mejorar el desacoplamiento, la tolerancia a fallos y la capacidad de procesamiento.

En conjunto, las vistas de AWS y localhost representan una arquitectura orientada a servicios, con autenticacion basada en JWT, persistencia distribuida en PostgreSQL y procesamiento asincrono mediante RabbitMQ. El entorno local permite validar el comportamiento completo mediante Docker Compose, mientras que AWS representa el despliegue distribuido en infraestructura cloud.

---

[Volver a Documentacion](../Documentaci%C3%B3n.md)
