import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MyContext } from "../context/AuthContextProvider";
import { useTheme } from "../context/ThemeContextProvider";
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
  Eye,
  Crown,
  Palette,
  Code
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "./ConfirmationModal";
import CSVManagementModal from "./CSVManagementModal";
import HackathonCustomization from "./HackathonCustomization";
import { ensureCSSLoaded } from "../utils/cssLoader";


const EligibleHackathons = () => {
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const { setCurrentHackathonId, userData, role, setHackathon } = useContext(MyContext);
  const { themeConfig, applyGlobalTheme } = useTheme();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [problemStatementModalOpen, setProblemStatementModalOpen] = useState(false);
  const [selectedHackathonId, setSelectedHackathonId] = useState(null);
  const location = useLocation(); // Add this line

  // Add state for tracking hackathon count changes
  const [hackathonCount, setHackathonCount] = useState(0);
  const [previousCount, setPreviousCount] = useState(0);

  
  
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
      fetchHackathons(userData); // pass parsed data directly
    } else {
      setLoading(false); // fallback if no user is found
    }
  }, [userData]);

  // Ensure theme is properly initialized for admin dashboard
  useEffect(() => {
    // Apply default theme for admin dashboard when no hackathon exists
    if (role === 'admin' && !hackathons.length) {
      applyGlobalTheme(themeConfig, 'Inter, sans-serif');
    }
  }, [role, hackathons.length, themeConfig, applyGlobalTheme]);

  // Ensure CSS is properly loaded for admin dashboard
  useEffect(() => {
    if (role === 'admin') {
      // Run CSS loader to ensure proper styling
      ensureCSSLoaded();
    }
  }, [role]);

  // Add another useEffect to refresh hackathons when component mounts
  useEffect(() => {
    // Refresh hackathons when component mounts (useful when navigating back from create/edit)
    fetchHackathons(userData);
  }, []); // Empty dependency array means it runs once when component mounts

  // Add new useEffect to handle refresh after navigation
  useEffect(() => {
    if (location.state?.refreshHackathons) {
      fetchHackathons(userData);
      // Clear the state to prevent infinite refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state, userData]);

  // Add timestamp-based refresh to ensure fresh data - OPTIMIZED: Reduced frequency
  useEffect(() => {
    const interval = setInterval(() => {
      if (userData && userData.role === "admin") {
        fetchHackathons(userData);
      }
    }, 60000); // Refresh every 60 seconds for admins (reduced from 30s)

    return () => clearInterval(interval);
  }, [userData]);

  const handleDelete = async (id) => {
    const response = await fetch(`${baseURL}/hackathons/${id}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('userId')}`
      }
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
    // SIMPLE: Validate hackathon data
    if (!hackathon?._id) {
      toast.error('Invalid hackathon data');
      return;
    }

    const hackathonId = hackathon._id;
    console.log('🎯 Creating teams for:', hackathon.title, 'ID:', hackathonId);

    try {
      setLoading(true);
      
      // 1. Get all participants for this hackathon
      const participantsResponse = await fetch(`${baseURL}/users/hackathon/${hackathonId}/participants`);
      if (!participantsResponse.ok) {
        throw new Error('Failed to fetch hackathon participants');
      }
      
      const participantsData = await participantsResponse.json();
      const allParticipants = participantsData.participants || [];
      
      console.log('📊 Participants found:', allParticipants.length);
      
      if (allParticipants.length === 0) {
        toast.error('No participants found in this hackathon. Please add participants first.');
        return;
      }
      
      // 2. Filter to only members/leaders (no admins)
      const eligibleParticipants = allParticipants.filter(user => 
        user.role === 'member' || user.role === 'leader'
      );
      
      if (eligibleParticipants.length === 0) {
        toast.error('No eligible participants (members/leaders) found.');
        return;
      }
      
      console.log('✅ Eligible participants:', eligibleParticipants.length);
      
      // 3. Simple team creation - 4 people per team
      const teamSize = 4;
      const teams = [];
      let currentTeam = [];
      
      for (const participant of eligibleParticipants) {
        currentTeam.push(participant);
        
        if (currentTeam.length === teamSize) {
          teams.push([...currentTeam]);
          currentTeam = [];
        }
      }
      
      // Add remaining participants to last team
      if (currentTeam.length > 0) {
        teams.push(currentTeam);
      }
      
      console.log('🏗️ Creating', teams.length, 'teams');
      
      // 4. Create teams
      const createdTeams = [];
      for (let i = 0; i < teams.length; i++) {
        const teamMembers = teams[i];
        const teamLeader = teamMembers.find(p => p.role === 'leader') || teamMembers[0];
        
        const teamData = {
          teamName: `${hackathon.title} - Team ${i + 1}`,
          createdBy: teamLeader._id,
          hackathonId: hackathonId,
          memberLimit: teamSize,
          teamMembers: teamMembers.map(p => p._id),
          description: `Auto-generated team for ${hackathon.title}`
        };
        
        console.log(`Creating team ${i + 1}:`, teamData.teamName);
        
        const teamResponse = await fetch(`${baseURL}/team/create-team`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('userId')}`
          },
          body: JSON.stringify(teamData)
        });
        
        if (teamResponse.ok) {
          const newTeam = await teamResponse.json();
          createdTeams.push(newTeam);
          console.log(`✅ Team ${i + 1} created:`, newTeam.teamName);
        } else {
          const error = await teamResponse.json();
          console.error(`❌ Failed to create team ${i + 1}:`, error);
        }
      }
      
      // 5. Success message
      if (createdTeams.length > 0) {
        toast.success(`Successfully created ${createdTeams.length} teams for ${hackathon.title}!`, {
          autoClose: 5000
        });
        
        console.log('🎉 Team creation complete:', createdTeams.length, 'teams created');
      } else {
        toast.error('Failed to create any teams. Please check the console for errors.');
      }
       
    } catch (error) {
      console.error('Error creating teams:', error);
      toast.error('Failed to create teams. Please try again.');
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
    
    // Find the hackathon data and set it in context
    const selectedHackathon = hackathons.find(h => h._id === hackathonId);
    if (selectedHackathon) {
      // Update the context with the selected hackathon
      setHackathon(selectedHackathon);
      console.log("🔍 Setting hackathon in context:", selectedHackathon);
    }
    
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



  // View teams for a hackathon
  const handleViewTeams = async (hackathon) => {
    setSelectedHackathonForTeams(hackathon);
    setTeamsModalOpen(true);
    setTeamsLoading(true);
    
    // Add loading timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      setTeamsLoading(false);
      toast.warning("Team loading timed out. Please check your connection and try again.", {
        autoClose: 6000
      });
    }, 15000); // 15 second timeout
    
    try {
      const teamEndpoint = `${baseURL}/team/hackathon/${hackathon._id}`;
      
      // Add AbortController for better request management
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 12000);
      
      const response = await fetch(teamEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: abortController.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        const teams = data.teams || [];
        setTeamsData(teams);
        
        if (teams.length === 0) {
          toast.info(`No teams found for "${hackathon.title}". Create teams first!`, {
            autoClose: 5000
          });
        } else {
          toast.success(`Loaded ${teams.length} team${teams.length !== 1 ? 's' : ''} for ${hackathon.title}`, {
            autoClose: 3000
          });
        }
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: `HTTP ${response.status} - ${response.statusText}` };
        }
        
        console.error(`Failed to fetch teams: ${response.status}`, errorData);
        toast.error(`Failed to fetch teams: ${errorData.message || `HTTP ${response.status}`}`, {
          autoClose: 5000
        });
        setTeamsData([]);
      }
    } catch (error) {
      console.error("Network error fetching teams:", error);
      
      if (error.name === 'AbortError') {
        toast.error("Request timed out. Please try again.", {
          autoClose: 5000
        });
      } else {
        toast.error(`Network error: ${error.message}`, {
          autoClose: 5000
        });
      }
      setTeamsData([]);
    } finally {
      clearTimeout(loadingTimeout);
      setTeamsLoading(false);
    }
  };

  // Copy team to clipboard in CSV format
  const copyTeamToClipboard = (team) => {
    // CSV header
    const csvHeader = "First Name\tLast Name\tEmail\tCourse\tSkills\tVertical\tPhone\tRole\n";
    
    // Process team leader first
    const leader = team.createdBy;
    let csvContent = csvHeader;
    
    if (leader) {
      const [firstName = "", lastName = ""] = leader.name ? leader.name.split(' ') : ["Unknown", "User"];
      csvContent += `${firstName}\t${lastName}\t${leader.email || "N/A"}\t${leader.course || "N/A"}\t${leader.skills ? leader.skills.join(", ") : "N/A"}\t${leader.vertical || "N/A"}\t${leader.phoneNumber || "N/A"}\tleader\n`;
    }
    
    // Process team members
    team.teamMembers.forEach(member => {
      // Skip if this member is already the leader
      if (member._id !== team.createdBy?._id) {
        const [firstName = "", lastName = ""] = member.name ? member.name.split(' ') : ["Unknown", "User"];
        csvContent += `${firstName}\t${lastName}\t${member.email || "N/A"}\t${member.course || "N/A"}\t${member.skills ? member.skills.join(", ") : "N/A"}\t${member.vertical || "N/A"}\t${member.phoneNumber || "N/A"}\tmember\n`;
      }
    });
    
    navigator.clipboard.writeText(csvContent).then(() => {
      toast.success(`${team.teamName} copied to clipboard in CSV format!`);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy team data');
    });
  };

  // Copy all teams to clipboard in CSV format
  const copyAllTeamsToClipboard = () => {
    const csvHeader = "Team Name\tFirst Name\tLast Name\tEmail\tCourse\tSkills\tVertical\tPhone\tRole\n";
    let csvContent = csvHeader;
    
    teamsData.forEach(team => {
      const teamName = team.teamName;
      
      // Add team leader first
      const leader = team.createdBy;
      if (leader) {
        const [firstName = "", lastName = ""] = leader.name ? leader.name.split(' ') : ["Unknown", "User"];
        csvContent += `${teamName}\t${firstName}\t${lastName}\t${leader.email || "N/A"}\t${leader.course || "N/A"}\t${leader.skills ? leader.skills.join(", ") : "N/A"}\t${leader.vertical || "N/A"}\t${leader.phoneNumber || "N/A"}\tleader\n`;
      }
      
      // Add team members
      team.teamMembers.forEach(member => {
        // Skip if this member is already the leader
        if (member._id !== team.createdBy?._id) {
          const [firstName = "", lastName = ""] = member.name ? member.name.split(' ') : ["Unknown", "User"];
          csvContent += `${teamName}\t${firstName}\t${lastName}\t${member.email || "N/A"}\t${member.course || "N/A"}\t${member.skills ? member.skills.join(", ") : "N/A"}\t${member.vertical || "N/A"}\t${member.phoneNumber || "N/A"}\tmember\n`;
        }
      });
    });
    
    navigator.clipboard.writeText(csvContent).then(() => {
      toast.success(`All ${teamsData.length} teams copied to clipboard in CSV format!`);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy all teams data');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {hackathons && (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header with background effect */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-indigo-600 opacity-5 rounded-xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start p-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Eligible Hackathons</h1>
                <p className="text-gray-600">
                  {loading ? "Loading..." : `Found ${hackathonCount} hackathon${hackathonCount !== 1 ? 's' : ''}`}
                </p>
              </div>
              {role === "admin" && (
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  <button 
                    onClick={handleRefresh} 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center shadow-md" 
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
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center shadow-md">
                      <Sparkles className="w-5 h-5 mr-2" />Create New Hackathon
                    </button>
                  </Link>
                  <Link to="/users-list">
                    <button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center shadow-md">
                      <Users className="w-5 h-5 mr-2" />All Users
                    </button>
                  </Link>
                </div>
              )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {role === "admin"
                ? hackathons.map((registration) => {
                    const status = getEventStatus(
                      registration.startDate,
                      registration.endDate
                    );

                    return (
                      <div
                        key={registration._id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-100 group flex flex-col h-full"
                      >
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        <div className="p-6 flex flex-col flex-grow">
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
                            className="space-y-3 mb-6 cursor-pointer flex-grow"
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

                          <div className="pt-4 border-t border-gray-100 mt-auto">
                            <div className="flex flex-wrap gap-3 items-center justify-between">
                              {/* Only show Create Teams button for admin-based team selection */}
                              {registration.teamCreationMode === 'admin' && (
                                <button
                                  onClick={() => openModal("create", registration)}
                                  className="bg-gradient-to-r from-purple-300 to-indigo-400 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow flex items-center"
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  Create Teams
                                </button>
                              )}
                              
                              {/* Show message for participant-based team selection */}
                              {registration.teamCreationMode === 'participant' && (
                                <div className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
                                  <span className="text-blue-700 text-sm font-medium">
                                    <Users className="w-4 h-4 mr-2 inline" />
                                    Participant Team Selection
                                  </span>
                                </div>
                              )}

                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleCSVUploadClick(registration._id)}
                                  className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white p-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow"
                                  title="Manage Participants"
                                >
                                  <Users className="w-5 h-5" />
                                </button>

                                <button
                                  onClick={() => handleViewTeams(registration)}
                                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-all duration-300"
                                  title="View Teams"
                                >
                                  <Eye className="w-5 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedHackathonId(registration._id);
                                    setProblemStatementModalOpen(true);
                                  }}
                                  className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white p-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow"
                                  title="Manage Problem Statements"
                                >
                                  <Code className="w-5 h-5" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedHackathonId(registration._id);
                                    setCustomizationModalOpen(true);
                                  }}
                                  className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white p-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow"
                                  title="Customize Theme"
                                >
                                  <Palette className="w-5 h-5" />
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
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-100 group flex flex-col h-full"
                        onClick={() => handleCardClick(registration?.hackathonId?._id)}
                      >
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        <div className="p-6 flex flex-col flex-grow">
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

                          <div className="space-y-3 mb-6 flex-grow">
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

                          <div className="pt-4 border-t border-gray-100 mt-auto">
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
                                  className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg transition-all duration-300 flex items-center"
                                  title="View Teams"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  <span className="text-sm font-medium">Teams</span>
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
      )}
        {/* Teams Display Modal */}
        {teamsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center">
                      <Users className="w-6 h-6 mr-3" />
                      Teams Overview
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {selectedHackathonForTeams?.title} - {teamsData.length} Teams Created
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={copyAllTeamsToClipboard}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center border-2 border-green-400 hover:border-green-300 shadow-xl"
                      title="Copy all teams to clipboard in CSV format"
                    >
                      <Copy className="w-4 h-4 mr-2 stroke-2" />
                      Export All CSV
                    </button>
                    <button
                      onClick={() => setTeamsModalOpen(false)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-300 border-2 border-red-400 hover:border-red-300 shadow-xl"
                      title="Close Teams Overview"
                    >
                      <X className="w-5 h-5 stroke-2" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-50">
                {teamsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <span className="text-gray-600 font-medium mb-2">Loading teams...</span>
                    <span className="text-sm text-gray-500 text-center max-w-md">
                      Fetching team information for {selectedHackathonForTeams?.title || 'this hackathon'}
                    </span>
                    <div className="mt-4 text-xs text-gray-400">
                      This may take a few seconds
                    </div>
                  </div>
                ) : teamsData.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Teams Found</h3>
                    <p className="text-gray-500 mb-4">Create teams first to see them here.</p>
                    <button
                      onClick={() => handleViewTeams(selectedHackathonForTeams)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      🔄 Refresh Teams
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {teamsData.map((team, index) => (
                      <div key={team._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        {/* Team Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b border-gray-200 rounded-t-xl">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800 mb-1">{team.teamName}</h3>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded border">
                                  {team.teamMembers.length} members
                                </span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                  {team.status || 'Active'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => copyTeamToClipboard(team)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-all duration-300 flex items-center text-sm font-bold shadow-lg border-2 border-emerald-500 hover:border-emerald-400 hover:shadow-xl"
                              title="Copy team to clipboard in CSV format"
                            >
                              <Copy className="w-4 h-4 mr-1 stroke-[2.5]" />
                              CSV
                            </button>
                          </div>
                        </div>
                        
                        {/* Team Content */}
                        <div className="p-4 space-y-4">
                          {/* Team Leader Section */}
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3 flex items-center">
                              <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                              Team Leader
                            </h4>
                            {team.createdBy ? (
                              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {team.createdBy.name?.charAt(0)?.toUpperCase() || 'L'}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-800">{team.createdBy.name}</p>
                                    <p className="text-xs text-orange-600 font-medium">Team Leader</p>
                                    {team.createdBy.email && (
                                      <p className="text-xs text-gray-500 mt-1">{team.createdBy.email}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">No leader assigned</p>
                            )}
                          </div>
                          
                          {/* Team Members Section */}
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3 flex items-center">
                              <Users className="w-4 h-4 mr-2 text-blue-500" />
                              Team Members ({team.teamMembers.length})
                            </h4>
                            <div className="space-y-2">
                              {team.teamMembers.length > 0 ? (
                                team.teamMembers.map((member, memberIndex) => (
                                  <div key={member._id || memberIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-800">{member.name}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <span className="text-xs text-gray-500 capitalize bg-white px-2 py-1 rounded border">
                                            {member.role || 'member'}
                                          </span>
                                          {member.email && (
                                            <span className="text-xs text-gray-400">
                                              {member.email}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {/* Leader indicator */}
                                      {member._id === team.createdBy?._id && (
                                        <Crown className="w-4 h-4 text-yellow-500" title="Team Leader" />
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 italic text-center py-4">No members in this team</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Team Description */}
                          {team.description && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg border">
                                "{team.description}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CSV Management Modal */}
        <CSVManagementModal
          isOpen={csvModalOpen}
          onClose={() => setCsvModalOpen(false)}
          hackathonId={selectedHackathonId}
        />

        {/* Problem Statement Management Modal - Temporarily removed */}

        {/* Hackathon Customization Modal */}
        <HackathonCustomization
          isOpen={customizationModalOpen}
          onClose={() => setCustomizationModalOpen(false)}
          hackathonId={selectedHackathonId}
          currentTheme={hackathons.find((h) => h._id === selectedHackathonId)?.theme}
          currentFont={hackathons.find((h) => h._id === selectedHackathonId)?.fontFamily}
        />
      </div>
    );
  };

export default EligibleHackathons;
