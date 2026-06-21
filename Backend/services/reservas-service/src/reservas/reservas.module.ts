import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { Asiento } from './entities/asiento.entity';
import { Boleto } from './entities/boleto.entity';
import { EstadoReserva } from './entities/estado-reserva.entity';
import { ReservaDetalle } from './entities/reserva-detalle.entity';
import { Reserva } from './entities/reserva.entity';
import { ReservasGateway } from './reservas.gateway';
import { RabbitMqService } from './rabbitmq.service';
import { ReservasPaymentsConsumer } from './reservas-payments.consumer';
import { HttpFuncionCatalogClient } from './clients/http-funcion-catalog.client';
import { FUNCION_CATALOG_CLIENT } from './interfaces/funcion-snapshot.interface';
import { TicketHistoryService } from './services/ticket-history.service';
import { AdminTicketSearchService } from './services/admin-ticket-search.service';
import { TicketValidationService } from './services/ticket-validation.service';
import { TicketDownloadService } from './services/ticket-download.service';
import { PdfTicketDocumentGenerator } from './services/pdf-ticket-document.generator';
import { TICKET_DOCUMENT_GENERATOR } from './interfaces/ticket-document-generator.interface';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Asiento,
      EstadoReserva,
      Reserva,
      ReservaDetalle,
      Boleto,
    ]),
  ],
  controllers: [ReservasController],
  providers: [
    ReservasService,
    RabbitMqService,
    ReservasPaymentsConsumer,
    ReservasGateway,
    TicketHistoryService,
    AdminTicketSearchService,
    TicketValidationService,
    TicketDownloadService,
    PdfTicketDocumentGenerator,
    HttpFuncionCatalogClient,
    {
      provide: FUNCION_CATALOG_CLIENT,
      useExisting: HttpFuncionCatalogClient,
    },
    {
      provide: TICKET_DOCUMENT_GENERATOR,
      useExisting: PdfTicketDocumentGenerator,
    },
  ],
  exports: [ReservasService],
})
export class ReservasModule {}
