import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../components/templates/MainLayout/MainLayout'
import UserProfileHeader from '../../components/organisms/UserProfileHeader/UserProfileHeader'
import UserSubHeader from '../../components/organisms/UserSubHeader/UserSubHeader'
import Cartelera from '../../components/organisms/Cartelera/Cartelera'
import SeleccionAsientos from '../../components/organisms/SeleccionAsientos/SeleccionAsientos'
import MiPerfil from '../../components/organisms/MiPerfil/MiPerfil'
import ModalHorarios from '../../components/organisms/ModalHorarios/ModalHorarios'
import ModalPago from '../../components/organisms/ModalPago/ModalPago'
import ModalConfirmacion from '../../components/organisms/ModalConfirmacion/ModalConfirmacion'
import { authService } from '../../services/auth.service'
import { type TabType } from '../../types/panel.types'

interface Pelicula {
  id: number
  titulo: string
  genero: string
  duracion: string
  clasificacion: string
  imagen: string
  horarios: string[]
  categoria: 'estreno' | 'preventa' | 'reestreno'
}

interface Asiento {
  id: string
  numero: number
  fila: string
  estado: 'disponible' | 'seleccionado' | 'ocupado'
}

const PanelUser = () => {
  const navigate = useNavigate()
  const user = authService.getUser()
  const [activeTab, setActiveTab] = useState<TabType>('cartelera')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCinema, setSelectedCinema] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPagoOpen, setModalPagoOpen] = useState(false)
  const [modalConfirmacionOpen, setModalConfirmacionOpen] = useState(false)
  const [selectedPelicula, setSelectedPelicula] = useState<Pelicula | null>(null)
  const [compraData, setCompraData] = useState<{
    pelicula: Pelicula
    horario: string
  } | null>(null)
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<Asiento[]>([])
  const [totalPago, setTotalPago] = useState(0)
  const [boletaGenerada, setBoletaGenerada] = useState<any>(null)
  
  const peliculas: Pelicula[] = [
    {
      id: 1,
      titulo: 'Dune: Parte 2',
      genero: 'Ciencia Ficción',
      duracion: '2h 46min',
      clasificacion: 'PG-13',
      imagen: '',
      horarios: ['14:30', '17:45', '21:00'],
      categoria: 'estreno'
    },
    {
      id: 2,
      titulo: 'Kung Fu Panda 4',
      genero: 'Animación',
      duracion: '1h 34min',
      clasificacion: 'PG',
      imagen: '',
      horarios: ['11:00', '13:30', '16:00', '18:30'],
      categoria: 'estreno'
    },
    {
      id: 3,
      titulo: 'Godzilla x Kong: El Nuevo Imperio',
      genero: 'Acción',
      duracion: '1h 55min',
      clasificacion: 'PG-13',
      imagen: '',
      horarios: ['15:00', '18:00', '20:30'],
      categoria: 'preventa'
    },
    {
      id: 4,
      titulo: 'Furiosa: De la Saga Mad Max',
      genero: 'Acción',
      duracion: '2h 28min',
      clasificacion: 'R',
      imagen: '',
      horarios: ['16:00', '19:15', '22:00'],
      categoria: 'preventa'
    },
    {
      id: 5,
      titulo: 'Intensamente 2',
      genero: 'Animación',
      duracion: '1h 40min',
      clasificacion: 'PG',
      imagen: '',
      horarios: ['10:30', '13:00', '15:30', '18:00'],
      categoria: 'preventa'
    },
    {
      id: 6,
      titulo: 'Titanic (Reestreno)',
      genero: 'Romance',
      duracion: '3h 14min',
      clasificacion: 'PG-13',
      imagen: '',
      horarios: ['12:00', '16:00', '20:00'],
      categoria: 'reestreno'
    },
    {
      id: 7,
      titulo: 'El Señor de los Anillos (Reestreno)',
      genero: 'Fantasía',
      duracion: '3h 48min',
      clasificacion: 'PG-13',
      imagen: '',
      horarios: ['13:00', '18:00'],
      categoria: 'reestreno'
    },
    {
      id: 8,
      titulo: 'Deadpool 3',
      genero: 'Acción/Comedia',
      duracion: '2h 10min',
      clasificacion: 'R',
      imagen: '',
      horarios: ['17:00', '20:00', '22:30'],
      categoria: 'estreno'
    }
  ]

  useEffect(() => {
    document.title = 'Mi Panel | FilmStars'
    
    if (!authService.isAuthenticated()) {
      navigate('/login')
    }
    
    const savedCity = localStorage.getItem('selectedCity')
    const savedCinema = localStorage.getItem('selectedCinema')
    setSelectedCity(savedCity || '')
    setSelectedCinema(savedCinema || '')
  }, [navigate])

  const handleVerHorarios = (pelicula: Pelicula) => {
    setSelectedPelicula(pelicula)
    setModalOpen(true)
  }

  const handleConfirmarHorario = (horario: string) => {
    if (selectedPelicula) {
      setCompraData({
        pelicula: selectedPelicula,
        horario
      })
      setModalOpen(false)
      setSelectedPelicula(null)
      setActiveTab('seleccion-asientos')
    }
  }

  const handleConfirmarSeleccionAsientos = (asientos: Asiento[], total: number) => {
    setAsientosSeleccionados(asientos)
    setTotalPago(total)
    setModalPagoOpen(true)
  }

  const handlePagar = (datosPago: any) => {
    const boleta = {
      id: `BOL-${Date.now()}`,
      pelicula: compraData?.pelicula.titulo,
      horario: compraData?.horario,
      fecha: new Date().toLocaleDateString('es-ES'),
      asientos: asientosSeleccionados.map(a => a.id),
      total: totalPago,
      fechaCompra: new Date().toLocaleString(),
      metodoPago: 'Tarjeta de crédito',
      ultimosDigitos: datosPago.numeroTarjeta.slice(-4)
    }
    
    setBoletaGenerada(boleta)
    setModalPagoOpen(false)
    setModalConfirmacionOpen(true)
  }

  const handleCerrarConfirmacion = () => {
    setModalConfirmacionOpen(false)
    setCompraData(null)
    setAsientosSeleccionados([])
    setActiveTab('cartelera')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'cartelera':
        return (
          <Cartelera 
            peliculas={peliculas}
            onVerHorarios={handleVerHorarios}
            selectedCity={selectedCity}
            selectedCinema={selectedCinema}
          />
        )
      case 'seleccion-asientos':
        if (compraData) {
          return (
            <SeleccionAsientos 
              pelicula={{
                titulo: compraData.pelicula.titulo,
                horario: compraData.horario,
                fecha: new Date().toLocaleDateString('es-ES')
              }}
              onConfirmarSeleccion={handleConfirmarSeleccionAsientos}
            />
          )
        }
        return (
          <div className="cinema-card p-6 text-center">
            <p className="text-gray-400">Primero selecciona una película y horario desde la cartelera</p>
            <button 
              onClick={() => setActiveTab('cartelera')}
              className="mt-4 bg-cinema-red-500 text-white px-4 py-2 rounded-lg"
            >
              Ir a Cartelera
            </button>
          </div>
        )
      case 'mi-perfil':
        return <MiPerfil usuario={{ nombre: user?.nombre || '', correo: user?.correo || '', telefono: '' }} />
      default:
        return null
    }
  }

  return (
    <>
      <MainLayout>
        <div className="w-full">
          <UserProfileHeader />
          <UserSubHeader activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="mt-6">
            {renderContent()}
          </div>
        </div>
      </MainLayout>

      <ModalHorarios
        pelicula={selectedPelicula}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedPelicula(null)
        }}
        onConfirm={handleConfirmarHorario}
      />

      <ModalPago
        isOpen={modalPagoOpen}
        onClose={() => setModalPagoOpen(false)}
        onPagar={handlePagar}
        total={totalPago}
        asientos={asientosSeleccionados.map(a => a.id)}
        pelicula={compraData?.pelicula.titulo || ''}
        horario={compraData?.horario || ''}
        fecha={new Date().toLocaleDateString('es-ES')}
      />

      <ModalConfirmacion
        isOpen={modalConfirmacionOpen}
        onClose={handleCerrarConfirmacion}
        boleta={boletaGenerada}
      />
    </>
  )
}

export default PanelUser
