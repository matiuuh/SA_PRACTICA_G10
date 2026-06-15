# Casos de Uso

## Core del negocio
![coreDelNegocio](./img/Practica-Core.drawio.svg)

## Casos de uso de alto nivel
![Caso de Uso de Alto Nivel](./img/Practica-CDU-Alto_Nivel.drawio.svg)

## Primera descomposición

![Primera Descomposicion](./img/Practica-Primera_Descomposición.drawio.svg)

**CDU01**: **Registro e inicio de sesión**: Es el punto de partido para que cualquier usuario pueda interactuar con el sistema. Permite a los usuarios crear una cuenta y autenticarse para acceder a las funcionalidades del sistema.

**CDU02**: **Gestión de películas y cartelera**: Permite al administrador gestionar las películas del sistema y mostrarlas en cartelera según su tipo de proyección.

**CDU03**: **Gestión de funciones de cine**: Permite al administrador gestionar las funciones de las películas, incluyendo la asignación de horarios.

**CDU04**: **Reserva y Compra de Boletos**: Permite a los usuarios seleccionar su ubicación, explorar funciones disponibles, reservar asientos en tiempo real y completar la compra de sus boletos.

**CDU05**: **Gestión de cines y salas**: Permite al administrador gestionar las sedes de cine y las salas

# Casos de uso expandidos
## Registro y manejo de autenticación

![CDU001](./img/Practica-CDU001.drawio.svg)

### CDU-001.1: Registrar Cliente

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-001.1 |
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
| 3 | Sistema | Valida que todos los campos estén completos y con formato correcto. |
| 4 | Sistema | Verifica que el correo electrónico no esté registrado previamente. |
| 5 | Sistema | Almacena el nuevo usuario con la contraseña cifrada. |
| 6 | Sistema | Muestra un mensaje de registro exitoso y redirige al login |

**Flujos alternativos:**
| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El usuario ya tiene una cuenta | El sistema notifica que el correo ya está en uso y sugiere reintentarlo. |
| 

**Flujos de excepción:**
| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Formato de correo inválido | El sistema redirije al usuario al campo de correo incitando a corregir el formato. |
| 
| FE-03 | Error de conexión con la base de datos | el sistema muestra un mensaje de error genérico y solicita reintentar. |

---

### CDU-001.2: Iniciar Sesión

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-001.2 |
| **Nombre** | Iniciar Sesión |
| **Actor** | Usuario / Administrador|
| **Descripción** | Permite a un usuario registrado o al administrador autenticarse en la plataforma mediante su correo electrónico y contraseña para acceder a las funcionalidades del sistema. |
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
| FA-01 | Contraseña incorrecta | El sistema muestra un mensaje de credenciales inválidas sin especificar cuál campo es incorrecto. |


**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-02 | Formato de correo inválido | El sistema muestra un error de formato y solicita corrección antes de continuar. |
| FE-03 | Error de conexión con la base de datos | El sistema muestra un mensaje de error genérico y solicita reintentar. |

### CDU-001.3: Cierre de sesión

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-001.3 |
| **Nombre** | Cierre de sesión |
| **Actor** | Usuario, Administrador |
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
| FA-01 | El usuario presiona el salir sesión | El sistema no realiza ninguna acción y mantiene la sesión activa. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Error de conexión con la base de datos | El sistema muestra un mensaje de error genérico y solicita reintentar. |

---

## Gestión de películas y cartelera

![CDU002](./img/Practica-CDU002.drawio.svg)

