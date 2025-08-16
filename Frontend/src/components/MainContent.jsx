import React, { useEffect } from "react";
import HeroSection from "./HeroSection";
import ProblemStatement from "./ProblemStatement";
import EventSchedule from "./EventSchedule";
import LeaderBoard from "./LeaderBoard";
import SocialMedia from "./SocialMedia";
import { useNavigate } from "react-router-dom";

const MainContent = () => {
  const currentHackathon = localStorage.getItem("currentHackathon");
  const navigate = useNavigate();
  useEffect(() => {
    if (!currentHackathon) {
      navigate("/");
    }
  });
  return (
    <>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <HeroSection />
        <ProblemStatement />
        <EventSchedule />
        <LeaderBoard />
        <SocialMedia />
      </main>
    </>
  );
};

export default MainContent;
