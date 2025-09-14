// Frontend/src/context/NewThemeContextProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import '../styles/theme.css';

const NewThemeContext = createContext();

export const useNewTheme = () => {
  const context = useContext(NewThemeContext);
  if (!context) {
    throw new Error('useNewTheme must be used within a NewThemeProvider');
  }
  return context;
};

export const NewThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const themeConfig = {
    colors: {
      primary: '#DC2626',
      secondary: '#1F2937',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      
      // Red shades
      red: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444',
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D'
      },
      
      // Gray shades
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827'
      },
      
      // Blue shades
      blue: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A'
      }
    },
    
    gradients: {
      primary: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
      secondary: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
      accent: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      subtle: 'linear-gradient(135deg, #FEF2F2 0%, #F9FAFB 100%)',
      bgPrimary: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)',
      bgDark: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
      bgCard: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)'
    },
    
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    },
    
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      full: '9999px'
    }
  };

  const applyGlobalTheme = () => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([shade, color]) => {
          root.style.setProperty(`--${key}-${shade}`, color);
        });
      } else {
        root.style.setProperty(`--${key}`, value);
      }
    });
    
    // Apply gradients
    Object.entries(themeConfig.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });
    
    // Apply typography
    root.style.setProperty('--font-family', themeConfig.typography.fontFamily);
    
    // Apply spacing
    Object.entries(themeConfig.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--space-${key}`, value);
    });
    
    // Apply shadows
    Object.entries(themeConfig.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Apply border radius
    Object.entries(themeConfig.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    // Apply to body
    document.body.style.fontFamily = themeConfig.typography.fontFamily;
    document.body.style.backgroundColor = themeConfig.colors.background;
    document.body.style.color = themeConfig.colors.text;
  };

  useEffect(() => {
    applyGlobalTheme();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    themeConfig,
    isDarkMode,
    toggleDarkMode,
    applyGlobalTheme
  };

  return (
    <NewThemeContext.Provider value={value}>
      {children}
    </NewThemeContext.Provider>
  );
};
