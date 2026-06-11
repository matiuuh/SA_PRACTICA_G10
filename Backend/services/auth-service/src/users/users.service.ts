import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const role = await this.findOrCreateRole(
      createUserDto.rol ||
        this.configService.get<string>('DEFAULT_ROLE', 'CLIENTE'),
    );

    const user = this.usersRepository.create({
      id: randomUUID(),
      nombre: createUserDto.nombre,
      correo: createUserDto.correo,
      passwordHash: createUserDto.passwordHash,
      rol: role,
    });

    return this.usersRepository.save(user);
  }

  findByEmail(correo: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { correo },
      relations: ['rol'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['rol'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  private async findOrCreateRole(nombre: string): Promise<Role> {
    const normalizedRole = nombre.trim().toUpperCase();

    let role = await this.rolesRepository.findOne({
      where: { nombre: normalizedRole },
    });

    if (!role) {
      role = this.rolesRepository.create({
        id: randomUUID(),
        nombre: normalizedRole,
      });
      role = await this.rolesRepository.save(role);
    }

    return role;
  }
}
