export const ROLES = {
  CLIENT: 'client',
  AGENT: 'agent'
} as const;

export const NAVIGATION = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard'
} as const;

export const FEATURES = [
  {
    icon: 'FaSearch',
    title: 'Búsqueda Avanzada',
    description: 'Encuentra exactamente lo que buscas'
  },
  {
    icon: 'FaBuilding',
    title: 'Catálogo Completo',
    description: 'Propiedades verificadas y actualizadas'
  },
  {
    icon: 'FaChartLine',
    title: 'Gestión Eficiente',
    description: 'Control total de propiedades y clientes'
  }
];
