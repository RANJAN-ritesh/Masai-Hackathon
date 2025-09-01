import React, { useState, useEffect, useContext } from "react";
import { Code, Database, TestTube, ChevronRight, X, Clock, Users, CheckCircle, AlertCircle, Vote, Timer } from "lucide-react";
import { toast } from "react-toastify";
import { MyContext } from "../context/AuthContextProvider";

const ProblemStatement = ({ hackathonData }) => {
  const { userData, role } = useContext(MyContext);
  const [problemStatements, setProblemStatements] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [teamSelection, setTeamSelection] = useState(null);
  const [teamSubmission, setTeamSubmission] = useState(null);
  const [activePoll, setActivePoll] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [selectionWindowOpen, setSelectionWindowOpen] = useState(false);
  const [submissionWindowOpen, setSubmissionWindowOpen] = useState(false);

  // Load problem statements
  useEffect(() => {
    if (hackathonData?._id) {
      loadProblemStatements();
      loadTeamData();
    }
  }, [hackathonData]);

  // Timer for selection window
  useEffect(() => {
    if (!hackathonData?.startDate || !hackathonData?.endDate) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(hackathonData.startDate);
      const end = new Date(hackathonData.endDate);
      
      // Selection window: 48hrs before start to 24hrs after end
      const selectionStart = new Date(start.getTime() - 48 * 60 * 60 * 1000);
      const selectionEnd = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      
      // Submission window: based on admin settings
      const submissionStart = new Date(hackathonData.submissionStartDate || start);
      const submissionEnd = new Date(hackathonData.submissionEndDate || end);
      
      setSelectionWindowOpen(now >= selectionStart && now <= selectionEnd);
      setSubmissionWindowOpen(now >= submissionStart && now <= submissionEnd);
      
      // Calculate time left for selection window
      if (now < selectionEnd) {
        const diff = selectionEnd - now;
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
          expired: false
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [hackathonData]);

  const loadProblemStatements = async () => {
    try {
      const response = await fetch(`/problem-statements/hackathon/${hackathonData._id}`);
      const data = await response.json();
      if (data.success) {
        setProblemStatements(data.problemStatements);
      }
    } catch (error) {
      console.error("Error loading problem statements:", error);
    }
  };

  const loadTeamData = async () => {
    if (!userData?.currentTeamId || !hackathonData?._id) return;
    
    try {
      // Load team selection
      const selectionResponse = await fetch(`/problem-statements/team/${userData.currentTeamId}/hackathon/${hackathonData._id}/selection`);
      const selectionData = await selectionResponse.json();
      if (selectionData.success) {
        setTeamSelection(selectionData.selection);
      }
      
      // Load team submission
      const submissionResponse = await fetch(`/problem-statements/team/${userData.currentTeamId}/hackathon/${hackathonData._id}/submission`);
      const submissionData = await submissionResponse.json();
      if (submissionData.success) {
        setTeamSubmission(submissionData.submission);
      }
      
      // Load active poll
      const pollResponse = await fetch(`/problem-statements/poll/team/${userData.currentTeamId}/active`);
      const pollData = await pollResponse.json();
      if (pollData.success) {
        setActivePoll(pollData.poll);
      }
    } catch (error) {
      console.error("Error loading team data:", error);
    }
  };

  const openModal = (track) => {
    setSelectedTrack(track);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedTrack(null);
    setShowModal(false);
  };

  const openSelectionModal = () => {
    setShowSelectionModal(true);
  };

  const closeSelectionModal = () => {
    setShowSelectionModal(false);
  };

  const openPollModal = () => {
    setShowPollModal(true);
  };

  const closePollModal = () => {
    setShowPollModal(false);
  };

  const openSubmissionModal = () => {
    setShowSubmissionModal(true);
  };

  const closeSubmissionModal = () => {
    setShowSubmissionModal(false);
    setSubmissionUrl("");
  };

  const getFilteredProblems = (track) => {
    return problemStatements.filter(
      (problem) => problem.category.toLowerCase() === track.toLowerCase()
    );
  };

  const handleProblemSelection = async (problemId) => {
    try {
      const response = await fetch("/problem-statements/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          teamId: userData.currentTeamId,
          hackathonId: hackathonData._id,
          problemId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Problem statement selected successfully!");
        setTeamSelection(data.selection);
        closeSelectionModal();
        loadTeamData();
      } else {
        toast.error(data.message || "Failed to select problem statement");
      }
    } catch (error) {
      console.error("Error selecting problem:", error);
      toast.error("Failed to select problem statement");
    }
  };

  const handleCreatePoll = async () => {
    try {
      const response = await fetch("/problem-statements/poll/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          teamId: userData.currentTeamId,
          hackathonId: hackathonData._id
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Poll created successfully! Team members have been notified.");
        setActivePoll(data.poll);
        closePollModal();
        loadTeamData();
      } else {
        toast.error(data.message || "Failed to create poll");
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Failed to create poll");
    }
  };

  const handleVote = async (problemId) => {
    try {
      const response = await fetch("/problem-statements/poll/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          pollId: activePoll._id,
          problemId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Vote recorded successfully!");
        loadTeamData();
      } else {
        toast.error(data.message || "Failed to record vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to record vote");
    }
  };

  const handleCompletePoll = async () => {
    try {
      const response = await fetch(`/problem-statements/poll/${activePoll._id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Poll completed successfully!");
        setActivePoll(null);
        setTeamSelection(data.selection);
        loadTeamData();
      } else {
        toast.error(data.message || "Failed to complete poll");
      }
    } catch (error) {
      console.error("Error completing poll:", error);
      toast.error("Failed to complete poll");
    }
  };

  const handleSubmission = async () => {
    if (!submissionUrl.trim()) {
      toast.error("Please enter a valid submission URL");
      return;
    }
    
    try {
      const response = await fetch("/problem-statements/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          teamId: userData.currentTeamId,
          hackathonId: hackathonData._id,
          submissionUrl: submissionUrl.trim()
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Submission successful! This is your final submission.");
        setTeamSubmission(data.submission);
        closeSubmissionModal();
        loadTeamData();
      } else {
        toast.error(data.message || "Failed to submit solution");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Failed to submit solution");
    }
  };

  const isTeamLeader = userData?.currentTeamId && userData?.role === "leader";
  const hasSelection = teamSelection && teamSelection.isLocked;
  const hasSubmission = teamSubmission;

  return (
    <>
      {/* Problem Statement Selection Modal */}
      {showSelectionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={closeSelectionModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Select Problem Statement
            </h3>

            {timeLeft && !timeLeft.expired && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Clock size={20} />
                  <span className="font-semibold">Selection Window Closes In:</span>
                  <span className="bg-blue-100 px-3 py-1 rounded-lg text-lg tracking-wider">
                    {`${timeLeft.days}d ${timeLeft.hours.toString().padStart(2, "0")}:${timeLeft.minutes.toString().padStart(2, "0")}:${timeLeft.seconds.toString().padStart(2, "0")}`}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {problemStatements.map((problem) => (
                <div
                  key={problem._id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleProblemSelection(problem._id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{problem.category}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">{problem.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-3">{problem.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl relative shadow-2xl">
            <button
              onClick={closePollModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Create Problem Selection Poll
            </h3>

            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2 text-yellow-700">
                <AlertCircle size={20} />
                <span className="font-semibold">Poll Instructions:</span>
              </div>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• Poll will be active for 1 hour</li>
                <li>• Team members will receive notifications</li>
                <li>• Problem with most votes will be selected</li>
                <li>• You can end the poll early if needed</li>
              </ul>
            </div>

            <button
              onClick={handleCreatePoll}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Create Poll
            </button>
          </div>
        </div>
      )}

      {/* Active Poll Modal */}
      {activePoll && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl relative shadow-2xl">
            <button
              onClick={() => setActivePoll(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Problem Selection Poll
            </h3>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-700">
                <Timer size={20} />
                <span className="font-semibold">Poll expires in: {new Date(activePoll.expiresAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              {problemStatements.map((problem) => (
                <div
                  key={problem._id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleVote(problem._id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{problem.title}</h4>
                      <p className="text-sm text-gray-600">{problem.category} • {problem.difficulty}</p>
                    </div>
                    <Vote size={20} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>

            {isTeamLeader && (
              <button
                onClick={handleCompletePoll}
                className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Complete Poll Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg relative shadow-2xl">
            <button
              onClick={closeSubmissionModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Submit Solution
            </h3>

            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle size={20} />
                <span className="font-semibold">Important:</span>
              </div>
              <p className="mt-2 text-sm text-red-700">
                This is your one and only submission. Once you submit, you won't be able to change it.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission URL
              </label>
              <input
                type="url"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://your-project-url.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSubmission}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Submit Final Solution
            </button>
          </div>
        </div>
      )}

      {/* Main Section */}
      <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Problem Statements
          </h2>
          
          {/* Selection Status */}
          {hasSelection ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle size={20} />
              <span className="font-semibold">Selected: {teamSelection.selectedProblemId.title}</span>
            </div>
          ) : selectionWindowOpen ? (
            <div className="flex items-center space-x-2 text-blue-600">
              <Clock size={20} />
              <span className="font-semibold">Selection Window Open</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <X size={20} />
              <span className="font-semibold">Selection Window Closed</span>
            </div>
          )}
        </div>

        {/* Selection Window Status */}
        {selectionWindowOpen && !hasSelection && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-700">
                <Clock size={20} />
                <span className="font-semibold">Problem Selection Window is Open!</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={openSelectionModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Select Problem
                </button>
                {isTeamLeader && (
                  <button
                    onClick={openPollModal}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    Create Poll
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Poll Notification */}
        {activePoll && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-yellow-700">
                <Vote size={20} />
                <span className="font-semibold">Active Poll - Vote Now!</span>
              </div>
              <button
                onClick={() => setActivePoll(activePoll)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
              >
                View Poll
              </button>
            </div>
          </div>
        )}

        {/* Submission Section */}
        {submissionWindowOpen && !hasSubmission && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle size={20} />
                <span className="font-semibold">Submission Window is Open!</span>
              </div>
              <button
                onClick={openSubmissionModal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Submit Solution
              </button>
            </div>
          </div>
        )}

        {/* Selected Problem Display */}
        {hasSelection && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Selected Problem Statement:</h3>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-gray-800">{teamSelection.selectedProblemId.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{teamSelection.selectedProblemId.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>{teamSelection.selectedProblemId.category}</span>
                <span>•</span>
                <span>{teamSelection.selectedProblemId.difficulty}</span>
                <span>•</span>
                <span>Selected: {new Date(teamSelection.selectedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submission Display */}
        {hasSubmission && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Team Submission:</h3>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <a
                href={teamSubmission.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {teamSubmission.submissionUrl}
              </a>
              <p className="text-xs text-gray-500 mt-1">
                Submitted: {new Date(teamSubmission.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Problem Statement Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Software Development */}
          <div
            onClick={() => openModal("Software Development")}
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="bg-blue-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Code size={24} />
            </div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Software Development
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Build innovative UI/UX solutions with modern frameworks
            </p>
            <span className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-800">
              View Challenges <ChevronRight size={16} />
            </span>
          </div>

          {/* Data Analytics */}
          <div
            onClick={() => openModal("Data Analytics")}
            className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="bg-purple-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Database size={24} />
            </div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              Data Analytics
            </h3>
            <p className="text-purple-700 text-sm mb-4">
              Extract insights from complex datasets
            </p>
            <span className="flex items-center text-purple-600 font-medium text-sm hover:text-purple-800">
              View Challenges <ChevronRight size={16} />
            </span>
          </div>

          {/* SDET */}
          <div
            onClick={() => openModal("SDET")}
            className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="bg-green-500 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <TestTube size={24} />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">SDET</h3>
            <p className="text-green-700 text-sm mb-4">
              Create robust testing frameworks and automation
            </p>
            <span className="flex items-center text-green-600 font-medium text-sm hover:text-green-800">
              View Challenges <ChevronRight size={16} />
            </span>
          </div>
        </div>
      </div>

      {/* Problem Statement Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg relative shadow-2xl">
            <div
              className={`absolute -top-4 -left-4 p-3 rounded-full ${
                selectedTrack === "Software Development"
                  ? "bg-blue-500"
                  : selectedTrack === "Data Analytics"
                  ? "bg-purple-500"
                  : "bg-green-500"
              } text-white`}
            >
              {selectedTrack === "Software Development" ? (
                <Code size={24} />
              ) : selectedTrack === "Data Analytics" ? (
                <Database size={24} />
              ) : (
                <TestTube size={24} />
              )}
            </div>

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-2 pl-1 text-gray-800">
              {selectedTrack} Challenges
            </h3>

            <p className="text-gray-500 mb-6 pl-1">
              Select a challenge to view details
            </p>

            <div className="max-h-72 overflow-y-auto pr-2 rounded-lg">
              {getFilteredProblems(selectedTrack)?.length > 0 ? (
                getFilteredProblems(selectedTrack).map((item, index) => (
                  <div
                    key={item._id}
                    className="mb-3 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm mr-3">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h4 className="text-gray-700 font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-500">{item.category} • {item.difficulty}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No challenges available for this track yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProblemStatement;