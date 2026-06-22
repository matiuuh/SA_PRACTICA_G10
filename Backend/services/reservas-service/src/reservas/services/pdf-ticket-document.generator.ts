// Backend/services/reservas-service/src/services/pdf-ticket-document.generator.ts

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
        margin: 0,
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

      const width = document.page.width;
      const height = document.page.height;

      // ========== FONDO CON DEGRADADO ==========
      const colors = [
        { pos: 0, r: 139, g: 0, b: 0 },
        { pos: 0.3, r: 100, g: 0, b: 0 },
        { pos: 0.6, r: 60, g: 0, b: 0 },
        { pos: 1, r: 0, g: 0, b: 0 },
      ];

      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.max(width, height) * 0.85;

      for (let i = 0; i < 100; i++) {
        const t = i / 100;
        const radius = t * maxRadius;
        
        let color = colors[0];
        for (let j = 0; j < colors.length - 1; j++) {
          if (t >= colors[j].pos && t <= colors[j + 1].pos) {
            const localT = (t - colors[j].pos) / (colors[j + 1].pos - colors[j].pos);
            color = {
              pos: t,
              r: Math.round(colors[j].r + (colors[j + 1].r - colors[j].r) * localT),
              g: Math.round(colors[j].g + (colors[j + 1].g - colors[j].g) * localT),
              b: Math.round(colors[j].b + (colors[j + 1].b - colors[j].b) * localT),
            };
            break;
          }
        }

        const alpha = 1 - (t * t * 0.9);
        document
          .circle(centerX, centerY, radius)
          .fillColor(`rgb(${color.r}, ${color.g}, ${color.b})`, alpha)
          .fill();
      }

      document.rect(0, 0, width, height).fillColor('#000000').fill();

      // ========== BORDE DECORATIVO ==========
      document.save();
      document
        .roundedRect(20, 20, width - 40, height - 40, 20)
        .lineWidth(2)
        .strokeColor('#FFD700', 0.3)
        .stroke();

      document
        .rect(60, 40, width - 120, 2)
        .fillColor('#FFD700', 0.15)
        .fill();

      document
        .rect(60, height - 43, width - 120, 2)
        .fillColor('#FFD700', 0.15)
        .fill();

      // ========== ENCABEZADO ==========
      document.save();
      
      // Título "FilmStars" - Color dorado suave (mismo que BOLETO DIGITAL)
      document
        .font('Helvetica-Bold')
        .fontSize(32)
        .fillColor('#FFD700', 0.7)
        .text('FilmStars', 0, 55, {
          align: 'center',
          width: width,
        });

      // Subtítulo "BOLETO DIGITAL" - Color dorado suave
      document
        .font('Helvetica')
        .fontSize(14)
        .fillColor('#FFD700', 0.7)
        .text('BOLETO DIGITAL', 0, 95, {
          align: 'center',
          width: width,
        });

      document.restore();

      // ========== PELÍCULA ==========
      const startY = 140;
      
      document.save();
      
      // Título de la película - Color dorado suave (mismo que BOLETO DIGITAL)
      document
        .font('Helvetica-Bold')
        .fontSize(26)
        .fillColor('#FFD700', 0.7)
        .text(ticket.pelicula.titulo ?? 'Película no disponible', 50, startY, {
          width: width - 250,
          align: 'left',
        });

      // Badge de estado - Verde o Rojo según corresponda
      const estadoColor = ticket.estado === 'VALIDO' ? '#00E676' : '#FF5252';
      const estadoTexto = ticket.estado === 'VALIDO' ? 'ACTIVO' : 'USADO';
      
      document
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(estadoColor)
        .text(estadoTexto, width - 180, startY + 8, {
          width: 130,
          align: 'right',
        });

      document.restore();

      // ========== TARJETA DE DETALLES ==========
      const cardY = startY + 50;
      const cardWidth = width - 100;
      const cardHeight = 170;
      
      document.save();
      document
        .roundedRect(50, cardY, cardWidth, cardHeight, 15)
        .fillColor('#FFFFFF', 0.07)
        .fill();
      
      document
        .roundedRect(50, cardY, cardWidth, cardHeight, 15)
        .lineWidth(1)
        .strokeColor('#FFFFFF', 0.1)
        .stroke();
      document.restore();

      // ========== DETALLES ==========
      const labelColor = '#FFD700';
      const valueColor = '#FFFFFF';
      
      const col1X = 75;
      const col2X = 320;
      
      this.writeDetail(document, 'FECHA', ticket.funcion.fecha ?? 'No disponible', col1X, cardY + 20, labelColor, valueColor);
      this.writeDetail(document, 'SALA', ticket.funcion.sala ?? 'No disponible', col2X, cardY + 20, labelColor, valueColor);
      this.writeDetail(document, 'HORA', ticket.funcion.hora ?? 'No disponible', col1X, cardY + 70, labelColor, valueColor);
      
      const asientosTexto = ticket.asientos.length > 0
        ? ticket.asientos.map((a) => `${a.fila}${a.numero}`).join(', ')
        : 'No disponibles';
      this.writeDetail(document, 'ASIENTOS', asientosTexto, col2X, cardY + 70, labelColor, valueColor);
      this.writeDetail(document, 'TOTAL', `Q${ticket.reserva.total.toFixed(2)}`, col1X, cardY + 120, labelColor, valueColor);

      // ========== CÓDIGO QR ==========
      const qrY = cardY + cardHeight + 30;
      const qrSize = 130;
      const qrX = (width - qrSize) / 2;
      
      document.save();
      document
        .roundedRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 55, 10)
        .fillColor('#FFFFFF')
        .fill();
      document.restore();

      document.save();
      document
        .roundedRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 55, 10)
        .lineWidth(2)
        .strokeColor('#FFD700', 0.4)
        .stroke();
      document.restore();

      document.image(qr, qrX, qrY, { width: qrSize });

      document
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#333333')
        .text(ticket.codigoQr, qrX, qrY + qrSize + 8, {
          width: qrSize,
          align: 'center',
        });

      document
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#666666')
        .text('Código de acceso', qrX, qrY + qrSize + 22, {
          width: qrSize,
          align: 'center',
        });

      // ========== PIE DE PÁGINA ==========
      const footerY = height - 55;

      document
        .rect(80, footerY - 8, width - 160, 1)
        .fillColor('#FFD700', 0.12)
        .fill();

      document
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#FFFFFF', 0.35)
        .text(`Emitido: ${ticket.fechaEmision.toISOString()}`, 50, footerY, {
          width: width - 100,
          align: 'center',
        });

      document
        .font('Helvetica')
        .fontSize(6)
        .fillColor('#FFFFFF', 0.2)
        .text('Presenta este código en el acceso. Cada boleto puede utilizarse una sola vez.', 50, footerY + 14, {
          width: width - 100,
          align: 'center',
        });

      document
        .font('Helvetica')
        .fontSize(6)
        .fillColor('#FFFFFF', 0.15)
        .text(`ID: ${ticket.id}`, 50, footerY + 28, {
          width: width - 100,
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
    labelColor: string,
    valueColor: string,
  ) {
    document
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor(labelColor, 0.6)
      .text(label, x, y);

    document
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(valueColor)
      .text(value, x, y + 15, {
        width: 200,
      });
  }

  private sanitizeFilename(value: string): string {
    return value.replace(/[^a-zA-Z0-9_-]/g, '_');
  }
}