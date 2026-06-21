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

## Justificación de cobertura: por qué estas pruebas y no otras

Las pruebas unitarias cubren exclusivamente la **capa de servicios** (lógica de negocio) y los **controladores** en los casos donde su lógica no es trivial. Se eligieron estas capas porque son donde reside el comportamiento observable del sistema: validaciones de negocio, manejo de errores, orquestación de dependencias y transformación de datos.

### ¿Por qué solo servicios y controladores?

- **Entidades / DTOs**: Son estructuras de datos sin lógica; probarlas no aporta valor.
- **Módulos de NestJS** (`.module.ts`): Solo registran proveedores; no contienen lógica ejecutable.
- **Estrategias de autenticación** (`JwtStrategy`, `LocalStrategy`): Delegan completamente en Passport; la lógica real está en `AuthService`, que sí se prueba.
- **Controladores con delegación pura** (como `AuthController`): Se prueban para confirmar que la firma del endpoint delega correctamente al servicio, sin lógica adicional que podría quedar oculta.

### ¿Por qué estas pruebas específicas y no otras?

Cada caso de prueba fue seleccionado para cubrir **al menos un camino de código diferente** (branch coverage). La regla aplicada fue: si hay un `if`, un `throw`, o una bifurcación por resultado de base de datos, se escribe un test por cada rama posible. Esto explica por qué cada método tiene invariablemente un test del camino feliz y uno o más tests de camino de error.

#### auth-service

| Archivo | Qué cubre | Por qué estas pruebas |
|---|---|---|
| `auth.controller.spec.ts` | `register`, `login`, `health`, `profile` | Verifica que el controlador delega sin transformar la respuesta; detectaría si alguien agrega lógica accidental en el controlador |
| `auth.service.spec.ts` | `register` (correo nuevo / correo duplicado), `login` (credenciales válidas / usuario inexistente / contraseña incorrecta), `validateUser` (válido / sin usuario / contraseña mala), `getJwtConfig` | Cada rama del `if` o del `findByEmail` que puede devolver `null` o un usuario genera un test separado; `bcrypt.hash` y `bcrypt.compare` se mockean para no depender de operaciones criptográficas reales |
| `users.service.spec.ts` | `create` (rol existente / rol nuevo / rol del DTO), `findByEmail` (existe / no existe), `findById` (existe / no existe) | El método `create` tiene tres ramas según si el rol ya existe o no; `findById` lanza `NotFoundException` solo en el camino null, por eso hay dos tests |

#### funciones-service

| Archivo | Qué cubre | Por qué estas pruebas |
|---|---|---|
| `peliculas.service.spec.ts` | CRUD completo de películas + validación de título duplicado + integridad referencial con categoría y tipo de cartelera + bloqueo de eliminación con funciones activas | `remove` tiene dos ramas: sin funciones activas (se elimina) y con funciones activas (lanza `BadRequestException`); `create` y `update` verifican que los campos de texto se reciben con `trim()` antes de guardarse |
| `categorias.service.spec.ts` | `findAll`, `findOne` (existe / no existe), `create` (nueva / duplicada) | Servicio simple de catálogo: solo se testean las dos ramas de `findOne` y las dos de `create` porque son los únicos puntos de fallo posibles |
| `tipo-cartelera.service.spec.ts` | Idéntico a categorías, misma estructura | Ambos son catálogos con la misma lógica; se testean igual para mantener cobertura simétrica |
| `salas.service.spec.ts` | `findAll`, `findOne`, `create`, `update`, `remove` | La sala en el contexto de funciones-service es más simple que en localidades-service (no tiene ciudad); el test de `update` verifica la actualización parcial de campos |
| `funciones.service.spec.ts` | `findAll`, `findBySala`, `findByPelicula`, `findByCine`, `findOne`, `create` (sin conflicto / sala ya ocupada), `remove` (sin boletos / con boletos / no existe), `update` (campos simples / cambia película y sala / sin conflicto de horario / con conflicto) | `remove` consulta al reservas-service via `fetch` para verificar boletos; se mockea `global.fetch` para cubrir ambas respuestas sin depender de red. `update` tiene cuatro tests porque combina múltiples ramas independientes (campos opcionales + verificación de conflicto de horario) |

#### localidades-service

| Archivo | Qué cubre | Por qué estas pruebas |
|---|---|---|
| `localidades.service.spec.ts` | CRUD de ciudades y cines; relación ciudad → cine; paginación y filtros | Las salas pertenecen a `funciones-service`; localidades valida únicamente la jerarquía de ciudades y cines. |

#### pagos-service

| Archivo | Qué cubre | Por qué estas pruebas |
|---|---|---|
| `pagos.service.spec.ts` | CRUD de métodos y estados, creación de pago con estado por defecto / estado específico / método inexistente / estado inexistente, `changeEstado`, `processPaymentRequest` para TARJETA (válida / terminada en 0000 / datos incompletos) y PAYPAL (con email / sin email / email con "fail") | `processPaymentRequest` es el método más complejo del sistema: contiene lógica de simulación de pagos con múltiples bifurcaciones. Cada test cubre una condición diferente del simulador. Sin estos tests, cambios en las reglas de validación de tarjetas o PayPal pasarían desapercibidos |

#### reservas-service

| Archivo | Qué cubre | Por qué estas pruebas |
|---|---|---|
| `reservas.service.spec.ts` | `findReservaById`, `findBoletoById`, `hasBoletosByFuncion` (existe / no existe), `createAsiento` (nuevo / duplicado), `createEstado` (nuevo / duplicado), `createReserva` (válida / asiento no existe / asiento ya reservado), `confirmReserva` (genera boleto / boleto ya existe), `rejectReserva` (con detalles / sin detalles), `findAsientosByFuncion` (libre / propio / de otro usuario), `createCheckout`, `findOrCreateEstado` | Este servicio orquesta asientos, estados y comunicación con RabbitMQ. Las pruebas de `createReserva` cubren las tres ramas del proceso de reserva: asientos válidos, asientos inexistentes y asientos ya ocupados. `findAsientosByFuncion` tiene tres casos porque cada uno prueba un valor distinto del par `{ocupado, propio}` |

---

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
