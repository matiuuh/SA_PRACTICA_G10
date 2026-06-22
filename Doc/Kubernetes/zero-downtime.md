# Estrategia Operativa de Despliegue Zero-Downtime — FilmStars

## Índice

1. [Fundamento: ¿Por qué Zero-Downtime?](#1-fundamento-por-qué-zero-downtime)
2. [RollingUpdate: Modelo Matemático y Conceptual](#2-rollingupdate-modelo-matemático-y-conceptual)
   - 2.1 [Definición formal de los parámetros](#21-definición-formal-de-los-parámetros)
   - 2.2 [Restricción matemática fundamental](#22-restricción-matemática-fundamental)
   - 2.3 [Configuración aplicada en FilmStars](#23-configuración-aplicada-en-filmstars)
   - 2.4 [Simulación paso a paso del rollout](#24-simulación-paso-a-paso-del-rollout)
   - 2.5 [Interacción con readinessProbe](#25-interacción-con-readinessprobe)
3. [Rollback Automatizado](#3-rollback-automatizado)
   - 3.1 [Mecanismo nativo de Kubernetes](#31-mecanismo-nativo-de-kubernetes)
   - 3.2 [Flujo de contingencia en el pipeline CD](#32-flujo-de-contingencia-en-el-pipeline-cd)
   - 3.3 [Implementación en el workflow CI/CD](#33-implementación-en-el-workflow-cicd)
   - 3.4 [Casos de fallo detectados](#34-casos-de-fallo-detectados)
4. [Relación con las Probes de Salud](#4-relación-con-las-probes-de-salud)
5. [Tabla de Configuraciones por Servicio](#5-tabla-de-configuraciones-por-servicio)

---

## 1. Fundamento: ¿Por qué Zero-Downtime?

FilmStars es un sistema de venta de boletos en tiempo real. Una interrupción de servicio durante un despliegue tiene consecuencias directas y medibles:

- **Pérdida de transacciones en curso**: un usuario que está en el flujo de pago pierde su sesión y el asiento reservado puede quedar bloqueado temporalmente.
- **Inconsistencia de reservas**: si el servicio de reservas cae mientras RabbitMQ tiene mensajes en cola, los mensajes sin consumir pueden causar dobles reservas al restaurar.
- **Daño a la experiencia del usuario**: errores 502/503 visibles durante un deploy erosionan la confianza en el sistema.

La arquitectura de microservicios agrava el problema: con 7 servicios de aplicación más 6 bases de datos y RabbitMQ, la probabilidad de que **algún** componente esté actualizándose en un momento dado es alta si los despliegues no son coordinados y sin downtime.

La estrategia `RollingUpdate` de Kubernetes resuelve esto controlando matemáticamente cuántos Pods nuevos y cuántos Pods disponibles pueden coexistir en cada instante del proceso de actualización.

---

## 2. RollingUpdate: Modelo Matemático y Conceptual

### 2.1 Definición formal de los parámetros

La estrategia se declara en el bloque `spec.strategy` del Deployment:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

#### `maxSurge`

Define el número máximo de Pods **adicionales** que pueden existir por encima del número deseado de réplicas (`spec.replicas`) durante la actualización.

Sea:
- **R** = `spec.replicas` (réplicas deseadas)
- **S** = `maxSurge`

Entonces, el número máximo de Pods que pueden estar corriendo simultáneamente durante el rollout es:

```
Pods_máximos = R + S
```

`maxSurge` puede expresarse como un entero absoluto o como un porcentaje de R. Con porcentaje, el resultado se redondea **hacia arriba** (_ceiling_):

```
S_abs = ⌈ R × (maxSurge%) / 100 ⌉
```

**Implicación práctica**: Kubernetes puede crear el Pod con la nueva versión **antes** de terminar el Pod viejo, garantizando que siempre haya capacidad disponible para atender tráfico.

#### `maxUnavailable`

Define el número máximo de Pods que pueden estar **no disponibles** (no en estado `Ready`) durante la actualización, con respecto al número deseado de réplicas.

Sea:
- **U** = `maxUnavailable`

Entonces, el número mínimo de Pods que deben estar disponibles en todo momento es:

```
Pods_disponibles_mínimos = R - U
```

Con porcentaje, el resultado se redondea **hacia abajo** (_floor_):

```
U_abs = ⌊ R × (maxUnavailable%) / 100 ⌋
```

**Implicación práctica**: con `maxUnavailable: 0`, el sistema garantiza que **en ningún instante** hay menos Pods disponibles que los configurados en `replicas`. El Pod viejo no se termina hasta que el nuevo haya pasado su `readinessProbe`.

---

### 2.2 Restricción matemática fundamental

Existe una restricción implícita en Kubernetes que previene el bloqueo del rollout:

```
maxSurge + maxUnavailable > 0
```

Si ambos fueran 0 simultáneamente, el controlador no podría avanzar: no puede crear un Pod nuevo (maxSurge=0) ni terminar un Pod viejo (maxUnavailable=0). Kubernetes lo valida al momento de aplicar el Deployment.

Los casos extremos son:

| Configuración | Comportamiento | Trade-off |
|---|---|---|
| `maxSurge: 0, maxUnavailable: 1` | Termina un Pod viejo antes de crear el nuevo | Sin overhead de recursos, pero con downtime momentáneo |
| `maxSurge: R, maxUnavailable: 0` | Crea todos los Pods nuevos antes de terminar los viejos | Zero-downtime, pero requiere el doble de recursos |
| `maxSurge: 1, maxUnavailable: 0` | Crea 1 Pod nuevo → espera Ready → termina 1 Pod viejo | **Zero-downtime con overhead mínimo** ← FilmStars |
| `maxSurge: 1, maxUnavailable: 1` | Puede crear 1 nuevo y terminar 1 viejo simultáneamente | Más rápido, acepta 1 Pod no disponible |

---

### 2.3 Configuración aplicada en FilmStars

Todos los Deployments de aplicación del proyecto usan:

```yaml
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

Aplicando las fórmulas con **R = 1**:

```
Pods_máximos       = R + S = 1 + 1 = 2
Pods_mínimos_Ready = R - U = 1 - 0 = 1
```

**Interpretación**: durante la actualización de cualquier microservicio, puede haber **como máximo 2 Pods corriendo** (el viejo + el nuevo), y **en todo momento habrá al menos 1 Pod en estado Ready** para recibir tráfico. El usuario jamás encuentra un servicio sin instancias disponibles.

#### Justificación de la elección R=1 con maxSurge=1

La elección de 1 réplica por servicio responde a las restricciones de recursos del entorno de producción (cluster K3s en AWS con instancias de capacidad limitada). Con `maxSurge: 1` se mantiene zero-downtime con el mínimo costo adicional: solo 1 Pod extra por servicio durante el rollout, que se libera tan pronto como el nuevo Pod pasa el health check.

---

### 2.4 Simulación paso a paso del rollout

Escenario: actualización del `auth-service` de la versión `v1` a la versión `v2`.

Estado inicial:
```
[Pod auth-service-v1] → Ready ✓   (sirviendo tráfico)
```

**Paso 1**: El controlador detecta que el Deployment template cambió (nueva imagen). Crea un nuevo Pod respetando `maxSurge: 1`:
```
[Pod auth-service-v1] → Ready ✓   (sirviendo tráfico)
[Pod auth-service-v2] → Pending → ContainerCreating
```

**Paso 2**: El nuevo Pod arranca y comienza las `readinessProbe`:
```
[Pod auth-service-v1] → Ready ✓   (sirviendo tráfico)
[Pod auth-service-v2] → Running, readinessProbe en curso...
```

**Paso 3**: El nuevo Pod pasa la `readinessProbe` → entra en rotación del Service:
```
[Pod auth-service-v1] → Ready ✓   (sirviendo tráfico)
[Pod auth-service-v2] → Ready ✓   (sirviendo tráfico)
← ambos están en los Endpoints del Service en este instante
```

**Paso 4**: El controlador verifica que `Pods_disponibles (2) ≥ R - U (1)`. Puede terminar el Pod viejo:
```
[Pod auth-service-v1] → Terminating (recibe SIGTERM, drena conexiones)
[Pod auth-service-v2] → Ready ✓   (única instancia sirviendo tráfico)
```

**Paso 5**: Pod viejo eliminado. Estado final:
```
[Pod auth-service-v2] → Ready ✓   (rollout completado)
```

> **En ningún paso del proceso hubo 0 Pods disponibles.** El Service siempre tuvo al menos un Endpoint activo.

---

### 2.5 Interacción con readinessProbe

El parámetro `maxUnavailable: 0` solo tiene el efecto deseado porque los Pods declaran una `readinessProbe`. Sin ella, Kubernetes marcaría el Pod como Ready inmediatamente al arrancar el proceso, antes de que la aplicación haya inicializado sus conexiones a la base de datos o a RabbitMQ.

```yaml
readinessProbe:
  tcpSocket:
    port: 3001              # Kubernetes verifica que el puerto acepte conexiones TCP
  initialDelaySeconds: 15   # Espera 15 s antes del primer chequeo (tiempo de boot de NestJS + DB)
  periodSeconds: 10         # Repite cada 10 s hasta obtener éxito
```

El pod no entra al pool de Endpoints del Service hasta que la readinessProbe es exitosa. Esto garantiza que el Pod nuevo es **funcionalmente capaz** de atender peticiones antes de que el Pod viejo sea terminado.

Para el frontend, se usa `httpGet` en lugar de `tcpSocket`, ya que nginx responde HTTP:
```yaml
readinessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 10
```

---

## 3. Rollback Automatizado

### 3.1 Mecanismo nativo de Kubernetes

Kubernetes mantiene un **historial de revisiones** de cada Deployment. Cada vez que se modifica el `spec.template` (imagen, variables de entorno, etc.) se crea una nueva `ReplicaSet` y se incrementa el número de revisión. El historial se consulta con:

```bash
kubectl rollout history deployment/auth-service -n filmstars
```

Salida de ejemplo:
```
REVISION  CHANGE-CAUSE
1         imagen v1.0.0 — commit abc1234
2         imagen v1.1.0 — commit def5678  ← actual
```

El comando de reversión es:
```bash
kubectl rollout undo deployment/auth-service -n filmstars
# Revierte a la revisión anterior (revisión N-1)

kubectl rollout undo deployment/auth-service -n filmstars --to-revision=1
# Revierte a una revisión específica
```

Al ejecutar `rollout undo`, Kubernetes aplica el spec del `ReplicaSet` anterior usando exactamente el mismo mecanismo `RollingUpdate`, garantizando que el rollback también sea sin downtime.

El número de revisiones conservadas se controla con:
```yaml
spec:
  revisionHistoryLimit: 3   # Mantiene las últimas 3 revisiones (default: 10)
```

---

### 3.2 Flujo de contingencia en el pipeline CD

El pipeline de CD (rama `release`) detecta fallos de rollout con `kubectl rollout status`, que monitorea el Deployment hasta que todos los Pods de la nueva versión están en estado Ready, o hasta que expira el timeout.


#### Estados de Pod que desencadenan el rollback

| Estado del Pod | Causa típica | ¿Rollback automático? |
|---|---|---|
| `CrashLoopBackOff` | La aplicación arranca y termina con error (excepción no controlada, variable de entorno faltante) | ✓ Sí, timeout de rollout status |
| `OOMKilled` | El contenedor excede `resources.limits.memory` | ✓ Sí |
| `ImagePullBackOff` | La imagen no existe en el registry o falla la autenticación | ✓ Sí, el Pod nunca llega a Running |
| `Pending` indefinido | El nodo no tiene recursos suficientes para el Pod nuevo (CPU/RAM) | ✓ Sí, timeout |
| readinessProbe falla repetidamente | La app arranca pero no responde en el puerto (error de DB, configuración incorrecta) | ✓ Sí, timeout |
| Rollout exitoso pero lógica de negocio rota | Error silencioso sin crash | ✗ No — requiere intervención manual o smoke tests adicionales |

---

### 3.3 Implementación en el workflow CI/CD

El paso de verificación en `.github/workflows/cicd.yml` (Fase 3b, paso "Verificar rollout y revertir en caso de fallo"):

```yaml
- name: Verificar rollout y revertir en caso de fallo
  run: |
    APP_DEPS="auth-service localidades-service funciones-service reservas-service pagos-service api-gateway frontend"
    FAILED=""
    for dep in $APP_DEPS; do
      echo "Verificando rollout de $dep..."
      if ! kubectl rollout status deployment/$dep -n filmstars --timeout=120s; then
        echo "::error::$dep fallo en el rollout. Ejecutando kubectl rollout undo..."
        kubectl rollout undo deployment/$dep -n filmstars
        FAILED="$FAILED $dep"
      fi
    done
    if [ -n "$FAILED" ]; then
      echo "::error::FASE 3 FALLIDA — Rollback ejecutado para:$FAILED"
      exit 1
    fi
    echo "Todos los deployments estan saludables. Despliegue completado."
```

#### Comportamiento del script

1. **Iteración independiente por servicio**: si `reservas-service` falla, el script revierte ese servicio pero continúa verificando los demás. Al final, reporta todos los servicios fallidos como un único error para facilitar el diagnóstico.

2. **Acumulación de fallos** (`FAILED`): permite saber exactamente qué servicios requirieron rollback, sin detener prematuramente la verificación de otros.

3. **`exit 1` al final**: marca el job de GitHub Actions como fallido, lo que activa las notificaciones correspondientes y bloquea merges protegidos si hay branch protection rules configuradas.

4. **Rollback también es RollingUpdate**: `kubectl rollout undo` reutiliza la misma estrategia `maxSurge/maxUnavailable`, por lo que la restauración de la versión anterior también es zero-downtime.

#### Infraestructura (paso previo)

Antes de desplegar los microservicios, el pipeline también verifica la infraestructura con un timeout mayor (180s para las bases de datos), pero sin rollback automático, ya que PostgreSQL y RabbitMQ usan PersistentVolumeClaims y no tienen una versión anterior funcional a la que revertir de forma automática:

```yaml
- name: Esperar que la infraestructura este lista
  run: |
    INFRA_DEPS="rabbitmq postgres-auth postgres-localidades postgres-funciones postgres-reservas postgres-pagos"
    for dep in $INFRA_DEPS; do
      echo "Esperando deployment/$dep..."
      kubectl rollout status deployment/$dep -n filmstars --timeout=180s
    done
```

---

### 3.4 Casos de fallo detectados

#### Caso 1: CrashLoopBackOff por variable de entorno faltante

```
Escenario: el Secret filmstars-secrets no fue actualizado antes del deploy
           y JWT_SECRET está vacío.

Síntomas en el cluster:
  auth-service-v2-7d9f5  0/1  CrashLoopBackOff  3  45s

Línea de logs del Pod:
  [NestJS] Error: JWT_SECRET environment variable is required

Flujo de rollback:
  1. kubectl rollout status deployment/auth-service --timeout=120s → FALLA (timeout)
  2. Pipeline ejecuta: kubectl rollout undo deployment/auth-service -n filmstars
  3. Kubernetes crea auth-service-v1-xxx (ReplicaSet anterior)
  4. auth-service-v1 pasa readinessProbe → entra al Service
  5. auth-service-v2 es terminado
  6. Pipeline registra: FAILED="auth-service", exit 1
```

#### Caso 2: ImagePullBackOff por tag inexistente

```
Escenario: el pipeline de build falló silenciosamente para funciones-service
           y el tag del SHA corto no fue publicado en el registry.

Síntomas en el cluster:
  funciones-service-v2-4c2a  0/1  ImagePullBackOff  0  30s

Flujo de rollback:
  1. kubectl rollout status → FALLA (Pod nunca pasa a Running)
  2. kubectl rollout undo deployment/funciones-service -n filmstars
  3. ReplicaSet anterior usa la imagen del SHA anterior (disponible en registry)
  4. Pod v_anterior → Ready → Pipeline: exit 1
```

#### Caso 3: Rollout exitoso pero se necesita rollback manual

```
Escenario: la nueva versión de pagos-service procesa pagos pero con
           un bug que cobra el doble (error silencioso).

Detección: monitoring externo / alertas de negocio (fuera del pipeline)

Rollback manual:
  kubectl rollout undo deployment/pagos-service -n filmstars

  # O a una revisión específica:
  kubectl rollout history deployment/pagos-service -n filmstars
  kubectl rollout undo deployment/pagos-service -n filmstars --to-revision=<N>
```

---

## 4. Relación con las Probes de Salud

El comportamiento correcto de `RollingUpdate` y del rollback automático depende directamente de que las probes estén correctamente configuradas. Las tres probes cumplen roles distintos:

| Probe | ¿Cuándo actúa? | Efecto en RollingUpdate |
|---|---|---|
| `readinessProbe` | Antes de que el Pod entre en el Service | El Pod nuevo no recibe tráfico hasta pasar. El Pod viejo no es terminado hasta que el nuevo pase. **Crítica para zero-downtime.** |
| `livenessProbe` | Durante toda la vida del Pod | Si falla, reinicia el contenedor. En el contexto de un rollout, contribuye a detectar Pods en estado zombie que podrían pasar la readinessProbe inicial pero degradarse después. |
| `startupProbe` (no implementado) | Solo durante el arranque inicial | Permite tiempos de arranque lentos sin que liveness mate el proceso. Recomendado para servicios con migrations de DB largas. |


---

## 5. Tabla de Configuraciones por Servicio

| Deployment | replicas | maxSurge | maxUnavailable | Pods máx. durante rollout | Pods mín. Ready | readinessProbe tipo | initialDelay |
|---|---|---|---|---|---|---|---|
| `frontend` | 1 | 1 | 0 | 2 | 1 | `httpGet /` | 10s |
| `api-gateway` | 1 | 1 | 0 | 2 | 1 | `tcpSocket :3006` | 10s |
| `auth-service` | 1 | 1 | 0 | 2 | 1 | `tcpSocket :3001` | 15s |
| `localidades-service` | 1 | 1 | 0 | 2 | 1 | `tcpSocket :3002` | 15s |
| `funciones-service` | 1 | 1 | 0 | 2 | 1 | `tcpSocket :3003` | 15s |
| `reservas-service` | 1 | 1 | 0 | 2 | 1 | `tcpSocket :3004` | 15s |
| `pagos-service` | 1 | 1 | 0 | 2 | 1 | `tcpSocket :3005` | 15s |
| `postgres-*` | 1 | — | — | — | — | `exec pg_isready` | 10s |
| `rabbitmq` | 1 | — | — | — | — | `tcpSocket :5672` | 15s |

> Las bases de datos y RabbitMQ no tienen estrategia `RollingUpdate` explícita (usan el default de Kubernetes: `maxSurge: 25%, maxUnavailable: 25%`) ya que su actualización es gestionada manualmente con mayor precaución, dado que involucra volúmenes persistentes.
