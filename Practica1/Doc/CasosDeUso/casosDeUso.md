# Casos de Uso

## Core del negocio
![coreDelNegocio](./img/coreDelNegocio.png)

## Casos de uso de alto nivel
![Caso de Uso de Alto Nivel](./img/CasoDeUsoAltoNivel.png)

## Primera descomposición
**CDU001**: **Registro e inicio de sesión**: Es el punto de partido para que cualquier usuario pueda interactuar con el sistema. Permite a los usuarios crear una cuenta y autenticarse para acceder a las funcionalidades del sistema.

**CDU002**: **Gestión de información personal**: Permite a los usuarios actualizar su información personal, como nombre, correo electrónico y contraseña. De la misma manera, permite a los usuarios gestionar su perfil.

**CDU003**: **Gestión de películas y cartelera**: Permite al administrador gestionar las películas del sistema y mostrarlas en cartelera según su tipo de proyección.

**CDU004**: **Gestión de funciones**: Permite al administrador gestionar las funciones de las películas, incluyendo la asignación de horarios y salas.

**CDU005**: **Compra de boletos**: Permite a los usuarios comprar boletos, así como seleccionar los asientos que deseen comprar para dicha función para asistir a las funciones de las películas.

![Primera Descomposicion](./img/primeraDescomposicion.png)

# Casos de uso expandidos
## Registro e inicio de sesión
### CU-01: Registrar Cliente

| Campo | Descripción |
|-------|-------------|
| **ID** | CU-01 |
| **Nombre** | Registrar Cliente |
| **Actor** | Usuario |
| **Descripción** | Permite a un nuevo usuario crear una cuenta en la plataforma proporcionando sus datos personales para acceder a las funcionalidades del sistema. |
| **Precondiciones** | El usuario no está registrado en el sistema. |
| **Postcondiciones** | El usuario queda registrado en el sistema y puede iniciar sesión. |

**Flujo principal:**
| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario | Accede a la página de registro. |
| 2 | Usuario | Ingresa su nombre, correo electrónico y contraseña. |
| 3 | Usuario | Confirma la contraseña y envía el formulario. |
| 4 | Sistema | Valida que todos los campos estén completos y con formato correcto. |
| 5 | Sistema | Verifica que el correo electrónico no esté registrado previamente. |
| 6 | Sistema | Almacena el nuevo usuario con la contraseña cifrada. |
| 7 | Sistema | Muestra un mensaje de registro exitoso y redirige al inicio de sesión. |

**Flujos alternativos:**
| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El usuario ya tiene una cuenta | En el paso 5, el sistema notifica que el correo ya está en uso y sugiere iniciar sesión. |
| FA-02 | El usuario cancela el registro | En cualquier paso, el usuario puede cancelar y el sistema descarta los datos ingresados. |

**Flujos de excepción:**
| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Formato de correo inválido | En el paso 4, el sistema muestra un mensaje de error indicando el formato correcto y solicita corrección. |
| FE-02 | Contraseñas no coinciden | En el paso 4, el sistema muestra un mensaje de error y limpia los campos de contraseña. |
| FE-03 | Error de conexión con la base de datos | En el paso 6, el sistema muestra un mensaje de error genérico y solicita reintentar. |

---

### CU-02: Iniciar Sesión

