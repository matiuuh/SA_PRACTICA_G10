import React from 'react';

const PopcornIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15 8.5H9L12 2Z" />
      <path d="M18 8.5C18 8.5 19 12 17 15C15 18 12 20 12 20C12 20 9 18 7 15C5 12 6 8.5 6 8.5H18Z" />
      <circle cx="8.5" cy="10.5" r="1.5" />
      <circle cx="12" cy="11" r="1.5" />
      <circle cx="15.5" cy="10.5" r="1.5" />
    </svg>
  );
};

export default PopcornIcon;
