// Clear invalid localStorage data and provide proper user guidance
import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../context/AuthContextProvider';
import { useTheme } from '../context/ThemeContextProvider';
import { AlertCircle, RefreshCw, LogOut, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ErrorHandler = () => {
  const { themeConfig } = useTheme();
  const navigate = useNavigate();
  
  const handleClearStorage = () => {
    // Clear all hackathon-related localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    localStorage.removeItem("currentHackathon");
    localStorage.removeItem("authToken");
    
    toast.success("Storage cleared! Please login again.");
    navigate('/login');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: themeConfig.backgroundColor }}>
      <div 
        className="max-w-md w-full p-8 rounded-lg shadow-lg text-center"
        style={{ backgroundColor: themeConfig.cardBg, border: `1px solid ${themeConfig.borderColor}` }}
      >
        <AlertCircle 
          className="mx-auto h-16 w-16 mb-4" 
          style={{ color: themeConfig.errorColor }} 
        />
        
        <h2 
          className="text-2xl font-bold mb-4"
          style={{ color: themeConfig.textColor }}
        >
          User Data Error
        </h2>
        
        <p 
          className="mb-6 text-sm leading-relaxed"
          style={{ color: themeConfig.textColor, opacity: 0.8 }}
        >
          We detected an issue with your stored user data. This might happen if:
          <br />• Your account was removed from the system
          <br />• Your session has expired
          <br />• There was a data synchronization issue
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition"
            style={{ 
              backgroundColor: themeConfig.accentColor, 
              color: 'white' 
            }}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={handleClearStorage}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition border"
            style={{ 
              borderColor: themeConfig.borderColor,
              color: themeConfig.textColor,
              backgroundColor: 'transparent'
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Clear Data & Login Again</span>
          </button>
        </div>
        
        <p 
          className="mt-6 text-xs"
          style={{ color: themeConfig.textColor, opacity: 0.6 }}
        >
          If this problem persists, please contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default ErrorHandler;
