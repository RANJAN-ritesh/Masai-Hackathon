import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Confetti from "react-confetti"; // 🎉 Import Confetti
import { useWindowSize } from "react-use"; // For dynamic width/height
import { io } from "socket.io-client";
import { MyContext } from "../context/AuthContextProvider";

// ✅ Initialize socket connection
// const socket = io("http://localhost:5009", { transports: ["websocket"] });

const RegisterTeamPage = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const { width, height } = useWindowSize(); // Auto-resizes confetti
  const [showConfetti, setShowConfetti] = useState(false); // State for Confetti 🎉
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState({
    teamName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setCurrentHackathonId } = useContext(MyContext);
  const currentHackathon = localStorage.getItem("currentHackathon");

  useEffect(() => {
    if (!currentHackathon) {
      navigate("/");
    }
  });

  const handleChange = (e) => {
    setTeamData({
      ...teamData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem("userId");

      const teamPayload = {
        teamName: teamData.teamName,
        createdBy: userId,
        hackathonId: setCurrentHackathonId,
      };

      const response = await fetch(`${baseURL}/team/create-team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }
      const result = await response.json();

      // ✅ Emit real-time event to notify other users
      // socket.emit("teamUpdated", result.team);

      // 🎉 Trigger Confetti Animation
      setShowConfetti(true);
      toast.success("Team created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => {
        setShowConfetti(false);
        navigate("/select-team");
      }, 4000); // Auto-stop confetti after 4 seconds
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {showConfetti && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={400}
          />
        </div>
      )}
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Teams</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Users size={32} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center">Create New Team</h2>
            <p className="text-indigo-100 text-center mt-2">
              Form your dream team for the hackathon
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="teamName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  name="teamName"
                  value={teamData.teamName}
                  onChange={handleChange}
                  placeholder="Enter your team name"
                  className="block w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Team"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export { RegisterTeamPage };
