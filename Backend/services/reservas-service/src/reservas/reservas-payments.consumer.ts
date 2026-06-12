import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMqService } from './rabbitmq.service';
import { ReservasService } from './reservas.service';

interface PaymentResultEvent {
  reservaId: string;
  pagoId: string;
  estado: 'APROBADO' | 'RECHAZADO';
  metodoPago: string;
  referencia: string;
  autorizacion?: string | null;
  motivo?: string;
}

@Injectable()
export class ReservasPaymentsConsumer implements OnModuleInit {
  private readonly logger = new Logger(ReservasPaymentsConsumer.name);

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly reservasService: ReservasService,
  ) {}

  async onModuleInit() {
    await this.rabbitMqService.consumePaymentResults(async (payload: PaymentResultEvent) => {
      this.logger.log(
        `Resultado de pago recibido para reserva ${payload.reservaId}: ${payload.estado}`,
      );

      if (payload.estado === 'APROBADO') {
        await this.reservasService.confirmReserva(payload.reservaId);
        return;
      }

      await this.reservasService.rejectReserva(
        payload.reservaId,
        payload.motivo || 'Pago rechazado por simulacion',
      );
    });
  }
}
