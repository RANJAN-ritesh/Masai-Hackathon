import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="lg:col-span-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl p-8 shadow-lg">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold mb-4">
            Transform Ideas into Reality
          </h2>
          <p className="text-xl mb-6">
            Join the most exciting hackathon of 2025 and showcase your skills,
            creativity, and innovation.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/select-team">
              <button className="bg-white text-red-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition transform hover:scale-105">
                Check Team
              </button>
            </Link>

            <a href="https://us06web.zoom.us/j/88056472555" target="_blank">
              <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white/10 transition transform hover:scale-105">
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
