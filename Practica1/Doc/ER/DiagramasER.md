# EXPLICACION DE DIAGRAMAS ENTIDAD RELACION


Para el diseño y modelado de la persistencia del sistema se decidió dividir la base de datos en cinco dominios funcionales independientes, siguiendo el enfoque de arquitectura orientada a servicios (SOA). Esta separación permite mantener desacoplamiento entre componentes, facilitar la escalabilidad del sistema y garantizar independencia entre los distintos módulos de negocio.

Los dominios definidos fueron los siguientes:

Manejo de usuarios
Manejo de funciones y cartelera
Manejo de reservas y asientos
Manejo de pagos
Manejo de notificaciones

Para la elaboración de los diagramas entidad-relación se utilizó la herramienta dbdiagram.io, permitiendo modelar de forma visual las entidades, relaciones y restricciones definidas para cada servicio.

Adicionalmente, con el objetivo de mantener trazabilidad y facilitar futuras modificaciones, dentro de la carpeta ER/ se incluyen tanto los diagramas exportados en formato PNG como los archivos fuente osea el código crudo utilizado para generar los diagramas, permitiendo replicar, modificar o regenerar los modelos de datos cuando sea necesario.

Cada uno de los siguientes apartados describe el propósito de las entidades utilizadas, las relaciones existentes entre ellas y la integración que poseen dentro de la arquitectura general del proyecto.


### 1. Usuarios

Para el manejo de usuarios se decidió implementar un servicio independiente encargado de gestionar la autenticación, administración de perfiles y control de sesiones dentro de la plataforma. Este servicio centraliza la identidad de los usuarios y permite que los demás servicios puedan consumir información relacionada mediante identificadores externos, evitando dependencias directas entre bases de datos.

Las tablas utilizadas para este módulo fueron:

* Roles
* Usuarios
* Perfiles/Sesiones


#### Tabla Roles

La tabla **roles** almacena los tipos de usuario disponibles dentro de la plataforma. Su propósito principal es permitir la clasificación de permisos y diferenciar las acciones disponibles para cada tipo de usuario.

Ejemplos de roles:

* Administrador
* Cliente

Relación:

```text
Roles (1) -------- (N) Usuarios
```

---

#### Tabla Usuarios

La tabla **usuarios** representa la entidad principal del servicio y almacena la información necesaria para identificar y autenticar a los usuarios registrados dentro de la plataforma.

Responsabilidades:

* Registrar usuarios dentro del sistema
* Gestionar credenciales de acceso
* Asociar usuarios con roles específicos
* Proporcionar identificadores únicos utilizados por otros servicios

Esta tabla actúa como punto central para la autenticación y autorización.

Relación:

```text
Usuarios (N) -------- (1) Roles
```

---

#### Tabla Perfiles

La tabla **perfiles** permite soportar la funcionalidad multiperfil dentro de una misma cuenta de usuario. Esto permite que un usuario pueda manejar múltiples configuraciones o perfiles independientes.

Responsabilidades:

* Manejar múltiples perfiles asociados a una cuenta
* Personalizar experiencia de usuario
* Asociar configuraciones independientes por perfil

Relación:

```text
Usuarios (1) -------- (N) Perfiles
```

---

#### Tabla Sesiones

La tabla **sesiones** almacena información relacionada con las sesiones activas de los usuarios.

Responsabilidades:

* Controlar sesiones activas
* Gestionar expiración de tokens
* Mantener persistencia temporal de autenticación

Relación:

```text
Usuarios (1) -------- (N) Sesiones
```

---

#### Integración con otros servicios

Este servicio se integra con el resto de la arquitectura mediante el uso de identificadores externos (`usuario_id`), evitando dependencias directas entre bases de datos.

Los servicios consumidores son:

* Servicio de Reservas
* Servicio de Pagos
* Servicio de Notificaciones

Esta estrategia mantiene el desacoplamiento requerido en una arquitectura orientada a servicios.



![alt text](01-ER_USUARIOS.png)

### 2. Manejo de Funciones y Cartelera

El servicio de funciones y cartelera es responsable de administrar toda la información relacionada con películas, horarios, cines y disponibilidad de funciones dentro de la plataforma. Este servicio permite que los usuarios puedan consultar películas disponibles según ubicación, cine y horario.

