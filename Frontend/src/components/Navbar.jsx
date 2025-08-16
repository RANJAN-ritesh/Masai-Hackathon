import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MyContext } from "../context/AuthContextProvider";
import {
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  FilePlus,
  UserRoundPlus,
  House,
} from "lucide-react"; // Added icons
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbar = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const userId = localStorage.getItem("userId");
  const { isAuth, setIsAuth, hackathon, role } = useContext(MyContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
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
    hackathon.eventType == "Interactive Hackathon" ? true : false;

  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString("default", { month: "long" }); // Example: March
    const year = now.getFullYear(); // Example: 2024
    setCurrentDate(`${month} ${year}`);
  }, []);

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
    toast.success("User logged out successfully", {
      position: "top-right",
      autoClose: 3000,
    });
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/hackathon" className="flex-shrink-0">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">
                <span className="text-black">xto</span>
                <span className="text-red-500">10x</span>
              </h1>
              <span className="text-gray-500 text-sm ml-2">by masai</span>
            </div>
          </Link>

          {/* Event Details - Hidden on mobile */}
          {!isLogin && (
            <div className="hidden md:block">
              <div className="flex justify-center text-xl ">
                <div className="font-bold">
                  {hackathon.name ? hackathon.name : "Hackathon"}{" "}
                </div>
                <span className="text-red-500 ml-2">{currentDate}</span>
              </div>
              <div className="text-gray-600 text-sm mt-1 flex justify-center">
                {hackathon.description
                  ? hackathon.description
                  : "Code, Collaborate, Conquer!"}
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>

          {/* Desktop Navigation */}
          {isAuth && (
            <div className="hidden md:flex items-center space-x-4">
              {!isDashboard && (
                <Link to="/select-team">
                  <button className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition">
                    {role === "admin" ? "Check Teams" : "Team"}
                  </button>
                </Link>
              )}
              {!isDashboard && (
                <Link
                  to="/"
                  className="border p-2 rounded-full bg-gray-800 text-white cursor-pointer"
                >
                  <House />
                </Link>
              )}

              {/* {!isInteractive && (
                <Link to="/register-team" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition mb-2">
                    Register Team
                  </button>
                </Link>
              )} */}

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center space-x-2"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Circle with User Initials */}
                  <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center text-lg font-semibold">
                    {userInitials}
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 ml-1 transition-transform duration-300 ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-500 transition"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 inline mr-2" />
                      View Profile
                    </Link>
                    {role === "admin" && (
                      <>
                        <Link to="/create-hackathon">
                          <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-500 transition flex items-center">
                            <FilePlus className="h-4 w-4 mr-2" />
                            Create Hackathon
                          </button>
                        </Link>

                        <Link to="/create-users">
                          <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-500 transition flex items-center">
                            <UserRoundPlus className="h-4 w-4 mr-2" />
                            Upload Users
                          </button>
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-500 transition flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isAuth && isMenuOpen && (
          <div className="md:hidden mt-4 space-y-3">
            <Link to="/select-team" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full bg-white border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition mb-2">
                Team
              </button>
            </Link>

            {/* {!isInteractive && (
              <Link to="/register-team" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition mb-2">
                  Register Team
                </button>
              </Link>
            )} */}
            {!isDashboard && (
              <Link to="/">
                <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition mb-2">
                  <House className="h-5 w-5 text-red-500" />
                  <span>Home</span>
                </button>
              </Link>
            )}

            <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition mb-2">
                <User className="h-5 w-5 text-red-500" />
                <span>View Profile</span>
              </button>
            </Link>

            {role === "admin" && (
              <>
                <Link to="/create-hackathon">
                  <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition mb-2">
                    <FilePlus className="h-5 w-5 mr-2 text-red-500" />
                    Create Hackathon
                  </button>
                </Link>
              </>
            )}

            <button
              onClick={() => {
                setIsMenuOpen(false);
                {
                  /* ✅ Closes dropdown on click */
                }
                handleLogout();
                {
                  /* Ensures logout logic is executed */
                }
              }}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              <LogOut className="h-5 w-5 text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
