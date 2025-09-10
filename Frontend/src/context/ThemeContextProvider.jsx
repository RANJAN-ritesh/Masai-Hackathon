import React, { createContext, useContext, useEffect, useState } from "react";
import { MyContext } from "./AuthContextProvider";

export const ThemeContext = createContext();

// Enhanced theme configurations with dark/light variants
const themes = {
  'modern-tech': {
    name: 'Modern Tech',
    variants: {
      light: {
        backgroundColor: '#f8fafc',
        textColor: '#1e293b',
        accentColor: '#3b82f6',
        cardBg: '#ffffff',
        borderColor: '#e2e8f0',
        heroBg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        buttonBg: '#3b82f6',
        buttonHover: '#2563eb',
        navbarBg: '#ffffff',
        sidebarBg: '#f1f5f9',
        inputBg: '#ffffff',
        inputBorder: '#cbd5e1',
        successColor: '#10b981',
        warningColor: '#f59e0b',
        dangerColor: '#ef4444',
        gradientBg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        mutedText: '#64748b',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        hoverBg: '#f8fafc'
      },
      dark: {
        backgroundColor: '#0f172a',
        textColor: '#f8fafc',
        accentColor: '#60a5fa',
        cardBg: '#1e293b',
        borderColor: '#334155',
        heroBg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        buttonBg: '#60a5fa',
        buttonHover: '#3b82f6',
        navbarBg: '#1e293b',
        sidebarBg: '#0f172a',
        inputBg: '#1e293b',
        inputBorder: '#475569',
        successColor: '#34d399',
        warningColor: '#fbbf24',
        dangerColor: '#f87171',
        gradientBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        mutedText: '#94a3b8',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        hoverBg: '#334155'
      }
    }
  },
  'creative-arts': {
    name: 'Creative Arts',
    variants: {
      light: {
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
        gradientBg: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
        mutedText: '#92400e',
        shadowColor: 'rgba(251, 191, 36, 0.2)',
        hoverBg: '#fef3c7'
      },
      dark: {
        backgroundColor: '#451a03',
        textColor: '#fef3c7',
        accentColor: '#f472b6',
        cardBg: '#92400e',
        borderColor: '#d97706',
        heroBg: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
        buttonBg: '#f472b6',
        buttonHover: '#ec4899',
        navbarBg: '#92400e',
        sidebarBg: '#451a03',
        inputBg: '#92400e',
        inputBorder: '#d97706',
        successColor: '#34d399',
        warningColor: '#fbbf24',
        dangerColor: '#f87171',
        gradientBg: 'linear-gradient(135deg, #451a03 0%, #92400e 100%)',
        mutedText: '#fbbf24',
        shadowColor: 'rgba(251, 191, 36, 0.3)',
        hoverBg: '#d97706'
      }
    }
  },
  'corporate': {
    name: 'Corporate',
    variants: {
      light: {
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
        gradientBg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        mutedText: '#64748b',
        shadowColor: 'rgba(71, 85, 105, 0.1)',
        hoverBg: '#f1f5f9'
      },
      dark: {
        backgroundColor: '#1e293b',
        textColor: '#f8fafc',
        accentColor: '#94a3b8',
        cardBg: '#334155',
        borderColor: '#475569',
        heroBg: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
        buttonBg: '#94a3b8',
        buttonHover: '#64748b',
        navbarBg: '#334155',
        sidebarBg: '#1e293b',
        inputBg: '#334155',
        inputBorder: '#475569',
        successColor: '#34d399',
        warningColor: '#fbbf24',
        dangerColor: '#f87171',
        gradientBg: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        mutedText: '#cbd5e1',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        hoverBg: '#475569'
      }
    }
  },
  'minimalist': {
    name: 'Minimalist',
    variants: {
      light: {
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
        gradientBg: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        mutedText: '#9ca3af',
        shadowColor: 'rgba(107, 114, 128, 0.1)',
        hoverBg: '#f3f4f6'
      },
      dark: {
        backgroundColor: '#111827',
        textColor: '#f9fafb',
        accentColor: '#9ca3af',
        cardBg: '#1f2937',
        borderColor: '#374151',
        heroBg: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
        buttonBg: '#9ca3af',
        buttonHover: '#6b7280',
        navbarBg: '#1f2937',
        sidebarBg: '#111827',
        inputBg: '#1f2937',
        inputBorder: '#374151',
        successColor: '#34d399',
        warningColor: '#fbbf24',
        dangerColor: '#f87171',
        gradientBg: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        mutedText: '#6b7280',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        hoverBg: '#374151'
      }
    }
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeConfig, setThemeConfig] = useState(themes['modern-tech'].variants.light);
  const [fontFamily, setFontFamily] = useState(fonts['roboto']);

  // Get current theme variant (light or dark)
  const getCurrentVariant = () => isDarkMode ? 'dark' : 'light';

  // Initialize theme system on mount and update when hackathon changes
  useEffect(() => {
    // Always initialize with default theme, even when no hackathon exists
    const theme = hackathon?.theme || 'modern-tech';
    const font = hackathon?.fontFamily || 'roboto';
    
    setCurrentTheme(theme);
    setCurrentFont(font);
    updateThemeConfig(theme, font);
  }, [hackathon, isDarkMode]);

  // Initialize theme on component mount (for admin dashboard when no hackathons exist)
  useEffect(() => {
    // Apply default theme immediately on mount
    updateThemeConfig('modern-tech', 'roboto');
  }, []);

  // Update theme configuration
  const updateThemeConfig = (theme, font) => {
    const variant = getCurrentVariant();
    const newThemeConfig = themes[theme]?.variants[variant] || themes['modern-tech'].variants.light;
    const newFontFamily = fonts[font] || fonts['roboto'];
    
    setThemeConfig(newThemeConfig);
    setFontFamily(newFontFamily);
    
    // Apply global styles
    applyGlobalTheme(newThemeConfig, newFontFamily);
  };

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply theme to document body when component mounts or theme changes
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
    root.style.setProperty('--theme-muted-text', theme.mutedText);
    root.style.setProperty('--theme-shadow-color', theme.shadowColor);
    root.style.setProperty('--theme-hover-bg', theme.hoverBg);

    // Add dark mode class to body for additional styling
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    }
  };

  const getThemeClasses = () => ({
    // Background classes
    bgPrimary: `bg-[${themeConfig.backgroundColor}]`,
    bgCard: `bg-[${themeConfig.cardBg}]`,
    bgNavbar: `bg-[${themeConfig.navbarBg}]`,
    
    // Text classes
    textPrimary: `text-[${themeConfig.textColor}]`,
    textAccent: `text-[${themeConfig.accentColor}]`,
    textMuted: `text-[${themeConfig.mutedText}]`,
    
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
    isDarkMode,
    toggleDarkMode,
    getThemeClasses,
    applyGlobalTheme,
    getCurrentVariant
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