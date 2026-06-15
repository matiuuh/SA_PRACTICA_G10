import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaPlayCircle, FaArrowRight, FaMagic, FaUsers, FaFilm, FaCouch, FaStar } from 'react-icons/fa'
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

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl mb-20 min-h-[520px] flex items-center">
          {/* Background layers — red-first matching app pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-cinema-red-600 via-cinema-dark-800 to-cinema-dark-900" />
          {/* Spotlight glow */}
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-cinema-red-600/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-0 w-[360px] h-[360px] rounded-full bg-cinema-gold-500/10 blur-3xl pointer-events-none" />

          {/* Film rolls illustration */}
          <div className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end pointer-events-none select-none">
            <img
              src="/landing/Film_Rolls.svg"
              alt="Film Rolls"
              className="h-full w-auto object-contain opacity-25 md:opacity-40 drop-shadow-2xl"
              draggable={false}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 py-20 md:px-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-cinema-gold-500/15 border border-cinema-gold-500/30 text-cinema-gold-500 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              <FaStar className="text-base" />
              Cine de autor &amp; estrenos mundiales
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-tight text-white mb-5 font-display">
              Vive el cine<br />
              <span className="text-cinema-gold-500">como arte.</span>
            </h1>

            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
              Descubre una selección curada de películas, estrenos y funciones especiales.
              Cada butaca es una primera fila.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/panel/usuario">
                <Button variant="primary" size="lg" className="flex items-center gap-2 px-8">
                  <FaPlayCircle className="text-xl" />
                  Ver Cartelera
                </Button>
              </Link>
              <Link to="/login" className="flex items-center gap-2 text-gray-300 hover:text-cinema-gold-500 transition-colors font-medium">
                Iniciar sesión
                <FaArrowRight className="text-sm" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats strip ──────────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            { value: '200+', label: 'Películas en catálogo' },
            { value: '12', label: 'Salas disponibles' },
            { value: '50k+', label: 'Espectadores al mes' },
            { value: '4K', label: 'Calidad de proyección' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="cinema-card p-5 text-center rounded-2xl border border-cinema-gold-500/10 hover:border-cinema-gold-500/30 transition-all"
            >
              <p className="text-3xl font-black text-cinema-gold-500 mb-1">{value}</p>
              <p className="text-gray-400 text-sm">{label}</p>
            </div>
          ))}
        </section>

        {/* ── Experience pillars ───────────────────────────────────── */}
        <section className="mb-20">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">
              Una experiencia que va más allá
            </h2>
            <p className="text-gray-400">Todo lo que necesitas para disfrutar el séptimo arte.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FaFilm className="text-3xl" />,
                cardCls: 'hover:border-cinema-red-500/30',
                iconCls: 'bg-cinema-red-500/15 text-cinema-red-500 group-hover:bg-cinema-red-500',
                title: 'Cartelera curada',
                desc: 'Estrenos mundiales, ciclos temáticos y retrospectivas de directores reconocidos.',
              },
              {
                icon: <FaCouch className="text-3xl" />,
                cardCls: 'hover:border-cinema-gold-500/30',
                iconCls: 'bg-cinema-gold-500/15 text-cinema-gold-500 group-hover:bg-cinema-gold-500',
                title: 'Butacas premium',
                desc: 'Selecciona tu asiento en tiempo real. Visión perfecta garantizada desde cualquier lugar.',
              },
              {
                icon: <FaMagic className="text-3xl" />,
                cardCls: 'hover:border-cinema-red-500/30',
                iconCls: 'bg-cinema-red-500/15 text-cinema-red-500 group-hover:bg-cinema-red-500',
                title: 'Experiencia inmersiva',
                desc: 'Sonido envolvente Dolby Atmos y proyección 4K para vivir cada escena al máximo.',
              },
            ].map(({ icon, cardCls, iconCls, title, desc }) => (
              <div
                key={title}
                className={`group cinema-card rounded-2xl p-7 border border-transparent ${cardCls} transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:text-white transition-all duration-300 ${iconCls}`}>
                  {icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section className="mb-20">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Así de simple</h2>
            <p className="text-gray-400">Tu boleto en menos de 2 minutos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: <FaFilm />, title: 'Elige tu película', desc: 'Explora la cartelera y selecciona la función que más te emocione.' },
              { step: '02', icon: <FaCouch />, title: 'Escoge tu asiento', desc: 'Selecciona el lugar ideal con nuestro mapa interactivo de la sala.' },
              { step: '03', icon: <FaUsers />, title: 'Disfruta', desc: 'Presenta tu boleto digital y vive la magia del cine.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cinema-red-500/20 border border-cinema-red-500/40 flex items-center justify-center text-cinema-red-500 font-black text-sm">
                  {step}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-cinema-gold-500 mb-1 text-lg">
                    {icon}
                    <h4 className="font-bold text-white">{title}</h4>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA banner ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center bg-gradient-to-br from-cinema-dark-800 to-cinema-red-600/30 border border-cinema-gold-500/20">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-cinema-gold-500/5 blur-3xl pointer-events-none" />
          <FaStar className="text-cinema-gold-500 text-5xl mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Tu primera función te espera
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
            Únete y accede a preventas exclusivas, descuentos especiales y funciones de medianoche
            antes que nadie.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary" size="lg" className="px-10">
                Crear cuenta gratis
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="px-10 border border-gray-600 bg-transparent text-gray-300 hover:bg-white/5">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </section>

      </PageTransition>
    </MainLayout>
  )
}

export default Home
