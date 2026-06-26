import { UnauthorizedException } from '@nestjs/common';
import { InternalServiceGuard } from './internal-service.guard';

describe('InternalServiceGuard', () => {
  const guard = new InternalServiceGuard({
    get: jest.fn().mockReturnValue('internal-test-token'),
  } as never);

  const context = (token?: string) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: token ? { 'x-internal-service-token': token } : {},
      }),
    }),
  });

  it('permite el token interno configurado', () => {
    expect(guard.canActivate(context('internal-test-token') as never)).toBe(true);
  });

  it('rechaza credenciales internas invalidas', () => {
    expect(() => guard.canActivate(context('otro-token') as never)).toThrow(
      UnauthorizedException,
    );
  });
});
