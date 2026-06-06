import { FaSearch, FaBuilding, FaChartLine } from 'react-icons/fa';
import FeatureCard from '../../molecules/FeatureCard/FeatureCard';
import Typography from '../../atoms/Typography/Typography';

const Features = () => {
  const features = [
    { icon: FaSearch, title: 'Búsqueda Avanzada', description: 'Encuentra exactamente lo que buscas' },
    { icon: FaBuilding, title: 'Catálogo Completo', description: 'Propiedades verificadas y actualizadas' },
    { icon: FaChartLine, title: 'Gestión Eficiente', description: 'Control total de propiedades y clientes' }
  ];

  return (
    <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-2xl p-10 mb-16 border border-emerald-100">
      <div className="text-center mb-10">
        <Typography variant="h2" className="mb-4">
          Nuestra Plataforma
        </Typography>
        <Typography variant="body" className="text-gray-600 max-w-2xl mx-auto">
          Herramientas diseñadas para facilitar cada paso del proceso inmobiliario
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={<feature.icon />}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  );
};

export default Features;
