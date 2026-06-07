export interface ServiceConfig {
  name: string;
  url: string;
  routes: string[];
  healthCheck: string;
}

export const services: ServiceConfig[] = [
  {
    name: 'auth',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    routes: ['/api/auth'],
    healthCheck: '/api/auth/health',
  },
  {
    name: 'localidades',
    url: process.env.LOCALIDADES_SERVICE_URL || 'http://localhost:3002',
    routes: ['/api/localidades'],
    healthCheck: '/api/localidades/health',
  },
  {
    name: 'funciones',
    url: process.env.FUNCIONES_SERVICE_URL || 'http://localhost:3003',
    routes: ['/api/funciones', '/api/peliculas', '/api/categorias', '/api/tipo-cartelera'],
    healthCheck: '/api/funciones/health',
  },
  {
    name: 'reservas',
    url: process.env.RESERVAS_SERVICE_URL || 'http://localhost:3004',
    routes: ['/api/reservas'],
    healthCheck: '/api/reservas/health',
  },
  {
    name: 'pagos',
    url: process.env.PAGOS_SERVICE_URL || 'http://localhost:3005',
    routes: ['/api/pagos'],
    healthCheck: '/api/pagos/health',
  },
];
