# Pruebas Unitarias

## Justificacion de herramientas

---

### Jest

**¿Qué?** Jest es el framework de pruebas unitarias utilizado en todos los microservicios del proyecto.

**¿Por qué?** Porque es el estándar de facto en el ecosistema JavaScript/TypeScript, cuenta con soporte nativo para mocks, spies y aserciones, y se integra directamente con NestJS sin configuración adicional compleja. Además, su salida en consola es clara y legible, lo que facilita identificar fallos rápidamente.

**¿Para qué?** Para ejecutar pruebas aisladas de cada unidad de lógica (servicios, controladores) sin necesidad de levantar la base de datos ni el servidor, garantizando que cada pieza del sistema se comporte correctamente de forma independiente.

---

### ts-jest

**¿Qué?** ts-jest es un preprocesador que permite a Jest ejecutar archivos TypeScript directamente, sin necesidad de compilarlos a JavaScript primero.

**¿Por qué?** Porque el proyecto está escrito completamente en TypeScript y Jest por defecto solo entiende JavaScript. ts-jest actúa como puente entre ambos, interpretando el código TypeScript en tiempo de prueba.

**¿Para qué?** Para poder escribir los archivos `.spec.ts` en TypeScript nativo, manteniendo la consistencia del lenguaje en todo el proyecto y aprovechando el tipado estático incluso dentro de las pruebas.

---

### @nestjs/testing

**¿Qué?** Es el módulo oficial de NestJS para facilitar la escritura de pruebas unitarias e de integración dentro del framework.

**¿Por qué?** Porque proporciona utilidades como `TestingModule` que permiten instanciar partes del sistema NestJS de forma controlada, inyectando dependencias mockeadas sin necesidad de levantar el módulo completo.

**¿Para qué?** Para probar servicios y controladores de NestJS en aislamiento, sustituyendo dependencias reales (como repositorios de base de datos) por mocks, y así validar la lógica de negocio sin efectos secundarios externos.

---

### @types/jest

**¿Qué?** Son las definiciones de tipos TypeScript para Jest, que incluyen los tipos de funciones como `jest.fn()`, `jest.Mock`, `jest.Mocked<T>`, entre otras.

**¿Por qué?** Porque sin estas definiciones, TypeScript no reconoce las funciones y utilidades de Jest, lo que genera errores de compilación al escribir pruebas tipadas.

**¿Para qué?** Para que el editor y el compilador de TypeScript comprendan la API de Jest, ofreciendo autocompletado, validación de tipos y detección de errores en los archivos de prueba.

---

## Instrucciones para correr las pruebas en local

### Prerequisitos

- Node.js 22 o superior
- pnpm instalado globalmente (`npm install -g pnpm`)

### Instalar dependencias de un servicio

Antes de correr las pruebas por primera vez (o si se borraron los `node_modules`), instalar dependencias con:

```bash
CI=true pnpm --dir Backend/services/<nombre-del-servicio> install --no-frozen-lockfile
```

> En caso de que el comando anterior falle por falta de TTY en entorno local, usar:
> ```bash
> echo | pnpm --dir Backend/services/<nombre-del-servicio> install --no-frozen-lockfile
> ```

### Correr pruebas de un solo servicio

Desde la raiz del proyecto:

```bash
pnpm --dir Backend/services/<nombre-del-servicio> test
```

Con reporte de cobertura:

```bash
pnpm --dir Backend/services/<nombre-del-servicio> test:cov
```

Los servicios disponibles son:

| Servicio            | Ruta                                    |
| ------------------- | --------------------------------------- |
| auth-service        | `Backend/services/auth-service`        |
| funciones-service   | `Backend/services/funciones-service`   |
| localidades-service | `Backend/services/localidades-service` |
| pagos-service       | `Backend/services/pagos-service`       |
| reservas-service    | `Backend/services/reservas-service`    |

### Correr pruebas de todos los servicios a la vez

Ejecutar el siguiente script desde la raiz del proyecto:

```bash
for service in auth-service funciones-service localidades-service pagos-service reservas-service; do
  echo "=== $service ==="
  pnpm --dir Backend/services/$service test
done
```

### Umbrales de cobertura requeridos

Todos los servicios tienen configurado un umbral minimo del **75%** en las siguientes metricas. Si no se alcanza, las pruebas fallan:

| Metrica     | Minimo |
| ----------- | ------ |
| Branches    | 75%    |
| Functions   | 75%    |
| Lines       | 75%    |
| Statements  | 75%    |

### Resumen de pruebas por servicio

| Servicio            | Tests | Archivos de prueba |
| ------------------- | ----- | ------------------ |
| auth-service        | 20    | [auth.controller.spec.ts](../../Backend/services/auth-service/src/auth/auth.controller.spec.ts) · [auth.service.spec.ts](../../Backend/services/auth-service/src/auth/auth.service.spec.ts) · [users.service.spec.ts](../../Backend/services/auth-service/src/users/users.service.spec.ts) |
| funciones-service   | 41    | [peliculas.service.spec.ts](../../Backend/services/funciones-service/src/funciones/services/peliculas.service.spec.ts) · [categorias.service.spec.ts](../../Backend/services/funciones-service/src/funciones/services/categorias.service.spec.ts) · [tipo-cartelera.service.spec.ts](../../Backend/services/funciones-service/src/funciones/services/tipo-cartelera.service.spec.ts) · [funciones.service.spec.ts](../../Backend/services/funciones-service/src/funciones/services/funciones.service.spec.ts) · [salas.service.spec.ts](../../Backend/services/funciones-service/src/funciones/services/salas.service.spec.ts) |
| localidades-service | 30    | [localidades.service.spec.ts](../../Backend/services/localidades-service/src/localidades/localidades.service.spec.ts) |
| pagos-service       | 20    | [pagos.service.spec.ts](../../Backend/services/pagos-service/src/pagos/pagos.service.spec.ts) |
| reservas-service    | 15    | [reservas.service.spec.ts](../../Backend/services/reservas-service/src/reservas/reservas.service.spec.ts) |
| **Total**           | **126** | |

---

[Volver a Documentación](../Documentación.md)
