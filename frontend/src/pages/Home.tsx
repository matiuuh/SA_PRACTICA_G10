import { useEffect } from 'react'
import { FaTicketAlt, FaFilm, FaStar, FaCouch, FaHeart } from 'react-icons/fa'
import MainLayout from '../components/templates/MainLayout/MainLayout'
import Button from '../components/atoms/Button/Button'
import PageTransition from '../components/atoms/PageTransition/PageTransition'

const Home = () => {
  useEffect(() => {
    document.title = 'FilmStars | Tu experiencia de cine premium'
  }, [])

  return (
    <MainLayout>
      <PageTransition>
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-red-600 to-cinema-dark-800 opacity-90"></div>
          <div className="relative z-10 text-center py-20 px-4">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-cinema-gold-500 rounded-full shadow-xl">
                <FaStar className="text-cinema-dark-900 text-5xl" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Film<span className="text-cinema-gold-500">Stars</span>
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">
              La mejor experiencia cinematográfica. Boletos en línea, asientos premium y las últimas funciones.
            </p>
            <Button variant="primary" size="lg" className="text-lg px-8 py-3">
              <FaTicketAlt className="inline mr-2" />
              Comprar Boletos Ahora
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="cinema-card p-6 text-center group hover:scale-105 transition-all">
            <div className="w-16 h-16 bg-cinema-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cinema-red-500 transition-all">
              <FaFilm className="text-cinema-red-500 text-2xl group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Últimos Estrenos</h3>
            <p className="text-gray-400">Las películas más esperadas del momento</p>
          </div>

          <div className="cinema-card p-6 text-center group hover:scale-105 transition-all">
            <div className="w-16 h-16 bg-cinema-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cinema-gold-500 transition-all">
              <FaCouch className="text-cinema-gold-500 text-2xl group-hover:text-cinema-dark-900" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Asientos Premium</h3>
            <p className="text-gray-400">Elige tu asiento favorito en tiempo real</p>
          </div>

          <div className="cinema-card p-6 text-center group hover:scale-105 transition-all">
            <div className="w-16 h-16 bg-cinema-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-cinema-red-500 transition-all">
              <FaTicketAlt className="text-cinema-red-500 text-2xl group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Reserva Fácil</h3>
            <p className="text-gray-400">Compra tus boletos en minutos</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-cinema-red-600 to-cinema-dark-800 rounded-2xl p-10 text-center">
          <FaHeart className="text-cinema-gold-500 text-4xl mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para tu experiencia cinematográfica?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Regístrate ahora y obtén beneficios exclusivos en tu primera compra
          </p>
          <Button variant="primary" size="lg" className="bg-black hover:bg-gray-800">
            Crear Cuenta Gratis
          </Button>
        </div>
      </PageTransition>
    </MainLayout>
  )
}

export default Home
