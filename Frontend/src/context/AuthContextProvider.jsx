import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const MyContext = createContext();

const AuthContextProvider = ({ children }) => {
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
  const [isAuth, setIsAuth] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [currentHackathonId, setCurrentHackathonId] = useState("");
  const [userHackathon, setUserHackathon] = useState(null); // Track user's enrolled hackathon
  let currentHackathon = localStorage.getItem("currentHackathon");
  
  // Don't set a default hackathon ID - let the system handle it properly
  if (!currentHackathon) {
    currentHackathon = null;
  }
  
  let userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [role, setRole] = useState("");

  // Effect to fetch user details when userId changes
  useEffect(() => {
    const fetchUserDetails = async () => {
      // Get fresh userId from localStorage
      const currentUserId = localStorage.getItem("userId");
      
      if (!currentUserId || currentUserId === "null" || currentUserId === "undefined") {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${baseURL}/users/get-user/${currentUserId}`);
        const contentType = response.headers.get("Content-Type");

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        localStorage.setItem("userData", JSON.stringify(userData));
        setUserData(userData);
        setRole(userData.role || "member"); // Use 'role' field from backend, not 'userType'
        setIsAuth(true);
      } catch (err) {
        console.error("Error fetching user data", err);
        
        // Check if it's a 404 error (user not found)
        if (err.message.includes("404") || err.message.includes("User not found")) {
          console.log("User not found, clearing invalid user data");
          // Clear invalid user data
          localStorage.removeItem("userId");
          localStorage.removeItem("userData");
          localStorage.removeItem("currentHackathon");
          setUserData(null);
          setRole("");
          setIsAuth(false);
          setLoading(false);
          return;
        }
        
        // If user fetch fails for other reasons, try to get from localStorage
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            setUserData(userData);
            setRole(userData.role || "member");
            setIsAuth(true);
          } catch (e) {
            console.error("Error parsing stored user data", e);
            // Clear invalid stored data
            localStorage.removeItem("userData");
            localStorage.removeItem("userId");
            localStorage.removeItem("currentHackathon");
            setUserData(null);
            setRole("");
            setIsAuth(false);
          }
        } else {
          // No stored data and fetch failed, clear everything
          localStorage.removeItem("userId");
          localStorage.removeItem("currentHackathon");
          setUserData(null);
          setRole("");
          setIsAuth(false);
        }
      } finally {
        setLoading(false); // Stop loading in any case
      }
    };

    fetchUserDetails();
  }, [isAuth]); // Depend on isAuth instead of userId

  // Effect to check if user is enrolled in any hackathon
  useEffect(() => {
    const checkUserHackathon = async () => {
      if (!userData || !userData._id) return;

      try {
        // Check if user is enrolled in any hackathon
        const response = await fetch(`${baseURL}/users/hackathon/${userData._id}/enrollment`);
        if (response.ok) {
          const enrollmentData = await response.json();
          if (enrollmentData.hackathon) {
            setUserHackathon(enrollmentData.hackathon);
            // Set this as the current hackathon
            setHackathon(enrollmentData.hackathon);
            localStorage.setItem("currentHackathon", enrollmentData.hackathon._id);
            return;
          }
        }
      } catch (error) {
        // Silent fail - user not enrolled
      }
    };

    checkUserHackathon();
  }, [userData, baseURL]);

  const [hackathon, setHackathon] = useState(null);
  
  // Logout function to clear all user data
  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    localStorage.removeItem("currentHackathon");
    setUserData(null);
    setRole("");
    setIsAuth(false);
    setHackathon(null);
    setUserHackathon(null);
    setCurrentHackathonId("");
  };
  
  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      try {
        // First try to get all hackathons
        const allHackathonsResponse = await fetch(`${baseURL}/hackathons`);
        
        if (allHackathonsResponse.ok) {
          const allHackathons = await allHackathonsResponse.json();
          
          if (allHackathons && allHackathons.length > 0) {
            // If user has a specific hackathon, use that one
            if (userHackathon) {
              setHackathon(userHackathon);
              localStorage.setItem("currentHackathon", userHackathon._id);
              return;
            }
            
            // If we have a currentHackathon ID in localStorage, try to find and use that one
            if (currentHackathon) {
              const selectedHackathon = allHackathons.find(h => h._id === currentHackathon);
              if (selectedHackathon) {
                setHackathon(selectedHackathon);
                return;
              } else {
                localStorage.removeItem("currentHackathon");
              }
            }
            
            // If no selection or selected hackathon not found, use the most recent hackathon
            const mostRecentHackathon = allHackathons.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            
            setHackathon(mostRecentHackathon);
            localStorage.setItem("currentHackathon", mostRecentHackathon._id);
            return;
          }
        }
        
        // If no hackathons found
        setHackathon(null);
        localStorage.removeItem("currentHackathon");
      } catch (error) {
        console.error("Error fetching hackathons:", error);
        setHackathon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, [userId, baseURL, userHackathon]);

  return (
    <MyContext.Provider
      value={{
        isAuth,
        setIsAuth,
        userData,
        loading,
        currentHackathonId,
        setCurrentHackathonId,
        hackathon,
        setHackathon,
        setUserData,
        role,
        userHackathon,
        setUserHackathon,
        logout,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export default AuthContextProvider;
