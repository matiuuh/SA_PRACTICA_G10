import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface TicketQrProps {
  value: string;
  size?: number;
}

const TicketQr = ({ value, size = 64 }: TicketQrProps) => {
  const [source, setSource] = useState('');

  useEffect(() => {
    let active = true;

    void QRCode.toDataURL(value, {
      width: size * 3,
      margin: 1,
      errorCorrectionLevel: 'M',
    })
      .then((dataUrl) => {
        if (active) setSource(dataUrl);
      })
      .catch(() => {
        if (active) setSource('');
      });

    return () => {
      active = false;
    };
  }, [size, value]);

  return source ? (
    <img
      src={source}
      alt="Código QR del boleto"
      width={size}
      height={size}
      className="rounded"
    />
  ) : (
    <div
      aria-label="Generando código QR"
      className="animate-pulse rounded bg-gray-200"
      style={{ width: size, height: size }}
    />
  );
};

export default TicketQr;
