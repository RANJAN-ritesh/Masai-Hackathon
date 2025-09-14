// Frontend/src/components/ui/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ 
  type, 
  title, 
  message, 
  onClose, 
  duration = 5000,
  position = "top-right"
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  const variants = {
    success: {
      bg: 'bg-gradient-to-r from-green-50 to-green-100',
      border: 'border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-50 to-red-100',
      border: 'border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
      border: 'border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  };
  
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };
  
  const variant = variants[type];
  const IconComponent = variant.icon;
  
  return (
    <div className={`fixed ${positions[position]} z-50 max-w-sm w-full`}>
      <div className={`p-4 rounded-lg border shadow-lg ${variant.bg} ${variant.border} transform transition-all duration-300`}>
        <div className="flex items-start gap-3">
          <IconComponent className={`w-5 h-5 ${variant.iconColor} mt-0.5 flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`font-medium ${variant.titleColor} mb-1`}>{title}</h4>
            )}
            <p className={`text-sm ${variant.messageColor}`}>{message}</p>
          </div>
          <button 
            onClick={onClose}
            className={`${variant.iconColor} hover:opacity-70 transition-opacity flex-shrink-0 p-1 rounded`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
