import React, { useState, useEffect, useContext } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import MainContent from "./components/MainContent";
import InteractiveElement from "./components/InteractiveElement";
import Footer from "./components/Footer";
import CountDownTimer from "./components/CountDownTimer";
import SelectTeamPage from "./components/SelectTeamPage";
import { RegisterTeamPage } from "./components/RegisterTeamPage";
import { MyContext } from "./context/AuthContextProvider";
import Login from "./components/login";
import { ToastContainer } from "react-toastify";
import CreateHackathon from "./components/CreateHackathon";
import ProfilePage from "./components/ProfilePage";
import ChatbotButton from "./components/chatbot/ChatbotButton";
import ChatWindow from "./components/chatbot/ChatWindow";
import ResourceHub from "./components/ResourceHub";
import VideoConference from "./components/VideoConference";
import MeetingRoom from "./components/MeetingRoom";
import Evolve from "./components/evolve/Evolve";
import CSBT from "./components/csbt/CSBT";
import ProtectedRoute from "./components/ProtectedRoute";
import EligibleHackathons from "./components/EligibleHackathons";
import CreateUser from "./components/CreateUser";
import EditHackathon from "./components/EditHackathon";
import AdminRoute from "./components/AdminRoute";

function App() {
  const { isAuth, hackathon } = useContext(MyContext);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();

  const isMeetingRoom = location.pathname === "/meeting-room";
  const isDashboard = location.pathname === "/";
  const isHackathon = location.pathname === "/hackathon";
  const isCSBT = location.pathname === "/csbt";

  if (isCSBT) {
    return <CSBT />;
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50">
        {!isMeetingRoom && <Navbar />}
        {isAuth &&
          !isDashboard &&
          isHackathon &&
          !isMeetingRoom &&
          hackathon.eventType !== "Interactive Hackathon" && <CountDownTimer />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <EligibleHackathons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hackathon"
            element={
              <ProtectedRoute>
                {hackathon.eventType === "Interactive Hackathon" ? (
                  <CSBT />
                ) : (
                  <MainContent />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/select-team"
            element={
              <ProtectedRoute>
                <SelectTeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register-team"
            element={
              <ProtectedRoute>
                <RegisterTeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resource-hub"
            element={
              <ProtectedRoute>
                <ResourceHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meeting-room"
            element={
              <ProtectedRoute>
                <MeetingRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/csbt"
            element={
              <ProtectedRoute>
                <CSBT />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edithackathon/:id"
            element={
              <AdminRoute>
                <EditHackathon />
              </AdminRoute>
            }
          />
          {/* <Route path="/eligible-hackathons" element={<ProtectedRoute><EligibleHackathons/></ProtectedRoute>}/> */}
          <Route
            path="/create-users"
            element={
              <AdminRoute>
                <CreateUser />
              </AdminRoute>
            }
          />
          <Route
            path="/create-hackathon"
            element={
              <AdminRoute>
                <CreateHackathon />
              </AdminRoute>
            }
          />
        </Routes>

        {!isMeetingRoom &&
          !isDashboard &&
          isAuth &&
          isHackathon &&
          hackathon.eventType !== "Interactive Hackathon" && (
            <ProtectedRoute>
              <VideoConference />
            </ProtectedRoute>
          )}
        {/* {!isMeetingRoom &&
          !isDashboard &&
          isAuth &&
          isHackathon &&
          hackathon.eventType !== "Interactive Hackathon" && (
            <ProtectedRoute>
              <InteractiveElement />
            </ProtectedRoute>
          )} */}
        {!isMeetingRoom && <Footer />}
        {isAuth && !isMeetingRoom && (
          <ChatbotButton
            isOpen={isChatOpen}
            onClick={() => setIsChatOpen(!isChatOpen)}
          />
        )}
        {isAuth && !isMeetingRoom && (
          <ChatWindow
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>
    </>
  );
}

export default App;
