import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const MyContext = createContext();

const AuthContextProvider = ({ children }) => {
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
  const [isAuth, setIsAuth] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [currentHackathonId, setCurrentHackathonId] = useState("");
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
        console.log("No valid userId found");
        setLoading(false);
          return;
        }

      try {
        const response = await fetch(`${baseURL}/users/get-user/${currentUserId}`);
        const contentType = response.headers.get("Content-Type");
        // console.log("Content-Type:", contentType);

        if (!response.ok) throw new Error("Failed to fetch user data");

        const userData = await response.json();
        // console.log("Data after login", userData);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUserData(userData);
        setRole(userData.role || "member"); // Use 'role' field from backend, not 'userType'
        setIsAuth(true);
      } catch (err) {
        console.error("Error fetching user data", err);
        // If user fetch fails, try to get from localStorage
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            setUserData(userData);
            setRole(userData.role || "member");
            setIsAuth(true);
          } catch (e) {
            console.error("Error parsing stored user data", e);
          }
        }
      } finally {
        setLoading(false); // Stop loading in any case
      }
    };

    fetchUserDetails();
  }, [isAuth]); // Depend on isAuth instead of userId

  const [hackathon, setHackathon] = useState(null);
  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      try {
        // First try to get all hackathons
        const allHackathonsResponse = await fetch(`${baseURL}/hackathons`);
        
        if (allHackathonsResponse.ok) {
          const allHackathons = await allHackathonsResponse.json();
          
          if (allHackathons && allHackathons.length > 0) {
            // If we have a currentHackathon ID in localStorage, try to find and use that one
            if (currentHackathon) {
              const selectedHackathon = allHackathons.find(h => h._id === currentHackathon);
              if (selectedHackathon) {
                console.log("🔍 AuthContext - Found selected hackathon:", selectedHackathon.title);
                setHackathon(selectedHackathon);
                return;
              } else {
                console.log("🔍 AuthContext - Selected hackathon not found, clearing localStorage");
                localStorage.removeItem("currentHackathon");
              }
            }
            
            // If no selection or selected hackathon not found, use the most recent hackathon
            const mostRecentHackathon = allHackathons.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            )[0];
            
            console.log("🔍 AuthContext - Using most recent hackathon:", mostRecentHackathon.title);
            setHackathon(mostRecentHackathon);
            localStorage.setItem("currentHackathon", mostRecentHackathon._id);
            return;
          }
        }
        
        // If no hackathons found
        console.log("🔍 AuthContext - No hackathons found");
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
  }, [userId, baseURL]);

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
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export default AuthContextProvider;
