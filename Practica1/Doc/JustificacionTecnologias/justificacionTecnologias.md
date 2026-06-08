# Justificación de Tecnologías

## Lenguaje

Se optó por TypeScript como lenguaje principal tanto para el frontend como para el backend porque este nos permite detectar errores antes de ejecutar el código, lo que consideramos importante para optimizar el tiempo de desarrollo y minimizar los errores en producción. Asimimsmo, la adopción de este lenguaje en nuestro sistema nos permite ofrecer un código más limpio y mantenible.

---

## Framework backend

Puesto que el backend sería desarrollado en TypeScript, NestJS fue opción muy adecuada, por la experiencia del equipo con dicho framework, pero principalmente por la estructura clara y consistente sobre Node.js, organizando el código en módulos bien delimitados. Esta organización beneficia al equipo porque todos los microservicios siguen las mismas convenciones, lo que facilita entender, mantener y probar cada uno de ellos de forma independiente. También simplifica la implementación de funcionalidades transversales como la autenticación y el control de acceso.

---

## Framework frontend

React fue elegido para construir la interfaz de usuario porque permite dividir la pantalla en componentes reutilizables, lo que agiliza el desarrollo y mantiene el código organizado. Vite complementa a React como herramienta de construcción, ofreciendo tiempos de arranque muy rápidos durante el desarrollo y generando una versión optimizada de la aplicación para producción, lo que mejora la experiencia tanto del desarrollador como del usuario final.

---

## Base de datos

Cada microservicio cuenta con su propia base de datos PostgreSQL independiente. Como equipo escogimos esta tecnología porque es una herramienta robusta y ampliamente utilizada en sistemas empresariales, lo que nos permite garantizar la integridad de los datos y es compatible con las herramientas de acceso a datos utilizadas en el proyecto. Además de la experiencia previa del equipo con PostgreSQL, lo que nos permite la detección temprana de errores y una mejor gestión de los datos.

---

## Mensajería asíncrona

RabbitMQ se incorporó como sistema de mensajería para coordinar la comunicación entre el servicio de reservas y el de pagos de forma desacoplada, consideramos kafka pero nos parecía una herramienta demasiado compleja para las necesidades del proyecto,, por lo que nos inclinamos por RabbitMQ el cual está orientado precisamente a la comunicación entre servicios mediante colas, con una configuración y despliegue considerablemente más simples.

---

[Volver a Documentación](../Documentación.md)
