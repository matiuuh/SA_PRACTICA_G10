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
    name: 'movies',
    url: process.env.MOVIES_SERVICE_URL || 'http://localhost:3002',
    routes: ['/api/movies'],
    healthCheck: '/api/movies/health',
  },
  {
    name: 'bookings',
    url: process.env.BOOKINGS_SERVICE_URL || 'http://localhost:3003',
    routes: ['/api/bookings'],
    healthCheck: '/api/bookings/health',
  },
  {
    name: 'payments',
    url: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3004',
    routes: ['/api/payments'],
    healthCheck: '/api/payments/health',
  },
  {
    name: 'locations',
    url: process.env.LOCATIONS_SERVICE_URL || 'http://localhost:3005',
    routes: ['/api/locations'],
    healthCheck: '/api/locations/health',
  },
];
