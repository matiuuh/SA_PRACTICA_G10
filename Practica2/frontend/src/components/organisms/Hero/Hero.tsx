import { FaLeaf } from 'react-icons/fa';
import Typography from '../../atoms/Typography/Typography';

const Hero = () => {
  return (
    <div className="text-center mb-16 pt-8">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-full mb-8 shadow-inner">
        <FaLeaf className="text-emerald-600 text-3xl" />
      </div>

      <Typography variant="h1" className="mb-6">
        Conexiones que <span className="text-emerald-600">perduran</span>
      </Typography>

      <Typography variant="body" className="text-gray-600 max-w-2xl mx-auto">
        Encuentra tu hogar ideal con nuestra plataforma especializada
      </Typography>

      <div className="w-32 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 mx-auto rounded-full mt-8"></div>
    </div>
  );
};

export default Hero;
