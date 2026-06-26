# Diagrama de Arquitectura General

## Arquitectura síncrona

![Diagrama de Arquitectura General Síncrono](<img/Diagrama de Arquitectura sincrono.png>)

### Descripción

La arquitectura síncrona representa las operaciones donde el usuario o administrador espera una respuesta inmediata del sistema. Ambos actores acceden al frontend desarrollado con React y Vite, y este envía las solicitudes al API Gateway mediante HTTP/REST utilizando JWT. El API Gateway centraliza el acceso y enruta cada petición hacia el microservicio correspondiente: autenticación/usuarios, funciones, reservas, pagos o localidades.

En la rama `develop`, el despliegue se realiza sobre instancias EC2 en AWS usando Docker Compose. La máquina virtual principal contiene el frontend y el API Gateway; una segunda máquina ejecuta los microservicios NestJS; y una tercera máquina aloja las bases de datos PostgreSQL separadas por dominio. Cada servicio se comunica con su base de datos mediante TCP, manteniendo independencia entre módulos y evitando que un dominio dependa directamente de la información interna de otro.

En la rama `release`, la solución se despliega en un cluster K3s dentro de AWS. El tráfico HTTPS entra por Traefik Ingress Controller y se dirige al frontend, al API Gateway y a los pods de microservicios. Los servicios se ejecutan como pods dentro del nodo del cluster, mientras que las bases de datos PostgreSQL se mantienen en una máquina virtual independiente administrada con Docker Compose. Esta separación permite escalar y actualizar los servicios sin mezclar la capa de aplicación con la capa de persistencia.

La observabilidad se apoya en Prometheus y Grafana para recolectar métricas y visualizar el comportamiento del sistema. El flujo de CI/CD inicia cuando el desarrollador envía cambios al repositorio GitHub en las ramas `develop` o `release`: GitHub Actions ejecuta pruebas unitarias con cobertura mínima del 75 %, construye las imágenes Docker, las publica en Docker Hub y activa el despliegue correspondiente. Terraform se utiliza para el aprovisionamiento de infraestructura y Ansible para tareas de configuración automatizada.

---

## Arquitectura asíncrona

![Diagrama de Arquitectura General Asíncrono](<img/Diagrama de Arquitectura asincrono.png>)

### Descripción

La arquitectura asíncrona representa el procesamiento desacoplado de reservas, pagos y generación de boletos. El usuario inicia la operación desde el frontend y la solicitud llega al API Gateway, pero el procesamiento pesado no se resuelve completamente dentro de la misma petición. En su lugar, RabbitMQ actúa como broker de mensajería y distribuye eventos en colas especializadas para que los consumidores trabajen de forma independiente.

El flujo principal se divide en colas para tickets, reservas y pagos. El Worker Tickets genera el boleto final, el Worker Reservas confirma o libera asignaciones de asientos y el Worker Pagos procesa la solicitud de pago. Estos workers consumen mensajes desde RabbitMQ y coordinan actualizaciones con los servicios de reservas y pagos. El servicio de pagos también se comunica por HTTP con el componente de pago simulado, mientras que los cambios persistentes se almacenan en bases de datos PostgreSQL independientes.

En `develop`, los componentes se ejecutan en EC2 con Docker Compose: el frontend y el API Gateway se ubican en una máquina, RabbitMQ junto con los consumidores y microservicios asíncronos en otra, y las bases de datos PostgreSQL en una tercera. En `release`, la aplicación se ejecuta sobre K3s: Traefik recibe el tráfico HTTPS, el frontend, API Gateway, RabbitMQ, workers y servicios se despliegan como pods, y la persistencia permanece en una máquina virtual separada con PostgreSQL para reservas y pagos.

El uso de mensajería permite que los eventos permanezcan disponibles aunque un consumidor no esté operativo temporalmente, favoreciendo la tolerancia a fallos y la recuperación del proceso. Al igual que en la arquitectura síncrona, el pipeline de GitHub Actions valida el código, construye imágenes Docker, las publica en Docker Hub y despliega según la rama utilizada. Prometheus y Grafana brindan observabilidad del estado de los servicios, colas y componentes desplegados.

---

[Volver a Documentacion](../Documentaci%C3%B3n.md)
