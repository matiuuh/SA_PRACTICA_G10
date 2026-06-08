## Principios SOLID aplicados

### S — Single Responsibility Principle
Cada clase tiene una unica razon de cambio. En NestJS esto se refleja en la separacion entre `Controller` (maneja HTTP), `Service` (logica de negocio) y `Repository` (acceso a datos). Por ejemplo, `LocalidadesController` solo enruta peticiones; `LocalidadesService` contiene toda la logica de ciudades, cines y salas.

### O — Open/Closed Principle
Los guards de autenticacion (`JwtAuthGuard`, `RolesGuard`) estan disenados para extenderse sin modificarse. Agregar un nuevo rol al sistema solo requiere usar el decorador `@Roles('NUEVO_ROL')` en el endpoint correspondiente, sin tocar la implementacion del guard.

### L — Liskov Substitution Principle
Las estrategias de Passport (`JwtStrategy`) implementan la interfaz `PassportStrategy`. Cualquier nueva estrategia de autenticacion (OAuth, API Key) puede sustituir o coexistir con la actual sin romper el sistema, ya que todos los guards dependen de la abstraccion `AuthGuard` y no de la implementacion concreta.

### I — Interface Segregation Principle
Los DTOs de cada servicio son especificos a su operacion: `CreateCiudadDto`, `CreateCineDto` y `CreateSalaDto` son interfaces separadas. Ningun cliente esta forzado a depender de campos que no necesita, a diferencia de tener un unico DTO generico de localidad.

### D — Dependency Inversion Principle
Los servicios de NestJS reciben sus dependencias por inyeccion de constructor. `LocalidadesService` no instancia su repositorio directamente; NestJS lo inyecta. Esto permite sustituir implementaciones en pruebas sin cambiar el codigo del servicio.

[Volver a Documentacion](../Documentación.md)