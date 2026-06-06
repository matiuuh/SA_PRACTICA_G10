interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false
}) => {
  const variants = {
    primary: 'bg-black hover:bg-gray-800 text-white',
    secondary: 'bg-cinema-red-500 hover:bg-cinema-red-600 text-white',
    outline: 'border-2 border-cinema-gold-500 text-cinema-gold-500 hover:bg-cinema-gold-500 hover:text-black'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;