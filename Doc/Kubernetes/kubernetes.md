# Justificación y Estructura de Manifiestos Kubernetes — FilmStars

## Índice

1. [Namespace](#1-namespace)
2. [Deployments](#2-deployments)
3. [Services](#3-services)
4. [ConfigMaps](#4-configmaps)
5. [Secrets](#5-secrets)
6. [Ingress](#6-ingress)

---

## 1. Namespace

El `Namespace` es la unidad de aislamiento lógico dentro del clúster. Toda la infraestructura de FilmStars se despliega bajo el namespace `filmstars`, lo que permite:

- **Aislamiento de recursos**: los objetos del proyecto no interfieren con otros workloads del clúster.
- **Control de acceso granular**: se pueden aplicar RBAC policies solo sobre `filmstars`.
- **Cuotas de recursos**: es posible limitar CPU/memoria a nivel de namespace con `ResourceQuota`.

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: filmstars
  labels:
    app: filmstars
```

---

## 2. Deployments

### Justificación teórica

Un `Deployment` es el objeto de Kubernetes que describe el **estado deseado** de un conjunto de Pods. El controlador de Deployments reconcilia continuamente el estado real con el deseado, lo que proporciona:

- **Auto-recuperación**: si un Pod falla, el controlador lo reemplaza automáticamente.
- **Actualizaciones sin downtime**: mediante la estrategia `RollingUpdate`, se reemplaza un Pod a la vez sin interrumpir el servicio.
- **Rollback automático**: si una nueva versión falla los health checks, Kubernetes puede revertir al estado anterior.
- **Escalado horizontal**: el número de réplicas puede ajustarse manual o automáticamente (HPA).

### Justificación práctica en FilmStars

Cada microservicio y componente de infraestructura tiene su propio Deployment independiente. Esto se alinea con la arquitectura SOA del proyecto: cada servicio puede escalar, actualizarse y fallar de forma aislada sin afectar al resto.

La estrategia `RollingUpdate` con `maxUnavailable: 0` y `maxSurge: 1` garantiza **zero-downtime deployments**, crítico en un sistema de venta de boletos donde una interrupción equivale a pérdida de ventas.

Los `readinessProbe` y `livenessProbe` son mecanismos de health check:
- **readinessProbe**: Kubernetes no envía tráfico al Pod hasta que esta sonda sea exitosa. Evita errores 502 durante el arranque.
- **livenessProbe**: si el Pod queda en estado zombie (proceso colgado), Kubernetes lo reinicia.

Los bloques `resources.requests` y `resources.limits` permiten al scheduler tomar decisiones informadas de placement y evitan que un servicio monopolice los recursos del nodo.

### Estructura base — Microservicio de aplicación

```yaml
# k8s/apps/<nombre-servicio>.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: <nombre-servicio>
  namespace: filmstars
spec:
  replicas: 1
  selector:
    matchLabels:
      app: <nombre-servicio>
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: <nombre-servicio>
    spec:
      imagePullSecrets:
        - name: registry-credentials       # Secret para el registro privado de imágenes
      containers:
        - name: <nombre-servicio>
          image: <REGISTRY_HOST>/<imagen>:<TAG>   # Sustituido por envsubst en el pipeline CI/CD
          ports:
            - containerPort: <PUERTO>
          env:
            - name: PORT
              valueFrom:
                configMapKeyRef:
                  name: <nombre-servicio>-config
                  key: PORT
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: <nombre-servicio>-config
                  key: DB_HOST
            - name: DB_PASSWORD              # Variable sensible: viene del Secret, no del ConfigMap
              valueFrom:
                secretKeyRef:
                  name: filmstars-secrets
                  key: POSTGRES_PASSWORD
          readinessProbe:
            tcpSocket:
              port: <PUERTO>
            initialDelaySeconds: 15
            periodSeconds: 10
          livenessProbe:
            tcpSocket:
              port: <PUERTO>
            initialDelaySeconds: 30
            periodSeconds: 20
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

### Estructura base — Infraestructura (PostgreSQL)

```yaml
# k8s/infra/postgres-<servicio>.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-<servicio>
  namespace: filmstars
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres-<servicio>
  template:
    metadata:
      labels:
        app: postgres-<servicio>
    spec:
      containers:
        - name: postgres-<servicio>
          image: postgres:15-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_USER
              valueFrom:
                configMapKeyRef:
                  name: filmstars-config
                  key: DB_USERNAME
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: filmstars-secrets
                  key: POSTGRES_PASSWORD
            - name: POSTGRES_DB
              valueFrom:
                configMapKeyRef:
                  name: <servicio>-config
                  key: DB_NAME
          volumeMounts:
            - name: postgres-<servicio>-data
              mountPath: /var/lib/postgresql/data
          readinessProbe:
            exec:
              command: [pg_isready, -U, postgres, -d, <nombre-db>]
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            exec:
              command: [pg_isready, -U, postgres, -d, <nombre-db>]
            initialDelaySeconds: 30
            periodSeconds: 10
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
      volumes:
        - name: postgres-<servicio>-data
          persistentVolumeClaim:
            claimName: pvc-postgres-<servicio>
```

### Deployments del proyecto

| Deployment | Imagen base | Puerto | Tipo |
|---|---|---|---|
| `frontend` | `filmstars-frontend` | 80 | Aplicación |
| `api-gateway` | `filmstars-api-gateway` | 3006 | Aplicación |
| `auth-service` | `filmstars-auth-service` | 3001 | Aplicación |
| `localidades-service` | `filmstars-localidades-service` | 3002 | Aplicación |
| `funciones-service` | `filmstars-funciones-service` | 3003 | Aplicación |
| `reservas-service` | `filmstars-reservas-service` | 3004 | Aplicación |
| `pagos-service` | `filmstars-pagos-service` | 3005 | Aplicación |
| `postgres-auth` | `postgres:15-alpine` | 5432 | Infraestructura |
| `postgres-localidades` | `postgres:15-alpine` | 5432 | Infraestructura |
| `postgres-funciones` | `postgres:15-alpine` | 5432 | Infraestructura |
| `postgres-reservas` | `postgres:15-alpine` | 5432 | Infraestructura |
| `postgres-pagos` | `postgres:15-alpine` | 5432 | Infraestructura |
| `rabbitmq` | `rabbitmq:3-management` | 5672 / 15672 | Infraestructura |

---

## 3. Services

### Justificación teórica

Un `Service` es una abstracción estable que expone un conjunto de Pods bajo una única dirección IP virtual (ClusterIP) y un nombre DNS dentro del clúster. Su propósito es desacoplar a los consumidores de los Pods concretos, que son efímeros y cambian de IP con cada reinicio.

Kubernetes registra automáticamente cada Service en su DNS interno con el patrón `<nombre>.<namespace>.svc.cluster.local`, lo que permite comunicación entre servicios usando nombres semánticos en lugar de IPs.

#### Tipos de Service utilizados

| Tipo | Alcance | Uso en FilmStars |
|---|---|---|
| `ClusterIP` | Solo dentro del clúster | Todos los microservicios y bases de datos |
| `LoadBalancer` / `Ingress` | Exposición externa | Gestionado por el Ingress Controller (nginx) |

Se utiliza exclusivamente `ClusterIP` para los servicios internos porque **ningún microservicio debe ser accesible directamente desde Internet**. El único punto de entrada externo es el Ingress, que actúa como reverse proxy hacia el API Gateway y el frontend.

### Justificación práctica en FilmStars

El API Gateway necesita conocer las URLs de los microservicios en tiempo de ejecución. En lugar de hardcodear IPs (que cambiarían en cada redespliegue), el ConfigMap `filmstars-config` almacena URLs como `http://auth-service:3001`, que son exactamente los nombres DNS que Kubernetes resuelve internamente. Los Services son los que hacen posible esta resolución.

### Estructura base — Service ClusterIP

```yaml
# Definido en el mismo archivo que el Deployment correspondiente
apiVersion: v1
kind: Service
metadata:
  name: <nombre-servicio>
  namespace: filmstars
spec:
  selector:
    app: <nombre-servicio>        # Debe coincidir con los labels del Pod template del Deployment
  type: ClusterIP
  ports:
    - port: <PUERTO>              # Puerto que expone el Service dentro del clúster
      targetPort: <PUERTO>        # Puerto del contenedor al que redirige el tráfico
```

### Estructura base — Service con múltiples puertos (RabbitMQ)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: rabbitmq
  namespace: filmstars
spec:
  selector:
    app: rabbitmq
  type: ClusterIP
  ports:
    - name: amqp
      port: 5672
      targetPort: 5672
    - name: management
      port: 15672
      targetPort: 15672
```

### Services del proyecto

| Service | Puerto(s) | Consumers principales |
|---|---|---|
| `frontend` | 80 | Ingress (usuario final) |
| `api-gateway` | 3006 | Ingress (usuario final) |
| `auth-service` | 3001 | API Gateway |
| `localidades-service` | 3002 | API Gateway |
| `funciones-service` | 3003 | API Gateway |
| `reservas-service` | 3004 | API Gateway, pagos-service |
| `pagos-service` | 3005 | API Gateway |
| `postgres-auth` | 5432 | auth-service |
| `postgres-localidades` | 5432 | localidades-service |
| `postgres-funciones` | 5432 | funciones-service |
| `postgres-reservas` | 5432 | reservas-service |
| `postgres-pagos` | 5432 | pagos-service |
| `rabbitmq` | 5672 (AMQP), 15672 (UI) | reservas-service, pagos-service |

---

## 4. ConfigMaps

### Justificación teórica

Un `ConfigMap` desacopla los datos de configuración no sensibles del código de la imagen de contenedor, siguiendo el principio de los **12-Factor Apps** (factor III: Config). Las ventajas son:

- **Portabilidad**: la misma imagen puede ejecutarse en desarrollo, staging y producción con diferente configuración sin reconstruirse.
- **Centralización**: los valores compartidos entre múltiples servicios se definen una sola vez y se referencian desde los Deployments.
- **Auditabilidad**: los cambios de configuración se pueden versionar en Git (al no contener secretos, es seguro hacerlo).
- **Separación de responsabilidades**: los desarrolladores mantienen el código, los operadores mantienen la configuración.

### Justificación práctica en FilmStars

El proyecto utiliza dos niveles de ConfigMaps:

1. **`filmstars-config`** (global): valores compartidos por todos los servicios — puerto de PostgreSQL, URLs internas, parámetros de JWT, configuración de RabbitMQ.
2. **`<servicio>-config`** (por servicio): valores únicos de cada microservicio — puerto propio, host y nombre de su base de datos.

Esta jerarquía evita duplicación: si el puerto de PostgreSQL cambia, se modifica en un solo lugar (`filmstars-config`) y todos los servicios lo toman automáticamente.

### Estructura base — ConfigMap global

```yaml
# k8s/configmaps/app-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: filmstars-config
  namespace: filmstars
data:
  DB_PORT: "5432"
  DB_USERNAME: "postgres"

  JWT_EXPIRES_IN: "1h"
  DEFAULT_ROLE: "CLIENTE"

  AUTH_SERVICE_URL: "http://auth-service:3001"
  LOCALIDADES_SERVICE_URL: "http://localidades-service:3002"
  FUNCIONES_SERVICE_URL: "http://funciones-service:3003"
  RESERVAS_SERVICE_URL: "http://reservas-service:3004"
  PAGOS_SERVICE_URL: "http://pagos-service:3005"
  FRONTEND_URL: "http://frontend:80"

  RABBITMQ_HOST: "rabbitmq"
  RABBITMQ_MANAGEMENT_PORT: "15672"
  RABBITMQ_AMQP_PORT: "5672"
```

### Estructura base — ConfigMap por servicio

```yaml
# Sección dentro de k8s/configmaps/app-config.yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: <nombre-servicio>-config
  namespace: filmstars
data:
  PORT: "<PUERTO>"
  DB_HOST: "postgres-<nombre-servicio>"
  DB_NAME: "<nombre_base_de_datos>"
```

### Referencia desde un Deployment

```yaml
env:
  - name: DB_PORT
    valueFrom:
      configMapKeyRef:
        name: filmstars-config    # Nombre del ConfigMap
        key: DB_PORT              # Clave dentro del ConfigMap
  - name: DB_HOST
    valueFrom:
      configMapKeyRef:
        name: auth-service-config
        key: DB_HOST
```

### ConfigMaps del proyecto

| ConfigMap | Alcance | Claves principales |
|---|---|---|
| `filmstars-config` | Global | `DB_PORT`, `DB_USERNAME`, `JWT_EXPIRES_IN`, URLs de servicios, parámetros de RabbitMQ |
| `auth-service-config` | `auth-service` | `PORT=3001`, `DB_HOST=postgres-auth`, `DB_NAME=auth_service` |
| `localidades-service-config` | `localidades-service` | `PORT=3002`, `DB_HOST=postgres-localidades`, `DB_NAME=localidades_service` |
| `funciones-service-config` | `funciones-service` | `PORT=3003`, `DB_HOST=postgres-funciones`, `DB_NAME=funciones_db` |
| `reservas-service-config` | `reservas-service` | `PORT=3004`, `DB_HOST=postgres-reservas`, `DB_NAME=reservas_service` |
| `pagos-service-config` | `pagos-service` | `PORT=3005`, `DB_HOST=postgres-pagos`, `DB_NAME=pagos_service` |
| `api-gateway-config` | `api-gateway` | `PORT=3006` |

---

## 5. Secrets

### Justificación teórica

Un `Secret` es funcionalmente similar a un ConfigMap pero está diseñado para datos sensibles (contraseñas, tokens, claves privadas). Sus características de seguridad son:

- **Almacenamiento encriptado en etcd**: a diferencia de los ConfigMaps, los Secrets pueden encriptarse en reposo con `EncryptionConfiguration`.
- **Acceso controlado por RBAC**: se pueden conceder permisos de lectura de Secrets solo a los ServiceAccounts que los necesiten.
- **No se imprimen en logs**: Kubernetes evita exponer valores de Secrets en los logs del sistema.
- **Montaje restringido**: solo los Pods que explícitamente referencian el Secret pueden acceder a él.

Los valores se almacenan codificados en **base64** (no encriptados por defecto — es solo codificación). La encriptación real se habilita a nivel de clúster.

> **Regla de oro**: ningún Secret con valores reales debe subirse al repositorio Git. El archivo `k8s/secrets/app-secrets.yaml` es una **plantilla** con variables `${VARIABLE_B64}` que el pipeline de CI/CD sustituye con `envsubst` en tiempo de despliegue.

### Justificación práctica en FilmStars

El sistema maneja cuatro secretos críticos:

| Secreto | Uso |
|---|---|
| `POSTGRES_PASSWORD` | Contraseña compartida para todas las instancias de PostgreSQL |
| `JWT_SECRET` | Clave de firma para tokens JWT del `auth-service` |
| `RABBITMQ_USER` | Usuario de autenticación de RabbitMQ |
| `RABBITMQ_PASS` | Contraseña de autenticación de RabbitMQ |

El Secret `registry-credentials` es de tipo `kubernetes.io/dockerconfigjson` y permite a los nodos del clúster autenticarse contra el registro privado de imágenes Docker para descargar las imágenes de los microservicios.

### Estructura base — Secret de aplicación (plantilla sin valores reales)

```yaml
# k8s/secrets/app-secrets.yaml  —  PLANTILLA, no contiene credenciales reales
# El pipeline sustituye ${..._B64} con: echo -n "<valor>" | base64 -w0
apiVersion: v1
kind: Secret
metadata:
  name: filmstars-secrets
  namespace: filmstars
type: Opaque
data:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD_B64}   # Inyectado por CI/CD via envsubst
  JWT_SECRET: ${JWT_SECRET_B64}
  RABBITMQ_USER: ${RABBITMQ_USER_B64}
  RABBITMQ_PASS: ${RABBITMQ_PASS_B64}
```

### Estructura base — Secret para registro privado de imágenes

```yaml
# k8s/secrets/registry-credentials.yaml  —  PLANTILLA
apiVersion: v1
kind: Secret
metadata:
  name: registry-credentials
  namespace: filmstars
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: ${REGISTRY_CREDENTIALS_B64}   # JSON de autenticación del registro, codificado en base64
```

### Referencia desde un Deployment

```yaml
# Variables de entorno sensibles
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: filmstars-secrets   # Nombre del Secret
        key: POSTGRES_PASSWORD    # Clave dentro del Secret

# Credenciales para pull de imágenes privadas
spec:
  imagePullSecrets:
    - name: registry-credentials
```

---

## 6. Ingress

El `Ingress` es el punto de entrada HTTP/HTTPS externo al clúster. Para FilmStars se utiliza el **Ingress Controller nginx** y se definen dos reglas:

```yaml
# k8s/ingress/ingress.yaml
# /api/* → api-gateway:3006  (nginx elimina el prefijo /api)
# /*     → frontend:80
```

La arquitectura de routing garantiza que **todo el tráfico de usuario pase por el API Gateway** antes de llegar a los microservicios, lo que centraliza la autenticación JWT y el control de acceso.

---