Las tablas utilizadas para este módulo fueron:

* Ciudades
* Cines
* Salas
* Categorías
* Películas
* Funciones


#### Tabla Ciudades

La tabla **ciudades** almacena las ubicaciones geográficas soportadas por la plataforma.

Responsabilidades:

* Gestionar ciudades disponibles
* Filtrar cines por ubicación
* Organizar cartelera regional

Relación:

```text id="lffhsq"
Ciudades (1) -------- (N) Cines
```

---

#### Tabla Cines

La tabla **cines** representa cada complejo cinematográfico disponible dentro del sistema.

Responsabilidades:

* Registrar cines disponibles
* Asociar cines a ciudades
* Administrar salas disponibles por sede

Relación:

```text id="jlwm0v"
Ciudades (1) -------- (N) Cines

Cines (1) -------- (N) Salas
```

---

#### Tabla Salas

La tabla **salas** almacena las salas disponibles dentro de cada cine.

Responsabilidades:

* Definir capacidad de salas
* Asociar funciones a espacios físicos
* Gestionar disponibilidad por sala

Relación:

```text id="uxx65w"
Salas (1) -------- (N) Funciones
```

---

#### Tabla Categorías

La tabla **categorías** clasifica las películas según su estado o tipo de proyección.

Ejemplos:

* Estreno
* Preventa
* Reestreno

Responsabilidades:

* Organizar contenido
* Facilitar filtrado de cartelera
* Mejorar búsquedas

Relación:

```text id="ye9fwv"
Categorias (1) -------- (N) Peliculas
```

---

#### Tabla Películas

La tabla **películas** almacena la información principal relacionada con el contenido cinematográfico.

Responsabilidades:

* Gestionar catálogo de películas
* Asociar categorías
* Mantener información descriptiva

Relación:

```text id="a7fgwy"
Peliculas (1) -------- (N) Funciones
```

---

#### Tabla Funciones

La tabla **funciones** representa cada horario disponible para una película específica.

Responsabilidades:

* Gestionar horarios
* Asociar películas con salas
* Proporcionar disponibilidad para reservas

Esta tabla funciona como punto de integración con otros servicios.

Relación:

```text id="wd8o9r"
Peliculas (1) -------- (N) Funciones

Salas (1) -------- (N) Funciones
```

---

#### Integración con otros servicios

Este servicio comparte información mediante identificadores externos.

Expone:

```text id="gqj9n2"
id_funcion
id_pelicula
id_sala
```

Consumido por:

* Servicio de Reservas
* Servicio de Notificaciones

Flujo principal:

```text id="y2wg5u"
Usuario
↓
Selecciona ciudad
↓
Selecciona cine
↓
Selecciona película
↓
Selecciona función
↓
Servicio de Reservas consume id_funcion
```

La separación de este módulo permite mantener independencia entre la lógica de cartelera y los procesos críticos de reserva y pago.

![alt text](02-ER_FUNCIONES.png)


### 3. Manejo de Reservas y Asientos

El servicio de reservas y asientos es responsable de administrar la disponibilidad de asientos, gestionar reservas temporales y confirmar compras realizadas por los usuarios. Este módulo representa uno de los componentes críticos del sistema debido a que debe soportar escenarios concurrentes donde múltiples usuarios intentan seleccionar los mismos asientos simultáneamente.

Las tablas utilizadas para este módulo fueron:

* Asientos
* Estado Reserva
* Reservas
* Reserva Detalle
* Boletos

![alt text](03-ER_RESERVAS.png)

#### Tabla Asientos

La tabla **asientos** almacena los asientos disponibles asociados a una función específica.

Responsabilidades:

* Representar asientos disponibles
* Asociar asientos a funciones
* Controlar disponibilidad por función

Cada asiento se encuentra vinculado mediante un identificador externo correspondiente a la función.

Relación:

```text id="ycjlyc"
Asientos (1) -------- (N) ReservaDetalle
```

---

#### Tabla Estado Reserva

La tabla **estado_reserva** administra el ciclo de vida de las reservas.

Estados implementados:

* Temporal
* Confirmada
* Expirada
* Cancelada

