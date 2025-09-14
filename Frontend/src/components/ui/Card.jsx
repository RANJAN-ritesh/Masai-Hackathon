// Frontend/src/components/ui/Card.jsx
import React from 'react';

const Card = ({ 
  children, 
  className = "", 
  variant = "default",
  padding = "default",
  ...props 
}) => {
  const variants = {
    default: "bg-white border border-gray-200 shadow-sm",
    elevated: "bg-white border border-gray-200 shadow-lg",
    gradient: "bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md",
    dark: "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 text-white",
    primary: "bg-gradient-to-br from-red-50 to-red-100 border border-red-200",
    accent: "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
  };
  
  const paddings = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8"
  };
  
  return (
    <div 
      className={`rounded-xl ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
