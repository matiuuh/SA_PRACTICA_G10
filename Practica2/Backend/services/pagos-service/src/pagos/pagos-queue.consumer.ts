import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PagosService } from './pagos.service';
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
export class PagosQueueConsumer implements OnModuleInit {
  private readonly logger = new Logger(PagosQueueConsumer.name);

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly pagosService: PagosService,
  ) {}

  async onModuleInit() {
    await this.rabbitMqService.consumePaymentRequests(
      async (payload: PaymentRequestEvent) => {
        this.logger.log(
          `Procesando pago asincrono para reserva ${payload.reservaId} con metodo ${payload.metodoPago}`,
        );
        await this.pagosService.processPaymentRequest(payload);
      },
    );
  }
}
