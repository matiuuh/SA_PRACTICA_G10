import { BrowserQRCodeReader } from '@zxing/browser';

export interface TicketScannerControls {
  stop: () => void;
}

type TicketDetectedHandler = (code: string) => void;

/**
 * Encapsula el acceso a la cámara. La lectura ocurre completamente en el
 * navegador; ningún fotograma se envía al servidor.
 */
export class TicketScannerService {
  private readonly reader = new BrowserQRCodeReader(undefined, {
    delayBetweenScanAttempts: 150,
    delayBetweenScanSuccess: 1000,
  });

  private controls: TicketScannerControls | null = null;
  private detected = false;
  private stopped = true;

  async start(video: HTMLVideoElement, onDetected: TicketDetectedHandler): Promise<void> {
    this.stop();
    this.detected = false;
    this.stopped = false;

    if (!window.isSecureContext) {
      throw new Error('La cámara requiere abrir el sitio mediante HTTPS o desde localhost.');
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Este dispositivo o navegador no permite usar la cámara.');
    }

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    const controls = await this.reader.decodeFromConstraints(
      constraints,
      video,
      (result, _error, controls) => {
        if (!result || this.detected) return;

        const code = result.getText().trim();
        if (!code) return;

        this.detected = true;
        controls.stop();
        this.controls = null;
        onDetected(code);
      },
    );

    if (this.stopped || this.detected) {
      controls.stop();
      return;
    }

    this.controls = controls;
  }

  stop(): void {
    this.stopped = true;
    this.controls?.stop();
    this.controls = null;
  }
}
