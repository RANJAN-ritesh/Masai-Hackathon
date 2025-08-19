import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MyContext } from "../context/AuthContextProvider";
import {
  ArrowRight,
  CalendarRange,
  MapPin,
  Trophy,
  Users,
  Frown,
  Sparkles,
  Delete,
  DeleteIcon,
  Trash2,
  Pencil,
  UserPlus,
  Copy,
  X,
  Eye
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "./ConfirmationModal";
import CSVUploadModal from "./CSVUploadModal";

const EligibleHackathons = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const { setCurrentHackathonId, userData, role } = useContext(MyContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [selectedHackathonId, setSelectedHackathonId] = useState(null);
  const location = useLocation(); // Add this line

  // Add state for tracking hackathon count changes
  const [hackathonCount, setHackathonCount] = useState(0);
  const [previousCount, setPreviousCount] = useState(0);

  const [participants, setParticipants] = useState({});
  const [showParticipants, setShowParticipants] = useState(null);
  
  // Teams display modal state
  const [teamsModalOpen, setTeamsModalOpen] = useState(false);
  const [selectedHackathonForTeams, setSelectedHackathonForTeams] = useState(null);
  const [teamsData, setTeamsData] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  const handleCSVUploadClick = (hackathonId) => {
    setSelectedHackathonId(hackathonId);
    setCsvModalOpen(true);
  };

  const handleRefresh = () => {
    console.log("🔄 Manual refresh triggered");
    setLoading(true);
    fetchHackathons(userData).then(() => {
      // Show success message after refresh
      toast.success("Hackathon list refreshed successfully!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });
  };

  const fetchHackathons = async (user) => {
    setLoading(true);
      try {
      // Fetch all hackathons for all users
        const response = await fetch(`${baseURL}/hackathons`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
        const data = await response.json();
      console.log("Hackathons Data: ", data);
      
      if (data && Array.isArray(data)) {
        // Track count changes for visual feedback
        setPreviousCount(hackathonCount);
        setHackathonCount(data.length);
        
          setHackathons(data);
        
        // Show notification if count increased (new hackathon detected)
        if (data.length > previousCount && previousCount > 0) {
          toast.info(`🎉 New hackathon detected! Total: ${data.length}`, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
      }
    } else {
          setHackathons([]);
        setHackathonCount(0);
        }
      } catch (error) {
        console.error("Error fetching hackathons:", error);
      setHackathons([]);
      setHackathonCount(0);
      } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      // console.log("This is parsed data", userData);
      fetchHackathons(userData); // pass parsed data directly
    } else {
      setLoading(false); // fallback if no user is found
    }
  }, [userData]);

  // Add another useEffect to refresh hackathons when component mounts
  useEffect(() => {
    // Refresh hackathons when component mounts (useful when navigating back from create/edit)
    fetchHackathons(userData);
  }, []); // Empty dependency array means it runs once when component mounts

  // Add new useEffect to handle refresh after navigation
  useEffect(() => {
    if (location.state?.refreshHackathons) {
      console.log("🔄 Refreshing hackathons after creation...");
      fetchHackathons(userData);
      // Clear the state to prevent infinite refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state, userData]);

  // Add timestamp-based refresh to ensure fresh data
  useEffect(() => {
    const interval = setInterval(() => {
      if (userData && userData.role === "admin") {
        console.log("🔄 Auto-refreshing hackathons every 30 seconds...");
        fetchHackathons(userData);
      }
    }, 30000); // Refresh every 30 seconds for admins

    return () => clearInterval(interval);
  }, [userData]);

  const handleDelete = async (id) => {
    const response = await fetch(`${baseURL}/hackathons/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      toast.success("Hackathon Deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      toast.warning("Failed to delete hackathon. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    fetchHackathons(userData);
  };

  const handleCreateTeam = async (hackathon) => {
    try {
      setLoading(true);
      
      // Get participants for THIS specific hackathon
      const participantsResponse = await fetch(`${baseURL}/users/hackathon/${hackathon._id}/participants`);
      if (!participantsResponse.ok) {
        throw new Error('Failed to fetch hackathon participants');
      }
      
      const participantsData = await participantsResponse.json();
      const allParticipants = participantsData.participants || [];
      
      // Filter participants who are not already in teams
      const participants = allParticipants.filter(user => 
        (user.role === 'member' || user.role === 'leader') && 
        (!user.teamId || user.teamId === '')
      );
      
      if (participants.length === 0) {
        toast.error(`No available participants found in ${hackathon.title} to create teams. Please add participants first.`, {
          autoClose: 5000
        });
        return;
      }
      
      // Calculate team size and number of teams using SMART ALGORITHM
      const minTeamSize = hackathon.minTeamSize || 2;
      const maxTeamSize = hackathon.maxTeamSize || 4;
      const totalParticipants = participants.length;
      
      console.log(`🎯 Creating teams for ${hackathon.title}:`, {
        totalParticipants,
        minTeamSize,
        maxTeamSize,
        hackathonId: hackathon._id
      });
      
      // SMART TEAM GENERATION ALGORITHM
      const calculateOptimalTeams = (total, min, max) => {
        // Try to create teams with maxTeamSize first
        let numTeams = Math.floor(total / max);
        let remainder = total % max;
        
        // If remainder is less than minTeamSize, redistribute
        if (remainder > 0 && remainder < min) {
          // Try to balance by reducing some teams by 1
          const shortfall = min - remainder;
          if (numTeams >= shortfall) {
            // Reduce some max-size teams by 1 to accommodate the small remainder
            return {
              teams: numTeams,
              sizes: Array(numTeams - shortfall).fill(max).concat(
                Array(shortfall).fill(max - 1)
              ).concat([remainder + shortfall])
            };
          } else {
            // Can't balance, create teams of minTeamSize
            numTeams = Math.ceil(total / min);
            const baseSize = Math.floor(total / numTeams);
            const extraMembers = total % numTeams;
            return {
              teams: numTeams,
              sizes: Array(extraMembers).fill(baseSize + 1).concat(
                Array(numTeams - extraMembers).fill(baseSize)
              )
            };
          }
        }
        
        // Normal case: teams fit within constraints
        const teamSizes = Array(numTeams).fill(max);
        if (remainder >= min) {
          teamSizes.push(remainder);
          numTeams++;
        } else if (remainder > 0) {
          // Distribute remainder among existing teams
          for (let i = 0; i < remainder; i++) {
            teamSizes[i]++;
          }
        }
        
        return { teams: numTeams, sizes: teamSizes };
      };
      
      const teamPlan = calculateOptimalTeams(totalParticipants, minTeamSize, maxTeamSize);
      
      console.log(`📊 Team Plan for ${hackathon.title}:`, {
        totalParticipants,
        minSize: minTeamSize,
        maxSize: maxTeamSize,
        plan: teamPlan
      });
      
      // Create teams using SMART ALGORITHM
      const createdTeams = [];
      let participantIndex = 0;
      
      for (let i = 0; i < teamPlan.teams; i++) {
        const teamSize = teamPlan.sizes[i];
        const teamMembers = participants.slice(participantIndex, participantIndex + teamSize);
        participantIndex += teamSize;
        
        if (teamMembers.length === 0) break;
        
        const teamName = `${hackathon.title} - Team ${i + 1}`;
        const teamLeader = teamMembers[0]; // First member becomes team leader
        
        const teamData = {
          teamName: teamName,
          createdBy: teamLeader._id,
          hackathonId: hackathon._id, // Associate with specific hackathon
          memberLimit: Math.max(teamSize, maxTeamSize), // Allow room for growth
          teamMembers: teamMembers.map(p => p._id),
          description: `Auto-generated team for ${hackathon.title}`
        };
        
        console.log(`🏗️ Creating ${teamName}:`, {
          size: teamSize,
          members: teamMembers.map(p => p.name),
          leader: teamLeader.name,
          hackathonId: hackathon._id
        });
        
        const teamResponse = await fetch(`${baseURL}/team/create-team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamData)
        });
        
        if (teamResponse.ok) {
          const newTeam = await teamResponse.json();
          createdTeams.push(newTeam);
          
          // Update user teamId in localStorage and context
          teamMembers.forEach(member => {
            const storedUserData = localStorage.getItem('userData');
            if (storedUserData) {
              try {
                const userData = JSON.parse(storedUserData);
                if (userData._id === member._id) {
                  userData.teamId = newTeam._id;
                  userData.role = member._id === teamLeader._id ? 'leader' : userData.role;
                  localStorage.setItem('userData', JSON.stringify(userData));
                }
              } catch (e) {
                console.error('Error updating user data:', e);
              }
            }
        });
      } else {
          const errorData = await teamResponse.json();
          console.error(`Failed to create ${teamName}:`, errorData);
          toast.error(`Failed to create ${teamName}: ${errorData.message}`, {
            autoClose: 5000
          });
        }
      }
      
      if (createdTeams.length > 0) {
        const teamSummary = teamPlan.sizes.map((size, i) => `Team ${i + 1}: ${size} members`).join(', ');
        
        // Create detailed team information
        let detailedMessage = `🎯 Smart Team Generation Complete!\n\n`;
        detailedMessage += `📊 Summary for ${hackathon.title}:\n`;
        detailedMessage += `• ${createdTeams.length} teams created\n`;
        detailedMessage += `• ${totalParticipants} participants assigned\n`;
        detailedMessage += `• Team sizes: ${teamPlan.sizes.join(', ')}\n`;
        detailedMessage += `• Hackathon: ${hackathon.title}\n\n`;
        detailedMessage += `💡 Teams are now ready for collaboration!`;
        
        toast.success(detailedMessage, {
          position: 'top-right',
          autoClose: 10000,
          style: { whiteSpace: 'pre-line', maxWidth: '400px' }
        });
        
        console.log(`✅ Team Creation Summary for ${hackathon.title}:`, {
          hackathon: hackathon.title,
          hackathonId: hackathon._id,
          totalParticipants,
          teamsCreated: createdTeams.length,
          teamSizes: teamPlan.sizes,
          adminSettings: { minTeamSize, maxTeamSize },
          createdTeams: createdTeams.map(team => ({
            name: team.teamName,
            id: team._id,
            members: team.teamMembers?.length || 0,
            hackathonId: hackathon._id
          }))
        });
        
        // Show additional info about viewing teams
        setTimeout(() => {
          toast.info(`👥 You can now view the created teams in the "Select Team" page. Teams are specific to ${hackathon.title}.`, {
            position: 'top-right',
            autoClose: 6000,
          });
        }, 2000);
        
        // Refresh hackathons to show updated data
        fetchHackathons(userData);
      } else {
        toast.error(`Failed to create any teams for ${hackathon.title}. Please check the console for errors.`);
      }
      
    } catch (error) {
      console.error('Error creating teams:', error);
      toast.error(`Failed to create teams for ${hackathon.title}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditHackathon = (hackathon) => {
    // Navigate to edit page with hackathon data
    navigate(`/edit-hackathon/${hackathon._id}`, { 
      state: { hackathonData: hackathon } 
    });
  };

  const handleCardClick = (hackathonId) => {
    setCurrentHackathonId(hackathonId);
    // console.log("Current Hackathon ID: ", hackathonId);
    localStorage.setItem("currentHackathon", hackathonId);
    navigate(`/hackathon`);
  };

  // Format date with options
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate status based on dates
  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return {
        label: "Upcoming",
        color: "bg-blue-100 text-blue-800",
        icon: <Sparkles className="w-4 h-4 mr-1" />,
      };
    } else if (now > end) {
      return {
        label: "Completed",
        color: "bg-gray-100 text-gray-800",
        icon: <Trophy className="w-4 h-4 mr-1" />,
      };
    } else {
      return {
        label: "Active",
        color: "bg-green-100 text-green-800",
        icon: <Users className="w-4 h-4 mr-1" />,
      };
    }
  };

  // Configure Modal based on Action and Pass Arguments
  const openModal = (actionType, hackathon) => {
    if (actionType === "create") {
      setModalConfig({
        title: "Confirm Create Teams",
        message: `Are you sure you want to create the teams for ${hackathon.title || hackathon.name || "this hackathon"}.`,
        onConfirm: () => {
          handleCreateTeam(hackathon);
          setIsModalOpen(false);
        },
      });
    } else if (actionType === "delete") {
      setModalConfig({
        title: "Confirm Deleting Team",
        message:
          "Are you sure you want to delete the Hackathon? This action is irreversible.",
        onConfirm: () => {
          handleDelete(hackathon._id);
          setIsModalOpen(false);
        },
      });
    }
    setIsModalOpen(true);
  };

  // View participants for a hackathon
  const handleViewParticipants = async (hackathonId) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/users/hackathon/${hackathonId}/participants`);
      
      if (response.ok) {
        const result = await response.json();
        setParticipants(prev => ({
          ...prev,
          [hackathonId]: result.participants
        }));
        setShowParticipants(hackathonId);
        
        toast.info(`Found ${result.count} participants in this hackathon`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to fetch participants");
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast.error("Network error while fetching participants");
    } finally {
      setLoading(false);
    }
  };

  // View teams for a hackathon
  const handleViewTeams = async (hackathon) => {
    setSelectedHackathonForTeams(hackathon);
    setTeamsModalOpen(true);
    setTeamsLoading(true);
    
    try {
      const response = await fetch(`${baseURL}/team/hackathon/${hackathon._id}`);
      if (response.ok) {
        const data = await response.json();
        setTeamsData(data.teams || []);
      } else {
        toast.error("Failed to fetch teams");
        setTeamsData([]);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Error fetching teams");
      setTeamsData([]);
    } finally {
      setTeamsLoading(false);
    }
  };

  // Copy individual team to clipboard
  const copyTeamToClipboard = (team) => {
    const teamText = `Team: ${team.teamName}\nMembers:\n${team.teamMembers.map(member => `- ${member.name} (${member.role})`).join('\n')}\nTeam Size: ${team.teamMembers.length}/${team.memberLimit}`;
    
    navigator.clipboard.writeText(teamText).then(() => {
      toast.success("Team information copied to clipboard!", {
        position: "top-center",
        autoClose: 2000
      });
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  // Copy all teams to clipboard
  const copyAllTeamsToClipboard = () => {
    const allTeamsText = teamsData.map(team => 
      `Team: ${team.teamName}\nMembers:\n${team.teamMembers.map(member => `- ${member.name} (${member.role})`).join('\n')}\nTeam Size: ${team.teamMembers.length}/${team.memberLimit}\n`
    ).join('\n---\n');
    
    navigator.clipboard.writeText(allTeamsText).then(() => {
      toast.success("All teams information copied to clipboard!", {
        position: "top-center",
        autoClose: 2000
      });
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  return (
    hackathons && (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header with background effect */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-indigo-600 opacity-5 rounded-xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center p-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Eligible Hackathons</h1>
                  <p className="text-gray-600">
                    {loading ? "Loading..." : `Found ${hackathonCount} hackathon${hackathonCount !== 1 ? 's' : ''}`}
                </p>
              </div>
              {role === "admin" && (
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleRefresh} 
                      disabled={loading}
                      className="mt-6 md:mt-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center shadow-md" 
                      title="Refresh hackathons list"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      <span className="ml-2">{loading ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                <Link to="/create-hackathon">
                  <button className="mt-6 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center shadow-md">
                        <Sparkles className="w-5 h-5 mr-2" />Create New Hackathon
                  </button>
                </Link>
                  </div>
              )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
            </div>
          ) : hackathons.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="bg-indigo-50 p-5 rounded-full inline-block mb-6">
                <Frown className="w-16 h-16 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Hackathons Found</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                {role === "admin" 
                  ? "You haven't created any hackathons yet. Start by creating your first event!"
                  : "You haven't registered for any hackathons yet. Join an event to see it here."}
              </p>
              {role === "admin" && (
                <Link to="/create-hackathon">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    Create Your First Hackathon
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {role === "admin"
                ? hackathons.map((registration) => {
                    const status = getEventStatus(
                      registration.startDate,
                      registration.endDate
                    );

                    return (
                      <div
                        key={registration._id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-100 group"
                      >
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        <div className="p-6">
                          <div
                            className="flex justify-between items-start mb-4 cursor-pointer"
                            onClick={() => handleCardClick(registration._id)}
                          >
                            <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">
                              {registration.title || registration.name || "Untitled Hackathon"}
                            </h3>
                            <span
                              className={`flex items-center text-xs font-medium px-3 py-1 rounded-full ${status.color}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </div>

                          <div
                            className="space-y-3 mb-6 cursor-pointer"
                            onClick={() => handleCardClick(registration._id)}
                          >
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarRange className="w-4 h-4 mr-2 text-indigo-500" />
                              <span className="font-medium">{formatDate(registration.startDate)} - {formatDate(registration.endDate)}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                              <span>{registration.eventType}</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex flex-wrap gap-3 items-center justify-between">
                              <button
                                onClick={() => openModal("create", registration)}
                                className="bg-gradient-to-r from-purple-300 to-indigo-400 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow flex items-center"
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Create Teams
                              </button>

                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleCSVUploadClick(registration._id)}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-all duration-300"
                                  title="Upload Participants"
                                >
                                  <UserPlus className="w-5 h-5" />
                                </button>

                                <button
                                  onClick={() => handleViewParticipants(registration._id)}
                                  className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-all duration-300"
                                  title="View Participants"
                                >
                                  <Users className="w-5 h-5" />
                                </button>

                                <button
                                  onClick={() => handleViewTeams(registration)}
                                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-all duration-300"
                                  title="View Teams"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>

                                <Link to={`/edithackathon/${registration._id}`}>
                                  <button 
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-all duration-300"
                                    title="Edit Hackathon"
                                  >
                                    <Pencil className="w-5 h-5" />
                                  </button>
                                </Link>

                                <button
                                  onClick={() => openModal("delete", registration)}
                                  className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-all duration-300"
                                  title="Delete Hackathon"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>

                                <div
                                  className="bg-indigo-100 hover:bg-indigo-200 p-2 rounded-lg cursor-pointer transition-all duration-300"
                                  onClick={() => handleCardClick(registration._id)}
                                  title="View Details"
                                >
                                  <ArrowRight className="w-5 h-5 text-indigo-600" />
                                </div>
                              </div>

                              {/* Reusable Confirmation Modal */}
                              <ConfirmationModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                onConfirm={modalConfig.onConfirm}
                                title={modalConfig.title}
                                message={modalConfig.message}
                              />
                              
                              {/* Participants Display */}
                              {showParticipants === registration._id && participants[registration._id] && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t">
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-semibold text-gray-700">
                                      Participants ({participants[registration._id].length})
                                    </h4>
                                    <button
                                      onClick={() => setShowParticipants(null)}
                                      className="text-xs text-gray-500 hover:text-gray-700 bg-white px-2 py-1 rounded border"
                                    >
                                      Hide
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                    {participants[registration._id].map((participant, index) => (
                                      <div key={participant._id} className="flex items-center space-x-2 text-sm bg-white p-2 rounded border">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="font-medium">{participant.name}</span>
                                        <span className="text-gray-500 text-xs">({participant.role})</span>
                                        {participant.teamId && (
                                          <span className="text-blue-600 text-xs bg-blue-100 px-1 rounded">Team</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                : hackathons.map((registration) => {
                    const status = getEventStatus(
                      registration.hackathonId.startDate,
                      registration.hackathonId.endDate
                    );

                    return (
                      <div
                        key={registration._id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-100 group"
                        onClick={() => handleCardClick(registration?.hackathonId?._id)}
                      >
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">
                              {registration?.hackathonId?.name}
                            </h3>
                            <span
                              className={`flex items-center text-xs font-medium px-3 py-1 rounded-full ${status.color}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </div>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarRange className="w-4 h-4 mr-2 text-indigo-500" />
                              <span className="font-medium">
                                {formatDate(registration?.hackathonId?.startDate)} - {formatDate(registration?.hackathonId?.endDate)}
                              </span>
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                              <span>{registration?.hackathonId?.eventType}</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <div className="bg-indigo-50 px-4 py-3 rounded-lg">
                                <p className="text-md font-semibold text-indigo-900">
                                  {registration.teamId?.teamName || "No Team"}
                                </p>
                                <p className="text-xs text-indigo-600 mt-1">
                                  Role: <span className="font-medium">{registration?.role}</span>
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewTeams(registration.hackathonId);
                                  }}
                                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-all duration-300"
                                  title="View Teams"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <div className="bg-indigo-100 hover:bg-indigo-200 p-3 rounded-lg transition-all duration-300">
                                  <ArrowRight className="w-5 h-5 text-indigo-600" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          )}
        </div>
        {/* Teams Display Modal */}
        {teamsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Teams Overview</h2>
                    <p className="text-purple-100 mt-1">
                      {selectedHackathonForTeams?.title} - {teamsData.length} Teams
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={copyAllTeamsToClipboard}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
                      title="Copy all teams to clipboard"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </button>
                    <button
                      onClick={() => setTeamsModalOpen(false)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all duration-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {teamsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
                  </div>
                ) : teamsData.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Teams Found</h3>
                    <p className="text-gray-600">Teams haven't been created for this hackathon yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {teamsData.map((team, index) => (
                      <div key={team._id} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                        {/* Team Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">{team.teamName}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                {team.teamMembers.length}/{team.memberLimit} members
                              </span>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                {team.status || 'active'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => copyTeamToClipboard(team)}
                            className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-all duration-300"
                            title="Copy team to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Team Members */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Members</h4>
                          <div className="space-y-2">
                            {team.teamMembers.map((member, memberIndex) => (
                              <div key={member._id || memberIndex} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{member.name}</p>
                                  <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                </div>
                                {member.email && (
                                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                    {member.email}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Team Footer */}
                        {team.description && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-600 italic">"{team.description}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <CSVUploadModal
          isOpen={csvModalOpen}
          onClose={() => setCsvModalOpen(false)}
          hackathonId={selectedHackathonId}
          baseURL={baseURL}
        />
      </div>
    )
  );
};

export default EligibleHackathons;
