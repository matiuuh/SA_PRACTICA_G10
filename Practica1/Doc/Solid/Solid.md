# Principios SOLID aplicados

## Índice
- [S — Responsabilidad Única](#responsabilidad-única)
- [O — Abierto/Cerrado](#abiertocerrado)
- [L — Sustitución de Liskov](#sustitución-de-liskov)
- [I — Segregación de Interfaces](#i--segregación-de-interfaces)
- [D — Inversión de Dependencias](#inversión-de-dependencias)

---

## Responsabilidad Única
En el proyecto, este principio se aplica mediante la separación estricta de responsabilidades entre controladores, servicios y repositorios en cada microservicio. Cada clase tiene un rol bien definido y no mezcla responsabilidades.

El controlador de localidades por ejemplo, únicamente recibe las peticiones HTTP y las delega al servicio. No contiene lógica de negocio ni acceso a datos.

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

##### [localidades.service.ts](../../../Practica2/Backend/services/localidades-service/src/localidades/localidades.service.ts)

El servicio concentra toda la lógica de negocio, es decir validaciones, creación de entidades y gestión de relaciones. No conoce nada del protocolo HTTP.

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

Si cambia la forma en que se expone la API, por ejemplo, de REST a GraphQL, solo se modifica el controlador. Si cambia la lógica de negocio, solo se modifica el servicio.

[Volver al índice](#índice)

---

## Abierto/Cerrado
Este principio se aplica de dos formas en el proyecto, en los guards de autenticación y en los DTOs de actualización.

##### RolesGuard y decorador @Roles

El `RolesGuard` está diseñado para ser extendido mediante metadatos. Para agregar un nuevo rol al sistema, no se toca la implementación del guard, basta con usar el decorador en el endpoint correspondiente.

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

El guard no necesita modificarse en ningún momento.

##### DTOs de actualización con PartialType

Los DTOs de actualización extienden los de creación sin duplicar código o modificar la clase base.

```typescript
// update-pelicula.dto.ts
export class UpdatePeliculaDto extends PartialType(CreatePeliculaDto) {}

// update-funcion.dto.ts
export class UpdateFuncionDto extends PartialType(CreateFuncionDto) {}

// update-sala.dto.ts
export class UpdateSalaDto extends PartialType(CreateSalaDto) {}
```

Si se agrega un campo a `CreatePeliculaDto`, `UpdatePeliculaDto` lo hereda automáticamente como opcional. La clase de actualización se extiende sin necesidad de modificarla.

[Volver al índice](#índice)

---

## Sustitución de Liskov

Este principio se aplica en la capa de autenticación a través de la abstracción de estrategias de Passport.

##### JwtStrategy y JwtAuthGuard
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

##### [jwt-auth.guard.ts](../../../Practica2/Backend/services/auth-service/src/auth/guards/jwt-auth.guard.ts)
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

Gracias a este diseño, si en el futuro se necesita incorporar una nueva estrategia de autenticación, puede coexistir con la actual sin modificar el guard ni los controladores que ya lo usan. 

Cualquier clase que cumpla el contrato de `PassportStrategy` puede sustituir o complementar a `JwtStrategy` de forma transparente.

[Volver al índice](#índice)

---

## I — Segregación de Interfaces

En lugar de crear un DTO genérico para todas las operaciones, nosotros definimos DTOs específicos para cada caso de uso. Cada cliente solo recibe y valida los campos que realmente necesita.

##### DTOs del servicio de localidades
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

##### DTOs del servicio de pagos

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

Si se usara un único DTO genérico, los endpoints de creación de métodos de pago recibirían campos como `monto` o `reservaIdExterna` que no les corresponden, violando la segregación. Con este diseño, cada endpoint recibe exactamente los campos que necesita.

[Volver al índice](#índice)

---

## Inversión de Dependencias

Este principio se implementa mediante inyección de dependencias en todos los servicios del proyecto. Ningún servicio instancia sus dependencias directamente porque todas son inyectadas por NestJS en el constructor.

##### AuthService
> [auth.service.ts](../../../Practica2/Backend/services/auth-service/src/auth/auth.service.ts)

`AuthService` depende de abstracciones como `UsersService`, `JwtService` y `ConfigService`, no de implementaciones concretas:

```typescript
// auth.service.ts
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

##### UsersService con @InjectRepository

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

##### `PagosService con múltiples dependencias

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
  }
}
```
Esta misma estructura se repite en `ReservasService`, `FuncionesService` y `LocalidadesService`, donde todos los repositorios y servicios auxiliares son inyectados en el constructor, nunca instanciados manualmente con `new`.

[Volver al índice](#índice)

---

[Volver a Documentación](../Documentación.md)
