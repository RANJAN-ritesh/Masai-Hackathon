import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const MyContext = createContext();

const AuthContextProvider = ({ children }) => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [isAuth, setIsAuth] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [currentHackathonId, setCurrentHackathonId] = useState("");
  let currentHackathon = localStorage.getItem("currentHackathon");
  
  // Set default hackathon if none exists
  if (!currentHackathon) {
    currentHackathon = "hackathon_001";
    localStorage.setItem("currentHackathon", currentHackathon);
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

  const [hackathon, setHackathon] = useState([]);
  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${baseURL}/hackathons/${currentHackathon}`
        );
        
        if (!response.ok) {
          throw new Error("Hackathon API not available");
        }
        
        const data = await response.json();
        // console.log("current id", currentHackathon);
        // console.log("Current hack data", data);
        setHackathon(data);
      } catch (error) {
        console.error("Error fetching hackathons, using fallback:", error);
        // Set default hackathon data if fetch fails
        setHackathon({
          _id: "hackathon_001",
          title: "Masai Hackathon 2024",
          description: "Build innovative solutions with your team",
          eventType: "Team Hackathon",
          maxTeamSize: 4,
          status: "active",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
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
