# Requerimientos Funcionales

| ID | Prioridad | Requerimiento | Descripción |
|----|-----------|----------------|-------------|
| RF-01 | Alta | Registro de Usuario | El sistema debe permitir a los usuarios registrarse proporcionando su nombre, correo electrónico y contraseña. |
| RF-02 | Alta | Inicio de Sesión | El sistema debe permitir a los usuarios autenticarse proporcionando su correo electrónico y contraseña, generando una sesión válida mediante token JWT. |
| RF-03 | Media | Cierre de Sesión | El sistema debe permitir a los usuarios cerrar su sesión activa, invalidando el token correspondiente. |
| RF-04 | Alta | Selección de Ubicación | El sistema debe permitir al usuario seleccionar su ciudad para visualizar dinámicamente los cines disponibles y sus funciones/horarios en dicha localidad. |
| RF-05 | Alta | Selección de Función/Horario | El sistema debe permitir al usuario seleccionar una función específica  para proceder con la reserva de asientos. |
| RF-06 | Alta | Visualización de Películas por Categoría | El sistema debe mostrar la cartelera de películas segmentada por tipo de proyección: Estrenos, Pre-ventas y Re-Estrenos. |
| RF-07 | Alta | Mapa Interactivo de Asientos | El sistema debe presentar un mapa visual e interactivo de la sala seleccionada, mostrando en tiempo real el estado de cada asiento: Disponible, Ocupado o Bloqueado temporalmente. |
| RF-08 | Alta | Bloqueo Temporal de Asientos | Al seleccionar un asiento, el sistema debe bloquearlo temporalmente para evitar condiciones de carrera con otros usuarios concurrentes. |
| RF-09 | Alta | Flujo de Compra de Boletos | El sistema debe procesar el flujo completo de compra: confirmación de selección de asientos, procesamiento de pago simulado y emisión del boleto final. |
| RF-10 | Alta | Procesamiento de Pago Simulado | El sistema debe permitir al usuario confirmar su compra a través de un proceso de pago simulado, validando la disponibilidad de los asientos seleccionados antes de proceder. |
| RF-11 | Alta | Emisión de Boleto | Tras la confirmación del pago, el sistema debe generar y entregar al usuario un boleto digital con los detalles de la función, asientos y número de confirmación, además debe contar con un código QR que valide el boleto y permitir su descarga. |
| RF-12 | Alta | CRUD de películas | El sistema debe permitir al administrador gestionar películas mediante operaciones CRUD completas: crear película con título, duración, poster, sinopsis, categoría y tipo de cartelera indicando si está activa; consultar listado y detalle de películas; editar información de películas existentes; y eliminar películas. |
| RF-13 | Alta | CRUD de funciones | El sistema debe permitir al administrador gestionar funciones/horarios de proyección mediante operaciones CRUD completas: crear función con fecha, hora, precio, película asignada y sala asignada indicando si está activa o no; consultar funciones por sala, película o cine y una vista detallada; editar datos de funciones existentes; y eliminar funciones del sistema. |
| RF-14 | Alta | CRUD de sucursales de cine | El sistema debe permitir al administrador gestionar sucursales de cine mediante operaciones CRUD completas: crear sucursal con nombre, dirección y ciudad asignada; consultar listado de sucursales por ciudad, nombre del cine o dirección, teniendo la opción de una vista detallada; editar datos de sucursales existentes; y eliminar sucursales del sistema. |
| RF-15 | Alta | CRUD de salas de cine | El sistema debe permitir al administrador gestionar salas de cine mediante operaciones CRUD completas: crear sala con nombre, capacidad, tipo y sucursal asignada; consultar salas por sucursal y una vista detallada; editar configuración de salas existentes; y eliminar salas del sistema. |
| RF-16 | Media | Carga masiva de películas | El sistema debe permitir al administrador realizar una carga masiva de películas a través de un archivo CSV, procesando la información para crear múltiples registros de películas en el sistema de manera eficiente. |
| RF-17 | Media | Historial de boletos | El sistema debe permitir al usuario consultar su historial de boletos comprados, mostrando si están activos o usados y permitir la descarga del mismo. |
| RF-18 | Alta | Validación de boleto | El sistema debe permitir al administrador validar boletos mediante el escaneo del código QR, verificando la autenticidad del boleto y registrando la entrada al cine lo que automáticamente cambia el estado del boleto. |
| RF-19 | Alta | Validación del boleto manual | El sistema debe permitir al administrador validar boletos de manera manual ingresando el número de confirmación del boleto o filtros y verificando la autenticidad del boleto y registrando la entrada al cine lo que automáticamente cambia el estado del boleto. |
| RF-20 | Alta | Manejo de incidencias | El sistema debe permitir al usuario notificar cualquier altercado en el servicio y debe permitir al administrador responder dicha queja o asunto. |

[Volver a Documentacion](../Documentación.md)
