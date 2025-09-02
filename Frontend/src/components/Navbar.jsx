import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MyContext } from "../context/AuthContextProvider";
import { useTheme } from "../context/ThemeContextProvider";
import {
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  FilePlus,
  UserRoundPlus,
  House,
  Trophy,
  Sun,
  Moon,
  Bell,
} from "lucide-react"; // Added Sun and Moon icons
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotificationCenter from "./NotificationCenter";

const Navbar = () => {
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
  const userId = localStorage.getItem("userId");
  const { isAuth, setIsAuth, hackathon, role } = useContext(MyContext);
  const { themeConfig, isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const isDashboard = location.pathname === "/";
  // ✅ Dynamic Month & Year
  const [currentDate, setCurrentDate] = useState("");
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userInitials = userData?.name
    ? userData.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U"; // Default to "U" if no name available
  const isInteractive =
    hackathon && hackathon.eventType == "Interactive Hackathon" ? true : false;

  // Load unread notifications count
  const loadUnreadCount = async () => {
    if (!userId || !isAuth) return;

    try {
      const response = await fetch(`${baseURL}/notifications/${userId}`, {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load unread notifications:', error);
    }
  };

  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString("default", { month: "long" }); // Example: March
    const year = now.getFullYear(); // Example: 2024
    setCurrentDate(`${month} ${year}`);

    // Load unread notifications count
    if (isAuth && userId) {
      loadUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuth, userId]);

  // Ref for detecting clicks outside the dropdown
  const profileDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false); // Close dropdown
      }
    };

    // Add event listener when dropdown is open
    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    localStorage.removeItem("currentHackathon");
    localStorage.removeItem("authData");
    setIsAuth(false);
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    toggleDarkMode();
    toast.success(isDarkMode ? "Switched to Light Mode" : "Switched to Dark Mode");
  };

  if (isLogin) return null; // Don't show navbar on login page

  return (
    <>
      {/* Global theme styles for navbar */}
      <style>{`
        .theme-navbar {
          background-color: ${themeConfig.navbarBg} !important;
          border-bottom: 1px solid ${themeConfig.borderColor} !important;
          color: ${themeConfig.textColor} !important;
        }
        
        .theme-button {
          background-color: ${themeConfig.buttonBg} !important;
          color: white !important;
          transition: all 0.3s ease;
        }
        
        .theme-button:hover {
          background-color: ${themeConfig.buttonHover} !important;
        }
        
        .theme-button-secondary {
          border: 1px solid ${themeConfig.accentColor} !important;
          color: ${themeConfig.accentColor} !important;
          background-color: transparent !important;
          transition: all 0.3s ease;
        }
        
        .theme-button-secondary:hover {
          background-color: ${themeConfig.accentColor} !important;
          color: white !important;
        }
        
        .theme-dropdown {
          background-color: ${themeConfig.cardBg} !important;
          border: 1px solid ${themeConfig.borderColor} !important;
          color: ${themeConfig.textColor} !important;
        }
        
        .theme-dropdown-item:hover {
          background-color: ${themeConfig.accentColor} !important;
          color: white !important;
        }

        .theme-toggle {
          background-color: ${themeConfig.cardBg} !important;
          border: 1px solid ${themeConfig.borderColor} !important;
          color: ${themeConfig.accentColor} !important;
          transition: all 0.3s ease;
        }

        .theme-toggle:hover {
          background-color: ${themeConfig.accentColor} !important;
          color: white !important;
          transform: scale(1.05);
        }
      `}</style>

      <nav 
        className="theme-navbar sticky top-0 z-50 shadow-sm"
        style={{
          backgroundColor: themeConfig.navbarBg,
          borderBottom: `1px solid ${themeConfig.borderColor}`,
          color: themeConfig.textColor
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                <span style={{ color: themeConfig.accentColor }}>xto</span>
                <span style={{ color: themeConfig.textColor }}>10x</span>
              </div>
              <span 
                className="text-sm px-2 py-1 rounded"
                style={{ 
                  backgroundColor: themeConfig.accentColor,
                  color: 'white'
                }}
              >
                by masai
              </span>
            </Link>

            {/* Center - Hackathon Info */}
            {isAuth && hackathon && (
              <div className="hidden md:flex flex-col items-center">
                <h2 
                  className="text-lg font-semibold"
                  style={{ color: themeConfig.textColor }}
                >
                  {hackathon.title || "Hackathon"}
                </h2>
                <p 
                  className="text-sm"
                  style={{ color: themeConfig.textColor, opacity: 0.7 }}
                >
                  {currentDate}
                </p>
              </div>
            )}

            {/* Right Side - Navigation */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle Button */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg theme-toggle transition-all duration-300"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md theme-button-secondary"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Desktop Navigation */}
              {isAuth && (
                <div className="hidden md:flex items-center space-x-4">
                  {/* Notification Bell */}
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 rounded-lg theme-button-secondary transition-all duration-300"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    )}
                  </button>

                  {!isDashboard && (
                    <Link to={role === "admin" ? "/select-team" : "/my-team"}>
                      <button className="theme-button-secondary px-4 py-2 rounded-lg transition">
                        {role === "admin" ? "Check Teams" : "My Team"}
                      </button>
                    </Link>
                  )}
                  {role === "member" && !isDashboard && (
                    <Link to="/create-participant-team">
                      <button className="theme-button px-4 py-2 rounded-lg transition">
                        Create Team
                      </button>
                    </Link>
                  )}
                  {!isDashboard && (
                    <Link
                      to="/"
                      className="p-2 rounded-full theme-button-secondary"
                      style={{
                        backgroundColor: themeConfig.cardBg,
                        color: themeConfig.textColor
                      }}
                    >
                      <House size={20} />
                    </Link>
                  )}

                  {/* Notification Center */}
                  <NotificationCenter />

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-2 p-2 rounded-lg theme-button-secondary"
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{
                          backgroundColor: themeConfig.accentColor,
                          color: 'white'
                        }}
                      >
                        {userInitials}
                      </div>
                      <ChevronDown size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div 
                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg theme-dropdown z-50"
                        style={{
                          backgroundColor: themeConfig.cardBg,
                          border: `1px solid ${themeConfig.borderColor}`
                        }}
                      >
                        <div className="py-1">
                          <div 
                            className="px-4 py-2 border-b"
                            style={{ borderColor: themeConfig.borderColor }}
                          >
                            <p 
                              className="text-sm font-medium"
                              style={{ color: themeConfig.textColor }}
                            >
                              {userData.name || "User"}
                            </p>
                            <p 
                              className="text-xs"
                              style={{ color: themeConfig.textColor, opacity: 0.7 }}
                            >
                              {role}
                            </p>
                          </div>
                          
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm theme-dropdown-item"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <User className="mr-3 h-4 w-4" />
                            View Profile
                          </Link>
                          
                          {role === "admin" && (
                            <>
                              <Link
                                to="/create-hackathon"
                                className="flex items-center px-4 py-2 text-sm theme-dropdown-item"
                                onClick={() => setIsProfileDropdownOpen(false)}
                              >
                                <FilePlus className="mr-3 h-4 w-4" />
                                Create Hackathon
                              </Link>
                              <Link
                                to="/create-user"
                                className="flex items-center px-4 py-2 text-sm theme-dropdown-item"
                                onClick={() => setIsProfileDropdownOpen(false)}
                              >
                                <UserRoundPlus className="mr-3 h-4 w-4" />
                                Create User
                              </Link>
                            </>
                          )}
                          
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm theme-dropdown-item"
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isAuth && isMenuOpen && (
            <div 
              className="md:hidden mt-4 space-y-3 pb-4"
              style={{
                backgroundColor: themeConfig.navbarBg,
                borderTop: `1px solid ${themeConfig.borderColor}`
              }}
            >
              {/* Theme Toggle in Mobile Menu */}
              <button
                onClick={handleThemeToggle}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition mb-2 theme-toggle"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-5 w-5" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <Link to={role === "admin" ? "/select-team" : "/my-team"} onClick={() => setIsMenuOpen(false)}>
                <button className="w-full theme-button-secondary px-4 py-2 rounded-lg transition mb-2">
                  {role === "admin" ? "Check Teams" : "My Team"}
                </button>
              </Link>

              {role === "member" && (
                <Link to="/create-participant-team" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full theme-button px-4 py-2 rounded-lg transition mb-2">
                    Create Team
                  </button>
                </Link>
              )}

              {!isDashboard && (
                <Link to="/">
                  <button 
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition mb-2"
                    style={{
                      backgroundColor: themeConfig.cardBg,
                      color: themeConfig.textColor,
                      border: `1px solid ${themeConfig.borderColor}`
                    }}
                  >
                    <House className="h-5 w-5" style={{ color: themeConfig.accentColor }} />
                    <span>Home</span>
                  </button>
                </Link>
              )}

              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                <button 
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition mb-2"
                  style={{
                    backgroundColor: themeConfig.cardBg,
                    color: themeConfig.textColor,
                    border: `1px solid ${themeConfig.borderColor}`
                  }}
                >
                  <User className="h-5 w-5" style={{ color: themeConfig.accentColor }} />
                  <span>View Profile</span>
                </button>
              </Link>

              {role === "admin" && (
                <>
                  <Link to="/create-hackathon" onClick={() => setIsMenuOpen(false)}>
                    <button 
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition mb-2"
                      style={{
                        backgroundColor: themeConfig.cardBg,
                        color: themeConfig.textColor,
                        border: `1px solid ${themeConfig.borderColor}`
                      }}
                    >
                      <FilePlus className="h-5 w-5" style={{ color: themeConfig.accentColor }} />
                      <span>Create Hackathon</span>
                    </button>
                  </Link>
                  <Link to="/create-user" onClick={() => setIsMenuOpen(false)}>
                    <button 
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition mb-2"
                      style={{
                        backgroundColor: themeConfig.cardBg,
                        color: themeConfig.textColor,
                        border: `1px solid ${themeConfig.borderColor}`
                      }}
                    >
                      <UserRoundPlus className="h-5 w-5" style={{ color: themeConfig.accentColor }} />
                      <span>Create User</span>
                    </button>
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition"
                style={{
                  backgroundColor: themeConfig.dangerColor,
                  color: 'white'
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
};

export default Navbar;
