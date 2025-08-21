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
      borderColor: '#334155'
    },
    'creative-arts': {
      backgroundColor: '#fef3c7',
      textColor: '#1f2937',
      accentColor: '#ec4899',
      cardBg: '#ffffff',
      borderColor: '#fbbf24'
    },
    'corporate': {
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      accentColor: '#475569',
      cardBg: '#ffffff',
      borderColor: '#cbd5e1'
    },
    'minimalist': {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      accentColor: '#6b7280',
      cardBg: '#f9fafb',
      borderColor: '#e5e7eb'
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
    if (!hackathon) {
      console.log("🔍 MainContent - No hackathon in context, redirecting to dashboard");
      navigate("/");
      return;
    }

    // Use the hackathon data directly from context instead of fetching
    console.log("🔍 MainContent - Using hackathon from context:", hackathon);
    console.log("🔍 MainContent - Schedule:", hackathon.schedule);
    console.log("🔍 MainContent - Problem Statements:", hackathon.problemStatements);
    
    setHackathonData(hackathon);
    setLoading(false);
  }, [hackathon, navigate]);

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
      {/* Apply dynamic theme and font to the entire page */}
      <style jsx>{`
        body {
          font-family: ${fontFamily};
          background-color: ${themeConfig.backgroundColor};
          color: ${themeConfig.textColor};
        }
        
        .theme-card {
          background-color: ${themeConfig.cardBg};
          border: 1px solid ${themeConfig.borderColor};
        }
        
        .theme-accent {
          color: ${themeConfig.accentColor};
        }
        
        .theme-border {
          border-color: ${themeConfig.borderColor};
        }
      `}</style>
      
      {/* Main Content */}
      <main 
        className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
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
