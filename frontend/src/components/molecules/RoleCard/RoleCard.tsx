interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: 'client' | 'agent';
}

const RoleCard: React.FC<RoleCardProps> = ({ 
  title, 
  description, 
  icon,
  variant = 'client'
}) => {
  const gradients = {
    client: 'from-emerald-100 to-teal-100',
    agent: 'from-teal-100 to-cyan-100'
  };

  const textColors = {
    client: 'text-emerald-600',
    agent: 'text-teal-600'
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg p-8 border border-emerald-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start mb-8">
        <div className={`w-16 h-16 bg-gradient-to-br ${gradients[variant]} rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300`}>
          <div className={`${textColors[variant]} text-2xl`}>{icon}</div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default RoleCard;
