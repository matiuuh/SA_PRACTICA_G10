import { FaCity, FaMapMarkerAlt, FaTheaterMasks } from 'react-icons/fa';
import type { Cine, Ciudad } from '../../../types/localidades.types';

interface CarteleraLocationFilterProps {
  cinemas: Cine[];
  cinemasLoading: boolean;
  cities: Ciudad[];
  citiesLoading: boolean;
  onCinemaChange: (cinemaId: string) => void;
  onCityChange: (cityId: string) => void;
  selectedCinema: string;
  selectedCity: string;
}

const CarteleraLocationFilter: React.FC<CarteleraLocationFilterProps> = ({
  cinemas,
  cinemasLoading,
  cities,
  citiesLoading,
  onCinemaChange,
  onCityChange,
  selectedCinema,
  selectedCity,
}) => {
  const selectedCinemaData = cinemas.find((cinema) => cinema.id === selectedCinema);

  return (
    <section className="cinema-card mb-6 overflow-hidden">
      <div className="border-b border-white/[0.08] bg-gradient-to-r from-cinema-red-500/10 via-transparent to-cinema-gold-500/[0.06] px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cinema-red-500/15 text-cinema-red-500 ring-1 ring-cinema-red-500/25">
            <FaMapMarkerAlt />
          </span>
          <div>
            <h3 className="font-semibold text-white">¿Dónde quieres ver tu película?</h3>
            <p className="mt-0.5 text-sm text-gray-500">Estos filtros modifican únicamente la cartelera disponible.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <FaCity className="text-cinema-gold-500" />
            Ciudad
          </span>
          <select
            value={selectedCity}
            onChange={(event) => onCityChange(event.target.value)}
            disabled={citiesLoading}
            className="w-full rounded-xl border border-white/10 bg-cinema-dark-900/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cinema-gold-500 disabled:cursor-wait disabled:opacity-60"
          >
            <option value="">{citiesLoading ? 'Cargando ciudades...' : 'Selecciona una ciudad'}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>{city.nombre}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <FaTheaterMasks className="text-cinema-gold-500" />
            Cine
          </span>
          <select
            value={selectedCinema}
            onChange={(event) => onCinemaChange(event.target.value)}
            disabled={!selectedCity || cinemasLoading}
            className="w-full rounded-xl border border-white/10 bg-cinema-dark-900/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cinema-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {!selectedCity
                ? 'Primero selecciona una ciudad'
                : cinemasLoading
                  ? 'Cargando cines...'
                  : 'Selecciona un cine'}
            </option>
            {cinemas.map((cinema) => (
              <option key={cinema.id} value={cinema.id}>{cinema.nombre}</option>
            ))}
          </select>
        </label>
      </div>

      {selectedCinemaData && (
        <div className="border-t border-white/[0.07] px-4 py-3 text-xs text-gray-500 sm:px-6">
          Mostrando funciones de <span className="font-semibold text-gray-300">{selectedCinemaData.nombre}</span>
          {' · '}{selectedCinemaData.direccion}
        </div>
      )}
    </section>
  );
};

export default CarteleraLocationFilter;