| Campo | Descripción |
|-------|-------------|
| **ID** | CU-03 |
| **Nombre** | Iniciar Sesión |
| **Actor** | Usuario |
| **Descripción** | Permite a un usuario registrado autenticarse en la plataforma mediante su correo electrónico y contraseña para acceder a las funcionalidades del sistema. |
| **Precondiciones** | El usuario tiene una cuenta registrada y no tiene una sesión activa. |
| **Postcondiciones** | El sistema genera un token de sesión válido y el usuario accede a la plataforma. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario | Accede a la página de inicio de sesión. |
| 2 | Usuario | Ingresa su correo electrónico y contraseña. |
| 3 | Usuario | Envía el formulario. |
| 4 | Sistema | Valida que los campos no estén vacíos y tengan formato correcto. |
| 5 | Sistema | Verifica que el correo esté registrado y que la contraseña coincida con el hash almacenado. |
| 6 | Sistema | Genera un token JWT y lo asocia a la sesión del usuario. |
| 7 | Sistema | Redirige al usuario a la página principal de la plataforma. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El usuario no tiene cuenta | En el paso 5, el sistema informa que el correo no está registrado y sugiere crear una cuenta. |
| FA-02 | El usuario cancela | En cualquier paso, el usuario puede cancelar y el sistema descarta los datos ingresados. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Contraseña incorrecta | En el paso 5, el sistema muestra un mensaje de credenciales inválidas sin especificar cuál campo es incorrecto. |
| FE-02 | Formato de correo inválido | En el paso 4, el sistema muestra un error de formato y solicita corrección antes de continuar. |
| FE-03 | Error de conexión con la base de datos | En el paso 5, el sistema muestra un mensaje de error genérico y solicita reintentar. |

---

![CDU001](./img/CDU001.png)

## Gestión de información personal

### CU-03: Actualizar Datos Personales

| Campo | Descripción |
|-------|-------------|
| **ID** | CU-03 |
| **Nombre** | Actualizar Datos Personales |
| **Actor** | Cliente, Administrador |
| **Descripción** | Permite al usuario modificar su nombre y correo electrónico registrados en la plataforma. |
| **Precondiciones** | El usuario tiene una sesión activa. |
| **Postcondiciones** | Los datos personales del usuario quedan actualizados en el sistema. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario | Accede a la sección de perfil desde el menú de usuario. |
| 2 | Usuario | Selecciona la opción de editar datos personales. |
| 3 | Usuario | Modifica los campos deseados y envía el formulario. |
| 4 | Sistema | Valida que los campos no estén vacíos y tengan formato correcto. |
| 5 | Sistema | Verifica que el nuevo correo electrónico no esté en uso por otra cuenta. |
| 6 | Sistema | Actualiza los datos del usuario en la base de datos. |
| 7 | Sistema | Muestra un mensaje de confirmación de actualización exitosa. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El usuario no modifica ningún campo | En el paso 3, el sistema no realiza ninguna operación y mantiene los datos actuales. |
| FA-02 | El usuario cancela | En cualquier paso, el usuario puede cancelar y el sistema descarta los cambios. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Formato de correo inválido | En el paso 4, el sistema muestra un mensaje de error y solicita corrección. |
| FE-02 | El nuevo correo ya está en uso | En el paso 5, el sistema notifica que el correo pertenece a otra cuenta y solicita uno diferente. |

---

### CU-04: Cambiar Contraseña

| Campo | Descripción |
|-------|-------------|
| **ID** | CU-04 |
| **Nombre** | Cambiar Contraseña |
| **Actor** | Cliente, Administrador |
| **Descripción** | Permite al usuario actualizar su contraseña actual por una nueva, previa verificación de la contraseña vigente. |
| **Precondiciones** | El usuario tiene una sesión activa. |
| **Postcondiciones** | La contraseña del usuario queda actualizada en el sistema. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario | Accede a la sección de perfil y selecciona la opción de cambiar contraseña. |
| 2 | Usuario | Ingresa su contraseña actual. |
| 3 | Usuario | Ingresa la nueva contraseña y la confirma. |
| 4 | Usuario | Envía el formulario. |
| 5 | Sistema | Verifica que la contraseña actual coincida con el hash almacenado. |
| 6 | Sistema | Valida que la nueva contraseña cumpla con los requisitos de seguridad. |
| 7 | Sistema | Almacena la nueva contraseña cifrada. |
| 8 | Sistema | Muestra un mensaje de confirmación y redirige al inicio de sesión. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El usuario cancela | En cualquier paso, el usuario puede cancelar y el sistema descarta los cambios. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Contraseña actual incorrecta | En el paso 5, el sistema muestra un error de credenciales inválidas sin revelar detalles adicionales. |
| FE-02 | Nueva contraseña no cumple requisitos | En el paso 6, el sistema indica los requisitos no cumplidos y solicita corrección. |
| FE-03 | Nueva contraseña y confirmación no coinciden | En el paso 6, el sistema muestra un error y limpia los campos de nueva contraseña. |

