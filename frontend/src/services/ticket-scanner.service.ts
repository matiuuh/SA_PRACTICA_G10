import { Html5Qrcode } from 'html5-qrcode';

type TicketDetectedHandler = (code: string) => void;

export const SCANNER_ELEMENT_ID = 'qr-reader-camera';

/**
 * Encapsula el acceso a la cámara usando html5-qrcode.
 * La lectura ocurre completamente en el navegador; no requiere HTTPS.
 */
export class TicketScannerService {
  private scanner: Html5Qrcode | null = null;
  private detected = false;
  private stopped = true;

  async start(containerId: string, onDetected: TicketDetectedHandler): Promise<void> {
    this.stop();
    this.detected = false;
    this.stopped = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Este dispositivo o navegador no permite usar la cámara.');
    }

    const scanner = new Html5Qrcode(containerId);
    this.scanner = scanner;

    await scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 4 / 3,
      },
      (decodedText) => {
        if (this.detected || this.stopped) return;

        const code = decodedText.trim();
        if (!code) return;

        this.detected = true;
        void this.stop();
        onDetected(code);
      },
      () => {
        // scan failure por frame — ignorar
      },
    );
  }

  stop(): void {
    this.stopped = true;
    const scanner = this.scanner;
    this.scanner = null;
    if (scanner) {
      void scanner.stop().catch(() => undefined);
    }
  }
}
