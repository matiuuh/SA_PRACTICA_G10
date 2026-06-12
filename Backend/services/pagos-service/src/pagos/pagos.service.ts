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
import { RabbitMqService } from './rabbitmq.service';

interface PaymentRequestEvent {
  reservaId: string;
  usuarioIdExterno: string;
  total: number;
  metodoPago: 'TARJETA' | 'PAYPAL';
  detallesPago: {
    numeroTarjeta?: string | null;
    nombreTitular?: string | null;
    cvv?: string | null;
    fechaExpiracion?: string | null;
    paypalEmail?: string | null;
  };
}

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
    private readonly rabbitMqService: RabbitMqService,
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

  async processPaymentRequest(event: PaymentRequestEvent): Promise<void> {
    const metodo = await this.findMetodoByNombre(event.metodoPago);
    const simulation = this.simulatePayment(event);
    const estado = await this.findOrCreateEstado(simulation.estado);

    const pago = this.pagosRepository.create({
      id: randomUUID(),
      reservaIdExterna: event.reservaId,
      monto: event.total,
      fechaPago: new Date(),
      metodo,
      estado,
    });

    const savedPago = await this.pagosRepository.save(pago);

    const transaccion = this.transaccionesRepository.create({
      id: randomUUID(),
      referencia: `TXN-${randomBytes(5).toString('hex').toUpperCase()}`,
      autorizacion: simulation.autorizacion,
      fechaTransaccion: new Date(),
      pago: savedPago,
    });

    await this.transaccionesRepository.save(transaccion);

    await this.rabbitMqService.publishPaymentResult({
      reservaId: event.reservaId,
      pagoId: savedPago.id,
      estado: simulation.estado,
      metodoPago: metodo.nombre,
      referencia: transaccion.referencia,
      autorizacion: simulation.autorizacion,
      motivo: simulation.motivo,
    });
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

  private async findMetodoByNombre(nombre: string): Promise<MetodoPago> {
    const normalized = nombre.trim().toUpperCase();
    const metodo = await this.metodosRepository.findOne({
      where: { nombre: normalized },
    });

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

  private simulatePayment(event: PaymentRequestEvent): {
    estado: 'APROBADO' | 'RECHAZADO';
    autorizacion: string | null;
    motivo?: string;
  } {
    if (event.metodoPago === 'TARJETA') {
      const card = event.detallesPago.numeroTarjeta?.replace(/\s/g, '') || '';

      if (card.length < 16 || !event.detallesPago.nombreTitular || !event.detallesPago.cvv) {
        return {
          estado: 'RECHAZADO',
          autorizacion: null,
          motivo: 'Datos incompletos de tarjeta',
        };
      }

      if (card.endsWith('0000')) {
        return {
          estado: 'RECHAZADO',
          autorizacion: null,
          motivo: 'Tarjeta rechazada por simulacion',
        };
      }

      return {
        estado: 'APROBADO',
        autorizacion: `AUTH-${randomBytes(4).toString('hex').toUpperCase()}`,
      };
    }

    if (!event.detallesPago.paypalEmail) {
      return {
        estado: 'RECHAZADO',
        autorizacion: null,
        motivo: 'Cuenta de PayPal no proporcionada',
      };
    }

    if (event.detallesPago.paypalEmail.toLowerCase().includes('fail')) {
      return {
        estado: 'RECHAZADO',
        autorizacion: null,
        motivo: 'Pago PayPal rechazado por simulacion',
      };
    }

    return {
      estado: 'APROBADO',
      autorizacion: `PAYPAL-${randomBytes(4).toString('hex').toUpperCase()}`,
    };
  }
}
