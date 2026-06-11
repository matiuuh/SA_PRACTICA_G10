# CI/CD — Integración y Entrega Continua

## Justificacion de herramientas

---

### GitHub Actions

**¿Qué?** GitHub Actions es la plataforma de automatización de flujos de trabajo integrada directamente en GitHub, utilizada como motor principal del pipeline CI/CD del proyecto.

**¿Por qué?** Porque al estar integrada en el mismo repositorio no requiere servidores externos ni configuración adicional de credenciales para acceder al código. Ofrece runners gratuitos con Ubuntu, soporte para matrices de ejecución paralela y un ecosistema amplio de acciones reutilizables.

**¿Para qué?** Para automatizar la validación, construcción y despliegue del sistema en cada cambio de código, garantizando que ningún commit defectuoso llegue a producción sin pasar por todas las etapas de verificación.

---

### pnpm/action-setup

**¿Qué?** Es una acción oficial de pnpm para GitHub Actions que instala y configura el gestor de paquetes pnpm en el runner.

**¿Por qué?** Porque el proyecto utiliza pnpm como gestor de dependencias en todos los servicios y el frontend, y los runners de GitHub Actions no lo incluyen por defecto.

**¿Para qué?** Para que todos los pasos de instalación de dependencias (`pnpm install`) y ejecución de scripts (`pnpm build`, `pnpm test:cov`) funcionen correctamente en el entorno de CI/CD.

---

### actions/setup-node

**¿Qué?** Es la acción oficial de GitHub para instalar y configurar una versión específica de Node.js en el runner.

**¿Por qué?** Porque el proyecto requiere Node.js 22 y los runners de GitHub Actions pueden tener versiones distintas preinstaladas. Esta acción garantiza que siempre se use la versión correcta.

**¿Para qué?** Para asegurar que la compilación y ejecución de los servicios NestJS y el frontend React sea consistente entre el entorno local y el entorno de CI/CD.

---

### actions/upload-artifact

**¿Qué?** Es una acción oficial de GitHub que permite guardar archivos generados durante un job (como el build del frontend o los reportes de cobertura) para consultarlos después.

**¿Por qué?** Porque los jobs de GitHub Actions son efímeros; una vez que terminan, sus archivos se pierden. Esta acción persiste los artefactos importantes durante un periodo configurable.

**¿Para qué?** Para conservar el build compilado del frontend (`dist/`) y los reportes de cobertura de cada servicio por 14 días, permitiendo auditarlos sin necesidad de volver a ejecutar el pipeline.

---

### appleboy/ssh-action

**¿Qué?** Es una acción de la comunidad que permite ejecutar comandos en un servidor remoto vía SSH desde GitHub Actions.

**¿Por qué?** Porque el despliegue en producción se realiza sobre una instancia EC2 en AWS, y esta acción permite conectarse de forma segura usando una llave privada almacenada como secreto del repositorio.

**¿Para qué?** Para automatizar el despliegue final: hacer `git pull`, reconstruir los contenedores con `docker compose up -d --build` y limpiar imágenes antiguas, todo de forma automática al hacer push a `main`.

---

## Flujo del pipeline

El pipeline se activa en dos eventos:

- **push** a las ramas `main` o `develop`
- **pull request** hacia `main` o `develop`

```
check-branch
     │
     ├──── build-frontend ────────────────────────────────┐
     │                                                     │
     ├──── build-services (5 servicios en paralelo) ──┐   │
     │            │                                   │   │
     │            └──── test-services (5 en paralelo) ┤   │
     │                                                 │   │
     └──── build-gateway ─────────────────────────────┘   │
                                                           │
                           deploy (solo push a main) ◄─────┘
```

### Descripcion de cada job

| Job | Depende de | Descripcion |
| --- | --- | --- |
| `check-branch` | — | Valida que solo la rama `release` pueda hacer merge a `main` |
| `build-frontend` | `check-branch` | Instala dependencias, corre lint y compila el frontend con Vite |
| `build-services` | `check-branch` | Compila TypeScript de cada microservicio (matriz de 5 servicios) |
| `test-services` | `build-services` | Ejecuta `pnpm test:cov` en cada servicio y sube el reporte de cobertura |
| `build-gateway` | `check-branch` | Compila el API Gateway |
| `deploy` | todos los anteriores | Despliega en EC2 via SSH (solo en push a `main`) |

### Regla de ramas

El job `check-branch` bloquea cualquier pull request hacia `main` que no venga de la rama `release`. Esto garantiza el flujo:

```
feature/* → develop → release → main
```

---

## Secretos requeridos en GitHub

Para que el job de deploy funcione, deben estar configurados los siguientes secretos en **Settings > Secrets and variables > Actions** del repositorio:

| Secreto | Descripcion |
| --- | --- |
| `EC2_HOST` | IP publica o dominio de la instancia EC2 |
| `EC2_USER` | Usuario SSH del servidor (ej. `ubuntu` o `ec2-user`) |
| `EC2_SSH_KEY` | Llave privada SSH para autenticarse en EC2 |
| `DEPLOY_PATH` | Ruta absoluta del repositorio en el servidor EC2 |

---

[Volver a Documentación](../Documentación.md)