Responsabilidades:

* Controlar estados de reserva
* Gestionar expiraciones automáticas
* Facilitar validaciones de negocio

Relación:

```text id="9fj9z8"
EstadoReserva (1) -------- (N) Reservas
```

---

#### Tabla Reservas

La tabla **reservas** representa la entidad principal del servicio y almacena la información general de una reserva realizada por un usuario.

Responsabilidades:

* Registrar reservas realizadas
* Asociar usuarios externos
* Controlar tiempos de expiración
* Gestionar estados

La reserva utiliza un identificador externo del usuario para mantener independencia entre servicios.

Relación:

```text id="7t8qri"
Reservas (1) -------- (N) ReservaDetalle

Reservas (1) -------- (1) Boletos
```

---

#### Tabla Reserva Detalle

La tabla **reserva_detalle** funciona como una tabla intermedia que permite asociar múltiples asientos a una reserva.

Responsabilidades:

* Relacionar asientos reservados
* Soportar múltiples boletos por compra
* Mantener trazabilidad de selección

Relación:

```text id="l4g9km"
Reservas (1) -------- (N) ReservaDetalle

Asientos (1) -------- (N) ReservaDetalle
```

---

#### Tabla Boletos

La tabla **boletos** almacena la evidencia final generada después de completar exitosamente el proceso de compra.

Responsabilidades:

* Generar comprobantes de compra
* Asociar códigos QR
* Mantener evidencia de acceso

Relación:

```text id="7h6m1q"
Reservas (1) -------- (1) Boletos
```

---

#### Integración con otros servicios

Este servicio interactúa directamente con múltiples módulos del sistema.

Consume información desde:

```text id="f2k4cg"
Movie Service:
- id_funcion

User Service:
- usuario_id
```

Comparte información hacia:

```text id="0pqjql"
Payment Service:
- reserva_id

Notification Service:
- estado_reserva
- boleto_generado
```

---

#### Comunicación Asíncrona

Debido a los problemas de concurrencia, este servicio utiliza mensajería asíncrona para procesar operaciones críticas.

Eventos generados:

```text id="yyzvww"
seat_reserved

reservation_confirmed

reservation_expired
```

Eventos consumidos:

```text id="2xzzv4"
payment_completed

payment_failed
```

---

#### Flujo principal del servicio

```text id="1zj6ju"
Usuario selecciona función
↓
Usuario selecciona asientos
↓
Reserva temporal creada
↓
Evento enviado a cola
↓
Pago procesado
↓
Reserva confirmada
↓
Boleto generado
```

La separación de este servicio permite manejar procesos concurrentes de forma independiente, reduciendo conflictos y manteniendo desacoplada la lógica crítica de negocio.

![alt text](03-ER_RESERVAS.png)

### 4. Manejo de Pagos

El servicio de pagos es responsable de procesar las transacciones financieras asociadas a las reservas realizadas por los usuarios. Su principal objetivo es validar pagos, registrar transacciones y comunicar el resultado del proceso hacia otros servicios del ecosistema.

Las tablas utilizadas para este módulo fueron:

* Métodos de Pago
* Pagos
* Transacciones

![alt text](04-ER_PAGOS.png)

#### Tabla Métodos de Pago

La tabla **metodos_pago** almacena los tipos de pago disponibles dentro de la plataforma.

Ejemplos:

* Tarjeta de crédito
* Tarjeta de débito
* Transferencia

Responsabilidades:

* Definir métodos disponibles
* Facilitar validaciones de pago
* Asociar pagos con un método específico

Relación:

```text id="n61n0z"
MetodosPago (1) -------- (N) Pagos
```

---

#### Tabla Pagos

La tabla **pagos** representa la entidad principal del servicio y almacena la información relacionada con el proceso financiero asociado a una reserva.

Responsabilidades:

* Registrar pagos realizados
* Asociar pagos a reservas externas
* Gestionar estados de pago
* Mantener historial financiero

Estados posibles:

* Pendiente
* Aprobado
* Rechazado

La tabla utiliza identificadores externos provenientes del servicio de reservas.

Relación:

```text id="ddg4av"
Pagos (1) -------- (1) Transacciones
```

---

