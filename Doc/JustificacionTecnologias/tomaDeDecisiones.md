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

## Infraestructura como Código — Terraform

**¿Qué?** Se eligió **Terraform** (HashiCorp) como proveedor de IaC (Infrastructure as Code) para aprovisionar todos los recursos de AWS del proyecto.

**¿Por qué?** Terraform usa un modelo declarativo: el equipo describe el estado deseado de la infraestructura en archivos `.tf` y Terraform calcula y ejecuta el plan de cambios para llegar a ese estado. Esto lo diferencia de alternativas como AWS CloudFormation (específico de AWS, YAML/JSON verboso sin módulos reutilizables de forma natural) o scripts Bash de `aws-cli` (imperativos, no idempotentes, difíciles de mantener y sin gestión de estado). La elección de Terraform sobre CloudFormation fue determinada por tres factores: el lenguaje HCL es más legible y compacto; el backend de estado remoto en S3 con bloqueo en DynamoDB es compatible con el pipeline de GitHub Actions sin configuración adicional; y el sistema de módulos permite reutilizar las definiciones de red y cómputo entre los entornos `develop` y `release` con parámetros distintos, eliminando la duplicación.

**¿Para qué?** Terraform aprovisiona la totalidad de la infraestructura de AWS del proyecto:

- **Módulo `networking`:** crea la VPC, la subred pública, el Internet Gateway y la tabla de rutas para cada entorno.
- **Módulo `compute`:** aprovisiona instancias EC2 con Ubuntu 22.04 LTS, volúmenes EBS cifrados con `gp3` y Elastic IPs estáticas para que la IP pública del servidor no cambie entre reinicios.
- **Security Groups:** define las reglas de firewall por entorno. En `develop`, abre los puertos de los microservicios y el API Gateway. En `release`, abre solo los puertos del Ingress Controller (80/443), la API de K3s (6443) y los puertos de comunicación intra-clúster (Flannel, kubelet, etcd).
- **Backend remoto:** el estado de Terraform se almacena en un bucket S3 con cifrado y versionado, con bloqueo distribuido a través de una tabla DynamoDB, garantizando que múltiples ejecuciones concurrentes del pipeline no corrompan el estado.

---

## Gestión de configuración — Ansible frente a scripts Bash

**¿Qué?** Se eligió **Ansible** para automatizar la configuración del sistema operativo, la instalación de dependencias y el despliegue de la aplicación en las instancias EC2 aprovisionadas por Terraform.

**¿Por qué?** La alternativa más directa era usar scripts Bash invocados a través de SSH desde el pipeline de CI/CD. Sin embargo, Ansible ofrece ventajas estructurales determinantes para este proyecto:

- **Idempotencia garantizada:** los módulos de Ansible (`apt`, `systemd`, `copy`, `template`, `file`, etc.) verifican el estado actual antes de actuar. Ejecutar el mismo playbook dos veces en el mismo servidor no produce efectos secundarios. Un script Bash equivalente requiere que el desarrollador implemente manualmente cada verificación (`if [ ! -f ... ]`), con alta probabilidad de errores.
- **Sin agente en los nodos:** Ansible se conecta por SSH estándar. No requiere instalar ningún cliente en las instancias EC2, lo que simplifica el bootstrapping y reduce la superficie de ataque.
- **Modularidad con roles:** la lógica de configuración está organizada en roles reutilizables (`common`, `docker`, `k3s_master`, `k3s_agent`, `zot_registry`). El mismo rol `common` se aplica a los nodos de `develop` y de `release` sin duplicación. Un playbook orquesta la secuencia de fases con dependencias explícitas (esperar SSH → instalar OS → instalar K3s master → unir workers → configurar registry).
- **Legibilidad y mantenibilidad:** los playbooks en YAML son autoexplicativos. Incorporar un nuevo desarrollador al proyecto tiene una curva de aprendizaje menor que auditar cientos de líneas de Bash.

La elección sobre scripts Bash no fue de capacidad sino de operabilidad: a medida que el número de nodos y de pasos de configuración crece, el coste de mantener scripts Bash idempotentes y robustos supera con creces el de mantener playbooks de Ansible.

**¿Para qué?** Ansible gestiona dos flujos de configuración distintos según el entorno:

- **Entorno `develop`:** el playbook `configure_develop.yml` espera conectividad SSH, aplica los roles `common` y `docker`, copia el `docker-compose.yml` y los archivos SQL de inicialización de bases de datos, genera el archivo `.env` desde la plantilla Jinja2 `develop_env.j2` con los secretos provistos por el pipeline, detiene y recrea los contenedores y limpia las imágenes obsoletas.
- **Entorno `release`:** el playbook `configure_release.yml` bootstrapea todos los nodos con `common`, instala K3s en el nodo master (deshabilitando Traefik), lee el token de nodo desde el master y une los workers al clúster, y finalmente configura el registry Zot en su instancia dedicada.

---

## Stack de observabilidad — Prometheus y Grafana

**¿Qué?** Se seleccionó **Prometheus** como sistema de recolección de métricas y **Grafana** como plataforma de visualización y dashboards para el stack de observabilidad del clúster.

**¿Por qué?** El stack Prometheus + Grafana es el estándar de facto para observabilidad en entornos Kubernetes. Frente a alternativas como Datadog o New Relic (SaaS con coste por host, poco adecuados para un entorno académico) o el stack ELK (orientado a logs, no a métricas de series temporales), Prometheus ofrece:

- **Modelo pull nativo para Kubernetes:** Prometheus descubre y raspa (`scrape`) endpoints `/metrics` expuestos por los pods, el API server de K3s, el Ingress Controller y los propios nodos. No requiere que los servicios empujen métricas a un destino externo.
- **PromQL:** lenguaje de consulta expresivo para métricas de series temporales, que permite construir alertas y dashboards basados en tasas, percentiles y agregaciones sin necesidad de infraestructura adicional.
- **Integración nativa con Grafana:** Grafana consume Prometheus como datasource y dispone de dashboards preconstruidos para Kubernetes (Kubernetes / Compute Resources, Node Exporter Full, NGINX Ingress Controller), lo que reduce el tiempo de configuración inicial.
- **Coste operativo cero:** ambas herramientas son open source y corren como pods dentro del propio clúster K3s, sin dependencias externas ni costes de licencia.

**¿Para qué?** El stack cubre tres necesidades operativas del sistema FilmStars en producción:

1. **Métricas de infraestructura:** uso de CPU, memoria, disco y red por nodo EC2 (via Node Exporter), y métricas del plano de control de K3s (API server latency, scheduler queue, etcd).
2. **Métricas de aplicación:** tasa de peticiones, latencia por percentil (p50/p95/p99) y tasa de errores por microservicio, expuestas a través del Ingress Controller y del API Gateway.
3. **Alertas operativas:** reglas de alerta en Prometheus (`PrometheusRule`) que disparan notificaciones ante condiciones críticas: pod en `CrashLoopBackOff`, uso de memoria superior al 85% del límite, o latencia p95 del API Gateway superior a 500 ms.

---

[Volver a Documentación](../Documentación.md)
