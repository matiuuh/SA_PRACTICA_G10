# Requerimientos No Funcionales

| ID | Requerimiento | Especificación Cuantitativa |
|----|---------------|-----------------------------|
| RNF-01 | Tiempo de respuesta del mapa de asientos | El mapa interactivo de la sala debe cargarse y reflejar el estado actualizado de los asientos en un tiempo máximo de 2 segundos bajo carga normal. |
| RNF-02 | Manejo de condiciones de carrera | El sistema debe garantizar que no ocurran condiciones de carrera al seleccionar asientos de forma simultánea. Debe soportar múltiples usuarios concurrentes intentando reservar asientos en la misma función sin inconsistencias de datos. |
| RNF-03 | Gestión de picos de demanda | La arquitectura SOA debe permitir escalar horizontalmente los servicios críticos (Reservas, Pagos) de forma independiente para absorber picos de hasta 5x la carga normal sin degradación del servicio. |
| RNF-04 | Durabilidad de transacciones financieras | El sistema no debe perder ninguna transacción de pago ante caídas del sistema. Las operaciones de pago deben persistirse en la cola de mensajería antes de procesarse. |
| RNF-05 | Autenticación y autorización | Todas las rutas protegidas deben validar un token JWT. Las contraseñas deben almacenarse cifradas con un bcrypt. |
| RNF-06 | Desacoplamiento de servicios | Cada dominio: Usuario, Películas/Cartelera, Reservas y Pagos, debe desplegarse como un servicio independiente. El acoplamiento entre servicios se limita a llamadas REST/gRPC síncronas y mensajes asíncronos vía bróker. |
| RNF-07 | Código limpio | El código fuente debe seguir los principios SOLID y los estándares de estilo del lenguaje utilizado. |
| RNF-08 | Procesamiento asincrónico de operaciones críticas | Ninguna operación crítica como validación de asientos o procesamiento de pago debe bloquear el hilo principal de la aplicación. Dichas operaciones deben encolarse en el bróker de mensajería y ser procesadas por consumidores independientes. |
| RNF-09 | Contenedores e infraestructura | Cada servicio debe contener su propio `Dockerfile`. El sistema debe poder desplegarse localmente y en la nube mediante dos archivos `docker-compose` diferenciados, sin modificaciones al código fuente. |
| RNF-11 | Punto de entrada único | Todos los servicios deben exponerse al cliente a través de un único API Gateway, que centralice el enrutamiento, la autenticación y el control de acceso. |
[Volver a Documentacion](../Documentación.md)
