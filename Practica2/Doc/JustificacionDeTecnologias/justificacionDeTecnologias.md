# Justificacion de tecnologias

## Lenguaje
Para el lenguaje se optó por TypeScript como lenguaje principal del sistema, utilizado en cada uno de sus servicios. Esto porque su sistema de tipos estaticos detecta errores en tiempo de compilacion, lo cual consideramos que era un tema critico en un sistema distribuido donde los contratos entre servicios deben ser precisos. También la reducción de bugs de integracion y la facilidad del mantenimiento del codigo.

## Framework backend
EL framework escogido para el backend el NestJS estructura el codigo en modulos, controladores y servicios siguiendo convenciones de inyeccion de dependencias similares a Angular. Esto garantiza consistencia entre los cinco microservicios del proyecto, facilita las pruebas unitarias y permite aplicar guards y decoradores para autenticacion y autorizacion de forma declarativa.

## Framework frontend
Para el desarrollo del frontend se utilizó React permite construir interfaces reactivas basadas en componentes reutilizables. Vite reemplaza a webpack con un servidor de desarrollo instantaneo basado en ESModules nativos y un build de produccion optimizado con Rollup, reduciendo significativamente los tiempos de compilacion.

## Bases de datos
Cada microservicio tiene su propia instancia PostgreSQL, siguiendo el patron Database-per-Service de la arquitectura de microservicios. PostgreSQL provee transacciones ACID, soporte para UUID como clave primaria y un tipado fuerte compatible con TypeORM.

## Broker de mensajeria
RabbitMQ actua como intermediario asincrono entre `reservas-service` y `pagos-service`. Cuando se crea una reserva, se publica un evento en la cola; el servicio de pagos lo consume independientemente. Esto desacopla ambos servicios, garantiza que los mensajes no se pierdan ante fallos temporales (durabilidad de colas) y permite procesar pagos sin bloquear la respuesta al cliente.

[Volver a Documentacion](../Documentación.md)