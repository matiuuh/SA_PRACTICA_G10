# Documentacion de la Practica 1: FilmStars

Integrantes:

| Nombre completo                | Carnet    |
| ------------------------------ | --------- |
| Chacon Trampe Juan Esteban     | 202300431 |
| Diego Noriega Mateo Estuardo   | 202203009 |
| Hernandez Flores Daniel Andree | 202300512 |
| Lopez Leveron Estiben Yair     | 202204578 |
| Pablo Sosof Jens Jeremy        | 202102771 |

## Indice

### Documento principal

- [Documentacion general](./Documentación.md)

### Requerimientos

- [Requerimientos funcionales](./RF/RF.md)
- [Requerimientos no funcionales](./RNF/RNF.md)

### Analisis

- [Casos de uso](./CasosDeUso/casosDeUso.md)
- [Diagrama de actividades](./Diagramas_Actividades/Diagramas.md)
- [Diagramas entidad relacion](./ER/DiagramasER.md)

### Arquitectura

- [Vistas 4+1](./Vistas/Vistas_4+1.md)
- [Diagrama de arquitectura general](./Diagramas_Estructurales/Diagrama_Arquitectura_General.md)
- [Vista de componentes](./Vista%20de%20Arquitectura/Vista_de_Componentes.md)
- [Vista de despliegue](./Vista%20de%20Arquitectura/Vista_Despliegue.md)

## Introduccion

En esta practica se desarrollo una pagina web para la gestion de venta de boletos de la empresa **FilmStars**. El sistema permite a los usuarios consultar la cartelera de peliculas por ubicacion, seleccionar asientos de forma interactiva en tiempo real, procesar pagos y recibir boletos digitales con numero de confirmacion.

El proyecto esta construido sobre una arquitectura orientada a servicios (SOA) con patron de microservicios, donde cada dominio del negocio opera como un servicio independiente con su propia base de datos PostgreSQL. La comunicacion entre servicios combina REST/HTTPS para operaciones sincronicas y **RabbitMQ** como broker de mensajeria para el procesamiento asincrono de reservaciones, pagos y generacion de boletos, garantizando durabilidad de transacciones incluso ante fallos del sistema.

El frontend estará desarrollado con **React + Vite**, el backend con **Node.js y NestJS**, y toda la infraestructura esta contenedorizada con **Docker**, lo que permite despliegue tanto local como en la nube. Un **API Gateway centralizado** actua como unico punto de entrada, gestionando el enrutamiento, la autenticacion con JWT y el control de acceso.

Los actores principales del sistema son el **Cliente**, que realiza reservas y compras, y el **Administrador**, que gestiona la cartelera, funciones y salas.

Este archivo funciona como indice principal de la documentacion. Desde aqui se puede acceder a cada uno de los documentos del proyecto.

## Conclusiones

1. La arquitectura de microservicios permitirá al sistema escalar de forma independiente los modulos con mayor demanda, como reservaciones y pagos, lo que hace al sistema mas flexible y resistente ante cargas elevadas.

2. El uso de RabbitMQ como broker de mensajeria garantiza que las transacciones criticas no se pierdan ante fallos, desacoplando el procesamiento de pagos, reservas y boletos de manera segura.

3. La contenedorizacion con Docker simplifica tanto el desarrollo local como el despliegue en la nube, asegurando que el sistema funcione de forma consistente en cualquier entorno sin cambios en el codigo.