### CDU-002.1: Modificar Cartelera

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-002.1 |
| **Nombre** | Modificar Cartelera |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador modificar la cartelera películas activas. |
| **Precondiciones** | El administrador tiene una sesión activa. Existen películas registradas en el sistema. |
| **Postcondiciones** | La cartelera queda actualizada y los cambios son visibles para los clientes de forma inmediata. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al panel de administración. |
| 2 | Sistema | Muestra el listado de películas en cartelera y la opción para agregar. |
| 3 | Administrador | puede editar o eliminar alguna pelicula de la cartelera|
| 4 | Administrador | confirma su decision |
| 5 | Sistema | muestra un mensaje de confirmacion |
| 6 | Sistema | Actualiza la cartelera en la base de datos. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador cancela | En cualquier paso, el administrador puede cancelar y el sistema descarta los cambios. |
| FA-02 | El administrador no realiza cambios |El sistema no ejecuta ninguna operación y mantiene la cartelera actual. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | La película seleccionada no tiene información completa | El sistema notifica al administrador los campos obligatorios|
| FE-02 | Error de conexión con la base de datos | En el paso 6, el sistema muestra un mensaje de error genérico y solicita reintentar. |

---

### CDU-002.2: Añadir Película

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-002.2 |
| **Nombre** | Añadir Película |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador registrar una nueva película en el sistema con toda su información, incluyendo título, categoría, duración, sinopsis, tipo de cartelera, poster, y si está activa o no. |
| **Precondiciones** | El administrador tiene una sesión activa. |
| **Postcondiciones** | La película queda registrada en el sistema y puede ser gestionada en la cartelera y en funciones. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al panel de administración y selecciona la opción de añadir película. |
| 2 | Administrador | Selecciona el tipo de carga de película: individual |
| 3 | Administrador | Ingresa el título, categoría, duración, sinopsis, tipo de cartelera, y si está activa o no. |
| 4| | Administrador | Carga la imagen del póster de la película por medio de un url. |
| 5 | Administrador | Envía el formulario. |
| 6 | Sistema | Valida que todos los campos obligatorios estén completos |
| 7 | Sistema | Almacena la película con toda su información en la base de datos. |
| 8 | Sistema | Muestra un mensaje de confirmación de registro exitoso. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador no carga imagen | No se registra una imagen para la pelicula |
| FA-02 | El administrador cancela | En cualquier paso, el administrador puede cancelar y el sistema descarta los datos ingresados. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Campos obligatorios incompletos | El sistema resalta los campos faltantes |
| FE-02 | Ya existe una película con el mismo título | Enl sistema notifica la duplicidad. |


---

### CDU-002.3: Modificar Película

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-002.3 |
| **Nombre** | Modificar Película |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador editar la información de una película existente en el sistema, como su título, sinopsis, clasificación, género o tipo de proyección. |
| **Precondiciones** | El administrador tiene una sesión activa. La película existe en el sistema. |
| **Postcondiciones** | La información de la película queda actualizada en el sistema y los cambios son visibles para los clientes. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al catálogo de películas y selecciona la película a modificar. |
| 2 | Sistema | Muestra el formulario con la información actual de la película. |
| 3 | Administrador | Modifica los campos deseados y envía el formulario. |
| 4 | Sistema | Valida que los campos modificados no estén vacíos|
| 5 | Sistema | Actualiza la información de la película en la base de datos. |
| 6 | Sistema | Muestra un mensaje de confirmación de actualización exitosa. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador cancela la edición | El sistema no realiza ninguna operación y mantiene la información actual. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Campo obligatorio vacío tras la edición | El sistema resalta los campos inválidos y solicita corrección. |
| FE-03 | Error de conexión con la base de datos | El sistema muestra un mensaje de error genérico y solicita reintentar. |

---

### CDU-002.4: Eliminar Película

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-002.4 |
| **Nombre** | Eliminar Película |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador eliminar del sistema una película que no tenga funciones activas ni boletos vendidos asociados. |
| **Precondiciones** | El administrador tiene una sesión activa. La película existe en el sistema. |
| **Postcondiciones** | La película queda eliminada del sistema y no aparece más en el catálogo ni en la cartelera. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al catálogo de películas y selecciona la película a eliminar. |
| 2 | Administrador | Selecciona la opción de eliminar. |
| 3 | Sistema | Solicita confirmación al administrador. |
| 4 | Administrador | Confirma la eliminación. |
| 5 | Sistema | Elimina la película y su información de la base de datos. |
| 6 | Sistema | Muestra un mensaje de confirmación de eliminación exitosa. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador cancela la eliminación | El sistema descarta la operación y mantiene la película en el catálogo. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | La película tiene boletos vendidos asociados | El sistema impide la eliminación e informa que existen boletos vendidos para esa película. |
| FE-03 | Error de conexión con la base de datos | El sistema muestra un mensaje de error genérico y solicita reintentar. |

