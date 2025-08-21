import React, { useEffect, useState, useContext } from "react";
import HeroSection from "./HeroSection";
import ProblemStatement from "./ProblemStatement";
import EventSchedule from "./EventSchedule";
import LeaderBoard from "./Leaderboard";
import SocialMedia from "./SocialMedia";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../context/AuthContextProvider";

const MainContent = () => {
  const { hackathon } = useContext(MyContext);
  const navigate = useNavigate();
  const [hackathonData, setHackathonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

  useEffect(() => {
    if (!hackathon) {
      console.log("🔍 MainContent - No hackathon in context, redirecting to dashboard");
      navigate("/");
      return;
    }

    // Use the hackathon data directly from context instead of fetching
    console.log("🔍 MainContent - Using hackathon from context:", hackathon);
    console.log("🔍 MainContent - Schedule:", hackathon.schedule);
    console.log("🔍 MainContent - Problem Statements:", hackathon.problemStatements);
    
    setHackathonData(hackathon);
    setLoading(false);
  }, [hackathon, navigate]);

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
