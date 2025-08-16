import React from "react";
import { useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const isEvolve = location.pathname === "/";
  return (
    <>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold">
                <span className="text-white">xto</span>
                <span className="text-red-500">10x</span>
              </h1>
              <p className="text-gray-400 text-sm">
                © 2025 Masai School. All rights reserved.
              </p>
            </div>

            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Rules
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                FAQ
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
