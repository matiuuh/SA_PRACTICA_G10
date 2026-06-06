import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreateEstadoPagoDto } from './dto/create-estado-pago.dto';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { CreatePagoDto } from './dto/create-pago.dto';
import { EstadoPago } from './entities/estado-pago.entity';
import { MetodoPago } from './entities/metodo-pago.entity';
import { Pago } from './entities/pago.entity';
import { Transaccion } from './entities/transaccion.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(MetodoPago)
    private readonly metodosRepository: Repository<MetodoPago>,
    @InjectRepository(EstadoPago)
    private readonly estadosRepository: Repository<EstadoPago>,
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,
    @InjectRepository(Transaccion)
    private readonly transaccionesRepository: Repository<Transaccion>,
  ) {}

  findMetodos(): Promise<MetodoPago[]> {
    return this.metodosRepository.find({ order: { nombre: 'ASC' } });
  }

  findPagosByReserva(reservaIdExterna: string): Promise<Pago[]> {
    return this.pagosRepository.find({
      where: { reservaIdExterna },
      relations: ['transacciones'],
      order: { fechaPago: 'DESC' },
    });
  }

  async findPagoById(id: string): Promise<Pago> {
    const pago = await this.pagosRepository.findOne({
      where: { id },
      relations: ['transacciones'],
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    return pago;
  }

  async createMetodo(
    createMetodoDto: CreateMetodoPagoDto,
  ): Promise<MetodoPago> {
    const nombre = createMetodoDto.nombre.trim().toUpperCase();
    const existing = await this.metodosRepository.findOne({ where: { nombre } });

    if (existing) {
      throw new ConflictException('Ese metodo de pago ya existe');
    }

    const metodo = this.metodosRepository.create({
      id: randomUUID(),
      nombre,
    });

    return this.metodosRepository.save(metodo);
  }

  async createEstado(
    createEstadoDto: CreateEstadoPagoDto,
  ): Promise<EstadoPago> {
    const nombre = createEstadoDto.nombre.trim().toUpperCase();
    const existing = await this.estadosRepository.findOne({ where: { nombre } });

    if (existing) {
      throw new ConflictException('Ese estado de pago ya existe');
    }

    const estado = this.estadosRepository.create({
      id: randomUUID(),
      nombre,
    });

    return this.estadosRepository.save(estado);
  }

  async createPago(createPagoDto: CreatePagoDto): Promise<Pago> {
    const metodo = await this.findMetodoById(createPagoDto.idMetodo);
    const estado = createPagoDto.idEstado
      ? await this.findEstadoById(createPagoDto.idEstado)
      : await this.findOrCreateEstado('PENDIENTE');

    const pago = this.pagosRepository.create({
      id: randomUUID(),
      reservaIdExterna: createPagoDto.reservaIdExterna,
      monto: createPagoDto.monto,
      fechaPago: new Date(),
      metodo,
      estado,
    });

    const savedPago = await this.pagosRepository.save(pago);

    const transaccion = this.transaccionesRepository.create({
      id: randomUUID(),
      referencia:
        createPagoDto.referencia || `TXN-${randomBytes(5).toString('hex').toUpperCase()}`,
      autorizacion: createPagoDto.autorizacion || null,
      fechaTransaccion: new Date(),
      pago: savedPago,
    });

    await this.transaccionesRepository.save(transaccion);

    return this.findPagoById(savedPago.id);
  }

  async changeEstado(id: string, nombreEstado: string): Promise<Pago> {
    const pago = await this.findPagoById(id);
    const estado = await this.findOrCreateEstado(nombreEstado);

    pago.estado = estado;
    await this.pagosRepository.save(pago);

    return this.findPagoById(id);
  }

  private async findMetodoById(id: string): Promise<MetodoPago> {
    const metodo = await this.metodosRepository.findOne({ where: { id } });

    if (!metodo) {
      throw new NotFoundException('Metodo de pago no encontrado');
    }

    return metodo;
  }

  private async findEstadoById(id: string): Promise<EstadoPago> {
    const estado = await this.estadosRepository.findOne({ where: { id } });

    if (!estado) {
      throw new NotFoundException('Estado de pago no encontrado');
    }

    return estado;
  }

  private async findOrCreateEstado(nombre: string): Promise<EstadoPago> {
    const normalized = nombre.trim().toUpperCase();
    let estado = await this.estadosRepository.findOne({
      where: { nombre: normalized },
    });

    if (!estado) {
      estado = this.estadosRepository.create({
        id: randomUUID(),
        nombre: normalized,
      });
      estado = await this.estadosRepository.save(estado);
    }

    return estado;
  }
}
