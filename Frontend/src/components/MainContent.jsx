import React, { useEffect, useState, useContext } from "react";
import HeroSection from "./HeroSection";
import ProblemStatement from "./ProblemStatement";
import EventSchedule from "./EventSchedule";
import LeaderBoard from "./Leaderboard";
import SocialMedia from "./SocialMedia";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../context/AuthContextProvider";

const MainContent = () => {
  const { hackathon } = useContext(MyContext);
  const navigate = useNavigate();
  const [hackathonData, setHackathonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

  // Theme configurations
  const themes = {
    'modern-tech': {
      backgroundColor: '#0f172a',
      textColor: '#f8fafc',
      accentColor: '#3b82f6',
      cardBg: '#1e293b',
      borderColor: '#334155',
      heroBg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      buttonBg: '#3b82f6',
      buttonHover: '#2563eb'
    },
    'creative-arts': {
      backgroundColor: '#fef3c7',
      textColor: '#1f2937',
      accentColor: '#ec4899',
      cardBg: '#ffffff',
      borderColor: '#fbbf24',
      heroBg: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
      buttonBg: '#ec4899',
      buttonHover: '#db2777'
    },
    'corporate': {
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      accentColor: '#475569',
      cardBg: '#ffffff',
      borderColor: '#cbd5e1',
      heroBg: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
      buttonBg: '#475569',
      buttonHover: '#374151'
    },
    'minimalist': {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      accentColor: '#6b7280',
      cardBg: '#f9fafb',
      borderColor: '#e5e7eb',
      heroBg: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
      buttonBg: '#6b7280',
      buttonHover: '#4b5563'
    }
  };

  // Font configurations
  const fonts = {
    'roboto': 'Roboto, sans-serif',
    'poppins': 'Poppins, sans-serif',
    'inter': 'Inter, sans-serif',
    'montserrat': 'Montserrat, sans-serif'
  };

  useEffect(() => {
    // Only redirect if we're on a hackathon-specific route and there's no hackathon
    const isHackathonRoute = window.location.pathname === '/hackathon';
    
    if (!hackathon && isHackathonRoute) {
      navigate("/");
      return;
    }

    if (hackathon) {
      // Use the hackathon data directly from context instead of fetching
      setHackathonData(hackathon);
    }
    setLoading(false);
  }, [hackathon, navigate]);

  // Apply theme to document body when component mounts or theme changes
  useEffect(() => {
    if (hackathonData) {
      const currentTheme = hackathonData.theme || 'modern-tech';
      const currentFont = hackathonData.fontFamily || 'roboto';
      const themeConfig = themes[currentTheme];
      const fontFamily = fonts[currentFont];

      // Apply theme to document body
      document.body.style.fontFamily = fontFamily;
      document.body.style.backgroundColor = themeConfig.backgroundColor;
      document.body.style.color = themeConfig.textColor;

      // Apply theme to html element as well
      document.documentElement.style.fontFamily = fontFamily;
      document.documentElement.style.backgroundColor = themeConfig.backgroundColor;
      document.documentElement.style.color = themeConfig.textColor;

      // Add theme-specific CSS variables
      document.documentElement.style.setProperty('--theme-bg', themeConfig.backgroundColor);
      document.documentElement.style.setProperty('--theme-text', themeConfig.textColor);
      document.documentElement.style.setProperty('--theme-accent', themeConfig.accentColor);
      document.documentElement.style.setProperty('--theme-card-bg', themeConfig.cardBg);
      document.documentElement.style.setProperty('--theme-border', themeConfig.borderColor);
      document.documentElement.style.setProperty('--theme-hero-bg', themeConfig.heroBg);
      document.documentElement.style.setProperty('--theme-button-bg', themeConfig.buttonBg);
      document.documentElement.style.setProperty('--theme-button-hover', themeConfig.buttonHover);

      // Cleanup function to reset styles when component unmounts
      return () => {
        document.body.style.fontFamily = '';
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        document.documentElement.style.fontFamily = '';
        document.documentElement.style.backgroundColor = '';
        document.documentElement.style.color = '';
      };
    }
  }, [hackathonData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
      </div>
    );
  }

  if (!hackathonData) {
    return null;
  }

  // Get current theme and font
  const currentTheme = hackathonData.theme || 'modern-tech';
  const currentFont = hackathonData.fontFamily || 'roboto';
  const themeConfig = themes[currentTheme];
  const fontFamily = fonts[currentFont];

  return (
    <>
      {/* Global theme styles */}
      <style>{`
        :root {
          --theme-bg: ${themeConfig.backgroundColor};
          --theme-text: ${themeConfig.textColor};
          --theme-accent: ${themeConfig.accentColor};
          --theme-card-bg: ${themeConfig.cardBg};
          --theme-border: ${themeConfig.borderColor};
          --theme-hero-bg: ${themeConfig.heroBg};
          --theme-button-bg: ${themeConfig.buttonBg};
          --theme-button-hover: ${themeConfig.buttonHover};
        }
        
        body {
          font-family: ${fontFamily} !important;
          background-color: ${themeConfig.backgroundColor} !important;
          color: ${themeConfig.textColor} !important;
          transition: all 0.3s ease;
        }
        
        .theme-card {
          background-color: ${themeConfig.cardBg} !important;
          border: 1px solid ${themeConfig.borderColor} !important;
          transition: all 0.3s ease;
        }
        
        .theme-accent {
          color: ${themeConfig.accentColor} !important;
        }
        
        .theme-border {
          border-color: ${themeConfig.borderColor} !important;
        }

        .theme-button {
          background-color: ${themeConfig.buttonBg} !important;
          color: white !important;
          transition: all 0.3s ease;
        }

        .theme-button:hover {
          background-color: ${themeConfig.buttonHover} !important;
          transform: translateY(-2px);
        }

        .theme-hero {
          background: ${themeConfig.heroBg} !important;
        }
      `}</style>
      
      {/* Main Content */}
      <main 
        className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-screen"
        style={{
          backgroundColor: themeConfig.backgroundColor,
          color: themeConfig.textColor,
          fontFamily: fontFamily
        }}
      >
        <HeroSection hackathonData={hackathonData} themeConfig={themeConfig} />
        <ProblemStatement hackathonData={hackathonData} themeConfig={themeConfig} />
        <EventSchedule hackathonData={hackathonData} themeConfig={themeConfig} />
        <LeaderBoard hackathonData={hackathonData} themeConfig={themeConfig} />
        <SocialMedia hackathonData={hackathonData} themeConfig={themeConfig} />
      </main>
    </>
  );
};

export default MainContent;
