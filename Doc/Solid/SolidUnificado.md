# Principios SOLID aplicados

## Índice

- [Funcionalidad 1 — Microservicios generales (localidades, autenticación, pagos)](#funcionalidad-1--microservicios-generales-localidades-autenticación-pagos)
- [Funcionalidad 2 — Módulo de administrador (localidades)](#funcionalidad-2--módulo-de-administrador-localidades)
- [Funcionalidad 3 — Carga masiva de películas (CSV)](#funcionalidad-3--carga-masiva-de-películas-csv)
- [Funcionalidad 4 — Generación y lectura de archivos de tickets/boletos](#funcionalidad-4--generación-y-lectura-de-archivos-de-ticketsboletos)
- [Funcionalidad 5 — Ingreso y respuesta de incidencias](#funcionalidad-5--ingreso-y-respuesta-de-incidencias)
- [Funcionalidad 6 — Validaciones de tickets del administrador](#funcionalidad-6--validaciones-de-tickets-del-administrador)

---

## Funcionalidad 1 — Microservicios generales (localidades, autenticación, pagos)

### S — Responsabilidad Única

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

### L — Sustitución de Liskov

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

### I — Segregación de Interfaces

En lugar de crear un DTO genérico para todas las operaciones, el proyecto define DTOs específicos para cada caso de uso. Cada cliente solo recibe y valida los campos que realmente necesita.

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

### D — Inversión de Dependencias

`AuthService` depende de abstracciones como `UsersService`, `JwtService` y `ConfigService`, no de implementaciones concretas:

> [auth.service.ts](../../../Practica2/Backend/services/auth-service/src/auth/auth.service.ts)

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

El servicio de pagos depende del servicio de mensajería sin conocer su implementación interna. Si en el futuro se reemplaza RabbitMQ por otra herramienta, este no necesita modificarse:

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

[Volver al índice](#índice)

---

## Funcionalidad 2 — Módulo de administrador (localidades)

### S — Responsabilidad Única

El servicio de localidades define **dos controladores distintos** en lugar de uno sobrecargado:

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

### O — Abierto/Cerrado

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

### D — Inversión de Dependencias

`LocalidadesService` recibe sus repositorios inyectados por el framework:

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

[Volver al índice](#índice)

---

## Funcionalidad 3 — Carga masiva de películas (CSV)

### S — Responsabilidad Única

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

### O — Abierto/Cerrado

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

### L — Sustitución de Liskov

El método `importCsv` delega la creación individual a `this.create(dto)`, que acepta cualquier `CreatePeliculaDto` válido. Las filas del CSV se mapean a ese mismo DTO sin importar su origen, por lo que el flujo de creación es sustituible por cualquier fuente de datos que produzca el mismo contrato.

### I — Segregación de Interfaces

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

Si se usara un único DTO genérico, los endpoints de creación de métodos de pago recibirían campos como `monto` o `reservaIdExterna` que no les corresponden, y el endpoint de carga CSV recibiría campos de HTTP form que no necesita.

### D — Inversión de Dependencias

`PeliculasService` aplica DIP al depender de abstracciones para todo lo que no es parsing:

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

[Volver al índice](#índice)

---

## Funcionalidad 4 — Generación y lectura de archivos de tickets/boletos

Esta funcionalidad abarca la generación del PDF del boleto (`PdfTicketDocumentGenerator`), la descarga por parte del usuario/administrador (`TicketDownloadService`), y la consulta del historial de boletos del usuario (`TicketHistoryService`).

### S — Responsabilidad Única

Cada clase tiene exactamente una razón para cambiar:

- **`PdfTicketDocumentGenerator`** ([pdf-ticket-document.generator.ts](../../Backend/services/reservas-service/src/reservas/services/pdf-ticket-document.generator.ts)) se encarga exclusivamente de construir el documento PDF a partir de los datos del ticket. No sabe nada de HTTP, de base de datos ni de permisos. Sus métodos privados también tienen responsabilidades únicas: `buildPdf` arma el documento, `writeDetail` renderiza un campo con etiqueta y valor, y `sanitizeFilename` limpia el nombre del archivo.

```typescript
@Injectable()
export class PdfTicketDocumentGenerator implements TicketDocumentGenerator {
  async generate(ticket: TicketHistoryItem): Promise<TicketDocument> {
    const qr = await QRCode.toBuffer(ticket.codigoQr, { type: 'png', width: 280 });
    const content = await this.buildPdf(ticket, qr);
    return {
      filename: `boleto-${this.sanitizeFilename(ticket.codigoQr)}.pdf`,
      contentType: 'application/pdf',
      content,
    };
  }

  private buildPdf(ticket: TicketHistoryItem, qr: Buffer): Promise<Buffer> { ... }
  private writeDetail(document, label, value, x, y, labelColor, valueColor) { ... }
  private sanitizeFilename(value: string): string { ... }
}
```

- **`TicketDownloadService`** ([ticket-download.service.ts](../../Backend/services/reservas-service/src/reservas/services/ticket-download.service.ts)) se encarga únicamente de buscar el boleto, verificar permisos y delegar la generación del documento. No sabe cómo se construye el PDF.

```typescript
@Injectable()
export class TicketDownloadService {
  async download(ticketId: string, usuarioId: string, rol?: string): Promise<TicketDocument> {
    const boleto = await this.boletosRepository.findOne({ ... });
    if (!boleto) throw new NotFoundException('Boleto no encontrado');
    if (rol !== 'ADMINISTRADOR' && boleto.reserva.usuarioIdExterno !== usuarioId)
      throw new ForbiddenException('No puedes descargar este boleto');
    return this.documentGenerator.generate(mapTicketHistoryItem(boleto));
  }
}
```

- **`TicketHistoryService`** ([ticket-history.service.ts](../../Backend/services/reservas-service/src/reservas/services/ticket-history.service.ts)) se encarga únicamente de consultar y paginar el historial de boletos de un usuario. No genera documentos ni valida accesos. Su método privado `applyFilters` centraliza la aplicación de criterios de búsqueda sobre un `QueryBuilder`.

- **`mapTicketHistoryItem`** ([ticket-history.mapper.ts](../../Backend/services/reservas-service/src/reservas/mappers/ticket-history.mapper.ts)) es una función pura cuya única responsabilidad es transformar la entidad `Boleto` a la interfaz `TicketHistoryItem`. No ejecuta consultas ni genera archivos.

```typescript
export const mapTicketHistoryItem = (boleto: Boleto): TicketHistoryItem => ({
  id: boleto.id,
  codigoQr: boleto.codigoQr,
  estado: boleto.estado,
  fechaEmision: boleto.fechaEmision,
  fechaUso: boleto.fechaUso ?? null,
  validadoPor: boleto.validadoPor ?? null,
  reserva: { id: boleto.reserva.id, usuarioId: boleto.reserva.usuarioIdExterno, ... },
  funcion: { id: boleto.idFuncionExterna ?? null, ... },
  pelicula: { id: boleto.idPeliculaExterna ?? null, titulo: boleto.tituloPelicula ?? null },
  asientos: (boleto.reserva.detalles ?? []).map(...).sort(...),
});
```

### O — Abierto/Cerrado

La interfaz `TicketDocumentGenerator` define el contrato de generación de documentos. Agregar un nuevo formato (por ejemplo HTML o DOCX) no requiere modificar `TicketDownloadService` ni ningún servicio consumidor: basta con implementar la interfaz y registrar el nuevo proveedor.

[ticket-document-generator.interface.ts](../../Backend/services/reservas-service/src/reservas/interfaces/ticket-document-generator.interface.ts)

```typescript
export interface TicketDocumentGenerator {
  generate(ticket: TicketHistoryItem): Promise<TicketDocument>;
}
```

Por ejemplo, un generador HTML que coexistiría sin romper nada:

```typescript
@Injectable()
export class HtmlTicketDocumentGenerator implements TicketDocumentGenerator {
  async generate(ticket: TicketHistoryItem): Promise<TicketDocument> {
    return {
      filename: `boleto-${ticket.codigoQr}.html`,
      contentType: 'text/html',
      content: Buffer.from(`<h1>${ticket.pelicula.titulo}</h1>`),
    };
  }
}
```

De igual forma, `TicketHistoryService.applyFilters` está cerrado para modificación: añadir un nuevo criterio de filtro (por ejemplo `salaId`) solo requiere agregar la condición dentro del método sin alterar la firma pública ni el resto de la lógica.

### L — Sustitución de Liskov

`PdfTicketDocumentGenerator` implementa `TicketDocumentGenerator`. `TicketDownloadService` depende únicamente de la interfaz, por lo que cualquier implementación concreta puede sustituir a `PdfTicketDocumentGenerator` sin que el servicio de descarga necesite cambiar. El contrato que `TicketDownloadService` espera (`generate(ticket) → TicketDocument`) es respetado por cualquier implementación.

```typescript
@Injectable()
export class TicketDownloadService {
  constructor(
    @InjectRepository(Boleto)
    private readonly boletosRepository: Repository<Boleto>,
    @Inject(TICKET_DOCUMENT_GENERATOR)
    private readonly documentGenerator: TicketDocumentGenerator, // abstracción, no clase concreta
  ) {}
}
```

### I — Segregación de Interfaces

Cada operación sobre boletos tiene su propio DTO con únicamente los campos que necesita:

[paginate-ticket-history.dto.ts](../../Backend/services/reservas-service/src/reservas/dto/paginate-ticket-history.dto.ts)

```typescript
export class PaginateTicketHistoryDto {
  @IsOptional() page?: number = 1;
  @IsOptional() limit?: number = 10;
  @IsOptional() identificador?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) fechaDesde?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) fechaHasta?: string;
  @IsOptional() @IsEnum(EstadoBoleto) estado?: EstadoBoleto;
}
```

La interfaz `TicketDocument` solo declara los campos que un documento de boleto requiere, sin mezclar datos de la reserva ni del usuario:

```typescript
export interface TicketDocument {
  filename: string;
  contentType: string;
  content: Buffer;
}
```

La interfaz `TicketHistoryItem` agrupa los datos de presentación del ticket separados en sub-objetos (`reserva`, `funcion`, `pelicula`, `asientos`), evitando que cada consumidor reciba una entidad plana gigante con campos que no le corresponden.

### D — Inversión de Dependencias

`TicketDownloadService` no instancia `PdfTicketDocumentGenerator` directamente. En su lugar, depende del token de inyección `TICKET_DOCUMENT_GENERATOR` que resuelve la abstracción `TicketDocumentGenerator`. El módulo registra la implementación concreta:

[reservas.module.ts](../../Backend/services/reservas-service/src/reservas/reservas.module.ts)

```typescript
{
  provide: TICKET_DOCUMENT_GENERATOR,
  useExisting: PdfTicketDocumentGenerator,
}
```

Cambiar el generador de PDF por otro formato solo requiere modificar el proveedor en el módulo, sin tocar `TicketDownloadService`.

`TicketHistoryService` y `TicketDownloadService` reciben su acceso a datos mediante `Repository<Boleto>` inyectado por TypeORM, desacoplando completamente la lógica de negocio del motor de base de datos.

[Volver al índice](#índice)

---

## Funcionalidad 5 — Ingreso y respuesta de incidencias

Esta funcionalidad cubre el registro de incidencias por parte del usuario y la respuesta por parte del administrador, implementados en `IncidenciasService`.

### S — Responsabilidad Única

`IncidenciasService` ([incidencias.service.ts](../../Backend/services/reservas-service/src/reservas/services/incidencias.service.ts)) concentra toda la lógica de negocio de incidencias: creación, consulta paginada y respuesta. No gestiona HTTP ni autenticación. El controlador `ReservasController` es quien expone los endpoints y delega inmediatamente al servicio.

Cada método tiene una responsabilidad única y bien delimitada:

```typescript
async create(usuarioId: string, dto: CreateIncidenciaDto): Promise<Incidencia> {
  // Crea la incidencia en estado PENDIENTE
}

findByUser(usuarioId: string, query: PaginateIncidenciasDto) {
  // Devuelve solo las incidencias del usuario autenticado
}

async respond(id: string, respuesta: string, administradorId: string): Promise<Incidencia> {
  // Actualiza la incidencia a estado RESPONDIDA con la respuesta del administrador
}

private async findPaginated(
  query: PaginateIncidenciasDto,
  baseWhere: FindOptionsWhere<Incidencia> = {},
) {
  // Centraliza la lógica de paginación reutilizable por findByUser y findAll
}
```

### O — Abierto/Cerrado

La paginación de incidencias está cerrada para modificación: para agregar un nuevo tipo de filtro (por ejemplo `tipo` de incidencia) solo se extiende `PaginateIncidenciasDto` con el nuevo campo y se añade la condición en `findPaginated`, sin cambiar la firma de `findByUser` ni `findAll`.

[paginate-incidencias.dto.ts](../../Backend/services/reservas-service/src/reservas/dto/paginate-incidencias.dto.ts)

El estado de la incidencia al responder (`EstadoIncidencia.RESPONDIDA`) está gestionado mediante un enum, lo que permite añadir nuevos estados (por ejemplo `CERRADA`, `EN_REVISION`) sin modificar la lógica de `respond`.

### L — Sustitución de Liskov

`ReservasController` trata a `IncidenciasService` como un proveedor de operaciones sobre incidencias sin importar la forma en que internamente se persistan los datos. Si en el futuro `IncidenciasService` se extendiera en una subclase (por ejemplo `AuditedIncidenciasService` que registra cambios en un log de auditoría), el controlador seguiría funcionando sin modificaciones, ya que depende únicamente de los métodos públicos `create`, `findByUser`, `findAll` y `respond`.

### I — Segregación de Interfaces

Cada operación tiene su propio DTO con únicamente los campos que requiere:

[create-incidencia.dto.ts](../../Backend/services/reservas-service/src/reservas/dto/create-incidencia.dto.ts)

```typescript
export class CreateIncidenciaDto {
  @IsEnum(TipoIncidencia)
  tipo!: TipoIncidencia;

  @IsString() @MinLength(3) @MaxLength(120)
  asunto!: string;

  @IsString() @MinLength(10) @MaxLength(1000)
  descripcion!: string;
}
```

[respond-incidencia.dto.ts](../../Backend/services/reservas-service/src/reservas/dto/respond-incidencia.dto.ts)

```typescript
export class RespondIncidenciaDto {
  @IsString() @MinLength(3) @MaxLength(1000)
  respuesta!: string;
}
```

El endpoint de creación no recibe `respuesta` ni `administradorId` porque no los necesita. El endpoint de respuesta no recibe `tipo`, `asunto` ni `descripcion` porque ya existen en la incidencia. Cada contrato es mínimo y específico.

### D — Inversión de Dependencias

`IncidenciasService` no instancia su repositorio directamente; lo recibe inyectado por NestJS a través de `@InjectRepository(Incidencia)`:

```typescript
@Injectable()
export class IncidenciasService {
  constructor(
    @InjectRepository(Incidencia)
    private readonly incidenciasRepository: Repository<Incidencia>,
  ) {}
}
```

Esto desacopla la lógica de negocio del motor de base de datos subyacente. En pruebas unitarias, `Repository<Incidencia>` puede sustituirse por un mock sin modificar el servicio.

[Volver al índice](#índice)

---

## Funcionalidad 6 — Validaciones de tickets del administrador

Esta funcionalidad abarca los dos tipos de validación de boletos que el administrador puede ejecutar: validación por código QR (`validateByCode`) y validación manual por ID (`validateManually`), implementados en `TicketValidationService`, y la búsqueda/lectura de boletos desde el panel de administrador en `AdminTicketSearchService`.

### S — Responsabilidad Única

- **`TicketValidationService`** ([ticket-validation.service.ts](../../Backend/services/reservas-service/src/reservas/services/ticket-validation.service.ts)) tiene la única responsabilidad de validar un boleto: marcarlo como `USADO`, actualizar el estado de los asientos a `EN_USO` y emitir la notificación de disponibilidad por WebSocket. No genera documentos, no lista boletos, no gestiona incidencias.

  La separación interna también respeta SRP: `validateByCode` y `validateManually` construyen el selector apropiado y delegan a `validate`; `validate` ejecuta la transacción y dispara el evento WebSocket; `validateWithinTransaction` contiene toda la lógica de negocio dentro de la transacción.

```typescript
type TicketSelector =
  | { type: 'codigo'; value: string }
  | { type: 'id'; value: string };

validateByCode(codigo: string, administradorId: string) {
  return this.validate({ type: 'codigo', value: codigo.trim() }, administradorId);
}

validateManually(ticketId: string, administradorId: string) {
  return this.validate({ type: 'id', value: ticketId }, administradorId);
}

private async validate(selector: TicketSelector, administradorId: string) {
  const result = await this.dataSource.transaction((manager) =>
    this.validateWithinTransaction(manager, selector, administradorId),
  );
  if (result.funcionId) {
    this.reservasGateway.notifySeatAvailabilityChanged(result.funcionId);
  }
  return result.ticket;
}
```

- **`AdminTicketSearchService`** ([admin-ticket-search.service.ts](../../Backend/services/reservas-service/src/reservas/services/admin-ticket-search.service.ts)) tiene la única responsabilidad de construir y ejecutar la consulta de búsqueda paginada de boletos para el administrador. No valida boletos ni genera documentos. Sus métodos privados `isUuid` y `nextDay` tienen responsabilidades auxiliares únicas y bien acotadas.

### O — Abierto/Cerrado

`AdminTicketSearchService` está cerrado para modificación: agregar un nuevo filtro de búsqueda (por ejemplo `usuarioId` o `salaId`) solo requiere añadir el campo a `SearchAdminTicketsDto` y la condición al `QueryBuilder`, sin alterar los métodos existentes ni la firma de `search`.

[search-admin-tickets.dto.ts](../../Backend/services/reservas-service/src/reservas/dto/search-admin-tickets.dto.ts)

```typescript
export class SearchAdminTicketsDto {
  @IsOptional() page?: number = 1;
  @IsOptional() limit?: number = 10;
  @IsOptional() identificador?: string;
  @IsOptional() pelicula?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) fechaDesde?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) fechaHasta?: string;
  @IsOptional() @IsEnum(EstadoBoleto) estado?: EstadoBoleto;
}
```

El tipo `TicketSelector` en `TicketValidationService` está cerrado para el resto del sistema: agregar un tercer tipo de selector (por ejemplo búsqueda por NIT del comprador) solo requiere extender el union type y el `if/else` dentro de `validateWithinTransaction`, sin modificar los métodos públicos `validateByCode` ni `validateManually`.

### L — Sustitución de Liskov

`TicketValidationService` utiliza `DataSource` de TypeORM para ejecutar la transacción. Gracias a que `DataSource` es inyectado, puede ser reemplazado en pruebas unitarias por un mock que respete el contrato de `transaction(manager => ...)`. `ReservasGateway` también es inyectado, por lo que puede sustituirse sin modificar la lógica de validación.

En `AdminTicketSearchService`, `mapTicketHistoryItem` (función pura) actúa como transformador: cualquier entidad `Boleto` que satisfaga la estructura esperada puede ser mapeada sin romper el contrato de `PaginatedTicketHistory`.

### I — Segregación de Interfaces

Las dos operaciones de validación tienen DTOs distintos y mínimos:

[validate-ticket.dto.ts](../../Backend/services/reservas-service/src/reservas/dto/validate-ticket.dto.ts)

```typescript
export class ValidateTicketDto {
  @IsString() @IsNotEmpty() @MaxLength(255)
  codigo!: string;
}
```

La validación manual no necesita DTO propio porque el ID se pasa como parámetro de ruta (`@Param('id', ParseUUIDPipe)`). Cada endpoint recibe exactamente lo que necesita.

`AdminTicketSearchService` devuelve `PaginatedTicketHistory`, la misma interfaz que `TicketHistoryService`, pero con un DTO de entrada diferente (`SearchAdminTicketsDto` vs `PaginateTicketHistoryDto`). El administrador tiene el campo adicional `pelicula` para filtrar; el usuario no lo necesita y no lo recibe.

### D — Inversión de Dependencias

`TicketValidationService` no instancia `DataSource` ni `ReservasGateway` directamente; ambos son inyectados por NestJS:

```typescript
@Injectable()
export class TicketValidationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly reservasGateway: ReservasGateway,
  ) {}
}
```

`AdminTicketSearchService` recibe `Repository<Boleto>` inyectado, desacoplando la lógica de búsqueda del motor de base de datos:

```typescript
@Injectable()
export class AdminTicketSearchService {
  constructor(
    @InjectRepository(Boleto)
    private readonly boletosRepository: Repository<Boleto>,
  ) {}
}
```

El módulo `ReservasModule` ([reservas.module.ts](../../Backend/services/reservas-service/src/reservas/reservas.module.ts)) también aplica DIP registrando la implementación concreta de `FuncionCatalogClient` detrás del token `FUNCION_CATALOG_CLIENT`:

```typescript
{
  provide: FUNCION_CATALOG_CLIENT,
  useExisting: HttpFuncionCatalogClient,
}
```

Si el catálogo de funciones pasa a ser un servicio gRPC u otro protocolo, solo se cambia la implementación de `HttpFuncionCatalogClient` (o se registra una nueva clase con el mismo token), sin tocar ninguno de los servicios que lo consumen.

[Volver al índice](#índice)

---

[Volver a Documentación](../Documentación.md)
