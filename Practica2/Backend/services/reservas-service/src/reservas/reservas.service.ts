import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { In, Repository } from 'typeorm';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { CreateEstadoReservaDto } from './dto/create-estado-reserva.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { Asiento } from './entities/asiento.entity';
import { Boleto } from './entities/boleto.entity';
import { EstadoReserva } from './entities/estado-reserva.entity';
import { ReservaDetalle } from './entities/reserva-detalle.entity';
import { Reserva } from './entities/reserva.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Asiento)
    private readonly asientosRepository: Repository<Asiento>,
    @InjectRepository(EstadoReserva)
    private readonly estadosRepository: Repository<EstadoReserva>,
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
    @InjectRepository(ReservaDetalle)
    private readonly detallesRepository: Repository<ReservaDetalle>,
    @InjectRepository(Boleto)
    private readonly boletosRepository: Repository<Boleto>,
  ) {}

  findAsientosByFuncion(idFuncionExterna: string): Promise<Asiento[]> {
    return this.asientosRepository.find({
      where: { idFuncionExterna },
      order: { fila: 'ASC', numero: 'ASC' },
    });
  }

  async findReservaById(id: string): Promise<Reserva> {
    const reserva = await this.reservasRepository.findOne({
      where: { id },
      relations: ['detalles', 'detalles.asiento', 'boletos'],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    return reserva;
  }

  async findBoletoById(id: string): Promise<Boleto> {
    const boleto = await this.boletosRepository.findOne({
      where: { id },
      relations: ['reserva'],
    });

    if (!boleto) {
      throw new NotFoundException('Boleto no encontrado');
    }

    return boleto;
  }

  async createAsiento(createAsientoDto: CreateAsientoDto): Promise<Asiento> {
    const alreadyExists = await this.asientosRepository.findOne({
      where: {
        idFuncionExterna: createAsientoDto.idFuncionExterna,
        fila: createAsientoDto.fila.trim(),
        numero: createAsientoDto.numero,
      },
    });

    if (alreadyExists) {
      throw new ConflictException(
        'Ya existe un asiento con esa fila y numero para la funcion',
      );
    }

    const asiento = this.asientosRepository.create({
      id: randomUUID(),
      fila: createAsientoDto.fila.trim(),
      numero: createAsientoDto.numero,
      idFuncionExterna: createAsientoDto.idFuncionExterna,
    });

    return this.asientosRepository.save(asiento);
  }

  async createEstado(
    createEstadoDto: CreateEstadoReservaDto,
  ): Promise<EstadoReserva> {
    const nombre = createEstadoDto.nombre.trim().toUpperCase();
    const existing = await this.estadosRepository.findOne({ where: { nombre } });

    if (existing) {
      throw new ConflictException('Ese estado de reserva ya existe');
    }

    const estado = this.estadosRepository.create({
      id: randomUUID(),
      nombre,
    });

    return this.estadosRepository.save(estado);
  }

  async createReserva(createReservaDto: CreateReservaDto): Promise<Reserva> {
    const asientos = await this.asientosRepository.find({
      where: {
        id: In(createReservaDto.asientosIds),
      },
    });

    if (asientos.length !== createReservaDto.asientosIds.length) {
      throw new NotFoundException('Uno o mas asientos no existen');
    }

    const estadoTemporal = await this.findOrCreateEstado('TEMPORAL');

    const reserva = this.reservasRepository.create({
      id: randomUUID(),
      usuarioIdExterno: createReservaDto.usuarioIdExterno,
      fechaReserva: new Date(),
      fechaExpiracion: createReservaDto.fechaExpiracion
        ? new Date(createReservaDto.fechaExpiracion)
        : null,
      total: createReservaDto.total,
      estado: estadoTemporal,
    });

    const savedReserva = await this.reservasRepository.save(reserva);

    const detalles = asientos.map((asiento) =>
      this.detallesRepository.create({
        id: randomUUID(),
        reserva: savedReserva,
        asiento,
      }),
    );

    await this.detallesRepository.save(detalles);

    return this.findReservaById(savedReserva.id);
  }

  async confirmReserva(id: string): Promise<Reserva> {
    const reserva = await this.findReservaById(id);
    const estadoConfirmada = await this.findOrCreateEstado('CONFIRMADA');

    reserva.estado = estadoConfirmada;
    await this.reservasRepository.save(reserva);

    const existingBoleto = await this.boletosRepository.findOne({
      where: { reserva: { id: reserva.id } },
      relations: ['reserva'],
    });

    if (!existingBoleto) {
      const boleto = this.boletosRepository.create({
        id: randomUUID(),
        codigoQr: this.generateTicketCode(),
        fechaEmision: new Date(),
        reserva,
      });
      await this.boletosRepository.save(boleto);
    }

    return this.findReservaById(id);
  }

  private async findOrCreateEstado(nombre: string): Promise<EstadoReserva> {
    const normalizedName = nombre.trim().toUpperCase();
    let estado = await this.estadosRepository.findOne({
      where: { nombre: normalizedName },
    });

    if (!estado) {
      estado = this.estadosRepository.create({
        id: randomUUID(),
        nombre: normalizedName,
      });
      estado = await this.estadosRepository.save(estado);
    }

    return estado;
  }

  private generateTicketCode(): string {
    return `BOL-${randomBytes(6).toString('hex').toUpperCase()}`;
  }
}
