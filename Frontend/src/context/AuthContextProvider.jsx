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
            // Use the first available hackathon
            const firstHackathon = allHackathons[0];
            setHackathon(firstHackathon);
            
            // Update localStorage with the actual hackathon ID
            localStorage.setItem("currentHackathon", firstHackathon._id);
            return;
          }
        }
        
        // If no hackathons found and we have a currentHackathon ID, try to fetch it
        if (currentHackathon) {
          try {
            const response = await fetch(`${baseURL}/hackathons/${currentHackathon}`);
            
            if (response.ok) {
              const data = await response.json();
              setHackathon(data);
            } else {
              // Invalid hackathon ID, clear it
              localStorage.removeItem("currentHackathon");
              setHackathon(null);
            }
          } catch (error) {
            console.error("Error fetching specific hackathon:", error);
            // Invalid hackathon ID, clear it
            localStorage.removeItem("currentHackathon");
            setHackathon(null);
          }
        } else {
          // No hackathons available
          setHackathon(null);
        }
      } catch (error) {
        console.error("Error fetching hackathons:", error);
        // Set hackathon to null if fetch fails
        setHackathon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, [userId, baseURL, currentHackathon]);

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
        setUserData,
        role,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export default AuthContextProvider;
