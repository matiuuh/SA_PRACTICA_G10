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
| RF-11 | Alta | Emisión de Boleto | Tras la confirmación del pago, el sistema debe generar y entregar al usuario un boleto digital con los detalles de la función, asientos y número de confirmación. |
| RF-12 | Alta | Registro de películas | El sistema debe permitir el registro de peliculas y sus detalles en la base de datos. |
| RF-13 | Alta | Registro de funciones | El sistema debe permitir al administrador registrar funciones y sus detalles en la base de datos. |

[Volver a Documentacion](../Documentación.md)