#### Tabla Transacciones

La tabla **transacciones** almacena la evidencia técnica del proceso financiero.

Responsabilidades:

* Guardar referencias de transacción
* Mantener auditoría financiera
* Registrar autorizaciones generadas

Relación:

```text id="c11jcm"
Pagos (1) -------- (1) Transacciones
```

---

#### Integración con otros servicios

Este servicio consume y genera información hacia otros módulos del sistema.

Consume:

```text id="ok1q1x"
Reservation Service:

- reserva_id
- monto_total
```

Comparte:

```text id="jz1p5q"
Reservation Service:

- estado_pago

Notification Service:

- pago_confirmado
```

---

#### Comunicación Asíncrona

Las operaciones financieras se procesan mediante colas de mensajería para evitar bloqueos en el flujo principal.

Eventos consumidos:

```text id="lzjlwm"
reservation_confirmed
payment_requested
```

Eventos generados:

```text id="azjexm"
payment_completed
payment_failed
```

---

#### Flujo principal del servicio

```text id="ifc0fq"
Reserva confirmada
↓
Solicitud enviada a cola
↓
Pago procesado
↓
Transacción registrada
↓
Resultado enviado
↓
Actualización de reserva
```

La separación de este servicio permite mantener independencia entre la lógica financiera y los demás componentes, facilitando la escalabilidad y reduciendo el acoplamiento entre dominios.

![alt text](04-ER_PAGOS.png)

### 5. Manejo de Notificaciones

El servicio de notificaciones es responsable de administrar y enviar comunicaciones automáticas relacionadas con eventos importantes dentro de la plataforma. Este módulo opera de manera desacoplada consumiendo eventos generados por otros servicios y generando mensajes dirigidos hacia los usuarios.

Las tablas utilizadas para este módulo fueron:

* Plantillas
* Notificaciones

![alt text](05-ER_NOTIFICACIONES.png)

#### Tabla Plantillas

La tabla **plantillas** almacena estructuras reutilizables para la generación de mensajes enviados a los usuarios.

Responsabilidades:

* Estandarizar mensajes enviados
* Facilitar reutilización de contenido
* Reducir duplicación de información

Ejemplos de plantillas:

* Compra Exitosa
* Reserva Expirada
* Pago Confirmado
* Boleto Generado

Relación:

```text id="f1t0ij"
Plantillas (1) -------- (N) Notificaciones
```

---

#### Tabla Notificaciones

La tabla **notificaciones** representa cada mensaje generado y enviado por el sistema.

Responsabilidades:

* Registrar envíos realizados
* Mantener historial de notificaciones
* Controlar estado de envío
* Asociar mensajes con usuarios externos

Estados posibles:

* Pendiente
* Enviada
* Error

Cada registro utiliza identificadores externos para mantener independencia respecto a otros servicios.

Relación:

```text id="xyrj4t"
Plantillas (1) -------- (N) Notificaciones
```

---

#### Integración con otros servicios

Este servicio consume información generada por otros módulos del sistema.

Consume eventos provenientes de:

```text id="wukv90"
Reservation Service

- reserva_confirmada
- reserva_expirada
- boleto_generado

Payment Service

- pago_aprobado
- pago_rechazado

User Service

- usuario_id
- correo_usuario
```

No expone relaciones directas hacia otras bases de datos y únicamente utiliza identificadores externos.

---

#### Comunicación Asíncrona

Este servicio trabaja completamente mediante eventos asíncronos, evitando bloquear procesos críticos del sistema.

Eventos consumidos:

```text id="c19i9t"
payment_completed

payment_failed

reservation_confirmed

reservation_expired

ticket_generated
```

Eventos generados:

```text id="wg6k3m"
notification_sent

notification_failed
```

---

#### Flujo principal del servicio

```text id="pry6mz"
Evento recibido
↓
Validación de plantilla
↓
Construcción del mensaje
↓
Envío de correo/notificación
↓
Registro del resultado
```

La separación de este servicio permite centralizar toda la lógica relacionada con comunicación hacia usuarios, reduciendo acoplamiento y permitiendo escalar el sistema de notificaciones independientemente del resto de módulos.

![alt text](05-ER_NOTIFICACIONES.png)