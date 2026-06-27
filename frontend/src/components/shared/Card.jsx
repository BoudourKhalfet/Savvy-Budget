import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  padding = true,
  hover = false,
  onClick,
}) => {
  return (
    <div
      className={`
        card
        ${padding ? 'p-6' : ''}
        ${hover ? 'cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;