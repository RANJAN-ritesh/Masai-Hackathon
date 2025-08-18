import React from 'react';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  hover = true,
  padding = 'default',
  ...props 
}) => {
  // Base classes
  const baseClasses = 'rounded-xl border transition-all duration-300';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-white border-gray-200 shadow-sm',
    elevated: 'bg-white border-gray-200 shadow-lg',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-md',
    primary: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 shadow-md',
    secondary: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md',
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-md',
    info: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-md',
  };
  
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  // Hover effects
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  
  // Combine all classes
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`;
  
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

// Card sub-components for better organization
Card.Header = ({ children, className = '', ...props }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`} {...props}>
    {children}
  </div>
);

export default Card; 