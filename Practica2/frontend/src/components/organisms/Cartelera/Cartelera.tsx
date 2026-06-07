import { useState } from 'react';
import {
  FaClock,
  FaFilm,
  FaFilter,
  FaFire,
  FaInfoCircle,
  FaRedo,
  FaRocket,
  FaStar,
} from 'react-icons/fa';
import type { CarteleraCategoria, CarteleraPelicula } from '../../../types/user-panel.types';

interface CarteleraProps {
  peliculas: CarteleraPelicula[];
  onVerHorarios: (pelicula: CarteleraPelicula) => void;
  selectedCity?: string;
  selectedCinema?: string;
}

type CategoriaFiltro = 'todos' | CarteleraCategoria;

const Cartelera: React.FC<CarteleraProps> = ({
  peliculas,
  onVerHorarios,
  selectedCity,
  selectedCinema,
}) => {
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaFiltro>('todos');

  const categorias = [
    { id: 'todos' as CategoriaFiltro, label: 'Todos', icon: FaFilter, color: 'bg-gray-500' },
    { id: 'estreno' as CategoriaFiltro, label: 'Estrenos', icon: FaFire, color: 'bg-cinema-red-500' },
    { id: 'preventa' as CategoriaFiltro, label: 'Pre-ventas', icon: FaRocket, color: 'bg-blue-500' },
    { id: 'reestreno' as CategoriaFiltro, label: 'Re-Estrenos', icon: FaRedo, color: 'bg-purple-500' },
  ];

  const peliculasFiltradas =
    categoriaActiva === 'todos'
      ? peliculas
      : peliculas.filter((pelicula) => pelicula.categoria === categoriaActiva);

  const getCategoriaBadge = (categoria: CarteleraCategoria) => {
    switch (categoria) {
      case 'estreno':
        return { text: 'Estreno', color: 'bg-cinema-red-500', icon: FaFire };
      case 'preventa':
        return { text: 'Pre-venta', color: 'bg-blue-500', icon: FaRocket };
      case 'reestreno':
        return { text: 'Re-Estreno', color: 'bg-purple-500', icon: FaRedo };
      default:
        return { text: '', color: 'bg-gray-500', icon: FaFilm };
    }
  };

  return (
    <div>
      {(!selectedCity || !selectedCinema) && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <FaInfoCircle className="text-yellow-500" />
            <p className="text-yellow-500 text-sm">
              Selecciona una ciudad y un cine en el menu superior para ver la cartelera disponible.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categorias.map((categoria) => {
          const Icon = categoria.icon;
          const isActive = categoriaActiva === categoria.id;

          return (
            <button
              key={categoria.id}
              onClick={() => setCategoriaActiva(categoria.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all transform hover:scale-105 ${
                isActive
                  ? `${categoria.color} text-white shadow-lg`
                  : 'bg-cinema-dark-800 text-gray-400 hover:bg-cinema-dark-700'
              }`}
            >
              <Icon className="text-sm" />
              <span className="font-medium">{categoria.label}</span>
              {isActive && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {peliculasFiltradas.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm">
          Mostrando <span className="text-cinema-gold-500 font-bold">{peliculasFiltradas.length}</span>{' '}
          peliculas
          {categoriaActiva !== 'todos' &&
            ` en ${categorias.find((categoria) => categoria.id === categoriaActiva)?.label}`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
        {peliculasFiltradas.map((pelicula) => {
          const badge = getCategoriaBadge(pelicula.categoria);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={pelicula.id}
              className="cinema-card overflow-hidden group hover:scale-105 transition-all cursor-pointer"
            >
              <div className="h-80 bg-gradient-to-br from-cinema-red-500 to-cinema-dark-800 flex items-center justify-center relative">
                <FaFilm className="text-7xl text-white/30 group-hover:scale-110 transition-all" />
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                  {pelicula.clasificacion}
                </div>
                <div
                  className={`absolute top-2 left-2 ${badge.color} px-2 py-1 rounded-lg text-xs text-white font-semibold flex items-center gap-1`}
                >
                  <BadgeIcon className="text-xs" />
                  {badge.text}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2 gap-3">
                  <h3 className="font-bold text-lg text-white line-clamp-2">{pelicula.titulo}</h3>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-cinema-gold-500 text-sm" />
                    <span className="text-sm text-gray-300">{pelicula.horarios.length}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">{pelicula.genero}</p>
                <p className="text-gray-500 text-xs mb-4">{pelicula.duracion}</p>

                <button
                  onClick={() => onVerHorarios(pelicula)}
                  disabled={!selectedCinema || pelicula.horarios.length === 0}
                  className="w-full bg-cinema-gold-500/20 hover:bg-cinema-gold-500/30 text-cinema-gold-500 font-semibold py-2.5 px-3 rounded-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaClock className="text-sm" />
                  Ver Horarios Disponibles
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {peliculasFiltradas.length === 0 && (
        <div className="text-center py-16">
          <FaFilm className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {selectedCinema ? 'No hay peliculas disponibles para este cine' : 'Aun no hay cartelera para mostrar'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Cartelera;
