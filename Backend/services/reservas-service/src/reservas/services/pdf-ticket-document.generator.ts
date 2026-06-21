import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import QRCode = require('qrcode');
import {
  TicketDocument,
  TicketDocumentGenerator,
} from '../interfaces/ticket-document-generator.interface';
import { TicketHistoryItem } from '../interfaces/ticket-history.interface';

@Injectable()
export class PdfTicketDocumentGenerator implements TicketDocumentGenerator {
  async generate(ticket: TicketHistoryItem): Promise<TicketDocument> {
    const qr = await QRCode.toBuffer(ticket.codigoQr, {
      type: 'png',
      width: 280,
      margin: 1,
      errorCorrectionLevel: 'M',
    });
    const content = await this.buildPdf(ticket, qr);

    return {
      filename: `boleto-${this.sanitizeFilename(ticket.codigoQr)}.pdf`,
      contentType: 'application/pdf',
      content,
    };
  }

  private buildPdf(ticket: TicketHistoryItem, qr: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = new PDFDocument({
        size: 'A4',
        margin: 48,
        info: {
          Title: `Boleto FilmStars ${ticket.codigoQr}`,
          Author: 'FilmStars',
          Subject: 'Boleto digital de cine',
        },
      });
      const chunks: Buffer[] = [];

      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      document
        .fillColor('#b91c1c')
        .fontSize(26)
        .text('FilmStars', { align: 'center' })
        .moveDown(0.25)
        .fillColor('#111827')
        .fontSize(16)
        .text('Boleto digital', { align: 'center' })
        .moveDown(1);

      document
        .roundedRect(48, document.y, 499, 410, 12)
        .lineWidth(1)
        .strokeColor('#d1d5db')
        .stroke();

      const boxTop = document.y + 22;
      document.image(qr, 338, boxTop, { width: 175 });

      document
        .fillColor('#111827')
        .fontSize(12)
        .text('Película', 72, boxTop)
        .fontSize(17)
        .text(ticket.pelicula.titulo ?? 'Película no disponible', 72, boxTop + 18, {
          width: 240,
        });

      this.writeDetail(document, 'Fecha', ticket.funcion.fecha ?? 'No disponible', 72, boxTop + 78);
      this.writeDetail(document, 'Hora', ticket.funcion.hora ?? 'No disponible', 72, boxTop + 122);
      this.writeDetail(document, 'Sala', ticket.funcion.sala ?? 'No disponible', 72, boxTop + 166);
      this.writeDetail(
        document,
        'Asientos',
        ticket.asientos.length
          ? ticket.asientos
              .map((asiento) => `${asiento.fila}${asiento.numero}`)
              .join(', ')
          : 'No disponibles',
        72,
        boxTop + 210,
      );
      this.writeDetail(
        document,
        'Total',
        `Q${ticket.reserva.total.toFixed(2)}`,
        72,
        boxTop + 254,
      );

      document
        .fontSize(9)
        .fillColor('#4b5563')
        .text('Código de acceso', 338, boxTop + 184, {
          width: 175,
          align: 'center',
        })
        .fontSize(10)
        .fillColor('#111827')
        .text(ticket.codigoQr, 338, boxTop + 199, {
          width: 175,
          align: 'center',
        })
        .fontSize(9)
        .fillColor('#4b5563')
        .text(`Estado: ${ticket.estado}`, 338, boxTop + 230, {
          width: 175,
          align: 'center',
        });

      document
        .fontSize(9)
        .fillColor('#6b7280')
        .text(
          `Emitido: ${ticket.fechaEmision.toISOString()}`,
          72,
          boxTop + 330,
          { width: 440 },
        )
        .moveDown(0.5)
        .text(
          'Presenta este código en el acceso. Cada boleto puede utilizarse una sola vez.',
          { width: 440 },
        );

      document
        .fontSize(9)
        .fillColor('#9ca3af')
        .text(`ID del boleto: ${ticket.id}`, 48, 760, {
          width: 499,
          align: 'center',
        });

      document.end();
    });
  }

  private writeDetail(
    document: PDFKit.PDFDocument,
    label: string,
    value: string,
    x: number,
    y: number,
  ) {
    document
      .fontSize(9)
      .fillColor('#6b7280')
      .text(label, x, y)
      .fontSize(12)
      .fillColor('#111827')
      .text(value, x, y + 13, { width: 240 });
  }

  private sanitizeFilename(value: string): string {
    return value.replace(/[^a-zA-Z0-9_-]/g, '_');
  }
}
