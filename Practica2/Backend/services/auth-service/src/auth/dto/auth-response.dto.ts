export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
  };
}
