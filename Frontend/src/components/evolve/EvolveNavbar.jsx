import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MyContext } from "../../context/AuthContextProvider";
import { LogOut, User, ChevronDown, Menu, X } from "lucide-react"; // Added icons
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EvolveNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuth, setIsAuth } = useContext(MyContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const isLogin = location.pathname === "/login";
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
    setIsAuth(false);
    toast.success("User logged out successfully", {
      position: "top-right",
      autoClose: 3000,
    });
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src="https://ik.imagekit.io/t6mlgjrxa/IMG_0248.png?updatedAt=1742069249449"
              alt="Evolve"
              className="h-8"
            />
            <span className="text-xs text-gray-500 font-light">by Masai</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <p
              href="#wings"
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Wings
            </p>
            <p
              href="#features"
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Features
            </p>
            <p
              href="#community"
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              Community
            </p>
            <Link to="/eligible-hackathons">
              <p className="cursor-pointer hover:text-red-500 transition-colors">Hackathon</p>
            </Link>
            <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-black/80 transition-colors">
              Join Now
            </button>
          </div>

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
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-semibold">
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

          {/* Mobile Navigation */}
          {isAuth && isMenuOpen && (
            <div className="md:hidden mt-4 space-y-3">
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition mb-2">
                  <User className="h-5 w-5 text-red-500" />
                  <span>View Profile</span>
                </button>
              </Link>

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
      </div>
    </nav>
  );
};

export default EvolveNavbar;
