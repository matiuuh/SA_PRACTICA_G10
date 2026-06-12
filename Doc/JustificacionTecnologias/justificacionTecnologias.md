# Justificación de Tecnologías

## Lenguaje

**¿Qué?** Se eligió TypeScript como lenguaje principal tanto para el frontend como para el backend.

**¿Por qué?** Porque permite detectar errores antes de ejecutar el código, lo que reduce fallos en etapas tardías del desarrollo. Además, aporta un código más claro, consistente y mantenible.

**¿Para qué?** Para optimizar el tiempo de desarrollo, minimizar errores en producción y facilitar el crecimiento y mantenimiento del sistema a largo plazo.

---

## Framework backend

**¿Qué?** Se eligió NestJS como framework principal para el backend.

**¿Por qué?** Porque ofrece una estructura clara y consistente sobre Node.js, basada en módulos bien delimitados. Además, el equipo ya cuenta con experiencia previa en este framework, lo que agiliza el desarrollo.

**¿Para qué?** Para que todos los microservicios sigan las mismas convenciones, facilitando su comprensión, mantenimiento y prueba individual. También ayuda a implementar de forma ordenada funcionalidades transversales como la autenticación y el control de acceso.

---

## Framework frontend

**¿Qué?** Se eligió React para construir la interfaz de usuario y Vite como herramienta de desarrollo y construcción.

**¿Por qué?** Porque React permite dividir la interfaz en componentes reutilizables, lo que mantiene el código organizado y acelera el desarrollo. Vite, además, ofrece arranques muy rápidos y una compilación optimizada para producción.

**¿Para qué?** Para mejorar la productividad del equipo durante el desarrollo y ofrecer una aplicación frontend más eficiente y preparada para su despliegue.

---

## Base de datos

**¿Qué?** Cada microservicio cuenta con su propia base de datos PostgreSQL independiente.

**¿Por qué?** Porque PostgreSQL es una tecnología robusta, ampliamente utilizada en entornos empresariales y compatible con las herramientas de acceso a datos del proyecto. Además, el equipo ya tiene experiencia previa con esta base de datos.

**¿Para qué?** Para garantizar la integridad de los datos, facilitar una mejor gestión de la información y permitir que cada servicio mantenga su autonomía sin depender de una base de datos compartida.

---

## Mensajería asíncrona

**¿Qué?** Se incorporó RabbitMQ como sistema de mensajería asíncrona entre el servicio de reservas y el de pagos.

**¿Por qué?** Porque permite desacoplar la comunicación entre servicios mediante colas, y su configuración es más simple que la de otras alternativas como Kafka, que resultaba más compleja para las necesidades del proyecto.

**¿Para qué?** Para coordinar procesos entre microservicios de forma flexible, reducir dependencias directas y mejorar la escalabilidad y mantenibilidad del sistema.

---

[Volver a Documentación](../Documentación.md)
