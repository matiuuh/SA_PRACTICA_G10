export class CreateUserDto {
  nombre: string;
  correo: string;
  passwordHash: string;
  rol?: string;
}