---

### CDU-002.5: Visualizar Cartelera

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-002.5 |
| **Nombre** | Visualizar Cartelera |
| **Actor** | Cliente |
| **Descripción** | Permite al cliente consultar las películas actualmente en cartelera, incluyendo su título, género, duración. |
| **Precondiciones** | Existe al menos una película en cartelera. |
| **Postcondiciones** | El cliente visualiza la cartelera y puede seleccionar una película para ver su detalle. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Cliente | Accede a la sección de cartelera desde la página principal. |
| 2 | Sistema | Recupera y muestra las películas actualmente en cartelera. |
| 3 | Cliente | Aplica filtro por tipo de proyección |
| 4 | Sistema | Actualiza la vista mostrando únicamente las películas que coincidan con la proyección seleccionada|
| 5 | Cliente | Visualiza las películas |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El cliente no aplica filtros | El sistema muestra todas las películas en cartelera sin filtrar. |
| FA-02 | El cliente limpia los filtros | El sistema restaura la vista completa de la cartelera. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | No hay películas en cartelera | El sistema muestra un mensaje indicando que no hay títulos disponibles en este momento. |
| FE-02 | Ninguna película coincide con los filtros aplicados | El sistema muestra un mensaje indicando que no hay resultados para los filtros seleccionados. |

---

### CDU-002.6: Visualizar Detalle de Película

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-002.6 |
| **Nombre** | Visualizar Detalle de Película |
| **Actor** | Cliente |
| **Descripción** | Permite al cliente consultar la información completa de una película seleccionada, incluyendo, título de la película, sinopsis, clasificación, duración y numero de horarios disponibles. |
| **Precondiciones** | La película existe en el sistema y está en cartelera. |
| **Postcondiciones** | El cliente Puede proceder a seleccionar una función. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Cliente | Accede a la sección de cartelera desde la página principal. |
| 2 | Sistema | Recupera y muestra las películas actualmente en cartelera. |
| 3 | Cliente | Aplica filtro por categoria |
| 4 | Sistema | Actualiza la vista mostrando únicamente las películas que coincidan con los filtros seleccionados. |
| 5 | Cliente | Selecciona el visualizar el detalle de las película en el que se refleja título de la película, sinopsis, clasificación, duración y numero de horarios disponibles. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El cliente regresa a la cartelera | El cliente puede volver al listado de cartelera sin seleccionar función. |


**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|

| FE-02 | Error al recuperar la información de la película | El sistema muestra un mensaje de error genérico y sugiere regresar a la cartelera. |

---

CDU-002.7: Carga masiva de películas

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-002.7 |
| **Nombre** | Carga masiva de películas |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador cargar múltiples películas a través de un archivo CSV, procesando la información para crear registros en el sistema. |
| **Precondiciones** | El administrador tiene una sesión activa. El archivo CSV contiene la información necesaria para crear las películas. |
| **Postcondiciones** | Las películas se registran en el sistema con toda su información. |


**Flujo principal:**
| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al panel de administración y selecciona la opción de añadir película. |
| 2 | Administrador | Selecciona el tipo de carga de película: Masiva |
| 3 | Administrador | Ingresa los datos por medio de un csv: el título, categoría, duración, sinopsis, tipo de cartelera, y si está activa o no. |
| 4| | Administrador | Selecciona el archivo CSV desde su dispositivo. |
| 5 | Sistema | Sube y procesa el archivo CSV  |
| 6 | Sistema | Valida que cada registro del CSV tenga los campos obligatorios completos y con formato correcto. |
| 7 | Sistema | Persiste las películas en la base de datos. |
| 8 | Sistema | Muestra un mensaje de confirmación indicando cuántas películas se registraron exitosamente |

**Flujos alternativos:**
| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador cancela la carga | En cualquier paso, el administrador puede cancelar y el sistema descarta los datos ingresados. |

