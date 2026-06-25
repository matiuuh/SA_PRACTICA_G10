# Toma de Decisiones de Infraestructura

Este documento justifica las decisiones de infraestructura tomadas para el entorno de producción del sistema FilmStars, detallando qué herramienta se eligió, por qué se eligió sobre las alternativas y para qué sirve dentro del sistema.

---

## Registry privado de imágenes — Zot

**¿Qué?** Se eligió **Zot** como registry privado de contenedores para el entorno de producción (rama `release`).

**¿Por qué?** Zot es un registry OCI-nativo, ligero y de código abierto que puede ejecutarse directamente en una instancia de AWS sin dependencias externas. A diferencia de Harbor, que requiere múltiples componentes (base de datos, Redis, componentes de UI, etc.) y una infraestructura más pesada, Zot arranca como un único binario o contenedor con configuración mínima. Esto lo hace ideal para equipos pequeños donde el costo operativo y la complejidad de mantenimiento deben ser bajos. Además, expone una API compatible con la especificación OCI Distribution, lo que lo hace compatible de forma nativa con Docker, Buildx y `kubectl`.

**¿Para qué?** En el pipeline CI/CD de la rama `release`, las imágenes de todos los microservicios y del frontend son construidas y publicadas con doble tag (`:latest` y `:<sha_corto>`) hacia el registry Zot alojado en la infraestructura AWS del proyecto. El cluster K3s de producción las descarga desde ahí usando el secret `registry-credentials`. Esto garantiza que las imágenes desplegadas en producción no dependan de DockerHub (evitando rate limits y filtraciones accidentales de código), que cada despliegue sea trazable por su SHA de commit y que el artefacto sea inmutable una vez publicado.

---

## Orquestador de contenedores — K3s

**¿Qué?** Se eligió **K3s** como orquestador de contenedores para el entorno de producción en AWS.

**¿Por qué?** K3s es una distribución certificada de Kubernetes diseñada para entornos con recursos limitados. Reduce el consumo de memoria y CPU respecto a un clúster Kubernetes estándar al eliminar componentes legacy, empaquetar todo en un único binario e incluir SQLite como almacén de estado por defecto. Para un proyecto académico desplegado sobre instancias EC2 de bajo costo, esto es determinante: permite correr un clúster funcional con un nodo master y nodos worker sin necesidad de instancias grandes. K3s sigue siendo 100% compatible con los manifiestos estándar de Kubernetes (`Deployment`, `Service`, `Ingress`, `PVC`, etc.), por lo que toda la configuración existente en `k8s/` es directamente aplicable sin modificaciones.

**¿Para qué?** K3s orquesta todos los workloads del sistema FilmStars en producción: los cinco microservicios del backend (`auth-service`, `localidades-service`, `funciones-service`, `reservas-service`, `pagos-service`), el `api-gateway`, el `frontend`, las cinco instancias de PostgreSQL y RabbitMQ. Gestiona el ciclo de vida de los pods (rolling updates, health checks via `readinessProbe` y `livenessProbe`, rollback automático ante fallos), el almacenamiento persistente de las bases de datos mediante `PersistentVolumeClaims` y la resolución de nombres de servicio entre contenedores dentro del namespace `filmstars`.

---

## Controlador de Ingress — NGINX Ingress Controller

**¿Qué?** Se eligió **NGINX Ingress Controller** como controlador de enrutamiento HTTP externo sobre K3s.

**¿Por qué?** K3s incluye Traefik como controlador de Ingress por defecto, pero el proyecto usa NGINX Ingress Controller para mantener un punto de entrada explicito y consistente con los manifiestos del clúster. Esto simplifica la integración con cert-manager, permite emitir TLS con Let's Encrypt y centraliza las reglas de `/api`, `/socket.io` y `/` en un único recurso de Ingress. NGINX Ingress Controller se instala con un único `kubectl apply` sobre K3s y coexiste sin conflictos desactivando Traefik.

**¿Para qué?** El NGINX Ingress Controller actúa como punto de entrada único al clúster desde Internet. Expone dos reglas definidas en `k8s/ingress/ingress.yaml`:

- **`/api/*`** → redirige al `api-gateway` en el puerto `3006`, preservando el prefijo `/api` que el gateway utiliza para enrutar internamente.
- **`/socket.io/*`** → redirige al `reservas-service` en el puerto `3004` para WebSockets.
- **`/`** → redirige al `frontend` en el puerto `80`, sirviendo la aplicación React para cualquier ruta no capturada por la regla anterior.

Este esquema centraliza el control de tráfico, evita exponer puertos individuales de cada servicio al exterior y permite servir el frontend por HTTPS sin comprar un dominio usando el host gratuito `<ip-publica>.sslip.io`.

---

[Volver a Documentación](../Documentación.md)
