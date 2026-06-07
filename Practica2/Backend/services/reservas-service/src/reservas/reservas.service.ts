import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { In, Repository } from 'typeorm';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateEstadoReservaDto } from './dto/create-estado-reserva.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { Asiento } from './entities/asiento.entity';
import { Boleto } from './entities/boleto.entity';
import { EstadoReserva } from './entities/estado-reserva.entity';
import { ReservaDetalle } from './entities/reserva-detalle.entity';
import { Reserva } from './entities/reserva.entity';
import { ReservasGateway } from './reservas.gateway';
import { RabbitMqService } from './rabbitmq.service';

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
    private readonly rabbitMqService: RabbitMqService,
    private readonly reservasGateway: ReservasGateway,
  ) {}

  async findAsientosByFuncion(idFuncionExterna: string) {
    const asientos = await this.asientosRepository.find({
      where: { idFuncionExterna },
      order: { fila: 'ASC', numero: 'ASC' },
    });

    const reservados = await this.detallesRepository
      .createQueryBuilder('detalle')
      .innerJoin('detalle.asiento', 'asiento')
      .innerJoin('detalle.reserva', 'reserva')
      .innerJoin('reserva.estado', 'estado')
      .where('asiento.id_funcion_externa = :idFuncionExterna', { idFuncionExterna })
      .andWhere('estado.nombre IN (:...estados)', {
        estados: ['TEMPORAL', 'CONFIRMADA'],
      })
      .select('asiento.id_asiento', 'id')
      .getRawMany<{ id: string }>();

    const reservedIds = new Set(reservados.map((item) => item.id));

    return asientos.map((asiento) => ({
      ...asiento,
      ocupado: reservedIds.has(asiento.id),
    }));
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
    return this.createReservaRecord(createReservaDto);
  }

  async createCheckout(createCheckoutDto: CreateCheckoutDto): Promise<Reserva> {
    const reserva = await this.createReservaRecord({
      usuarioIdExterno: createCheckoutDto.usuarioIdExterno,
      asientosIds: createCheckoutDto.asientosIds,
      total: createCheckoutDto.total,
      fechaExpiracion:
        createCheckoutDto.fechaExpiracion ||
        new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    await this.rabbitMqService.publishPaymentRequested({
      reservaId: reserva.id,
      usuarioIdExterno: reserva.usuarioIdExterno,
      total: Number(reserva.total),
      metodoPago: createCheckoutDto.metodoPago,
      detallesPago: {
        numeroTarjeta: createCheckoutDto.numeroTarjeta || null,
        nombreTitular: createCheckoutDto.nombreTitular || null,
        cvv: createCheckoutDto.cvv || null,
        fechaExpiracion: createCheckoutDto.fechaExpiracion || null,
        paypalEmail: createCheckoutDto.paypalEmail || null,
      },
    });

    return this.findReservaById(reserva.id);
  }

  async rejectReserva(id: string, motivo?: string): Promise<Reserva> {
    const reserva = await this.findReservaById(id);
    const estadoRechazada = await this.findOrCreateEstado('RECHAZADA');

    reserva.estado = estadoRechazada;
    reserva.fechaExpiracion = reserva.fechaExpiracion ?? new Date();
    await this.reservasRepository.save(reserva);
    const funcionId = reserva.detalles[0]?.asiento.idFuncionExterna;
    if (funcionId) {
      this.reservasGateway.releaseSeatsForReservation(
        funcionId,
        reserva.detalles.map((detalle) => detalle.asiento.id),
      );
    }

    return this.findReservaById(id);
  }

  private async createReservaRecord(
    createReservaDto: CreateReservaDto,
  ): Promise<Reserva> {
    const asientos = await this.asientosRepository.find({
      where: {
        id: In(createReservaDto.asientosIds),
      },
    });

    if (asientos.length !== createReservaDto.asientosIds.length) {
      throw new NotFoundException('Uno o mas asientos no existen');
    }

    const asientosYaReservados = await this.detallesRepository
      .createQueryBuilder('detalle')
      .innerJoin('detalle.reserva', 'reserva')
      .innerJoin('reserva.estado', 'estado')
      .innerJoin('detalle.asiento', 'asiento')
      .where('asiento.id_asiento IN (:...asientosIds)', {
        asientosIds: createReservaDto.asientosIds,
      })
      .andWhere('estado.nombre IN (:...estados)', {
        estados: ['TEMPORAL', 'CONFIRMADA'],
      })
      .select('asiento.id_asiento', 'id')
      .getRawMany<{ id: string }>();

    if (asientosYaReservados.length > 0) {
      throw new ConflictException(
        'Uno o mas asientos ya fueron reservados por otro usuario.',
      );
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

    const funcionId = reserva.detalles[0]?.asiento.idFuncionExterna;
    if (funcionId) {
      this.reservasGateway.releaseSeatsForReservation(
        funcionId,
        reserva.detalles.map((detalle) => detalle.asiento.id),
      );
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