**Flujos de excepción:**
| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | El archivo CSV tiene formato incorrecto | El sistema muestra un mensaje de error indicando que el formato del archivo no es válido. |

## Gestión de funciones


![CDU003](./img/Practica-CDU003.drawio.svg)

### CDU-003.1: Registrar Función de cine

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-003.1 |
| **Nombre** | Registrar Función |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador programar una nueva función asignando una película a una sala, fecha, horario y precio en específicos, si está activa o no por medio de un formulario. |
| **Precondiciones** | El administrador tiene una sesión activa. Existen películas y salas registradas en el sistema. |
| **Postcondiciones** | La función queda registrada y disponible para que los clientes consulten y compren boletos. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al panel de administración y selecciona la opción de registrar función. |
| 2 | Administrador | Selecciona la película, la sala, la fecha, el horario, el precio y si está activa o no. |
| 4 | Sistema | Valida que todos los campos estén completos. |
| 5 | Sistema | Verifica que no exista otra función programada en la misma sala, fecha y horario. |
| 6 | Sistema | Registra la función y genera el mapa de asientos disponibles. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador cancela | El administrador puede cancelar y el sistema descarta los datos ingresados. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Campos obligatorios incompletos | El sistema resalta los campos faltantes y solicita completarlos. |
| FE-02 | Conflicto de sala y horario | El sistema notifica que la sala ya tiene una función programada en ese horario. |

---

### CDU-003.2: Actualizar Función de cine

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-003.2 |
| **Nombre** | Actualizar Función |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador modificar los datos de una función existente, como su fecha, horario o sala asignada. |
| **Precondiciones** | El administrador tiene una sesión activa y la función existe en el sistema sin boletos vendidos. |
| **Postcondiciones** | Los datos de la función quedan actualizados en el sistema. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al listado de funciones y selecciona la función a editar. |
| 2 | Administrador | Modifica los campos deseados y envía el formulario. |
| 3 | Sistema | Valida que los nuevos datos no generen conflicto de sala y horario. |
| 4 | Sistema | Actualiza los datos de la función en la base de datos. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador puede cancelar y el sistema descarta los cambios. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | No se establece conexión a la base de datos | El sistema muestra un mensaje de error |

### CDU-003.3: Eliminar Función de cine

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-003.3 |
| **Nombre** | Eliminar Función |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador eliminar una función existente, siempre que no tenga boletos vendidos. |
| **Precondiciones** | El administrador tiene una sesión activa y la función existe en el sistema sin boletos vendidos. |
| **Postcondiciones** | La función queda eliminada del sistema. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al listado de funciones y selecciona la función a eliminar. |
| 2 | Sistema | Verifica que no existan boletos vendidos para la función. |
| 3 | Sistema | Elimina la función de la base de datos. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador puede cancelar y el sistema descarta la eliminación. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | No se establece conexión a la base de datos | El sistema muestra un mensaje de error |

## Reserva y Compra de Boletos

![CDU004](./img/Practica-CDU004.drawio.svg)

### CDU-004.1: Seleccionar asientos

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-004.1 |
| **Nombre** | Seleccionar asientos |
| **Actor** | Cliente |
| **Descripción** | Permite al cliente seleccionar su ciudad para visualizar dinámicamente los cines disponibles, selecciona una película de la cartelera y selecciona una función en dicha localidad, luego selecciona sus asientos. |
| **Precondiciones** | Existe al menos un cine registrado con funciones disponibles en el sistema. |
| **Postcondiciones** | El sistema reserva temporalmente esos asientos hasta que se confirme una compra o el cliente desista. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Cliente | Accede a la página principal de la plataforma. |
| 2 | Cliente | Selecciona su ciudad desde el listado de ciudades disponibles. |
| 3 | Sistema | Recupera y muestra los cines disponibles en la ciudad seleccionada. |
| 4 | Sistema | Muestra la cartelera disponible para el cine seleccionado. |
| 5 | Cliente | Selecciona una película de la cartelera |
| 6 | Sistema | Muestra las funciones disponibles para la película seleccionada |
| 7 | Cliente | Selecciona una función de la lista |
| 8 | Sistema | Muestra el mapa de asientos disponible para la función seleccionada |
| 9 | Cliente | Selecciona los asientos deseados |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El cliente cambia de ciudad | El cliente puede seleccionar otra ciudad y el sistema actualiza el listado de cines. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | El sistema no puede conectarse a la base de datos | El sistema muestra un mensaje de error |

