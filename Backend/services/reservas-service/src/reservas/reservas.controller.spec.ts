import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ReservasController } from './reservas.controller';

const mockService = {
  findAsientosByFuncion: jest.fn(),
  findBoletoById: jest.fn(),
  findReservaById: jest.fn(),
  createAsiento: jest.fn(),
  createEstado: jest.fn(),
  createReserva: jest.fn(),
  createCheckout: jest.fn(),
  confirmReserva: jest.fn(),
};
const mockTicketHistoryService = {
  findByUser: jest.fn(),
};
const mockAdminTicketSearchService = {
  search: jest.fn(),
};
const mockTicketValidationService = {
  validateByCode: jest.fn(),
  validateManually: jest.fn(),
};
const mockTicketDownloadService = {
  download: jest.fn(),
};

const mockUser = { id: 'user-1', rol: 'CLIENTE' };
const mockAdminUser = { id: 'admin-1', rol: 'ADMINISTRADOR' };
const buildRequest = (user: any) => ({ user });

describe('ReservasController', () => {
  let controller: ReservasController;

  beforeEach(() => {
    controller = new ReservasController(
      mockService as any,
      mockTicketHistoryService as any,
      mockAdminTicketSearchService as any,
      mockTicketValidationService as any,
      mockTicketDownloadService as any,
    );
    jest.clearAllMocks();
  });

  describe('health', () => {
    it('debe retornar status ok con nombre del servicio', () => {
      const result = controller.health();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('reservas-service');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('findAsientosByFuncion', () => {
    it('debe llamar al servicio con el id de funcion y usuario autenticado', () => {
      mockService.findAsientosByFuncion.mockResolvedValue([]);
      controller.findAsientosByFuncion('funcion-1', buildRequest(mockUser));
      expect(mockService.findAsientosByFuncion).toHaveBeenCalledWith('funcion-1', 'user-1');
    });

    it('debe lanzar UnauthorizedException si no hay usuario en el request', () => {
      expect(() =>
        controller.findAsientosByFuncion('funcion-1', buildRequest(undefined)),
      ).toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario no tiene id', () => {
      expect(() =>
        controller.findAsientosByFuncion('funcion-1', buildRequest({})),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('findBoleto', () => {
    const mockBoleto = { id: 'bol-1', reserva: { usuarioIdExterno: 'user-1' } };

    it('debe retornar el boleto si el usuario es el propietario', async () => {
      mockService.findBoletoById.mockResolvedValue(mockBoleto);
      const result = await controller.findBoleto('bol-1', buildRequest(mockUser));
      expect(result).toEqual(mockBoleto);
    });

    it('debe retornar el boleto si el usuario es ADMINISTRADOR aunque no sea propietario', async () => {
      mockService.findBoletoById.mockResolvedValue(mockBoleto);
      const result = await controller.findBoleto('bol-1', buildRequest(mockAdminUser));
      expect(result).toEqual(mockBoleto);
    });

    it('debe lanzar ForbiddenException si el usuario no es propietario ni admin', async () => {
      mockService.findBoletoById.mockResolvedValue(mockBoleto);
      const otherUser = { id: 'other-user', rol: 'CLIENTE' };
      await expect(
        controller.findBoleto('bol-1', buildRequest(otherUser)),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar ForbiddenException si no hay usuario en el request', async () => {
      mockService.findBoletoById.mockResolvedValue(mockBoleto);
      await expect(
        controller.findBoleto('bol-1', buildRequest(undefined)),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findMyTickets', () => {
    it('consulta el historial del usuario autenticado', () => {
      mockTicketHistoryService.findByUser.mockResolvedValue({
        data: [],
        meta: { page: 2, limit: 5, total: 0, totalPages: 0 },
      });

      controller.findMyTickets(
        { page: 2, limit: 5 },
        buildRequest(mockUser),
      );

      expect(mockTicketHistoryService.findByUser).toHaveBeenCalledWith(
        'user-1',
        2,
        5,
      );
    });

    it('rechaza la consulta sin usuario autenticado', () => {
      expect(() =>
        controller.findMyTickets({}, buildRequest(undefined)),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('searchTickets', () => {
    it('delega los filtros al servicio administrativo', () => {
      const filters = {
        identificador: 'BOL-001',
        pelicula: 'Pelicula',
        page: 1,
        limit: 10,
      };

      controller.searchTickets(filters);

      expect(mockAdminTicketSearchService.search).toHaveBeenCalledWith(filters);
    });
  });

  describe('ticket validation', () => {
    it('valida un codigo usando el administrador autenticado', () => {
      controller.validateTicket(
        { codigo: ' BOL-001 ' },
        buildRequest(mockAdminUser),
      );

      expect(mockTicketValidationService.validateByCode).toHaveBeenCalledWith(
        ' BOL-001 ',
        'admin-1',
      );
    });

    it('valida manualmente por id usando el administrador autenticado', () => {
      controller.validateTicketManually(
        '11111111-1111-4111-8111-111111111111',
        buildRequest(mockAdminUser),
      );

      expect(
        mockTicketValidationService.validateManually,
      ).toHaveBeenCalledWith(
        '11111111-1111-4111-8111-111111111111',
        'admin-1',
      );
    });

    it('rechaza validacion sin usuario autenticado', () => {
      expect(() =>
        controller.validateTicket(
          { codigo: 'BOL-001' },
          buildRequest(undefined),
        ),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('downloadTicket', () => {
    it('envia el PDF generado con headers de descarga', async () => {
      const content = Buffer.from('%PDF-test');
      mockTicketDownloadService.download.mockResolvedValue({
        filename: 'boleto-BOL-001.pdf',
        contentType: 'application/pdf',
        content,
      });
      const response = {
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await controller.downloadTicket(
        '11111111-1111-4111-8111-111111111111',
        buildRequest(mockUser),
        response as any,
      );

      expect(mockTicketDownloadService.download).toHaveBeenCalledWith(
        '11111111-1111-4111-8111-111111111111',
        'user-1',
        'CLIENTE',
      );
      expect(response.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(response.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="boleto-BOL-001.pdf"',
      );
      expect(response.setHeader).toHaveBeenCalledWith(
        'Content-Length',
        content.length.toString(),
      );
      expect(response.end).toHaveBeenCalledWith(content);
    });
  });

  describe('findReserva', () => {
    const mockReserva = { id: 'res-1', usuarioIdExterno: 'user-1' };

    it('debe retornar la reserva si el usuario es el propietario', async () => {
      mockService.findReservaById.mockResolvedValue(mockReserva);
      const result = await controller.findReserva('res-1', buildRequest(mockUser));
      expect(result).toEqual(mockReserva);
    });

    it('debe retornar la reserva si el usuario es ADMINISTRADOR', async () => {
      mockService.findReservaById.mockResolvedValue(mockReserva);
      const result = await controller.findReserva('res-1', buildRequest(mockAdminUser));
      expect(result).toEqual(mockReserva);
    });

    it('debe lanzar ForbiddenException si el usuario no es propietario ni admin', async () => {
      mockService.findReservaById.mockResolvedValue(mockReserva);
      const otherUser = { id: 'other-user', rol: 'CLIENTE' };
      await expect(
        controller.findReserva('res-1', buildRequest(otherUser)),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createAsiento', () => {
    it('debe delegar al servicio con el dto recibido', () => {
      const dto = { fila: 'A', numero: 1, idFuncionExterna: 'funcion-1' };
      mockService.createAsiento.mockResolvedValue({ id: 'asiento-1', ...dto });
      controller.createAsiento(dto);
      expect(mockService.createAsiento).toHaveBeenCalledWith(dto);
    });
  });

  describe('createEstado', () => {
    it('debe delegar al servicio con el dto recibido', () => {
      const dto = { nombre: 'TEMPORAL' };
      mockService.createEstado.mockResolvedValue({ id: 'est-1', ...dto });
      controller.createEstado(dto);
      expect(mockService.createEstado).toHaveBeenCalledWith(dto);
    });
  });

  describe('createReserva', () => {
    it('debe llamar al servicio incluyendo el id del usuario autenticado', () => {
      const dto = { asientosIds: ['a-1'], total: 100 };
      mockService.createReserva.mockResolvedValue({ id: 'res-1' });
      controller.createReserva(dto as any, buildRequest(mockUser));
      expect(mockService.createReserva).toHaveBeenCalledWith({
        ...dto,
        usuarioIdExterno: 'user-1',
      });
    });

    it('debe lanzar UnauthorizedException si no hay usuario en el request', () => {
      const dto = { asientosIds: ['a-1'], total: 100 };
      expect(() =>
        controller.createReserva(dto as any, buildRequest(undefined)),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('createCheckout', () => {
    it('debe llamar al servicio incluyendo el id del usuario autenticado', () => {
      const dto = { asientosIds: ['a-1'], total: 100, idFuncionExterna: 'funcion-1' };
      mockService.createCheckout.mockResolvedValue({ id: 'res-1' });
      controller.createCheckout(dto as any, buildRequest(mockUser));
      expect(mockService.createCheckout).toHaveBeenCalledWith({
        ...dto,
        usuarioIdExterno: 'user-1',
      });
    });

    it('debe lanzar UnauthorizedException si no hay usuario en el request', () => {
      const dto = { asientosIds: ['a-1'], total: 100, idFuncionExterna: 'funcion-1' };
      expect(() =>
        controller.createCheckout(dto as any, buildRequest(undefined)),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('confirmReserva', () => {
    it('debe llamar al servicio con el id de la reserva', () => {
      mockService.confirmReserva.mockResolvedValue({ id: 'res-1' });
      controller.confirmReserva('res-1');
      expect(mockService.confirmReserva).toHaveBeenCalledWith('res-1');
    });
  });
});