---

### CU-05: Cerrar Sesión

| Campo | Descripción |
|-------|-------------|
| **ID** | CU-05 |
| **Nombre** | Cerrar Sesión |
| **Actor** | Cliente, Administrador |
| **Descripción** | Permite al usuario finalizar su sesión activa en la plataforma, invalidando el token de autenticación. |
| **Precondiciones** | El usuario tiene una sesión activa. |
| **Postcondiciones** | El token de sesión queda invalidado y el usuario es redirigido a la página de inicio. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Usuario | Selecciona la opción de cerrar sesión desde el menú de usuario. |
| 2 | Sistema | Invalida el token JWT asociado a la sesión activa. |
| 3 | Sistema | Redirige al usuario a la página de inicio de sesión. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El usuario cancela el cierre de sesión | En el paso 1, el sistema no realiza ninguna acción y mantiene la sesión activa. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Error al invalidar el token | En el paso 2, el sistema muestra un mensaje de error e intenta invalidar el token nuevamente. |

![CDU002](./img/CDU002.png)

## Gestión de películas y cartelera

### CU-06: Visualizar Cartelera por Categoría

| Campo | Descripción |
|-------|-------------|
| **ID** | CU-06 |
| **Nombre** | Visualizar Cartelera por Categoría |
| **Actor** | Cliente |
| **Descripción** | Permite al cliente explorar las películas disponibles en cartelera, segmentadas por su tipo de proyección: Estrenos, Pre-ventas y Re-Estrenos. |
| **Precondiciones** | Existe al menos una película registrada en el catálogo. |
| **Postcondiciones** | El cliente visualiza las películas disponibles según la categoría seleccionada. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Cliente | Accede a la sección de cartelera desde la página principal. |
| 2 | Cliente | Selecciona una categoría de proyección: Estrenos, Pre-ventas o Re-Estrenos. |
| 3 | Sistema | Recupera y muestra las películas activas correspondientes a la categoría seleccionada. |
| 4 | Cliente | Navega por el listado de películas disponibles. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El cliente no selecciona categoría | En el paso 2, el sistema muestra todas las películas disponibles sin filtro de categoría. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | No hay películas en la categoría seleccionada | En el paso 3, el sistema muestra un mensaje indicando que no hay contenido disponible en esa categoría. |

---

### CU-07: Ver Detalle de Película

| Campo | Descripción |
|-------|-------------|
| **ID** | CU-07 |
| **Nombre** | Ver Detalle de Película |
| **Actor** | Cliente |
| **Descripción** | Permite al cliente consultar la información completa de una película seleccionada desde la cartelera, incluyendo sinopsis, duración, género y funciones disponibles. |
| **Precondiciones** | La película existe en el catálogo y tiene al menos una función programada. |
| **Postcondiciones** | El cliente visualiza los detalles de la película y puede proceder a seleccionar una función. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Cliente | Selecciona una película desde la cartelera. |
| 2 | Sistema | Recupera y muestra los detalles de la película. |
| 3 | Sistema | Muestra las funciones disponibles para la película (cine, sala, fecha y horario). |
| 4 | Cliente | Revisa la información y selecciona una función para continuar con la compra. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El cliente no selecciona ninguna función | En el paso 4, el cliente puede regresar a la cartelera sin continuar con la compra. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | La película no tiene funciones programadas | En el paso 3, el sistema muestra un mensaje indicando que no hay funciones disponibles por el momento. |

![CDU003](./img/CDU003.png)

## Gestión de funciones