---

### CDU-004.2: Mostrar asientos Disponibles

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-004.2 |
| **Nombre** | Mostrar asientos Disponibles |
| **Actor** | Cliente |
| **Descripción** | Permite al cliente consultar los asientos disponibles para una función seleccionada. |
| **Precondiciones** | El cliente ha seleccionado una función. |
| **Postcondiciones** | El cliente visualiza los asientos disponibles y puede seleccionar uno para continuar con la compra. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Sistema | Muestra el mapa de asientos disponible para la función seleccionada |
| 2 | Sistema | Está constantemente actualizando el mapa de asientos para reflejar los asientos ocupados |
| 3 | Cliente | selecciona sus asientos |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | Decisión de cliente | El cliente puede cambiar de función y el sistema actualiza el mapa de asientos. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | No hay funciones disponibles en el cine seleccionado | El sistema muestra un mensaje indicando que no hay funciones programadas. |

---

### CDU-004.3: Confirmar compra de asientos

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-004.3 |
| **Nombre** | Confirmar compra de asientos |
| **Actor** | Cliente |
| **Descripción** | Permite al cliente confirmar la compra de los asientos seleccionados. |
| **Precondiciones** | El cliente tiene una sesión activa y ha seleccionado asientos para su función. |
| **Postcondiciones** | Los asientos seleccionados quedan marcados como no disponibles para el resto de usuarios. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Cliente | Confirma la selección de asientos pulsando el botón confirmar a pago |
| 2 | Sistema | Procesa la confirmación y marca los asientos como seleccionados |
| 3 | Sistema | Redirige al cliente al formulario de pago |
| 4 | Cliente | Llena el formulario de pago |
| 5 | Cliente | Realiza el pago en el botón pagar visualizando la cantidad |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El cliente cancela el pago | El sistema redirige al cliente a la página anterior sin procesar la compra, y dejando seleccionados los asientos que el cliente seleccionó anteriormente |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Se pierde la conexión WebSocket | El sistema intenta reconectar automáticamente y, al restablecer la conexión, sincroniza el estado actual del mapa de asientos. |

---

### CDU-004.4: Confirmar transacción bancaria

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-004.4 |
| **Nombre** | Confirmar transacción bancaria |
| **Actor** | Cliente, Sistema de Pagos |
| **Descripción** | Permite al cliente confirmar su selección de asientos y procesar el pago a través del sistema de pagos. |
| **Precondiciones** | El cliente tiene una sesión activa y tiene asientos seleccionados en el mapa interactivo y confirma que desea pagar. |
| **Postcondiciones** | El pago queda registrado, los asientos pasan a estado Ocupado y el cliente recibe su boleto digital. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Sistema | Envía la solicitud de cobro al Sistema de Pagos. |
| 2 | Sistema de Pagos | Procesa la transacción y retorna el resultado al sistema. |
| 3 | Sistema | Registra el pago, cambia el estado de los asientos a Ocupado.|

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Error de conexión con el Sistema de Pagos | El sistema encola el reintento de cobro |

