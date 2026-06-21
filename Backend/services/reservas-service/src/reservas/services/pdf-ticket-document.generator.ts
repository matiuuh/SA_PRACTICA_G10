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

      // ========== FONDO CON DEGRADADO (usando rectángulos) ==========
      // Crear un degradado manual con múltiples rectángulos
      const colors = [
        { pos: 0, r: 139, g: 0, b: 0 },    // #8B0000 - Rojo oscuro
        { pos: 0.3, r: 100, g: 0, b: 0 },  // #640000
        { pos: 0.6, r: 60, g: 0, b: 0 },   // #3C0000
        { pos: 1, r: 0, g: 0, b: 0 },      // #000000 - Negro
      ];

      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.max(width, height) * 0.85;

      // Dibujar el degradado con círculos concéntricos
      for (let i = 0; i < 100; i++) {
        const t = i / 100;
        const radius = (t * maxRadius);
        
        // Encontrar el color interpolado
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

      // Fondo base negro por si acaso
      document.rect(0, 0, width, height).fillColor('#000000').fill();

      // ========== BORDE DECORATIVO ==========
      document.save();
      document
        .roundedRect(20, 20, width - 40, height - 40, 20)
        .lineWidth(2)
        .strokeColor('#FFD700', 0.3)
        .stroke();

      // Línea dorada decorativa superior
      document
        .rect(60, 40, width - 120, 3)
        .fillColor('#FFD700', 0.15)
        .fill();

      // Línea dorada decorativa inferior
      document
        .rect(60, height - 43, width - 120, 3)
        .fillColor('#FFD700', 0.15)
        .fill();

      // ========== ENCABEZADO ==========
      document.save();
      
      // Título "FilmStars"
      document
        .font('Helvetica-Bold')
        .fontSize(32)
        .fillColor('#FFD700')
        .text('✦ FilmStars ✦', 0, 65, {
          align: 'center',
          width: width,
        });

      // Subtítulo "Boleto Digital"
      document
        .font('Helvetica')
        .fontSize(14)
        .fillColor('#FFD700', 0.7)
        .text('BOLETO DIGITAL', 0, 105, {
          align: 'center',
          width: width,
        });

      document.restore();

      // ========== SECCIÓN PRINCIPAL ==========
      const startY = 145;

      // ===== PELÍCULA =====
      document.save();
      document
        .font('Helvetica-Bold')
        .fontSize(28)
        .fillColor('#FFFFFF')
        .text(ticket.pelicula.titulo ?? 'Película no disponible', 50, startY, {
          width: width - 200,
          align: 'left',
        });

      // Badge de estado
      const estadoColor = ticket.estado === 'VALIDO' ? '#00E676' : '#FF5252';
      const estadoTexto = ticket.estado === 'VALIDO' ? '✓ ACTIVO' : '✗ USADO';
      
      document
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor(estadoColor)
        .text(estadoTexto, width - 180, startY + 10, {
          width: 130,
          align: 'right',
        });

      document.restore();

      // ===== DETALLES EN FORMATO TARJETA ======
      const cardY = startY + 45;
      
      // Fondo semitransparente (glassmorphism)
      document.save();
      document
        .roundedRect(50, cardY, width - 100, 160, 15)
        .fillColor('#FFFFFF', 0.08)
        .fill();
      
      // Borde del glassmorphism
      document
        .roundedRect(50, cardY, width - 100, 160, 15)
        .lineWidth(1)
        .strokeColor('#FFFFFF', 0.15)
        .stroke();
      document.restore();

      // ===== DETALLES =====
      const col1 = 75;
      const col2 = 320;
      const row1 = cardY + 25;
      const row2 = cardY + 75;
      const row3 = cardY + 125;
      const labelColor = '#FFD700';
      const valueColor = '#FFFFFF';

      // Fila 1: Fecha y Sala
      this.writeDetail(
        document,
        '📅 FECHA',
        ticket.funcion.fecha ?? 'No disponible',
        col1,
        row1,
        labelColor,
        valueColor,
      );

      this.writeDetail(
        document,
        '📍 SALA',
        ticket.funcion.sala ?? 'No disponible',
        col2,
        row1,
        labelColor,
        valueColor,
      );

      // Fila 2: Hora y Asientos
      this.writeDetail(
        document,
        '⏰ HORA',
        ticket.funcion.hora ?? 'No disponible',
        col1,
        row2,
        labelColor,
        valueColor,
      );

      const asientosTexto = ticket.asientos.length > 0
        ? ticket.asientos.map((a) => `${a.fila}${a.numero}`).join(', ')
        : 'No disponibles';

      this.writeDetail(
        document,
        '💺 ASIENTOS',
        asientosTexto,
        col2,
        row2,
        labelColor,
        valueColor,
      );

      // Fila 3: Total
      this.writeDetail(
        document,
        '💰 TOTAL',
        `Q${ticket.reserva.total.toFixed(2)}`,
        col1,
        row3,
        labelColor,
        valueColor,
      );

      // ===== CÓDIGO QR =====
      const qrX = width - 230;
      const qrY = startY + 35;
      
      // Fondo blanco para el QR
      document.save();
      document
        .roundedRect(qrX - 10, qrY - 10, 150, 160, 12)
        .fillColor('#FFFFFF')
        .fill();
      document.restore();

      // Borde dorado alrededor del QR
      document.save();
      document
        .roundedRect(qrX - 10, qrY - 10, 150, 160, 12)
        .lineWidth(2)
        .strokeColor('#FFD700', 0.5)
        .stroke();
      document.restore();

      document.image(qr, qrX + 5, qrY + 5, { width: 120 });

      // Etiqueta "Código de acceso"
      document
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#FFD700', 0.6)
        .text('CÓDIGO DE ACCESO', qrX + 5, qrY + 125, {
          width: 120,
          align: 'center',
        });

      document
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#333333')
        .text(ticket.codigoQr, qrX + 5, qrY + 135, {
          width: 120,
          align: 'center',
        });

      // ===== PIE DE PÁGINA ======
      const footerY = height - 70;

      // Línea decorativa
      document
        .rect(80, footerY - 10, width - 160, 1)
        .fillColor('#FFD700', 0.15)
        .fill();

      // Fecha de emisión
      document
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#FFFFFF', 0.4)
        .text(`Emitido: ${ticket.fechaEmision.toISOString()}`, 50, footerY, {
          width: width - 100,
          align: 'center',
        });

      // Mensaje de seguridad
      document
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#FFFFFF', 0.25)
        .text('Presenta este código en el acceso. Cada boleto puede utilizarse una sola vez.', 50, footerY + 14, {
          width: width - 100,
          align: 'center',
        });

      // ID del boleto
      document
        .font('Helvetica')
        .fontSize(6)
        .fillColor('#FFFFFF', 0.2)
        .text(`ID: ${ticket.id}`, 50, footerY + 30, {
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
      .fillColor(labelColor, 0.7)
      .text(label, x, y);

    document
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(valueColor)
      .text(value, x, y + 16, {
        width: 200,
      });
  }

  private sanitizeFilename(value: string): string {
    return value.replace(/[^a-zA-Z0-9_-]/g, '_');
  }
}