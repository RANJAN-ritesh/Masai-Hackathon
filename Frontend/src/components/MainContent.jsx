import React, { useEffect, useState } from "react";
import HeroSection from "./HeroSection";
import ProblemStatement from "./ProblemStatement";
import EventSchedule from "./EventSchedule";
import LeaderBoard from "./Leaderboard";
import SocialMedia from "./SocialMedia";
import { useNavigate } from "react-router-dom";

const MainContent = () => {
  const currentHackathon = localStorage.getItem("currentHackathon");
  const navigate = useNavigate();
  const [hackathonData, setHackathonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!currentHackathon) {
      navigate("/");
      return;
    }

    const fetchHackathonData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/hackathons/${currentHackathon}`);
        if (response.ok) {
          const data = await response.json();
          console.log("🔍 MainContent - Fetched hackathon data:", data);
          console.log("🔍 MainContent - Schedule:", data.schedule);
          console.log("🔍 MainContent - Problem Statements:", data.problemStatements);
          setHackathonData(data);
        } else {
          console.error("Failed to fetch hackathon data");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching hackathon:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathonData();
  }, [currentHackathon, navigate, baseURL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
      </div>
    );
  }

  if (!hackathonData) {
    return null;
  }

  return (
    <>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <HeroSection hackathonData={hackathonData} />
        <ProblemStatement hackathonData={hackathonData} />
        <EventSchedule hackathonData={hackathonData} />
        <LeaderBoard hackathonData={hackathonData} />
        <SocialMedia hackathonData={hackathonData} />
      </main>
    </>
  );
};

export default MainContent;