### CDU-004.5: Emitir Boleto

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-004.5 |
| **Nombre** | Emitir Boleto |
| **Actor** | Sistema |
| **Descripción** | Permite al sistema generar y emitir el boleto digital una vez que el pago ha sido procesado exitosamente, incluyendo toda la información relevante de la función y los asientos adquiridos. |
| **Precondiciones** | El pago ha sido procesado y confirmado exitosamente por el Sistema de Pagos. Los asientos han sido marcados como Ocupado. |
| **Postcondiciones** | El boleto digital es generado con un código único de confirmación y queda disponible para el cliente. Se registra la transacción completa en el sistema. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Sistema | Recibe la confirmación de pago exitoso del Sistema de Pagos. |
| 2 | Sistema | Crea el boleto digital con los datos de la función película, fecha, hora, asientos seleccionados,total y numero de boleto, tarjeta de credito utilizada, y fecha de la transacción. |
| 3 | Sistema | Registra la transacción completa en la base de datos asociándola al cliente. |
| 4 | Cliente | Visualiza, descarga o imprime el boleto digital. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-02 | El cliente desea imprimir el boleto | El sistema ofrece una versión optimizada para impresión del boleto digital. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Error al generar el código de confirmación | El sistema reintenta la generación y si persiste el error |
| FE-03 | Error de conexión con la base de datos | El sistema encola el registro para procesarlo posteriormente y continúa con la emisión del boleto. |

---

## Gestión de cines y salas

![CDU005](./img/Practica-CDU005.drawio.svg)

### CDU-005.1: Visualizar Sucursales de Cine

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-005.1 |
| **Nombre** | Visualizar Sucursales de Cine |
| **Actor** | Administrador|
| **Descripción** | Permite al administrador consultar las sucursales de cine disponibles en una ciudad |
| **Precondiciones** | El administrador tiene una sesión activa. |
| **Postcondiciones** | El administrador visualiza la lista de sucursales y puede seleccionar una para ver su vista detllada. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede a la sección de sucursales desde la página principal. |
| 2 | Sistema | Recupera y muestra las sucursales |
| 3 | Administrador | Visualiza las sucursales disponibles |
|4 | Administrador | Selecciona una sucursal para ver su vista detallada |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | No hay sucursales en la ciudad seleccionada | El sistema muestra un mensaje indicando que no hay sucursales disponibles. |

---

### CDU-005.2: Añadir Sucursal de Cine

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-005.2 |
| **Nombre** | Añadir Sucursal de Cine |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador registrar una nueva sucursal con su nombre, dirección, ciudad |
| **Precondiciones** | El administrador tiene una sesión activa. |
| **Postcondiciones** | La sucursal queda registrada y disponible en las búsquedas del sistema. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al panel de administración y selecciona "Agregar Cine". |
| 2 | Administrador | Ingresa nombre, dirección y  una nueva ciudad. |
| 3 | Sistema | Valida los campos obligatorios . |
| 4 | Sistema | Crea la sucursal en la base de datos. |
| 5 | Sistema | Muestra un mensaje de confirmación y lista la nueva sucursal. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador decide crear una nueva sucursal desde una ciudad existente | El sistema muestra la lista de ciudades disponibles y permite seleccionar una y continua con el formulario. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | seccion incompleta | El sistema solicita completar los campos obligatorios. |


---

### CDU-005.3: Editar Sucursal de Cine

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-005.3 |
| **Nombre** | Editar Sucursal de Cine |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador modificar los datos de una sucursal existente dirección,nombre, ciudad. |
| **Precondiciones** | El administrador tiene una sesión activa. La sucursal existe en el sistema. |
| **Postcondiciones** | Los datos de la sucursal quedan actualizados en el sistema. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al listado de sucursales y selecciona la sucursal a editar. |
| 2 | Sistema | Muestra el formulario con la información actual de la sucursal. |
| 3 | Administrador | Modifica los campos deseados y envía el formulario. |
| 4 | Sistema | Valida los datos y actualiza la sucursal en la base de datos. |
| 5 | Sistema | Muestra un mensaje de confirmación de actualización. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | Se cancela la edición | El sistema no modifica la sucursal y mantiene la información actual. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Campos sin llenar | El sistema resalta los campos vacíos y resalta para completarlos. |

---

### CDU-005.4: Eliminar Sucursal de Cine

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-005.4 |
| **Nombre** | Eliminar Sucursal de Cine |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador eliminar una sucursal. |
| **Precondiciones** | El administrador tiene una sesión activa. |
| **Postcondiciones** | La sucursal queda eliminada del sistema y ya no aparece en búsquedas ni listados. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al listado de sucursales y selecciona la sucursal a eliminar. |
| 2 | Sistema | Solicita confirmación al administrador. |
| 3 | Administrador | Confirma la eliminación. |
| 4 | Sistema | Elimina la sucursal y muestra un mensaje de confirmación. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador cancela la eliminación | El sistema descarta la acción y mantiene la sucursal. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | No hay conexión a base de datos | El sistema muestra un mensaje de error. |

