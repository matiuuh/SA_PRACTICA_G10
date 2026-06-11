# Principios SOLID aplicados al Módulo de Administrador


## Índice
- [S — Responsabilidad Única](#responsabilidad-única)
- [O — Abierto/Cerrado](#abiertocerrado)
- [L — Sustitución de Liskov](#sustitución-de-liskov)
- [I — Segregación de Interfaces](#i--segregación-de-interfaces)
- [D — Inversión de Dependencias](#inversión-de-dependencias)

## Contexto del Administrador en el Proyecto

El administrador es un actor clave que opera sobre múltiples microservicios (localidades, funciones, películas, auth) con permisos elevados. A continuación, se justifica cómo cada principio SOLID se evidencia específicamente en las operaciones que realiza el administrador.

---

## Responsabilidad Única 

**Principio:** Una clase debe tener una sola razón para cambiar.

### Justificación en el contexto del administrador

En el proyecto, la separación de responsabilidades permite que las operaciones de administrador estén claramente diferenciadas de las operaciones públicas. Cada controlador tiene un rol único y no mezcla responsabilidades.

#### Ejemplo 1: Controladores separados para administrador

El servicio de localidades define **dos controladores distintos**:

- `LocalidadesController`: maneja operaciones públicas (consultas)

[Localidades.controller.ts](../../Backend/services/localidades-service/src/localidades/localidades.controller.ts)

- `AdminLocalidadesController`: maneja operaciones exclusivas de administrador (creación, actualización, eliminación)

[admin-localidades.controller.ts](../../Backend/services/localidades-service/src/localidades/admin-localidades.controller.ts)



```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR')
@Controller('admin/localidades')
export class AdminLocalidadesController {
  @Post('ciudades')
  createCiudad(@Body() dto: CreateCiudadDto) { ... }
  
  @Patch('ciudades/:id')
  updateCiudad(@Param('id') id: string, @Body() dto: UpdateCiudadDto) { ... }
  
  @Delete('ciudades/:id')
  removeCiudad(@Param('id') id: string) { ... }
}
```

**¿Por qué cumple SRP?**

- Si cambia la lógica de negocio para crear ciudades, solo se modifica LocalidadesService

- Si cambia la forma de exponer la API de administrador, solo se modifica AdminLocalidadesController

- Si cambian las reglas de autenticación, solo se modifican los guards


**Ejemplo 2: Servicio centralizado con responsabilidad única**


```typescript
// LocalidadesService - Única responsabilidad: lógica de negocio de localidades
@Injectable()
export class LocalidadesService {
  constructor(
    @InjectRepository(Ciudad)
    private readonly ciudadesRepository: Repository<Ciudad>,
    @InjectRepository(Cine)
    private readonly cinesRepository: Repository<Cine>,
  ) {}

  async createCiudad(dto: CreateCiudadDto): Promise<Ciudad> {
    // Solo lógica de negocio, no HTTP, no autenticación
    const ciudad = this.ciudadesRepository.create({
      id: randomUUID(),
      nombre: dto.nombre.trim(),
    });
    return this.ciudadesRepository.save(ciudad);
  }
}
```

[localidades.service.ts](../../Backend/services/localidades-service/src/localidades/localidades.service.ts)


**Razón de cambio única para el administrador:** Si se modifica la validación de datos de una ciudad (ej: agregar código postal), solo cambia LocalidadesService, no los controladores ni los guards.

## Abierto/Cerrado 

**Principio:** Las entidades deben estar abiertas para extensión, pero cerradas para modificación.

### Justificación en el contexto del administrador

El sistema permite agregar nuevas acciones para administradores sin modificar el código existente de autenticación y autorización.

#### Ejemplo: Sistema de roles extensible

El `RolesGuard` está cerrado para modificación pero abierto para extensión mediante el decorador `@Roles`:

```typescript
// RolesGuard - CERRADO para modificación
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Lógica genérica que no necesita cambiar al agregar nuevos roles
    return requiredRoles.includes(request.user?.rol);
  }
}
```

[roles.guard.ts](../../Backend/services/funciones-service/src/auth/roles.guard.ts)

**Extensión para nuevo rol de administrador:**

```typescript
// Para proteger un endpoint con un rol específico, solo se extiende el comportamiento
@Post('backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMINISTRADOR')  // Nuevo rol, sin modificar el guard
createBackup() { ... }
```

#### Ejemplo: DTOs de actualización con PartialType

```typescript
// CreatePeliculaDto - Definición base
export class CreatePeliculaDto {
  @IsString() titulo: string;
  @IsString() sinopsis?: string;
  @IsUUID() id_categoria: string;
}



// UpdatePeliculaDto - EXTIENDE sin modificar la clase base
export class UpdatePeliculaDto extends PartialType(CreatePeliculaDto) {}
```

[create-pelicula.dto.ts](../../Backend/services/funciones-service/src/funciones/dto/create-pelicula.dto.ts)

**Beneficio para el administrador:** Cuando se agrega un nuevo campo a `CreatePeliculaDto` (ej: `fecha_estreno`), automáticamente `UpdatePeliculaDto` lo hereda como opcional, permitiendo al administrador actualizar ese campo sin modificar el DTO de actualización.

## Sustitución de Liskov 

**Principio:** Las clases derivadas deben poder sustituir a sus clases base sin alterar el comportamiento del programa.

### Justificación en el contexto del administrador

El sistema de autenticación permite que cualquier estrategia de validación de tokens pueda sustituir a `JwtStrategy` sin afectar los endpoints protegidos del administrador.

#### Ejemplo: Estrategia JWT sustituible

```typescript
// Contrato que deben respetar las estrategias de autenticación
export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
}

// Implementación concreta - puede ser sustituida
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      nombre: payload.name,
      correo: payload.email,
      rol: payload.role, // El rol del administrador se extrae del token
    };
  }
}

// Guard - funciona con cualquier estrategia que cumpla el contrato
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```
[jwt-payload.interface.ts](../../Backend/services/auth-service/src/auth/interfaces/jwt-payload.interface.ts)

**¿Qué significa para el administrador?**

Si en el futuro se decide:

- Usar tokens con formato diferente (ej: JWT con campos anidados)
- Usar OAuth2 con proveedores externos
- Usar sesiones en lugar de JWT

Se puede crear una nueva estrategia que sustituya a `JwtStrategy` sin modificar ni un solo controlador de administrador. El `RolesGuard` seguirá funcionando porque espera `request.user.rol`, independientemente de cómo se obtuvo.

```typescript
// Nueva estrategia que sustituye a JwtStrategy sin romper nada
@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
  validate(profile: any) {
    return {
      id: profile.id,
      nombre: profile.displayName,
      correo: profile.emails[0].value,
      rol: profile.role || 'CLIENTE', // Mismo contrato esperado
    };
  }
}
```

**Beneficio para el administrador:** Los controladores administrativos dependen únicamente de la información presente en `request.user`, no de la implementación específica que la genera. Esto permite reemplazar mecanismos de autenticación sin afectar las funcionalidades de gestión de películas, funciones, localidades o pagos.

## Segregación de Interfaces 

**Principio:** Ningún cliente debe depender de métodos que no usa.

### Justificación en el contexto del administrador

El administrador opera sobre diferentes entidades (ciudades, cines, salas, películas y funciones). Cada operación recibe DTOs específicos con únicamente los campos necesarios para realizar la acción correspondiente, evitando interfaces excesivamente grandes con atributos irrelevantes.

#### Ejemplo 1: DTOs específicos para cada acción del administrador

```typescript
// El administrador crea una ciudad - SOLO necesita nombre
export class CreateCiudadDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}

// El administrador crea un cine - necesita nombre, dirección y ciudad
export class CreateCineDto {
  @IsString() nombre: string;
  @IsString() direccion: string;
  @IsUUID() idCiudad: string;
}

// El administrador crea una sala - necesita nombre, capacidad, tipo y cine
export class CreateSalaDto {
  @IsString() nombre: string;
  @IsInt()
  @Min(1)
  capacidad: number;

  @IsOptional()
  @IsString()
  tipoSala?: string;

  @IsUUID()
  idCine: string;
}
```

[textcreate-ciudad.dto.ts](../../Backend/services/localidades-service/src/localidades/dto/create-ciudad.dto.ts)

**Beneficio:** Un DTO genérico como `CreateLocalidadDto` obligaría al administrador a proporcionar campos que no corresponden a la entidad que desea crear.

- Crear una ciudad requeriría atributos como `direccion`, `capacidad` o `tipoSala`, que no tienen sentido para una ciudad.
- Crear un cine requeriría campos relacionados con salas, como `capacidad` o `tipoSala`.
- Las validaciones serían más complejas y existirían dependencias innecesarias entre entidades distintas.

Esto violaría el principio ISP porque cada operación dependería de información que realmente no utiliza.

#### Ejemplo 2: Controladores segregados por tipo de operación

El administrador dispone de endpoints independientes para cada recurso, evitando un controlador monolítico que centralice todas las operaciones.

```typescript
// AdminLocalidadesController - métodos específicos para cada recurso

@Post('ciudades')     // Solo para ciudades
createCiudad() { ... }

@Post('cines')        // Solo para cines
createCine() { ... }

@Post('salas')        // Solo para salas
createSala() { ... }
```

Si existiera un único endpoint como `@Post('crear')` que recibiera un parámetro `tipo`, el controlador tendría que incluir validaciones condicionales y lógica adicional para determinar qué entidad crear. Esto haría que los clientes dependieran de comportamientos y parámetros que no necesitan utilizar.

**Beneficio para el administrador:** Cada operación utiliza contratos específicos y minimalistas, facilitando el mantenimiento, reduciendo errores de validación y permitiendo que cada recurso evolucione de manera independiente sin afectar a los demás.

## Inversión de Dependencias

**Principio:** Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.

### Justificación en el contexto del administrador

El administrador realiza operaciones sobre localidades, películas, funciones y pagos a través de servicios que dependen de abstracciones proporcionadas por el framework, como repositorios de TypeORM y servicios especializados. De esta manera, la lógica de negocio permanece desacoplada de las tecnologías concretas utilizadas para almacenamiento o comunicación.

#### Ejemplo 1: Servicio de localidades con dependencias inyectadas

```typescript
@Injectable()
export class LocalidadesService {
  constructor(
    @InjectRepository(Ciudad)
    private readonly ciudadesRepository: Repository<Ciudad>,

    @InjectRepository(Cine)
    private readonly cinesRepository: Repository<Cine>,

    @InjectRepository(Sala)
    private readonly salasRepository: Repository<Sala>,
  ) {}
}
```

**¿Qué permite esto para el administrador?**

- La base de datos puede cambiar de PostgreSQL a MySQL sin modificar `LocalidadesService`.
- La estrategia de conexión puede cambiar (pooling, réplicas de lectura, balanceo de carga) sin afectar la lógica de negocio.
- Las pruebas unitarias pueden utilizar repositorios simulados (mocks) sin necesidad de una base de datos real.

La lógica utilizada por el administrador para crear, actualizar o eliminar localidades depende únicamente de la abstracción `Repository<T>` y no de una implementación específica de almacenamiento.

#### Ejemplo 2: Servicio de pagos con dependencia de mensajería

```typescript
@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,

    private readonly rabbitMqService: RabbitMqService,
  ) {}

  async createPago(createPagoDto: CreatePagoDto): Promise<Pago> {
    // Lógica de negocio

    await this.rabbitMqService.publish('pago.creado', pago);
  }
}
```

**Beneficio para el administrador:** Si el sistema de mensajería cambia de RabbitMQ a Kafka, Amazon SQS o cualquier otra tecnología, únicamente se modifica la implementación encargada de la comunicación. La lógica de negocio contenida en `PagosService` permanece intacta y las funcionalidades administrativas continúan operando de la misma manera.

#### Ejemplo 3: Controladores que dependen de servicios

```typescript
@Controller('admin/localidades')
export class AdminLocalidadesController {
  constructor(
    private readonly localidadesService: LocalidadesService,
  ) {}

  @Post('ciudades')
  createCiudad(@Body() dto: CreateCiudadDto) {
    return this.localidadesService.createCiudad(dto);
  }
}
```

El controlador administrativo no conoce detalles sobre la persistencia de datos ni sobre la infraestructura utilizada. Su única responsabilidad es delegar la solicitud al servicio correspondiente.

**Beneficio para el administrador:** Los controladores administrativos permanecen desacoplados de la tecnología utilizada internamente. Si `LocalidadesService` cambia su implementación para utilizar otro motor de base de datos o incluso una API externa, el controlador seguirá funcionando sin modificaciones.

### Conclusión

El principio de Inversión de Dependencias se evidencia en todo el módulo administrativo mediante la inyección de dependencias proporcionada por NestJS. Los controladores dependen de servicios, los servicios dependen de abstracciones como `Repository<T>` o servicios especializados, y las implementaciones concretas quedan ocultas detrás de estas abstracciones. Esto facilita el mantenimiento, las pruebas y la evolución tecnológica del sistema sin afectar las funcionalidades que utiliza el administrador.