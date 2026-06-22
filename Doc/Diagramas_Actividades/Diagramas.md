# Diagramas de actividades

## Actividades del usuario

El diagrama presenta la interacción del usuario con la aplicación web, el API Gateway y los servicios de usuarios, localidades, funciones, reservas y pagos. El flujo comienza con el registro o inicio de sesión, donde las credenciales son validadas y se genera el token JWT utilizado para autorizar las solicitudes posteriores.

Después de autenticarse, el usuario consulta las ciudades, sucursales, películas y funciones disponibles. Al seleccionar una función, el sistema solicita al servicio correspondiente el mapa de la sala y muestra dinámicamente los estados de los asientos para que el usuario pueda escoger los que desea reservar.

La solicitud de compra se procesa mediante los servicios de reservas y pagos, utilizando la cola de mensajes para desacoplar el procesamiento. Si la operación finaliza correctamente, se actualizan los estados de los asientos, se generan los boletos con sus códigos QR y se presentan al usuario con la opción de descargarlos.

![Diagrama de actividades del usuario](<./data nueva/Actividades Usuario.drawio.svg>)

---

## Actividades del administrador

El diagrama describe la interacción del administrador con la aplicación web, el API Gateway y los microservicios. El acceso comienza con la validación de credenciales y permisos mediante JWT. También se representa el cierre de sesión y la invalidación del token de autenticación.

Desde el panel administrativo se gestionan películas, funciones, localidades y demás datos operativos. Las solicitudes son validadas por el API Gateway y enviadas al servicio responsable. El flujo también contempla operaciones mediante archivos CSV y la consulta o descarga de información en formato PDF.

Para el control de acceso, el administrador puede proporcionar un boleto, solicitar el análisis de su código QR y recibir el resultado de la validación. Además, puede consultar las incidencias enviadas por los usuarios, revisar su información y responderlas manualmente; la respuesta es almacenada por el servicio de reservas y queda disponible para el usuario.

![Diagrama de actividades del administrador](<./data nueva/Diagrama de actividades admin.svg>)

---

## Diagrama editable

El diagrama en crudo puede consultarse y editarse directamente en [Draw.io / diagrams.net](https://app.diagrams.net/#G17zqvzKtzFauwvckD7d33XzBFcmADsWsG#%7B%22pageId%22%3A%22qnoyfdcMu2km39snqnNb%22%7D).

---

[Volver a Documentación](../Documentaci%C3%B3n.md)
