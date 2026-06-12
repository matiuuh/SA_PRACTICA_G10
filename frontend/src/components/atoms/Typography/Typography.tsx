interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  className?: string;
}

const Typography: React.FC<TypographyProps> = ({ 
  children, 
  variant = 'body',
  className = '' 
}) => {
  const variants = {
    h1: 'text-4xl md:text-5xl font-bold',
    h2: 'text-3xl font-bold',
    h3: 'text-xl font-semibold',
    body: 'text-base',
    caption: 'text-sm text-gray-600'
  };

  const Component = variant === 'body' || variant === 'caption' ? 'p' : variant;

  return (
    <Component className={`${variants[variant]} ${className}`}>
      {children}
    </Component>
  );
};

export default Typography;
