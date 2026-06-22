# Diagrama de Arquitectura General

## Arquitectura síncrona

![Diagrama de Arquitectura General Síncrono](<img/Diagrama de Arquitectura sincrono.png>)

### Descripción

La arquitectura síncrona representa las operaciones en las que el usuario o administrador espera una respuesta inmediata. Ambos actores acceden al frontend desarrollado con React y Vite, el cual se comunica con el API Gateway mediante HTTP/REST y JWT. El gateway funciona como punto único de acceso a los servicios de autenticación, funciones, reservas, pagos y localidades.

El diagrama diferencia los dos flujos de despliegue. En la rama `develop`, un GitHub Runner self-hosted descarga las imágenes y levanta el sistema completo en una máquina local mediante Docker Compose. Este entorno contiene el frontend, el API Gateway, los microservicios y sus componentes de infraestructura, permitiendo realizar pruebas integradas antes de publicar una versión.

En la rama `release`, la aplicación se despliega en AWS sobre un clúster K3s. Traefik Ingress Controller recibe las solicitudes externas y las dirige hacia los pods del frontend y del API Gateway. El gateway enruta las peticiones hacia los pods de autenticación, funciones, reservas, pagos y localidades. Cada servicio se conecta mediante TCP con su base de datos PostgreSQL correspondiente, alojada fuera del clúster en una máquina virtual dedicada a persistencia.

El proceso de CI/CD comienza con un `push` a `develop` o `release`. GitHub Actions ejecuta las pruebas unitarias con una cobertura mínima del 75 %, construye las imágenes Docker y las publica en Docker Hub. Después, la fase de despliegue actualiza el ambiente correspondiente: Docker Compose para `develop` y los recursos del clúster K3s para `release`.

---

## Arquitectura asíncrona

![Diagrama de Arquitectura General Asíncrono](<img/Diagrama de Arquitectura asincrono.png>)

### Descripción

La arquitectura asíncrona representa el procesamiento desacoplado de reservas, pagos, estados de asientos y generación de boletos. El usuario inicia la operación desde el frontend y la solicitud llega al API Gateway. RabbitMQ funciona como broker de mensajería y distribuye los eventos en colas especializadas, evitando que las tareas internas bloqueen la interacción principal.

Los consumidores especializados atienden cada flujo: el Worker Tickets genera el boleto final, el Worker Reservas confirma o libera los asientos y el Worker Pagos procesa las solicitudes de pago. Estos consumidores actualizan los servicios de reservas y pagos; posteriormente, cada servicio registra el resultado en su base de datos PostgreSQL. El servicio de pagos también se comunica mediante HTTP con el componente de pago simulado.

En `develop`, RabbitMQ, los consumidores, los microservicios y las bases de datos se ejecutan localmente mediante Docker Compose. En `release`, el frontend, el API Gateway, RabbitMQ, los workers y los servicios de reservas y pagos se ejecutan como pods dentro del clúster K3s. Traefik Ingress Controller administra la entrada al clúster y el K3s Server mantiene el control de sus recursos. Las bases de datos de reservas y pagos permanecen en una máquina virtual de persistencia y son consumidas mediante TCP.

Esta separación permite conservar y reprocesar los mensajes cuando un consumidor no está disponible temporalmente, reduce el acoplamiento entre servicios y mejora la tolerancia a fallos. Las mismas imágenes publicadas en Docker Hub son utilizadas por Docker Compose en `develop` y por los pods de K3s en `release`.

---

[Volver a Documentacion](../Documentaci%C3%B3n.md)
