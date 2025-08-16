import React, { useContext, useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  X,
  Check,
  Trash2,
  LogOut,
  Shield,
  User,
  Eye,
  EyeOff,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Code,
  Video,
  SquareArrowOutUpRight,
  Github,
  Globe,
  User2,
  CloudUpload,
} from "lucide-react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";
import { MyContext } from "../context/AuthContextProvider";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";

// Initialize socket connection
// const socket = io("http://localhost:5009"); // Replace with your backend URL

const SelectTeamPage = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [teams, setTeams] = useState([]);
  const [userTeamId, setUserTeamId] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [problemLoading, setProblemLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userIsCreator, setUserIsCreator] = useState(false);
  const [requestProcessing, setRequestProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleContacts, setVisibleContacts] = useState({});
  const [fullTeamDetails, setFullTeamDetails] = useState({});
  const userId = localStorage.getItem("userId");
  const { hackathon, userData, role } = useContext(MyContext);
  const currentHackathon = localStorage.getItem("currentHackathon");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const isInteractive =
    hackathon.eventType == "Interactive Hackathon" ? true : false;

  const [currentTeamId, setCurrentTeamId] = useState(null);
  const [problemStatements, setProblemStatements] = useState([]);
  const [showSelectProblemModal, setShowSelectProblemModal] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [submissionTeamId, setSubmissionTeamId] = useState(null);
  const [teamSubmissions, setTeamSubmissions] = useState([]);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    githubLink: "",
    deploymentLink: "",
    teamVideoLink: "",
  });
  const [showGroupSubmissionModal, setShowGroupSubmissionModal] =
    useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(null);
  // Store selected problem details for each team
  const [selectedProblems, setSelectedProblems] = useState({});

  const handleSubmissionInputChange = (e) => {
    const { name, value } = e.target;
    setSubmissionData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchProblemStatements = async (id) => {
    setShowSelectProblemModal(true);
    setProblemLoading(true);
    try {
      const res = await fetch(
        `${baseURL}/hackathons/problems/${currentHackathon}`
      );
      const data = await res.json();
      setCurrentTeamId(id);
      setProblemStatements(data.problemStatements || []);
    } catch (err) {
      toast.error("Failed to load problem statements");
    } finally {
      setProblemLoading(false);
    }
  };

  const handleProblemSelection = async (problemId, teamId) => {
    try {
      const res = await fetch(`${baseURL}/team/select-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: currentTeamId,
          hackathonId: currentHackathon,
          problemStatementId: problemId,
        }),
      });

      if (!res.ok) throw new Error("Failed to select problem");
      toast.success("Problem statement selected successfully");
      setShowSelectProblemModal(false);
    } catch (err) {
      toast.error("Error selecting problem statement");
    }
  };

  const handleSubmission = async (teamId) => {
    try {
      const body = {
        userId,
        ...submissionData,
      };

      const res = await fetch(`${baseURL}/team/submissions/${teamId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Submission failed");
      console.log(res);
      toast.success("Submission successful");
      setShowSubmissionModal(false);
      setSubmissionData({
        githubLink: "",
        deploymentLink: "",
        teamVideoLink: "",
      });
    } catch (err) {
      toast.error("Error submitting project");
    }
  };

  const fetchTeamSubmissions = async (teamId) => {
    try {
      const res = await fetch(`${baseURL}/team/submissions/${teamId}`);
      const data = await res.json();
      setTeamSubmissions(data.submissions);
      setShowGroupSubmissionModal(true);
    } catch (err) {
      toast.error("Failed to fetch submissions");
    }
  };

  // Configure Modal based on Action and Pass Arguments
  const openModal = (actionType, teamId, creatorId) => {
    if (actionType === "leave") {
      setModalConfig({
        title: "Confirm Leaving Team",
        message:
          "Are you sure you want to leave the team? This action cannot be undone.",
        onConfirm: () => {
          leaveTeam(userId);
          setIsModalOpen(false);
        },
      });
    } else if (actionType === "delete") {
      setModalConfig({
        title: "Confirm Deleting Team",
        message:
          "Are you sure you want to delete the team? This action is irreversible.",
        onConfirm: () => {
          deleteTeam(teamId, creatorId);
          setIsModalOpen(false);
        },
      });
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!currentHackathon) {
      navigate("/");
    }
  });

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${baseURL}/team/${currentHackathon}`);
      // let res = await response.json()
      // console.log(res)
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setTeams(data);
      // console.log("Teams: ", data)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${baseURL}/users/get-user/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user data");
        const userData = await response.json();
        // console.log(userData.teamId)
        setUserTeamId(userData?.teamId || null);
      } catch (err) {
        console.error("Error fetching user data", err);
      }
    };

    fetchUserDetails();
    fetchTeams();
  }, [userId]);

  useEffect(() => {
    if (!userTeamId) return;

    const fetchPendingRequests = async () => {
      try {
        const response = await fetch(
          `${baseURL}/team-request/${userTeamId}/join-requests`, // userTeamId is an array
          {
            method: "GET",
          }
        );
        if (response.status === 403) {
          console.log("User is not the team creator.");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch pending requests");
        const data = await response.json();
        setPendingRequests(data.pendingRequests);
        setUserIsCreator(true);
      } catch (err) {
        console.error("Error fetching pending requests", err);
      }
    };

    // fetchPendingRequests();
  }, [userTeamId]); // userTeamId is an array

  const handleJoinRequest = async (teamId) => {
    try {
      const response = await fetch(`${baseURL}/team-request/send-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, teamId }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Join request sent successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(`${result.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error sending join request:", err);
    }
  };

  const handleAcceptRequest = async (requestId, teamId) => {
    setRequestProcessing(true);
    try {
      const response = await fetch(`${baseURL}/team-request/accept-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, teamId }),
      });

      const result = await response.json();
      if (response.ok) {
        // Update UI by removing the accepted request
        setPendingRequests(
          pendingRequests.filter((req) => req._id !== requestId)
        );

        // Refresh teams to show updated member list
        const teamsResponse = await fetch(`${baseURL}/team/get-teams`);
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
        }

        toast.success("User accepted to the team!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(result.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error accepting join request:", err);
      toast.error("Failed to accept request. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setRequestProcessing(false);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setRequestProcessing(true);
    try {
      const response = await fetch(`${baseURL}/team-request/decline-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      const result = await response.json();
      if (response.ok) {
        // Update UI by removing the declined request
        setPendingRequests(
          pendingRequests.filter((req) => req._id !== requestId)
        );
        toast.success("Join request declined!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(result.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error declining join request:", err);
      toast.error("Failed to decline request. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setRequestProcessing(false);
    }
  };

  // Leave team
  const leaveTeam = async (userId) => {
    try {
      const response = await fetch(`${baseURL}/users/leave-team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to leave the team");
      }
      toast.success("You have successfully left the team", {
        position: "top-right",
        autoClose: 3000,
      });
      await fetchTeams(); // ✅ Refresh teams after successful deletion
    } catch (error) {
      console.error("Error:", error);
      toast.success(error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const deleteTeam = async (teamId, userId) => {
    try {
      const response = await fetch(`${baseURL}/team/delete-team`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete the team");
      }
      toast.success("You have successfully deleted the team", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchTeams(); // ✅ Refresh teams after successful deletion
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const removeMember = async (memberId) => {
    // This function is referenced but not implemented in the original code
    alert("Remove member functionality not implemented yet");
  };

  // Function to get a color scheme based on team index
  const getColorScheme = (index) => {
    const schemes = [
      {
        primary: "from-sky-400 to-sky-500",
        accent: "bg-sky-100",
        text: "text-sky-600",
        border: "border-sky-200",
        button: "bg-sky-500 hover:bg-sky-600",
        badge: "bg-sky-100 text-sky-600",
      },
      {
        primary: "from-emerald-400 to-emerald-500",
        accent: "bg-emerald-100",
        text: "text-emerald-600",
        border: "border-emerald-200",
        button: "bg-emerald-500 hover:bg-emerald-600",
        badge: "bg-emerald-100 text-emerald-600",
      },
      {
        primary: "from-amber-400 to-amber-500",
        accent: "bg-amber-100",
        text: "text-amber-600",
        border: "border-amber-200",
        button: "bg-amber-500 hover:bg-amber-600",
        badge: "bg-amber-100 text-amber-600",
      },
      {
        primary: "from-violet-400 to-violet-500",
        accent: "bg-violet-100",
        text: "text-violet-600",
        border: "border-violet-200",
        button: "bg-violet-500 hover:bg-violet-600",
        badge: "bg-violet-100 text-violet-600",
      },
      {
        primary: "from-rose-400 to-rose-500",
        accent: "bg-rose-100",
        text: "text-rose-600",
        border: "border-rose-200",
        button: "bg-rose-500 hover:bg-rose-600",
        badge: "bg-rose-100 text-rose-600",
      },
      {
        primary: "from-teal-400 to-teal-500",
        accent: "bg-teal-100",
        text: "text-teal-600",
        border: "border-teal-200",
        button: "bg-teal-500 hover:bg-teal-600",
        badge: "bg-teal-100 text-teal-600",
      },
    ];
    return schemes[index % schemes.length];
  };

  const toggleContact = (memberId) => {
    setVisibleContacts((prev) => ({
      ...prev,
      [memberId]: !prev[memberId], // Toggle visibility for this member
    }));
  };

  function generateThreeDigitNumber() {
    return Math.floor(100 + Math.random() * 900);
  }

  useEffect(() => {
    const fetchFullMemberDetails = async () => {
      try {
        const memberIds = [
          ...new Set(
            teams.flatMap((team) => team.teamMembers.map((m) => m._id))
          ),
        ]; // Extract unique member IDs

        const memberDetails = {};

        await Promise.all(
          memberIds.map(async (id) => {
            const res = await fetch(`${baseURL}/users/get-user/${id}`);
            if (res.ok) {
              const userData = await res.json();
              memberDetails[id] = userData; // Store full details
            }
          })
        );

        setFullTeamDetails(memberDetails); // Save fetched details
      } catch (err) {
        console.error("Error fetching team members:", err);
      }
    };

    if (teams.length > 0) fetchFullMemberDetails();
  }, [teams]);

  // Countdown timer logic
  useEffect(() => {
    if (!hackathon?.startDate) return;
    const interval = setInterval(() => {
      const start = new Date(hackathon.startDate);
      const now = new Date();
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours after start
      const diff = end - now;
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
          expired: false,
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hackathon?.startDate]);

  // Fetch selected problem for each team on mount or teams change
  useEffect(() => {
    const fetchSelectedProblems = async () => {
      const problems = {};
      for (const team of teams) {
        if (team.selectedProblem) {
          // Fetch problem details from backend if not already present
          try {
            const res = await fetch(
              `${baseURL}/hackathons/problems/${currentHackathon}`
            );
            const data = await res.json();
            const found = (data.problemStatements || []).find(
              (p) => p._id === team.selectedProblem
            );
            if (found) problems[team._id] = found;
          } catch {}
        }
      }
      setSelectedProblems(problems);
    };
    if (teams.length > 0) fetchSelectedProblems();
  }, [teams, baseURL, currentHackathon]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center text-red-600 p-8 bg-white rounded-xl shadow-lg border-l-4 border-red-500 max-w-md">
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()} // 🔄 Fake state change to refresh UI
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  if (userData.teamId == null && role !== "admin")
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center text-red-600 p-8 bg-white rounded-xl shadow-lg border-l-4 border-red-500 max-w-md">
          <h3 className="text-xl font-bold mb-2">
            You are not part of any team
          </h3>
          <button
            onClick={() => window.location.reload()} // 🔄 Fake state change to refresh UI
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Countdown Timer */}
          {hackathon?.startDate && (
            <div className="mb-6 flex flex-col items-center justify-center">
              {timeLeft && !timeLeft.expired ? (
                <div className="flex items-center space-x-2 text-red-600 font-semibold">
                  <span>Time left to pick your problem statement:</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-lg text-lg tracking-wider">
                    {`${timeLeft.hours.toString().padStart(2, "0")}:${timeLeft.minutes
                      .toString()
                      .padStart(2, "0")}:${timeLeft.seconds
                      .toString()
                      .padStart(2, "0")}`}
                  </span>
                </div>
              ) : timeLeft && timeLeft.expired ? (
                <div className="text-red-500 font-semibold">
                  Problem selection window has closed.
                </div>
              ) : null}
            </div>
          )}
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Team Selection
                </h1>
                <p className="text-gray-600 mt-1">
                  Join an existing team or create your own for the hackathon
                </p>
              </div>

              {/* {userTeamId && !isInteractive && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                >
                  <LogOut size={18} />
                  Leave Current Team
                </button>
              )} */}
            </div>
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search teams by name or member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
          />

          {/* Teams Grid */}
          {teams.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Teams Available
              </h3>
              <p className="text-gray-500 mb-6">
                There are no teams created yet for this hackathon.
              </p>
              <button className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition shadow-md">
                Create Your Team
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...teams]
                .sort((a, b) => (a.teamMembers.length === 3 ? 1 : -1))
                .filter((team) => {
                  const lowerCaseSearch = searchTerm.trim().toLowerCase();

                  return (
                    (team.teamName?.toLowerCase() || "").includes(
                      lowerCaseSearch
                    ) ||
                    (team.teamMembers || []).some((member) =>
                      (member?.name?.toLowerCase() || "").includes(
                        lowerCaseSearch
                      )
                    )
                  );
                })
                .map((team, index) => {
                  const isMember = team.teamMembers.some(
                    (member) => member._id === userId
                  );
                  console.log(team);
                  const isCreator = team.createdBy?._id === userId;
                  const teamHasPendingRequests =
                    pendingRequests.length > 0 && isCreator;

                  // Conditionally check if userTeamId exists and matches team._id
                  // if (userTeamId && userTeamId !== team._id) {
                  //   return null; // Skip rendering this team if the condition is not met
                  // }

                  // ✅ Allow admin to view all teams, others only if member or creator
                  const isAdmin = role === "admin";
                  if (!isAdmin && !isMember && !isCreator) {
                    return null; // 🔒 Non-admins can't see this team
                  }

                  const colorScheme = getColorScheme(index);

                  return (
                    <div
                      key={team._id}
                      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
                        isMember ? `border-2 ${colorScheme.border}` : ""
                      }`}
                    >
                      {/* Team Header */}
                      <div
                        className={`bg-gradient-to-r ${colorScheme.primary} p-4 text-white`}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold">{team.teamName}</h3>
                          <div className="flex gap-2">
                            {isMember && !isCreator && (
                              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                                <User size={14} className="mr-1" />
                                Member
                              </span>
                            )}
                            {isCreator && (
                              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                                <Shield size={14} className="mr-1" />
                                Creator
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-white/80 text-sm mt-1">
                          Created by {team.createdBy?.name || "Unknown"}
                        </p>
                      </div>

                      {/* Team Content */}
                      <div className="p-5">
                        {/* Team Members */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-lg font-medium text-gray-800 flex items-center">
                              <Users
                                size={18}
                                className={`mr-2 ${colorScheme.text}`}
                              />
                              Team Members
                            </h4>
                            <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                              {team.teamMembers.length}/{team.memberLimit || 3}
                            </span>
                          </div>

                          {team.teamMembers.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">
                              No members yet
                            </p>
                          ) : (
                            <ul className="space-y-3">
                              {team.teamMembers.map((member) => {
                                const memberDetails =
                                  fullTeamDetails[member._id] || {}; // Get fetched details
                                return (
                                  <li
                                    key={member._id}
                                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                                  >
                                    <div className="flex items-center">
                                      <div
                                        className={`w-9 h-9 rounded-full ${colorScheme.accent} text-gray-800 flex items-center justify-center mr-3 font-medium shadow-sm`}
                                      >
                                        {member.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-800">
                                          {member.name}
                                        </p>
                                        {member._id === team.createdBy?._id && (
                                          <span
                                            className={`text-xs ${colorScheme.text}`}
                                          >
                                            Team Leader
                                          </span>
                                        )}

                                        {/* Display Skills */}
                                        {memberDetails.skills &&
                                          memberDetails.skills[0] && (
                                            <div className="mt-1">
                                              <span
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                                                title={memberDetails.skills[0]} // ✅ Full text visible on hover
                                              >
                                                <Code className="w-3 h-3 mr-1" />
                                                {memberDetails.skills[0]
                                                  .length > 48
                                                  ? `${memberDetails.skills[0].slice(
                                                      0,
                                                      48
                                                    )}...`
                                                  : memberDetails.skills[0]}
                                              </span>
                                            </div>
                                          )}

                                        {/* Contact Details Button */}
                                        {console.log("This is user role", role)}
                                        {(role == "admin" ||
                                          userTeamId.includes(team._id)) && ( // userTeamId is an array
                                          <div className="mt-2">
                                            <button
                                              onClick={() =>
                                                toggleContact(member._id)
                                              }
                                              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors 
                    bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200
                    focus:outline-none focus:ring-2 focus:ring-gray-300`}
                                              aria-expanded={
                                                visibleContacts[member._id]
                                                  ? "true"
                                                  : "false"
                                              }
                                              aria-controls={`contact-info-${member._id}`}
                                            >
                                              {visibleContacts[member._id] ? (
                                                <>
                                                  <ChevronUp
                                                    size={14}
                                                    aria-hidden="true"
                                                  />
                                                  <span>
                                                    Hide Contact Details
                                                  </span>
                                                </>
                                              ) : (
                                                <>
                                                  <ChevronDown
                                                    size={14}
                                                    aria-hidden="true"
                                                  />
                                                  <span>Contact Details</span>
                                                </>
                                              )}
                                            </button>
                                            {/* Contact Information Panel with Smooth Transition */}
                                            {visibleContacts[member._id] && (
                                              <div
                                                id={`contact-info-${member._id}`}
                                                className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                                              >
                                                <div className="space-y-3">
                                                  <div className="flex items-center gap-2">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                                                      <Mail
                                                        size={14}
                                                        aria-hidden="true"
                                                      />
                                                    </div>
                                                    <div>
                                                      <p className="text-xs text-gray-500 font-medium">
                                                        Email Address
                                                      </p>
                                                      <p className="text-sm text-gray-800">
                                                        {memberDetails.email ||
                                                          "Not Available"}
                                                      </p>
                                                    </div>
                                                  </div>

                                                  <div className="flex items-center gap-2">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                                                      <Phone
                                                        size={14}
                                                        aria-hidden="true"
                                                      />
                                                    </div>
                                                    <div>
                                                      <p className="text-xs text-gray-500 font-medium">
                                                        Phone Number
                                                      </p>
                                                      <p className="text-sm text-gray-800">
                                                        {memberDetails.phoneNumber ||
                                                          "Not Available"}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* {isCreator &&
                                      member._id !== userId &&
                                      !isInteractive && (
                                        <button
                                          onClick={() =>
                                            removeMember(member._id)
                                          }
                                          className="p-1.5 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"
                                          title="Remove member"
                                        >
                                          <X size={16} />
                                        </button>
                                      )} */}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mt-4">
                          {/* {!userTeamId &&
                            !isMember &&
                            team.teamMembers.length < 3 && (
                              <button
                                onClick={() => handleJoinRequest(team._id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all duration-200 ${
                                  pendingRequests.some(
                                    (req) => req.teamId === team._id
                                  )
                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                    : `${colorScheme.button} text-white shadow hover:shadow-md`
                                }`}
                                disabled={pendingRequests.some(
                                  (req) => req.teamId === team._id
                                )}
                              >
                                {pendingRequests.some(
                                  (req) => req.teamId === team._id
                                ) ? (
                                  <>
                                    <span>Request Sent</span>
                                  </>
                                ) : (
                                  <>
                                    <UserPlus size={18} />
                                    <span>Join Team</span>
                                  </>
                                )}
                              </button>
                            )} */}

                          {/* Delete Team (For Creator) */}
                          {/* {isCreator && !isInteractive && (
                            <button
                              onClick={() =>
                                openModal(
                                  "delete",
                                  team._id,
                                  team.createdBy._id
                                )
                              }
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                            >
                              <Trash2 size={18} />
                              <span>Delete Team</span>
                            </button>
                          )} */}

                          {/* Leave Team (For Member) */}
                          {/* {isMember && !isCreator && !isInteractive && (
                            <button
                              onClick={() => openModal("leave")}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                            >
                              <LogOut size={18} />
                              <span>Leave Team</span>
                            </button>
                          )} */}

                          {/* Reusable Confirmation Modal */}
                          <ConfirmationModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onConfirm={modalConfig.onConfirm}
                            title={modalConfig.title}
                            message={modalConfig.message}
                          />

                          {(role == "admin" ||
                            userTeamId.includes(team._id)) && (
                            <a
                              href={`https://meet.jit.si/${
                                team.teamName
                              }_${generateThreeDigitNumber()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <button
                                className={`flex items-center justify-center gap-2 ${colorScheme.button} text-white px-4 py-2.5 rounded-md transition`}
                              >
                                <Video /> Team Meet
                              </button>
                            </a>
                          )}

                          <button
                            onClick={() => fetchProblemStatements(team._id)}
                            className={`${colorScheme.button} text-white px-3 py-2 rounded-md`}
                          >
                            Select Problem
                          </button>

                          {(role === "admin" ||
                            (new Date() >= new Date(hackathon?.submissionStart) &&
                              new Date() <=
                                new Date(hackathon?.submissionEnd))) && (
                            <>
                              <button
                                onClick={() => {
                                  setSubmissionTeamId(team._id);
                                  setShowSubmissionModal(true);
                                }}
                                className={`${colorScheme.button} text-white px-3 py-2 rounded-md`}
                              >
                                Team Submission
                              </button>

                              <button
                                onClick={() => fetchTeamSubmissions(team._id)}
                                className={`${colorScheme.button} text-white px-3 py-2 rounded-md`}
                              >
                                Group Submission
                              </button>
                            </>
                          )}

                          {(role == "admin" || userTeamId.includes(team._id)) &&
                            isInteractive && (
                              <a
                                href={`https://meet.jit.si/${
                                  userData.name
                                }_${generateThreeDigitNumber()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <button
                                  className={`flex items-center justify-center gap-2 ${colorScheme.button} text-white px-4 py-2.5 rounded-md transition`}
                                >
                                  <Video /> Solo Meet
                                </button>
                              </a>
                            )}
                        </div>
                      </div>

                      {/* Pending Requests Section */}
                      {teamHasPendingRequests && (
                        <div className="border-t border-gray-200 p-5 bg-gray-50">
                          <h4 className="text-lg font-medium text-gray-800 flex items-center mb-4">
                            <UserPlus
                              size={18}
                              className={`mr-2 ${colorScheme.text}`}
                            />
                            <span>Pending Requests</span>
                            <span
                              className={`ml-2 ${colorScheme.badge} text-xs px-2 py-0.5 rounded-full`}
                            >
                              {pendingRequests.length}
                            </span>
                          </h4>

                          <ul className="space-y-3">
                            {pendingRequests.map((req) => (
                              <li
                                key={req._id}
                                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex items-center">
                                    <div
                                      className={`w-10 h-10 rounded-full bg-gradient-to-r ${colorScheme.primary} text-white flex items-center justify-center mr-3 font-medium`}
                                    >
                                      {req.userId.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800">
                                        {req.userId.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Wants to join your team
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleAcceptRequest(req._id, team._id)
                                      }
                                      disabled={requestProcessing}
                                      className={`flex items-center gap-1 px-3 py-1.5 ${colorScheme.button} text-white rounded-md transition disabled:bg-gray-300 disabled:cursor-not-allowed`}
                                    >
                                      <Check size={16} />
                                      <span>Accept</span>
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeclineRequest(req._id)
                                      }
                                      disabled={requestProcessing}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                      <X size={16} />
                                      <span>Decline</span>
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Selected Problem Statement Card */}
                      {selectedProblems[team._id] && (
                        <div className="mt-6 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-lg shadow">
                          <h4 className="text-lg font-bold text-indigo-700 mb-2 flex items-center">
                            <Code className="w-5 h-5 mr-2 text-indigo-500" />
                            Selected Problem Statement
                          </h4>
                          <div className="mb-1">
                            <span className="font-semibold text-gray-700">Track:</span> {selectedProblems[team._id].track}
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold text-gray-700">Difficulty:</span> {selectedProblems[team._id].difficulty}
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold text-gray-700">Description:</span> <a href={selectedProblems[team._id].description} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">View Problem</a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
      {showSelectProblemModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-[90%] max-w-lg shadow-xl border border-gray-100">
              {problemLoading ? (
                <div className=" flex justify-center items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                      Select Problem Statement
                    </h3>
                    <div className="bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">
                      {problemStatements.length} Available
                    </div>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                    {problemStatements.map((p) => (
                      <div
                        key={p._id}
                        className="bg-gray-50 border border-gray-100 p-4 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
                        onClick={() =>
                          handleProblemSelection(p._id, userTeamId)
                        }
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-gray-800">
                            {p.track}
                          </span>
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full ${
                              p.difficulty === "Easy"
                                ? "bg-green-100 text-green-800"
                                : p.difficulty === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {p.difficulty}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <a
                            href={p.description}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Description
                            <SquareArrowOutUpRight className="h-4 w-4 ml-1" />
                          </a>
                          <div className="text-gray-500 text-xs">
                            Select this problem
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowSelectProblemModal(false)}
                      className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2 rounded-lg mr-3 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowSelectProblemModal(false)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {showGroupSubmissionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-2xl transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Group Submissions
                </h3>
                <button
                  onClick={() => setShowGroupSubmissionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {teamSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No submissions available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamSubmissions.map((sub, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {sub.userId.name.charAt(0)}
                        </div>
                        <h4 className="ml-3 font-medium text-gray-800">
                          {sub.userId.name}
                        </h4>
                      </div>
                      <div className="flex items-center mt-1 text-gray-600">
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm">
                            Last updated{" "}
                            <time
                              dateTime={sub?.createdAt}
                              className="font-medium text-blue-600"
                            >
                              {new Date(sub?.createdAt).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </time>
                          </span>
                        </span>
                      </div>

                      <hr className="mt-1 mb-2 border-t-1 border-gray-300" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-gray-500 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          <a
                            href={sub.githubLink}
                            className="text-blue-600 hover:underline truncate"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {sub.githubLink}
                          </a>
                        </div>

                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-gray-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                          </svg>
                          <a
                            href={sub.deploymentLink}
                            className="text-blue-600 hover:underline truncate"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {sub.deploymentLink}
                          </a>
                        </div>

                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-gray-500 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <a
                            href={sub.teamVideoLink}
                            className="text-blue-600 hover:underline truncate"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {sub.teamVideoLink}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 text-right">
                <button
                  onClick={() => setShowGroupSubmissionModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-[90%] max-w-lg shadow-xl border border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center bg-white shadow rounded-lg p-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <CloudUpload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Submit Your Project
                </h3>
                <div className="flex items-center mt-1 text-gray-600">
                  <span className="font-medium">
                    Deadline:{" "}
                    <span className="text-blue-600">
                      {new Date(hackathon?.submissionEnd).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-5 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  GitHub Repository <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="githubLink"
                    required
                    value={submissionData.githubLink}
                    onChange={handleSubmissionInputChange}
                    placeholder="https://github.com/username/repository"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Other Link
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="deploymentLink"
                    value={submissionData.deploymentLink}
                    onChange={handleSubmissionInputChange}
                    placeholder="https://your-project.vercel.app"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Team Explanation Video <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="teamVideoLink"
                    required
                    value={submissionData.teamVideoLink}
                    onChange={handleSubmissionInputChange}
                    placeholder="https://youtu.be/your-team-video-id"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSubmission(submissionTeamId)}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Submit Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectTeamPage;
