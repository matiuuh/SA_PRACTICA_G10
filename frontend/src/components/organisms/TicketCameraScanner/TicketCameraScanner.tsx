import { useCallback, useEffect, useRef, useState } from 'react';
import { FaCamera, FaRedo, FaSpinner } from 'react-icons/fa';
import { TicketScannerService } from '../../../services/ticket-scanner.service';

interface TicketCameraScannerProps {
  disabled?: boolean;
  resetKey: number;
  onDetected: (code: string) => void;
}

const cameraErrorMessage = (error: unknown): string => {
  const name = error instanceof DOMException ? error.name : '';

  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Permiso de cámara denegado. Habilítalo en la configuración del navegador.';
  }

  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No se encontró una cámara disponible en este dispositivo.';
  }

  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'La cámara está siendo utilizada por otra aplicación.';
  }

  return error instanceof Error
    ? error.message
    : 'No se pudo iniciar la cámara.';
};

const TicketCameraScanner = ({ disabled = false, resetKey, onDetected }: TicketCameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<TicketScannerService | null>(null);
  const onDetectedRef = useRef(onDetected);
  const [starting, setStarting] = useState(false);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const stopCamera = useCallback(() => {
    scannerRef.current?.stop();
    scannerRef.current = null;
    setStarting(false);
    setActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!videoRef.current || disabled) return;

    stopCamera();
    setStarting(true);
    setError(null);

    const scanner = new TicketScannerService();
    scannerRef.current = scanner;

    try {
      await scanner.start(videoRef.current, (code) => {
        setActive(false);
        onDetectedRef.current(code);
      });

      if (scannerRef.current !== scanner) return;

      setActive(true);
      setStarting(false);
    } catch (cameraError: unknown) {
      scanner.stop();
      if (scannerRef.current !== scanner) return;

      scannerRef.current = null;
      setError(cameraErrorMessage(cameraError));
      setActive(false);
      setStarting(false);
    }
  }, [disabled, stopCamera]);

  useEffect(() => {
    void startCamera();
    return stopCamera;
  }, [resetKey, startCamera, stopCamera]);

  useEffect(() => {
    if (disabled) stopCamera();
  }, [disabled, stopCamera]);

  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-2xl border border-cinema-gold-500/30 bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
          aria-label="Vista de la cámara para escanear el código QR"
        />

        {!active && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cinema-dark-900/90 text-gray-300">
            {starting || disabled ? (
              <FaSpinner className="animate-spin text-3xl text-cinema-gold-500" />
            ) : (
              <FaCamera className="text-3xl text-cinema-gold-500" />
            )}
            <p className="text-sm">
              {starting ? 'Iniciando cámara...' : disabled ? 'Validando boleto...' : 'Lectura detenida'}
            </p>
          </div>
        )}

        {active && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-52 w-52 max-h-[65%] max-w-[65%] rounded-2xl border-2 border-cinema-gold-400 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]">
              <div className="absolute left-3 right-3 top-1/2 h-0.5 animate-pulse bg-cinema-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-cinema-dark-900/95 p-6 text-center">
            <FaCamera className="text-4xl text-cinema-red-500" />
            <p className="max-w-md text-sm text-gray-200">{error}</p>
            <button
              type="button"
              onClick={() => void startCamera()}
              className="flex items-center gap-2 rounded-lg bg-cinema-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cinema-red-600"
            >
              <FaRedo />
              Reintentar cámara
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        Centra el código QR dentro del recuadro. La lectura se realiza en este dispositivo.
      </p>
    </div>
  );
};

export default TicketCameraScanner;
