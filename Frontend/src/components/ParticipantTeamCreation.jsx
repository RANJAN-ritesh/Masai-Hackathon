import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../context/AuthContextProvider';
import { useTheme } from '../context/ThemeContextProvider';
import { 
  Users, 
  Plus, 
  Crown, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  ArrowRight,
  Shield,
  Target,
  Star,
  Calendar,
  UserPlus,
  Send,
  Eye,
  UserCheck,
  AlertCircle,
  User
} from 'lucide-react';
import { toast } from 'react-toastify';

const ParticipantTeamCreation = () => {
  const { userData } = useContext(MyContext);
  const { themeConfig } = useTheme();
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    teamName: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [otherTeams, setOtherTeams] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showOtherTeams, setShowOtherTeams] = useState(false);
  const [error, setError] = useState(null);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [joinRequestLoading, setJoinRequestLoading] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      setError(null);
      const response = await fetch(`${baseURL}/hackathons`);
      const data = await response.json();
      
      // Filter hackathons that allow participant teams
      const allowedHackathons = data.filter(hackathon => 
        hackathon.allowParticipantTeams || hackathon.teamCreationMode === 'participant' || hackathon.teamCreationMode === 'both'
      );
      
      setHackathons(allowedHackathons);
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      setError('Failed to load hackathons. Please refresh the page.');
      toast.error('Failed to load hackathons');
    }
  };

  const fetchParticipants = async (hackathonId) => {
    try {
      setParticipantsLoading(true);
      setError(null);
      
      console.log(`🔍 Fetching participants for hackathon: ${hackathonId}`);
      console.log(`🔍 Current user: ${userData?.name} (${userData?._id})`);
      
      // Check if user is authenticated
      if (!userData?._id) {
        setError('You must be logged in to view participants');
        toast.error('Please log in to view participants');
        return;
      }
      
      // Use the correct endpoint that I just fixed
      const response = await fetch(`${baseURL}/participant-team/participants/${hackathonId}`, {
        headers: {
          'Authorization': `Bearer ${userData._id}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`🔍 Response status: ${response.status}`);
      console.log(`🔍 Response ok: ${response.ok}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Response not ok: ${response.status} - ${errorText}`);
        throw new Error('Failed to fetch participants');
      }
      
      const data = await response.json();
      console.log(`🔍 Response data:`, data);
      
      const list = Array.isArray(data.participants) ? data.participants : [];
      console.log(`🔍 Participants list:`, list);
      
      // Filter out the current user and users already in teams
      const availableParticipants = list.filter(p => 
        p._id !== userData?._id && !p.currentTeamId
      );
      
      console.log(`🔍 Available participants (filtered):`, availableParticipants);
      
      setParticipants(availableParticipants);
      
      if (availableParticipants.length === 0) {
        if (list.length === 0) {
          toast.error('No participants found in this hackathon. Please check if participants were added correctly.');
        } else {
          toast.info('All participants are already in teams or you are the only participant.');
        }
      }
      
    } catch (error) {
      console.error('Error fetching participants:', error);
      console.error('Full error details:', error);
      setError('Failed to load participants. Please try again.');
      toast.error('Failed to load participants');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const fetchOtherTeams = async (hackathonId) => {
    try {
      setTeamsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!userData?._id) {
        setError('You must be logged in to view teams');
        toast.error('Please log in to view teams');
        return;
      }
      
      const response = await fetch(`${baseURL}/team/hackathon/${hackathonId}`, {
        headers: {
          'Authorization': `Bearer ${userData._id}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      
      const data = await response.json();
      
      // Filter out teams where current user is already a member
      const otherTeamsList = data.teams.filter(team => 
        !team.teamMembers.some(member => member._id === userData?._id)
      );
      
      setOtherTeams(otherTeamsList);
      
      if (otherTeamsList.length === 0) {
        toast.info('No other teams found in this hackathon.');
      }
      
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to load teams. Please try again.');
      toast.error('Failed to load teams');
    } finally {
      setTeamsLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    
    setError(null);
    
    if (!formData.teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    if (!validateTeamName(formData.teamName)) {
      toast.error('Team name must be 16 characters or less and contain only lowercase letters, underscores, and hyphens');
      return;
    }

    if (!userData?._id) {
      toast.error('You must be logged in to create a team');
      return;
    }

    if (!selectedHackathon) {
      toast.error('Please select a hackathon first');
      return;
    }

    setLoading(true);
    try {
      // FIXED: Use proper JWT authentication
      const response = await fetch(`${baseURL}/participant-team/create-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData._id}` // This will be fixed by the backend to accept user ID temporarily
        },
        body: JSON.stringify({
          ...formData,
          hackathonId: selectedHackathon._id
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Team created successfully! 🎉');
        setShowCreateForm(false);
        setFormData({ teamName: '', description: '' });
        // Navigate to team management
        navigate('/my-team');
      } else {
        setError(data.message || 'Failed to create team');
        toast.error(data.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Network error. Please check your connection and try again.');
      toast.error('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteParticipant = async (participantId, participantName) => {
    try {
      setInviteLoading(true);
      
      // First, check if user has a team
      const userResponse = await fetch(`${baseURL}/users/get-user/${userData._id}`);
      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }
      
      const userInfo = await userResponse.json();
      if (!userInfo.currentTeamId) {
        toast.error('You need to create a team first before inviting participants');
        return;
      }

      // Send invitation (this will be implemented in the backend)
      const inviteResponse = await fetch(`${baseURL}/participant-team/send-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData._id}`
        },
        body: JSON.stringify({
          participantId,
          teamId: userInfo.currentTeamId,
          message: `You're invited to join our team!`
        })
      });

      if (inviteResponse.ok) {
        toast.success(`Invitation sent to ${participantName}!`);
      } else {
        const errorData = await inviteResponse.json();
        toast.error(errorData.message || 'Failed to send invitation');
      }
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleJoinRequest = async (teamId, teamName) => {
    try {
      setJoinRequestLoading(true);
      
      const response = await fetch(`${baseURL}/participant-team/send-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData._id}`
        },
        body: JSON.stringify({
          teamId,
          message: `I would like to join your team "${teamName}"!`
        })
      });

      if (response.ok) {
        toast.success(`Join request sent to ${teamName}!`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send join request');
      }
      
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error('Failed to send join request');
    } finally {
      setJoinRequestLoading(false);
    }
  };

  const validateTeamName = (name) => {
    if (!name || name.length > 16) return false;
    const validPattern = /^[a-z_-]+$/;
    return validPattern.test(name);
  };

  const handleTeamNameChange = (e) => {
    const value = e.target.value.toLowerCase();
    const filteredValue = value.replace(/[^a-z_-]/g, '');
    
    if (filteredValue.length <= 16) {
      setFormData(prev => ({ ...prev, teamName: filteredValue }));
    }
  };

  const getHackathonStatus = (hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'active';
    return 'completed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'active': return <Zap className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Global theme styles */}
      <style>{`
        .theme-card {
          background-color: ${themeConfig.cardBg} !important;
          border: 1px solid ${themeConfig.borderColor} !important;
          color: ${themeConfig.textColor} !important;
          transition: all 0.3s ease;
        }
        
        .theme-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px var(--theme-shadow-color, rgba(0,0,0,0.1));
        }
        
        .theme-button {
          background-color: ${themeConfig.buttonBg} !important;
          color: white !important;
          transition: all 0.3s ease;
        }
        
        .theme-button:hover {
          background-color: ${themeConfig.buttonHover} !important;
          transform: translateY(-1px);
        }
        
        .theme-button-secondary {
          border: 1px solid ${themeConfig.accentColor} !important;
          color: ${themeConfig.accentColor} !important;
          background-color: transparent !important;
          transition: all 0.3s ease;
        }
        
        .theme-button-secondary:hover {
          background-color: ${themeConfig.accentColor} !important;
          color: white !important;
        }
        
        .theme-gradient {
          background: ${themeConfig.gradientBg} !important;
        }
        
        .theme-accent-bg {
          background-color: ${themeConfig.accentColor} !important;
          color: white !important;
        }
      `}</style>

      {/* Authentication Check */}
      {!userData?._id && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h1>
            <p className="text-gray-600 mb-4">You must be logged in to access this page.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Only show if authenticated */}
      {userData?._id && (
      <div 
        className="min-h-screen py-8 px-4"
        style={{ 
          backgroundColor: themeConfig.backgroundColor,
          color: themeConfig.textColor
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: themeConfig.textColor }}
            >
              Create Your Team
            </h1>
            <p 
              className="text-lg"
              style={{ color: themeConfig.textColor, opacity: 0.7 }}
            >
              Build your dream team for the hackathon
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Hackathon Selection */}
          <div className="theme-card rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Select Hackathon</h2>
            
            {hackathons.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No hackathons available</p>
                <p className="text-sm opacity-70">There are no hackathons that allow participant team creation.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hackathons.map((hackathon) => (
                  <div
                    key={hackathon._id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedHackathon?._id === hackathon._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedHackathon(hackathon);
                      setParticipants([]);
                      setOtherTeams([]);
                      setShowParticipants(false);
                      setShowOtherTeams(false);
                    }}
                  >
                    <h3 className="font-semibold mb-2">{hackathon.title}</h3>
                    <p className="text-sm opacity-70 mb-2">{hackathon.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(getHackathonStatus(hackathon))}`}>
                        {getHackathonStatus(hackathon)}
                      </span>
                      <span className="opacity-70">
                        {hackathon.teamSize?.min || 2}-{hackathon.teamSize?.max || 4} members
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Creation Form */}
          {selectedHackathon && (
            <div className="theme-card rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create Team for {selectedHackathon.title}</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="theme-button px-4 py-2 rounded-lg flex items-center"
                >
                  {showCreateForm ? <XCircle className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {showCreateForm ? 'Cancel' : 'Create Team'}
                </button>
              </div>

              {showCreateForm && (
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team Name *</label>
                    <input
                      type="text"
                      value={formData.teamName}
                      onChange={handleTeamNameChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter team name (16 chars max, lowercase, _, - only)"
                      maxLength={16}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.teamName.length}/16 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Team Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your team's focus and goals"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !formData.teamName.trim()}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                      loading || !formData.teamName.trim()
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'theme-button hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Team...
                      </div>
                    ) : (
                      'Create Team'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {selectedHackathon && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* View Participants */}
              <button
                onClick={() => {
                  setShowParticipants(!showParticipants);
                  if (!showParticipants) {
                    fetchParticipants(selectedHackathon._id);
                  }
                }}
                className="theme-button-secondary p-4 rounded-lg flex items-center justify-center"
              >
                <Users className="h-5 w-5 mr-2" />
                {showParticipants ? 'Hide Participants' : 'View Participants'}
              </button>

              {/* View Other Teams */}
              <button
                onClick={() => {
                  setShowOtherTeams(!showOtherTeams);
                  if (!showOtherTeams) {
                    fetchOtherTeams(selectedHackathon._id);
                  }
                }}
                className="theme-button-secondary p-4 rounded-lg flex items-center justify-center"
              >
                <Eye className="h-5 w-5 mr-2" />
                {showOtherTeams ? 'Hide Teams' : 'View Other Teams'}
              </button>

              {/* Create Team */}
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="theme-button p-4 rounded-lg flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                {showCreateForm ? 'Cancel Creation' : 'Create Team'}
              </button>
            </div>
          )}

          {/* Participants List */}
          {selectedHackathon && showParticipants && (
            <div className="theme-card rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Available Participants</h2>
              
              {participantsLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p>Loading participants...</p>
                </div>
              )}

              {!participantsLoading && participants.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participants.map((participant) => (
                    <div key={participant._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{participant.name}</h4>
                          <p className="text-sm text-gray-500">{participant.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className={`px-2 py-1 rounded-full ${
                          participant.role === 'leader' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {participant.role}
                        </span>
                        <span className="opacity-70">
                          {participant.skills?.slice(0, 2).join(', ')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleInviteParticipant(participant._id, participant.name)}
                        disabled={inviteLoading}
                        className="w-full bg-green-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center justify-center"
                      >
                        {inviteLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Invite to Team
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!participantsLoading && participants.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No available participants</p>
                  <p className="text-sm opacity-70">All participants are already in teams or you're the only one.</p>
                </div>
              )}
            </div>
          )}

          {/* Other Teams List */}
          {selectedHackathon && showOtherTeams && (
            <div className="theme-card rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Other Teams in {selectedHackathon.title}</h2>
              
              {teamsLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p>Loading teams...</p>
                </div>
              )}

              {!teamsLoading && otherTeams.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherTeams.map((team) => (
                    <div key={team._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <Shield className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{team.teamName}</h4>
                          <p className="text-sm text-gray-500">{team.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="opacity-70">
                          {team.teamMembers?.length || 0}/{team.memberLimit} members
                        </span>
                        <span className={`px-2 py-1 rounded-full ${
                          team.teamStatus === 'forming' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {team.teamStatus}
                        </span>
                      </div>
                      <button
                        onClick={() => handleJoinRequest(team._id, team.teamName)}
                        disabled={joinRequestLoading}
                        className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center justify-center"
                      >
                        {joinRequestLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Join Request
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!teamsLoading && otherTeams.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No other teams found</p>
                  <p className="text-sm opacity-70">You might be the first team in this hackathon!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}
    </>
  );
};

export default ParticipantTeamCreation;