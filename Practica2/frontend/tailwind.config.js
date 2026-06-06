/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cinema-red': {
          500: '#C41E3A',  // Rojo teatro clásico
          600: '#8B0000',  // Rojo más oscuro
          700: '#660000',
        },
        'cinema-gold': {
          500: '#D4AF37',  // Oro - lujo y premios
          600: '#B8860B',
          700: '#8B6508',
        },
        'cinema-dark': {
          800: '#2C1810',  // Marrón oscuro - calidez
          900: '#1A0F0A',  // Más oscuro
        },
        'cinema-warm': {
          500: '#8B5A2B',  // Marrón medio
          600: '#654321',
        },
        'cinema-cream': {
          500: '#F5E6D3',  // Crema para fondos
          600: '#E8D5B7',
        },
      },
      backgroundImage: {
        'cinema-gradient': 'linear-gradient(135deg, #1A0F0A 0%, #2C1810 100%)',
        'cinema-card': 'linear-gradient(135deg, rgba(44,24,16,0.95) 0%, rgba(26,15,10,0.95) 100%)',
      },
      fontFamily: {
        'cinema': ['Poppins', 'system-ui', 'sans-serif'],
        'display': ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
