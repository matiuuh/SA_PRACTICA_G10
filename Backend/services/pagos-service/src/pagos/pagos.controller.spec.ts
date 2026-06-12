import { PagosController } from './pagos.controller';

const mockService = {
  findMetodos: jest.fn(),
  findPagosByReserva: jest.fn(),
  findPagoById: jest.fn(),
  createMetodo: jest.fn(),
  createEstado: jest.fn(),
  createPago: jest.fn(),
  changeEstado: jest.fn(),
};

describe('PagosController', () => {
  let controller: PagosController;

  beforeEach(() => {
    controller = new PagosController(mockService as any);
    jest.clearAllMocks();
  });

  describe('health', () => {
    it('debe retornar status ok con nombre del servicio', () => {
      const result = controller.health();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('pagos-service');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('findMetodos', () => {
    it('debe delegar al servicio', () => {
      const metodos = [{ id: 'met-1', nombre: 'TARJETA' }];
      mockService.findMetodos.mockResolvedValue(metodos);
      controller.findMetodos();
      expect(mockService.findMetodos).toHaveBeenCalled();
    });
  });

  describe('findPagosByReserva', () => {
    it('debe delegar al servicio con el id de reserva', () => {
      const pagos = [{ id: 'pago-1' }];
      mockService.findPagosByReserva.mockResolvedValue(pagos);
      controller.findPagosByReserva('reserva-1');
      expect(mockService.findPagosByReserva).toHaveBeenCalledWith('reserva-1');
    });
  });

  describe('findPago', () => {
    it('debe delegar al servicio con el id de pago', () => {
      const pago = { id: 'pago-1' };
      mockService.findPagoById.mockResolvedValue(pago);
      controller.findPago('pago-1');
      expect(mockService.findPagoById).toHaveBeenCalledWith('pago-1');
    });
  });

  describe('createMetodo', () => {
    it('debe delegar al servicio con el dto', () => {
      const dto = { nombre: 'TARJETA' };
      mockService.createMetodo.mockResolvedValue({ id: 'met-1', ...dto });
      controller.createMetodo(dto);
      expect(mockService.createMetodo).toHaveBeenCalledWith(dto);
    });
  });

  describe('createEstado', () => {
    it('debe delegar al servicio con el dto', () => {
      const dto = { nombre: 'PENDIENTE' };
      mockService.createEstado.mockResolvedValue({ id: 'est-1', ...dto });
      controller.createEstado(dto);
      expect(mockService.createEstado).toHaveBeenCalledWith(dto);
    });
  });

  describe('createPago', () => {
    it('debe delegar al servicio con el dto', () => {
      const dto = { reservaId: 'res-1', metodoPagoId: 'met-1', monto: 100 };
      mockService.createPago.mockResolvedValue({ id: 'pago-1' });
      controller.createPago(dto as any);
      expect(mockService.createPago).toHaveBeenCalledWith(dto);
    });
  });

  describe('approvePago', () => {
    it('debe llamar a changeEstado con APROBADO', () => {
      mockService.changeEstado.mockResolvedValue({ id: 'pago-1' });
      controller.approvePago('pago-1');
      expect(mockService.changeEstado).toHaveBeenCalledWith('pago-1', 'APROBADO');
    });
  });

  describe('rejectPago', () => {
    it('debe llamar a changeEstado con RECHAZADO', () => {
      mockService.changeEstado.mockResolvedValue({ id: 'pago-1' });
      controller.rejectPago('pago-1');
      expect(mockService.changeEstado).toHaveBeenCalledWith('pago-1', 'RECHAZADO');
    });
  });
});