---

### CDU-005.5: Visualizar Salas de Cine

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-005.5 |
| **Nombre** | Visualizar Salas de Cine |
| **Actor** | Administrador |
| **Descripción** | Permite al Administrador consultar las salas disponibles en una sucursal |
| **Precondiciones** | El administrador está en la vista de salas. |
| **Postcondiciones** | El administrador visualiza las salas y puede ver una vista detallada. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador |Selecciona la sala de cine que desea visualizar detalladamente |
| 2 | Sistema | el sistema muestra la información detallada |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | No hay sucursales de cine | el sistema no muestra las sucursales de cine por ende no meustre las salas disponibles |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Error al recuperar información de salas | El sistema muestra un mensaje de error. |

---

### CDU-005.6: Añadir Sala de Cine

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-005.6 |
| **Nombre** | Añadir Sala de Cine |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador crear una nueva sala dentro de una sucursal, definiendo su sucursal, nombre de la sala, tipo de proyección y capacidad. |
| **Precondiciones** | El administrador tiene una sesión activa y la sucursal existe. |
| **Postcondiciones** | La sala queda registrada y disponible para asignar funciones. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Accede al panel de la sucursal y selecciona "Agregar sala". |
| 2 | Administrador | Ingresa sucursal, nombre de la sala, tipo de proyección y capacidad |
| 3 | Sistema | Valida los datos y crea la sala en la sucursal. |
| 4 | Sistema | Muestra confirmación y la nueva sala en el listado. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | Cancela la agregación de sala | El sistema descarta la acción y vuelve al listado de salas. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | Capacidad inválida | El sistema solicita un valor de capacidad válido. |

---

### CDU-005.7: Editar Sala de Cine

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-005.7 |
| **Nombre** | Editar Sala de Cine |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador modificar la configuración de una sala, por ejemplo su sucursal de cine, su nombre , su tipo y su capicidad. |
| **Precondiciones** | El administrador tiene una sesión activa y la sala existe.|
| **Postcondiciones** | La sala queda actualizada con la nueva configuración. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Selecciona la sala a editar desde el panel de las salas. |
| 2 | Sistema | Muestra el formulario con la configuración actual de la sala. |
| 3 | Administrador | Realiza cambios y guarda. |
| 4 | Sistema | Valida cambios y actualiza la sala en la base de datos. |
| 5 | Sistema | Muestra confirmación de actualización. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador cancela edición | No se realizan cambios y se mantiene la configuración actual. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | No hay conexión | El sistema muestra un mensaje de error. |

---

### CDU-005.8: Eliminar Sala de Cine

| Campo | Descripción |
|-------|-------------|
| **ID** | CDU-005.8 |
| **Nombre** | Eliminar Sala de Cine |
| **Actor** | Administrador |
| **Descripción** | Permite al administrador eliminar una sala. |
| **Precondiciones** | El administrador tiene una sesión activa. Debe existir una sala |
| **Postcondiciones** | La sala queda eliminada y ya no puede ser usada para programar funciones. |

**Flujo principal:**

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Administrador | Selecciona la sala a eliminar desde la seccion de salas   . |
| 2 | Sistema | Solicita confirmación. |
| 3 | Administrador | Confirma la eliminación. |
| 4 | Sistema | Elimina la sala y muestra confirmación. |

**Flujos alternativos:**

| ID | Condición | Acción |
|----|-----------|--------|
| FA-01 | El administrador cancela | El sistema mantiene la sala sin cambios. |

**Flujos de excepción:**

| ID | Condición | Acción |
|----|-----------|--------|
| FE-01 | No hay conexión | El sistema muestra un mensaje de error. |

[Volver a Documentacion](../Documentación.md)
