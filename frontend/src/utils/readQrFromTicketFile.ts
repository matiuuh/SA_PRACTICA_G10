import { BrowserQRCodeReader } from '@zxing/browser';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

const reader = new BrowserQRCodeReader();
const MAX_PDF_PAGES = 5;
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const decodeCanvas = (canvas: HTMLCanvasElement): string | null => {
  try {
    return reader.decodeFromCanvas(canvas).getText().trim();
  } catch {
    return null;
  }
};

const readImage = async (file: File): Promise<string> => {
  const url = URL.createObjectURL(file);

  try {
    const result = await reader.decodeFromImageUrl(url);
    return result.getText().trim();
  } finally {
    URL.revokeObjectURL(url);
  }
};

const readPdf = async (file: File): Promise<string> => {
  const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = getDocument({ data });
  const document = await loadingTask.promise;

  try {
    const pagesToScan = Math.min(document.numPages, MAX_PDF_PAGES);

    for (let pageNumber = 1; pageNumber <= pagesToScan; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2.5 });
      const canvas = window.document.createElement('canvas');

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await page.render({ canvas, viewport }).promise;

      const decoded = decodeCanvas(canvas);
      page.cleanup();

      if (decoded) return decoded;
    }
  } finally {
    await loadingTask.destroy();
  }

  throw new Error('No se encontró un código QR legible en el PDF.');
};

export const readQrFromTicketFile = async (file: File): Promise<string> => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('El archivo no puede superar los 15 MB.');
  }

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return readPdf(file);
  }

  if (['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    try {
      return await readImage(file);
    } catch {
      throw new Error('No se encontró un código QR legible en la imagen.');
    }
  }

  throw new Error('Formato no compatible. Sube un archivo PDF, PNG, JPG o WEBP.');
};
