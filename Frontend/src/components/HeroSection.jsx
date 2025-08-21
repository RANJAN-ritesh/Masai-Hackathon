import React from "react";
import { Link } from "react-router-dom";

const HeroSection = ({ hackathonData, themeConfig }) => {
  if (!hackathonData) return null;

  return (
    <>
      {/* Hero Section */}
      <div 
        className="lg:col-span-3 text-white rounded-xl p-8 shadow-lg theme-hero"
        style={{
          background: themeConfig?.heroBg || 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
        }}
      >
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold mb-4">
            {hackathonData.title || "Hackathon"}
          </h2>
          <p className="text-xl mb-4">
            {hackathonData.description || "Build innovative solutions with your team"}
          </p>
          {hackathonData.startDate && hackathonData.endDate && (
            <p className="text-lg mb-6 text-white/80">
              {new Date(hackathonData.startDate).toLocaleDateString()} - {new Date(hackathonData.endDate).toLocaleDateString()}
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <Link to="/select-team">
              <button 
                className="px-6 py-3 rounded-md font-semibold transition transform hover:scale-105 theme-button"
                style={{
                  backgroundColor: themeConfig?.buttonBg || '#ffffff',
                  color: themeConfig?.buttonBg ? '#ffffff' : '#dc2626'
                }}
              >
                Check Team
              </button>
            </Link>

            <a href="https://us06web.zoom.us/j/88056472555" target="_blank" rel="noopener noreferrer">
              <button 
                className="border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white/10 transition transform hover:scale-105"
              >
                Join Helpdesk
              </button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
