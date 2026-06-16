# Principios SOLID aplicados

## Índice
- [S — Responsabilidad Única](#responsabilidad-única)
- [O — Abierto/Cerrado](#abiertocerrado)
- [L — Sustitución de Liskov](#sustitución-de-liskov)
- [I — Segregación de Interfaces](#i--segregación-de-interfaces)
- [D — Inversión de Dependencias](#inversión-de-dependencias)

---

## Responsabilidad Única

**Principio:** Una clase debe tener una sola razón para cambiar.

En el proyecto, este principio se aplica mediante la separación estricta de responsabilidades entre controladores, servicios y repositorios en cada microservicio. Cada clase tiene un rol bien definido y no mezcla responsabilidades.

### Microservicios generales

El controlador de localidades únicamente recibe las peticiones HTTP y las delega al servicio. No contiene lógica de negocio ni acceso a datos.

##### [localidades.controller.ts](../../../Practica2/Backend/services/localidades-service/src/localidades/localidades.controller.ts)
```typescript
@Controller('localidades')
export class LocalidadesController {
  constructor(private readonly localidadesService: LocalidadesService) {}

  @Get('ciudades')
  findCiudades() {
    return this.localidadesService.findCiudades();
  }

  @Post('ciudades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  createCiudad(@Body() createCiudadDto: CreateCiudadDto) {
    return this.localidadesService.createCiudad(createCiudadDto);
  }

  @Post('cines')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  createCine(@Body() createCineDto: CreateCineDto) {
    return this.localidadesService.createCine(createCineDto);
  }
}
```
![Localidades](/Doc/Solid/img/localidades_controller.png)

##### [localidades.service.ts](../../../Practica2/Backend/services/localidades-service/src/localidades/localidades.service.ts)

El servicio concentra toda la lógica de negocio: validaciones, creación de entidades y gestión de relaciones. No conoce nada del protocolo HTTP.

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

  async createCiudad(dto: CreateCiudadDto): Promise<Ciudad> {
    const ciudad = this.ciudadesRepository.create({
      id: randomUUID(),
      nombre: dto.nombre.trim(),
    });
    return this.ciudadesRepository.save(ciudad);
  }

  async createCine(dto: CreateCineDto): Promise<Cine> {
    const ciudad = await this.ensureCiudadExists(dto.idCiudad);
    const cine = this.cinesRepository.create({
      id: randomUUID(),
      nombre: dto.nombre.trim(),
      direccion: dto.direccion.trim(),
      ciudad,
    });
    return this.cinesRepository.save(cine);
  }
}
```
![Localidades](/Doc/Solid/img/localidades_service.png)

Si cambia la forma en que se expone la API (de REST a GraphQL), solo se modifica el controlador. Si cambia la lógica de negocio, solo se modifica el servicio.

### Módulo de Administrador

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

- Si cambia la lógica de negocio para crear ciudades, solo se modifica `LocalidadesService`.
- Si cambia la forma de exponer la API de administrador, solo se modifica `AdminLocalidadesController`.
- Si cambian las reglas de autenticación, solo se modifican los guards.

### Carga masiva de películas (CSV)

La carga masiva respeta SRP distribuyendo cada responsabilidad en una capa distinta:

- **`PeliculasController`** expone el endpoint `POST /peliculas/carga-csv` y delega el archivo al servicio. No sabe nada de parsing ni de base de datos.

##### [peliculas.controller.ts](../../../Practica2/Backend/services/funciones-service/src/funciones/controllers/peliculas.controller.ts)
```typescript
@Post('carga-csv')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR')
@UseInterceptors(FileInterceptor('file'))
importCsv(@UploadedFile() file: any) {
  return this.peliculasService.importCsv(file);
}
```

- **`PeliculasService`** contiene métodos privados con responsabilidades únicas: `parseCsv` para leer el buffer, `parseCsvLine` para tokenizar cada línea, `mapCsvRowToDto` para convertir la fila a DTO, y `resolveCategoriaId` / `resolveTipoCarteleraId` para resolver entidades relacionadas. Ninguno de estos métodos hace más de una cosa.

##### [peliculas.service.ts](../../../Practica2/Backend/services/funciones-service/src/funciones/services/peliculas.service.ts)
```typescript
async importCsv(file: any): Promise<PeliculasCsvImportResult> {
  if (!file?.buffer) {
    throw new BadRequestException('Debes enviar un archivo CSV en el campo "file"');
  }

  const rows = this.parseCsv(file.buffer.toString('utf8'));
  // ...
  for (const row of rows) {
    try {
      await this.create(await this.mapCsvRowToDto(row.data));
      result.insertadas += 1;
    } catch (error) {
      result.fallidas += 1;
      result.errores.push({ fila: row.line, error: (error as Error).message });
    }
  }
  return result;
}
```

- **`import-peliculas-csv.dto.ts`** define únicamente los contratos de datos (`CsvPeliculaRow`, `PeliculasCsvImportResult`, `PeliculasCsvImportError`) sin mezclar lógica de negocio.

[Volver al índice](#índice)

---

## Abierto/Cerrado

**Principio:** Las entidades deben estar abiertas para extensión, pero cerradas para modificación.

Este principio se aplica de dos formas en el proyecto: en los guards de autenticación y en los DTOs de actualización.

### RolesGuard y decorador @Roles

El `RolesGuard` está diseñado para ser extendido mediante metadatos. Para agregar un nuevo rol al sistema, no se toca la implementación del guard; basta con usar el decorador en el endpoint correspondiente.

##### [roles.guard.ts](../../../Practica2/Backend/services/funciones-service/src/auth/roles.guard.ts)

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    return requiredRoles.includes(request.user?.rol);
  }
}
```
![RolesGuard](/Doc/Solid/img/roles_guard.png)

##### [roles.decorator.ts](../../../Practica2/Backend/services/funciones-service/src/auth/roles.decorator.ts)
```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

Para proteger un endpoint con un nuevo rol, simplemente se anota el método:

```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('NUEVO_ROL')
create(@Body() dto: CreateFuncionDto) {
  return this.funcionesService.create(dto);
}
```
![Decorator](/Doc/Solid/img/roles_decorator.png)

El guard no necesita modificarse en ningún momento. Para agregar un rol de administrador especial bastará con:

```typescript
@Post('backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMINISTRADOR')  // Nuevo rol, sin modificar el guard
createBackup() { ... }
```

### DTOs de actualización con PartialType

Los DTOs de actualización extienden los de creación sin duplicar código ni modificar la clase base:

```typescript
// update-pelicula.dto.ts
export class UpdatePeliculaDto extends PartialType(CreatePeliculaDto) {}

// update-funcion.dto.ts
export class UpdateFuncionDto extends PartialType(CreateFuncionDto) {}

// update-sala.dto.ts
export class UpdateSalaDto extends PartialType(CreateSalaDto) {}
```

[create-pelicula.dto.ts](../../Backend/services/funciones-service/src/funciones/dto/create-pelicula.dto.ts)

Si se agrega un campo a `CreatePeliculaDto`, `UpdatePeliculaDto` lo hereda automáticamente como opcional. La clase de actualización se extiende sin necesidad de modificarla.

### Carga masiva de películas (CSV)

El pipeline de carga masiva está cerrado para modificación: agregar soporte para un nuevo campo en el CSV (por ejemplo `fecha_estreno`) solo requiere añadirlo a `CsvPeliculaRow` y a `CreatePeliculaDto`, sin tocar la lógica central de `importCsv`, `parseCsv` ni `parseCsvLine`.

```typescript
// import-peliculas-csv.dto.ts — se extiende con nuevos campos sin modificar la lógica
export interface CsvPeliculaRow {
  titulo: string;
  sinopsis?: string;
  duracion_minutos?: string;
  poster_url?: string;
  categoria?: string;
  tipo_cartelera?: string;
  id_categoria?: string;
  id_tipo_cartelera?: string;
  activa?: string;
  // fecha_estreno?: string;  ← nuevo campo sin romper nada existente
}
```

[Volver al índice](#índice)

---

## Sustitución de Liskov

**Principio:** Las clases derivadas deben poder sustituir a sus clases base sin alterar el comportamiento del programa.

Este principio se aplica en la capa de autenticación a través de la abstracción de estrategias de Passport.

### JwtStrategy y JwtAuthGuard

`JwtStrategy` extiende `PassportStrategy`, implementando el contrato que Passport espera. El guard no depende de la implementación concreta de la estrategia, sino de la abstracción `AuthGuard`.

##### [jwt.strategy.ts](../../../Practica2/Backend/services/auth-service/src/auth/strategies/jwt.strategy.ts)
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'change_this_secret'),
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      nombre: payload.name,
      correo: payload.email,
      rol: payload.role,
    };
  }
}
```

![JwtStrategy](/Doc/Solid/img/jwt_strategy.png)

##### [jwt-auth.guard.ts](../../../Practica2/Backend/services/auth-service/src/auth/guards/jwt-auth.guard.ts)
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

Gracias a este diseño, si en el futuro se necesita incorporar una nueva estrategia de autenticación, puede coexistir con la actual sin modificar el guard ni los controladores que ya lo usan.

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

[jwt-payload.interface.ts](../../Backend/services/auth-service/src/auth/interfaces/jwt-payload.interface.ts)

Los controladores administrativos dependen únicamente de la información presente en `request.user`, no de la implementación específica que la genera. Esto permite reemplazar mecanismos de autenticación (OAuth2, sesiones, JWT con campos anidados) sin afectar las funcionalidades de gestión de películas, funciones, localidades o pagos.

### Carga masiva de películas (CSV)

El método `importCsv` delega la creación individual a `this.create(dto)`, que acepta cualquier `CreatePeliculaDto` válido. Las filas del CSV se mapean a ese mismo DTO sin importar su origen, por lo que el flujo de creación es sustituible por cualquier fuente de datos que produzca el mismo contrato.

[Volver al índice](#índice)

---

## I — Segregación de Interfaces

**Principio:** Ningún cliente debe depender de métodos o campos que no usa.

En lugar de crear un DTO genérico para todas las operaciones, el proyecto define DTOs específicos para cada caso de uso. Cada cliente solo recibe y valida los campos que realmente necesita.

### DTOs del servicio de localidades

Tres operaciones distintas, tres contratos distintos:

> Ver archivos: [create-ciudad.dto.ts](../../../Practica2/Backend/services/localidades-service/src/localidades/dto/create-ciudad.dto.ts) · [create-cine.dto.ts](../../../Practica2/Backend/services/localidades-service/src/localidades/dto/create-cine.dto.ts) · [create-sala.dto.ts](../../../Practica2/Backend/services/localidades-service/src/localidades/dto/create-sala.dto.ts)

```typescript
// create-ciudad.dto.ts
export class CreateCiudadDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}

// create-cine.dto.ts
export class CreateCineDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  direccion!: string;

  @IsUUID()
  idCiudad!: string;
}

// create-sala.dto.ts
export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsInt()
  @Min(1)
  capacidad!: number;

  @IsOptional()
  @IsString()
  tipoSala?: string;

  @IsUUID()
  idCine!: string;
}
```
![DTOs ISP](/Doc/Solid/img/dto_i.png)

### DTOs del servicio de pagos

Cada entidad del dominio de pagos tiene su propio contrato:

> Ver archivos: [create-pago.dto.ts](../../../Practica2/Backend/services/pagos-service/src/pagos/dto/create-pago.dto.ts) · [create-metodo-pago.dto.ts](../../../Practica2/Backend/services/pagos-service/src/pagos/dto/create-metodo-pago.dto.ts) · [create-estado-pago.dto.ts](../../../Practica2/Backend/services/pagos-service/src/pagos/dto/create-estado-pago.dto.ts)

```typescript
// create-pago.dto.ts
export class CreatePagoDto {
  @IsUUID()
  reservaIdExterna!: string;

  @IsNumber()
  @Min(0)
  monto!: number;

  @IsUUID()
  idMetodo!: string;

  @IsOptional()
  @IsString()
  referencia?: string;
}

// create-metodo-pago.dto.ts
export class CreateMetodoPagoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}

// create-estado-pago.dto.ts
export class CreateEstadoPagoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
```

![DTOs ISP II](/Doc/Solid/img/dto_ii.png)

### Carga masiva de películas (CSV)

La carga masiva aplica ISP mediante DTOs y contratos independientes para cada etapa del proceso:

- **`CsvPeliculaRow`**: contrato de la fila del CSV, solo los campos que el archivo puede contener.
- **`CreatePeliculaDto`**: contrato de creación, solo los campos validados necesarios para persistir una película.
- **`PeliculasCsvImportResult`** / **`PeliculasCsvImportError`**: contratos del resultado, sin mezclar campos de fila cruda con el resumen de la operación.

[import-peliculas-csv.dto.ts](../../../Practica2/Backend/services/funciones-service/src/funciones/dto/import-peliculas-csv.dto.ts)

```typescript
export interface CsvPeliculaRow {
  titulo: string;
  sinopsis?: string;
  duracion_minutos?: string;
  poster_url?: string;
  categoria?: string;
  tipo_cartelera?: string;
  id_categoria?: string;
  id_tipo_cartelera?: string;
  activa?: string;
}

export interface PeliculasCsvImportResult {
  insertadas: number;
  fallidas: number;
  errores: PeliculasCsvImportError[];
}

export interface PeliculasCsvImportError {
  fila: number;
  error: string;
}
```

Si se usara un único DTO genérico, los endpoints de creación de métodos de pago recibirían campos como `monto` o `reservaIdExterna` que no les corresponden, y el endpoint de carga CSV recibiría campos de HTTP form que no necesita. Con este diseño, cada endpoint recibe exactamente los campos que necesita.

[Volver al índice](#índice)

---

## Inversión de Dependencias

**Principio:** Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.

Este principio se implementa mediante inyección de dependencias en todos los servicios del proyecto. Ningún servicio instancia sus dependencias directamente; todas son inyectadas por NestJS en el constructor.

### AuthService

> [auth.service.ts](../../../Practica2/Backend/services/auth-service/src/auth/auth.service.ts)

`AuthService` depende de abstracciones como `UsersService`, `JwtService` y `ConfigService`, no de implementaciones concretas:

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.correo, loginDto.password);
    return this.buildAuthResponse(user);
  }
}
```

### UsersService con @InjectRepository

El acceso a la base de datos se realiza a través de la abstracción `Repository<T>` de TypeORM, inyectada por el framework:

##### [users.service.ts](../../../Practica2/Backend/services/auth-service/src/users/users.service.ts)
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  findByEmail(correo: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { correo },
      relations: ['rol'],
    });
  }
}
```

### PagosService con múltiples dependencias

El servicio de pagos depende del servicio de mensajería sin conocer su implementación interna. Si en el futuro se reemplaza RabbitMQ por otra herramienta, este no necesita modificarse, siempre que el nuevo servicio cumpla el mismo contrato:

##### [pagos.service.ts](../../../Practica2/Backend/services/pagos-service/src/pagos/pagos.service.ts)
```typescript
@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,
    @InjectRepository(Transaccion)
    private readonly transaccionesRepository: Repository<Transaccion>,
    private readonly rabbitMqService: RabbitMqService,
  ) {}

  async createPago(createPagoDto: CreatePagoDto): Promise<Pago> {
    // lógica de negocio usando las dependencias inyectadas
    await this.rabbitMqService.publish('pago.creado', pago);
  }
}
```

![PagosService DIP](/Doc/Solid/img/pagos_sevice.png)
![AuthService DIP](/Doc/Solid/img/auth_service.png)

### Módulo de Administrador — LocalidadesService

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

- La base de datos puede cambiar de PostgreSQL a MySQL sin modificar `LocalidadesService`.
- Las pruebas unitarias pueden utilizar repositorios simulados (mocks) sin necesidad de una base de datos real.

### Carga masiva de películas (CSV)

`PeliculasService` aplica DIP en la carga masiva al depender de abstracciones para todo lo que no es parsing:

##### [peliculas.service.ts](../../../Practica2/Backend/services/funciones-service/src/funciones/services/peliculas.service.ts)
```typescript
@Injectable()
export class PeliculasService {
  constructor(
    @InjectRepository(Pelicula)
    private readonly repo: Repository<Pelicula>,
    private readonly categoriasService: CategoriasService,
    private readonly tipoCarteleraService: TipoCarteleraService,
  ) {}
}
```

- `repo: Repository<Pelicula>` oculta la implementación concreta de TypeORM; cambiar el motor de base de datos no requiere modificar `importCsv`.
- `categoriasService` y `tipoCarteleraService` son abstracciones de servicios: `resolveCategoriaId` y `resolveTipoCarteleraId` los invocan sin acoplarse a la forma en que cada servicio consulta su fuente de datos.
- Si en el futuro las categorías provienen de una API externa, basta con cambiar la implementación de `CategoriasService` sin tocar la lógica de carga masiva.

Esta misma estructura se repite en `ReservasService`, `FuncionesService` y `LocalidadesService`, donde todos los repositorios y servicios auxiliares son inyectados en el constructor, nunca instanciados manualmente con `new`.

[Volver al índice](#índice)

---

[Volver a Documentación](../Documentación.md)
