import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import type { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import {
  FILMSTARS_EXCHANGE,
  PAYMENT_REQUEST_QUEUE,
  PAYMENT_REQUEST_ROUTING_KEY,
  PAYMENT_RESULT_QUEUE,
  PAYMENT_RESULT_ROUTING_KEY,
} from './rabbitmq.constants';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection?: ChannelModel;
  private channel?: Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  async publishPaymentRequested(payload: unknown) {
    const channel = await this.getChannel();

    channel.publish(
      FILMSTARS_EXCHANGE,
      PAYMENT_REQUEST_ROUTING_KEY,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
  }

  async consumePaymentResults(
    handler: (payload: any) => Promise<void>,
  ): Promise<void> {
    const channel = await this.getChannel();

    await channel.consume(PAYMENT_RESULT_QUEUE, async (message) => {
      if (!message) {
        return;
      }

      await this.handleMessage(channel, message, handler);
    });
  }

  private async connect() {
    if (this.channel) {
      return;
    }

    const url = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://guest:guest@localhost:5672',
    );

    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(FILMSTARS_EXCHANGE, 'topic', {
      durable: true,
    });
    await this.channel.assertQueue(PAYMENT_REQUEST_QUEUE, { durable: true });
    await this.channel.assertQueue(PAYMENT_RESULT_QUEUE, { durable: true });
    await this.channel.bindQueue(
      PAYMENT_REQUEST_QUEUE,
      FILMSTARS_EXCHANGE,
      PAYMENT_REQUEST_ROUTING_KEY,
    );
    await this.channel.bindQueue(
      PAYMENT_RESULT_QUEUE,
      FILMSTARS_EXCHANGE,
      PAYMENT_RESULT_ROUTING_KEY,
    );
    await this.channel.prefetch(10);

    this.logger.log('RabbitMQ conectado en reservas-service');
  }

  private async getChannel(): Promise<Channel> {
    if (!this.channel) {
      await this.connect();
    }

    if (!this.channel) {
      throw new Error('No se pudo inicializar el canal de RabbitMQ');
    }

    return this.channel;
  }

  private async handleMessage(
    channel: Channel,
    message: ConsumeMessage,
    handler: (payload: any) => Promise<void>,
  ) {
    try {
      const payload = JSON.parse(message.content.toString());
      await handler(payload);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        `Error procesando mensaje de resultado de pago: ${(error as Error).message}`,
      );
      channel.nack(message, false, false);
    }
  }
}
