import React, { createContext, useContext, useEffect, useState } from "react";
import { MyContext } from "./AuthContextProvider";

export const ThemeContext = createContext();

// Theme configurations
const themes = {
  'modern-tech': {
    name: 'Modern Tech',
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    accentColor: '#3b82f6',
    cardBg: '#1e293b',
    borderColor: '#334155',
    heroBg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    buttonBg: '#3b82f6',
    buttonHover: '#2563eb',
    navbarBg: '#1e293b',
    sidebarBg: '#0f172a',
    inputBg: '#1e293b',
    inputBorder: '#334155',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    dangerColor: '#ef4444',
    gradientBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
  },
  'creative-arts': {
    name: 'Creative Arts',
    backgroundColor: '#fef3c7',
    textColor: '#1f2937',
    accentColor: '#ec4899',
    cardBg: '#ffffff',
    borderColor: '#fbbf24',
    heroBg: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
    buttonBg: '#ec4899',
    buttonHover: '#db2777',
    navbarBg: '#ffffff',
    sidebarBg: '#fef3c7',
    inputBg: '#ffffff',
    inputBorder: '#fbbf24',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    dangerColor: '#ef4444',
    gradientBg: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)'
  },
  'corporate': {
    name: 'Corporate',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    accentColor: '#475569',
    cardBg: '#ffffff',
    borderColor: '#cbd5e1',
    heroBg: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
    buttonBg: '#475569',
    buttonHover: '#374151',
    navbarBg: '#ffffff',
    sidebarBg: '#f8fafc',
    inputBg: '#ffffff',
    inputBorder: '#cbd5e1',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    dangerColor: '#ef4444',
    gradientBg: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
  },
  'minimalist': {
    name: 'Minimalist',
    backgroundColor: '#ffffff',
    textColor: '#374151',
    accentColor: '#6b7280',
    cardBg: '#f9fafb',
    borderColor: '#e5e7eb',
    heroBg: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
    buttonBg: '#6b7280',
    buttonHover: '#4b5563',
    navbarBg: '#f9fafb',
    sidebarBg: '#ffffff',
    inputBg: '#f9fafb',
    inputBorder: '#e5e7eb',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    dangerColor: '#ef4444',
    gradientBg: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
  }
};

// Font configurations
const fonts = {
  'roboto': 'Roboto, sans-serif',
  'poppins': 'Poppins, sans-serif',
  'inter': 'Inter, sans-serif',
  'montserrat': 'Montserrat, sans-serif'
};

export const ThemeContextProvider = ({ children }) => {
  const { hackathon } = useContext(MyContext);
  const [currentTheme, setCurrentTheme] = useState('modern-tech');
  const [currentFont, setCurrentFont] = useState('roboto');
  const [themeConfig, setThemeConfig] = useState(themes['modern-tech']);
  const [fontFamily, setFontFamily] = useState(fonts['roboto']);

  // Update theme when hackathon changes
  useEffect(() => {
    if (hackathon) {
      const theme = hackathon.theme || 'modern-tech';
      const font = hackathon.fontFamily || 'roboto';
      
      setCurrentTheme(theme);
      setCurrentFont(font);
      setThemeConfig(themes[theme]);
      setFontFamily(fonts[font]);
      
      // Apply global styles
      applyGlobalTheme(themes[theme], fonts[font]);
    }
  }, [hackathon]);

  const applyGlobalTheme = (theme, font) => {
    // Apply to document body and html
    document.body.style.fontFamily = font;
    document.body.style.backgroundColor = theme.backgroundColor;
    document.body.style.color = theme.textColor;
    document.body.style.transition = 'all 0.3s ease';

    document.documentElement.style.fontFamily = font;
    document.documentElement.style.backgroundColor = theme.backgroundColor;
    document.documentElement.style.color = theme.textColor;

    // Set CSS custom properties for global access
    const root = document.documentElement;
    root.style.setProperty('--theme-bg', theme.backgroundColor);
    root.style.setProperty('--theme-text', theme.textColor);
    root.style.setProperty('--theme-accent', theme.accentColor);
    root.style.setProperty('--theme-card-bg', theme.cardBg);
    root.style.setProperty('--theme-border', theme.borderColor);
    root.style.setProperty('--theme-hero-bg', theme.heroBg);
    root.style.setProperty('--theme-button-bg', theme.buttonBg);
    root.style.setProperty('--theme-button-hover', theme.buttonHover);
    root.style.setProperty('--theme-navbar-bg', theme.navbarBg);
    root.style.setProperty('--theme-sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--theme-input-bg', theme.inputBg);
    root.style.setProperty('--theme-input-border', theme.inputBorder);
    root.style.setProperty('--theme-success', theme.successColor);
    root.style.setProperty('--theme-warning', theme.warningColor);
    root.style.setProperty('--theme-danger', theme.dangerColor);
    root.style.setProperty('--theme-gradient-bg', theme.gradientBg);
    root.style.setProperty('--theme-font', font);
  };

  const getThemeClasses = () => ({
    // Background classes
    bgPrimary: `bg-[${themeConfig.backgroundColor}]`,
    bgCard: `bg-[${themeConfig.cardBg}]`,
    bgNavbar: `bg-[${themeConfig.navbarBg}]`,
    
    // Text classes
    textPrimary: `text-[${themeConfig.textColor}]`,
    textAccent: `text-[${themeConfig.accentColor}]`,
    
    // Border classes
    borderPrimary: `border-[${themeConfig.borderColor}]`,
    
    // Button classes
    btnPrimary: `bg-[${themeConfig.buttonBg}] hover:bg-[${themeConfig.buttonHover}] text-white`,
    btnSecondary: `border-[${themeConfig.accentColor}] text-[${themeConfig.accentColor}] hover:bg-[${themeConfig.accentColor}] hover:text-white`,
  });

  const value = {
    currentTheme,
    currentFont,
    themeConfig,
    fontFamily,
    themes,
    fonts,
    getThemeClasses,
    applyGlobalTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
}; 