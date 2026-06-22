# Diagrama de Arquitectura General

## Arquitectura síncrona

![Diagrama de Arquitectura General Síncrono](<img/Diagrama de Arquitectura sincrono.png>)

### Descripción

La arquitectura síncrona representa las operaciones en las que el usuario o administrador espera una respuesta inmediata. Ambos actores acceden al frontend desarrollado con React y Vite, el cual envía las solicitudes al API Gateway mediante HTTP/REST utilizando JWT. El gateway funciona como punto único de entrada y dirige cada petición hacia el microservicio responsable.

En AWS, los componentes están distribuidos en tres máquinas virtuales EC2 administradas con Docker Compose. La primera contiene el frontend y el API Gateway; la segunda ejecuta los servicios de autenticación, funciones, reservas, pagos y localidades; y la tercera aloja una base de datos PostgreSQL independiente para cada dominio. Los microservicios se comunican con sus bases de datos mediante TCP, conservando la separación de responsabilidades y datos.

El proceso de CI/CD comienza cuando el desarrollador envía cambios a las ramas `develop` o `release` del repositorio GitHub. GitHub Actions ejecuta las pruebas unitarias con una cobertura mínima del 75 %, construye y publica las imágenes en Docker Hub y realiza el despliegue mediante SSH. La rama `release` despliega en AWS, mientras que `develop` utiliza un runner self-hosted para levantar el sistema completo en el ambiente local.

---

## Arquitectura asíncrona

![Diagrama de Arquitectura General Asíncrono](<img/Diagrama de Arquitectura asincrono.png>)

### Descripción

La arquitectura asíncrona representa el procesamiento desacoplado de reservas, pagos y generación de boletos. El usuario inicia la operación desde el frontend y la solicitud llega al API Gateway. En la capa de servicios, RabbitMQ funciona como broker de mensajería y distribuye los eventos en colas para que sean procesados sin mantener bloqueada la petición original.

Los consumidores especializados atienden cada proceso: el Worker Tickets genera el boleto final, el Worker Reservas confirma o libera los asientos y el Worker Pagos procesa la solicitud de pago. Estos consumidores interactúan con los servicios de reservas y pagos, que actualizan sus respectivas bases de datos PostgreSQL. El servicio de pagos también se comunica mediante HTTP con el componente de pago simulado.

Esta separación permite que los mensajes permanezcan disponibles si un consumidor no está operativo temporalmente, facilitando la recuperación del proceso y reduciendo el acoplamiento entre servicios. Al igual que en la arquitectura síncrona, las imágenes Docker se generan mediante el pipeline de GitHub Actions, se almacenan en Docker Hub y se despliegan en AWS para `release` o en el entorno local para `develop`.

---

[Volver a Documentacion](../Documentaci%C3%B3n.md)
