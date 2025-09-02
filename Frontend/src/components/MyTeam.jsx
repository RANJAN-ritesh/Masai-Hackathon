import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../context/AuthContextProvider';
import { useTheme } from '../context/ThemeContextProvider';
import { 
  Users, 
  Search, 
  UserPlus, 
  Crown, 
  MessageSquare,
  Eye,
  Plus,
  Send,
  Check,
  X,
  Clock,
  Mail
} from 'lucide-react';
import { toast } from 'react-toastify';

const MyTeam = () => {
  const { hackathon, role } = useContext(MyContext);
  const { themeConfig } = useTheme();
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
  const userId = localStorage.getItem("userId");

  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTeam, setCurrentTeam] = useState(null);
  const [hackathonParticipants, setHackathonParticipants] = useState([]);
  const [hackathonTeams, setHackathonTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamCreationData, setTeamCreationData] = useState({
    teamName: '',
    description: ''
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);

  // Check team creation mode
  const isParticipantTeamMode = hackathon?.allowParticipantTeams && hackathon?.teamCreationMode === 'participant';
  const isAdminTeamMode = !hackathon?.allowParticipantTeams && hackathon?.teamCreationMode === 'admin';

  useEffect(() => {
    if (hackathon && userId) {
      loadData();
    }
  }, [hackathon, userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCurrentTeam(),
        loadHackathonParticipants(),
        loadHackathonTeams(),
        loadTeamRequests()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentTeam = async () => {
    try {
      const response = await fetch(`${baseURL}/team/hackathon/${hackathon._id}`, {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userTeam = data.teams?.find(team => 
          team.teamMembers.some(member => member._id === userId) ||
          team.createdBy?._id === userId
        );
        setCurrentTeam(userTeam || null);
      }
    } catch (error) {
      console.error('Error loading current team:', error);
    }
  };

  const loadHackathonParticipants = async () => {
    try {
      const response = await fetch(`${baseURL}/participant-team/participants/${hackathon._id}`, {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHackathonParticipants(data.participants || []);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const loadHackathonTeams = async () => {
    try {
      const response = await fetch(`${baseURL}/team/hackathon/${hackathon._id}`, {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHackathonTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadTeamRequests = async () => {
    try {
      const response = await fetch(`${baseURL}/participant-team/requests`, {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeamRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error loading team requests:', error);
    }
  };

  const createTeam = async () => {
    if (!teamCreationData.teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/participant-team/create-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({
          teamName: teamCreationData.teamName,
          description: teamCreationData.description,
          hackathonId: hackathon._id
        })
      });

      if (response.ok) {
        toast.success('Team created successfully!');
        setTeamCreationData({ teamName: '', description: '' });
        await loadData();
        setActiveTab('overview');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  const sendJoinRequest = async (teamId) => {
    try {
      const response = await fetch(`${baseURL}/participant-team/send-join-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({
          teamId,
          message: 'I would like to join your team!'
        })
      });

      if (response.ok) {
        toast.success('Join request sent successfully!');
        await loadTeamRequests();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send join request');
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      toast.error('Failed to send join request');
    }
  };

  const sendInvitation = async (participantId) => {
    if (!currentTeam) {
      toast.error('You need to be in a team to send invitations');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/participant-team/send-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({
          participantId,
          teamId: currentTeam._id,
          message: 'You are invited to join our team!'
        })
      });

      if (response.ok) {
        toast.success('Invitation sent successfully!');
        setSelectedMembers(prev => prev.filter(id => id !== participantId));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const respondToRequest = async (requestId, response, responseMessage = '') => {
    try {
      const res = await fetch(`${baseURL}/participant-team/respond-request/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({
          response,
          message: responseMessage
        })
      });

      if (res.ok) {
        toast.success(`Request ${response} successfully!`);
        await loadData();
      } else {
        const error = await res.json();
        toast.error(error.message || `Failed to ${response} request`);
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error(`Failed to ${response} request`);
    }
  };

  const filteredParticipants = hackathonParticipants.filter(participant => 
    participant._id !== userId &&
    !participant.currentTeamId &&
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableTeams = hackathonTeams.filter(team => 
    team.teamMembers.length < team.memberLimit &&
    !team.teamMembers.some(member => member._id === userId) &&
    team.createdBy?._id !== userId
  );

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: themeConfig.backgroundColor }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
               style={{ borderColor: themeConfig.accentColor }}></div>
          <p style={{ color: themeConfig.textColor }}>Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8"
      style={{ backgroundColor: themeConfig.backgroundColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: themeConfig.textColor }}
          >
            My Team
          </h1>
          <p 
            className="text-lg"
            style={{ color: themeConfig.textColor, opacity: 0.7 }}
          >
            {hackathon?.title || 'Hackathon'} - {isParticipantTeamMode ? 'Participant' : 'Admin'} Team Mode
          </p>
        </div>

        {/* Admin Team Mode */}
        {isAdminTeamMode && currentTeam && (
          <div 
            className="rounded-lg shadow-lg p-6 mb-8"
            style={{ 
              backgroundColor: themeConfig.cardBg,
              border: `1px solid ${themeConfig.borderColor}`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="text-2xl font-semibold flex items-center gap-2"
                style={{ color: themeConfig.textColor }}
              >
                <Crown className="w-6 h-6" style={{ color: themeConfig.accentColor }} />
                {currentTeam.teamName}
              </h2>
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: themeConfig.accentColor + '20',
                  color: themeConfig.accentColor 
                }}
              >
                {currentTeam.teamMembers.length}/{currentTeam.memberLimit} Members
              </span>
            </div>

            {/* Team Members */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {currentTeam.teamMembers.map((member, index) => (
                <div 
                  key={member._id}
                  className="flex items-center p-3 rounded-lg"
                  style={{ backgroundColor: themeConfig.backgroundColor }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mr-3"
                    style={{ backgroundColor: themeConfig.accentColor, color: 'white' }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: themeConfig.textColor }}>
                      {member.name}
                      {currentTeam.teamLeader?._id === member._id && (
                        <Crown className="w-4 h-4 inline ml-1" style={{ color: themeConfig.accentColor }} />
                      )}
                    </p>
                    <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                      {member.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Leader Actions */}
            {currentTeam.teamLeader?._id === userId && (
              <div 
                className="p-4 rounded-lg"
                style={{ backgroundColor: themeConfig.accentColor + '10' }}
              >
                <h3 className="font-semibold mb-2" style={{ color: themeConfig.textColor }}>
                  Team Leader Actions
                </h3>
                <button
                  className="px-4 py-2 rounded-lg transition"
                  style={{ 
                    backgroundColor: themeConfig.accentColor,
                    color: 'white'
                  }}
                >
                  Start Problem Statement Poll
                </button>
              </div>
            )}
          </div>
        )}

        {/* Admin Team Mode - No Team */}
        {isAdminTeamMode && !currentTeam && (
          <div 
            className="text-center py-12 rounded-lg"
            style={{ 
              backgroundColor: themeConfig.cardBg,
              border: `1px solid ${themeConfig.borderColor}`
            }}
          >
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: themeConfig.textColor, opacity: 0.5 }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: themeConfig.textColor }}>
              No Team Assigned
            </h3>
            <p style={{ color: themeConfig.textColor, opacity: 0.7 }}>
              You haven't been assigned to a team yet. Please contact the admin.
            </p>
          </div>
        )}

        {/* Participant Team Mode */}
        {isParticipantTeamMode && (
          <>
            {/* Navigation Tabs */}
            <div className="mb-6">
              <div className="flex space-x-1 rounded-lg p-1" style={{ backgroundColor: themeConfig.cardBg }}>
                {[
                  { id: 'overview', label: 'Overview', icon: Users },
                  { id: 'search', label: 'Search Members', icon: Search },
                  { id: 'members', label: 'Show Members', icon: Eye },
                  { id: 'join', label: 'Join Team', icon: UserPlus },
                  { id: 'create', label: 'Create Team', icon: Plus }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                        activeTab === tab.id ? 'shadow-sm' : ''
                      }`}
                      style={{
                        backgroundColor: activeTab === tab.id ? themeConfig.accentColor : 'transparent',
                        color: activeTab === tab.id ? 'white' : themeConfig.textColor
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div 
              className="rounded-lg shadow-lg p-6"
              style={{ 
                backgroundColor: themeConfig.cardBg,
                border: `1px solid ${themeConfig.borderColor}`
              }}
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  {currentTeam ? (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 
                          className="text-2xl font-semibold flex items-center gap-2"
                          style={{ color: themeConfig.textColor }}
                        >
                          <Crown className="w-6 h-6" style={{ color: themeConfig.accentColor }} />
                          {currentTeam.teamName}
                        </h2>
                        <span 
                          className="px-3 py-1 rounded-full text-sm"
                          style={{ 
                            backgroundColor: themeConfig.accentColor + '20',
                            color: themeConfig.accentColor 
                          }}
                        >
                          {currentTeam.teamMembers.length}/{currentTeam.memberLimit} Members
                        </span>
                      </div>

                      {/* Team Members */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {currentTeam.teamMembers.map((member) => (
                          <div 
                            key={member._id}
                            className="flex items-center p-3 rounded-lg"
                            style={{ backgroundColor: themeConfig.backgroundColor }}
                          >
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mr-3"
                              style={{ backgroundColor: themeConfig.accentColor, color: 'white' }}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: themeConfig.textColor }}>
                                {member.name}
                                {currentTeam.teamLeader?._id === member._id && (
                                  <Crown className="w-4 h-4 inline ml-1" style={{ color: themeConfig.accentColor }} />
                                )}
                              </p>
                              <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                                {member.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Leader Actions */}
                      {currentTeam.teamLeader?._id === userId && (
                        <div 
                          className="p-4 rounded-lg"
                          style={{ backgroundColor: themeConfig.accentColor + '10' }}
                        >
                          <h3 className="font-semibold mb-2" style={{ color: themeConfig.textColor }}>
                            Team Leader Actions
                          </h3>
                          <div className="flex space-x-4">
                            <button
                              className="px-4 py-2 rounded-lg transition"
                              style={{ 
                                backgroundColor: themeConfig.accentColor,
                                color: 'white'
                              }}
                            >
                              Start Problem Statement Poll
                            </button>
                            <button
                              onClick={() => setActiveTab('search')}
                              className="px-4 py-2 rounded-lg transition border"
                              style={{ 
                                borderColor: themeConfig.accentColor,
                                color: themeConfig.accentColor
                              }}
                            >
                              Invite Members
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Pending Requests */}
                      {teamRequests.filter(req => req.teamId === currentTeam._id && req.status === 'pending').length > 0 && (
                        <div className="mt-6">
                          <h3 className="font-semibold mb-4" style={{ color: themeConfig.textColor }}>
                            Pending Join Requests
                          </h3>
                          <div className="space-y-3">
                            {teamRequests
                              .filter(req => req.teamId === currentTeam._id && req.status === 'pending')
                              .map((request) => (
                                <div 
                                  key={request._id}
                                  className="flex items-center justify-between p-4 rounded-lg"
                                  style={{ backgroundColor: themeConfig.backgroundColor }}
                                >
                                  <div className="flex items-center">
                                    <div 
                                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mr-3"
                                      style={{ backgroundColor: themeConfig.accentColor, color: 'white' }}
                                    >
                                      {request.fromUserId?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                      <p className="font-medium" style={{ color: themeConfig.textColor }}>
                                        {request.fromUserId?.name || 'Unknown User'}
                                      </p>
                                      <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                                        {request.message}
                                      </p>
                                    </div>
                                  </div>
                                  {currentTeam.teamLeader?._id === userId && (
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => respondToRequest(request._id, 'accepted')}
                                        className="p-2 rounded-lg transition"
                                        style={{ backgroundColor: '#10b981', color: 'white' }}
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => respondToRequest(request._id, 'rejected')}
                                        className="p-2 rounded-lg transition"
                                        style={{ backgroundColor: '#ef4444', color: 'white' }}
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto mb-4" style={{ color: themeConfig.textColor, opacity: 0.5 }} />
                      <h3 className="text-xl font-semibold mb-2" style={{ color: themeConfig.textColor }}>
                        No Team Yet
                      </h3>
                      <p className="mb-6" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                        You can search for team members, join existing teams, or create your own team.
                      </p>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => setActiveTab('join')}
                          className="px-6 py-2 rounded-lg transition"
                          style={{ 
                            backgroundColor: themeConfig.accentColor,
                            color: 'white'
                          }}
                        >
                          Join Team
                        </button>
                        <button
                          onClick={() => setActiveTab('create')}
                          className="px-6 py-2 rounded-lg transition border"
                          style={{ 
                            borderColor: themeConfig.accentColor,
                            color: themeConfig.accentColor
                          }}
                        >
                          Create Team
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Search Members Tab */}
              {activeTab === 'search' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: themeConfig.textColor }}>
                    Search & Invite Members
                  </h3>
                  
                  {/* Search Input */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                             style={{ color: themeConfig.textColor, opacity: 0.5 }} />
                      <input
                        type="text"
                        placeholder="Search participants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: themeConfig.backgroundColor,
                          borderColor: themeConfig.borderColor,
                          color: themeConfig.textColor,
                          '--tw-ring-color': themeConfig.accentColor
                        }}
                      />
                    </div>
                  </div>

                  {/* Available Participants */}
                  <div className="space-y-3">
                    {filteredParticipants.map((participant) => (
                      <div 
                        key={participant._id}
                        className="flex items-center justify-between p-4 rounded-lg"
                        style={{ backgroundColor: themeConfig.backgroundColor }}
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mr-3"
                            style={{ backgroundColor: themeConfig.accentColor, color: 'white' }}
                          >
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: themeConfig.textColor }}>
                              {participant.name}
                            </p>
                            <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                              {participant.email} • {participant.course}
                            </p>
                          </div>
                        </div>
                        {currentTeam && currentTeam.teamLeader?._id === userId && (
                          <button
                            onClick={() => sendInvitation(participant._id)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition"
                            style={{ 
                              backgroundColor: themeConfig.accentColor,
                              color: 'white'
                            }}
                          >
                            <Send className="w-4 h-4" />
                            <span>Invite</span>
                          </button>
                        )}
                      </div>
                    ))}
                    {filteredParticipants.length === 0 && (
                      <p className="text-center py-8" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                        No available participants found.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Show Members Tab */}
              {activeTab === 'members' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: themeConfig.textColor }}>
                    All Participants
                  </h3>
                  
                  {/* Participants Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${themeConfig.borderColor}` }}>
                          <th className="text-left py-3 px-4" style={{ color: themeConfig.textColor }}>
                            Name
                          </th>
                          <th className="text-left py-3 px-4" style={{ color: themeConfig.textColor }}>
                            Email
                          </th>
                          <th className="text-left py-3 px-4" style={{ color: themeConfig.textColor }}>
                            Course
                          </th>
                          <th className="text-left py-3 px-4" style={{ color: themeConfig.textColor }}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {hackathonParticipants.map((participant) => (
                          <tr 
                            key={participant._id}
                            style={{ borderBottom: `1px solid ${themeConfig.borderColor}` }}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3"
                                  style={{ backgroundColor: themeConfig.accentColor, color: 'white' }}
                                >
                                  {participant.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ color: themeConfig.textColor }}>
                                  {participant.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4" style={{ color: themeConfig.textColor }}>
                              {participant.email}
                            </td>
                            <td className="py-3 px-4" style={{ color: themeConfig.textColor }}>
                              {participant.course}
                            </td>
                            <td className="py-3 px-4">
                              <span 
                                className="px-2 py-1 rounded-full text-xs"
                                style={{
                                  backgroundColor: participant.currentTeamId 
                                    ? '#10b981' + '20' 
                                    : themeConfig.accentColor + '20',
                                  color: participant.currentTeamId 
                                    ? '#10b981' 
                                    : themeConfig.accentColor
                                }}
                              >
                                {participant.currentTeamId ? 'In Team' : 'Available'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Join Team Tab */}
              {activeTab === 'join' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: themeConfig.textColor }}>
                    Join Existing Teams
                  </h3>
                  
                  <div className="space-y-4">
                    {availableTeams.map((team) => (
                      <div 
                        key={team._id}
                        className="p-4 rounded-lg border"
                        style={{ 
                          backgroundColor: themeConfig.backgroundColor,
                          borderColor: themeConfig.borderColor
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold" style={{ color: themeConfig.textColor }}>
                              {team.teamName}
                            </h4>
                            <p className="text-sm mb-2" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                              Created by: {team.createdBy?.name || 'Unknown'}
                            </p>
                            <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                              {team.teamMembers.length}/{team.memberLimit} members
                            </p>
                          </div>
                          <button
                            onClick={() => sendJoinRequest(team._id)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition"
                            style={{ 
                              backgroundColor: themeConfig.accentColor,
                              color: 'white'
                            }}
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Request to Join</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {availableTeams.length === 0 && (
                      <p className="text-center py-8" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                        No teams available to join.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Create Team Tab */}
              {activeTab === 'create' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: themeConfig.textColor }}>
                    Create New Team
                  </h3>
                  
                  {!currentTeam ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textColor }}>
                          Team Name *
                        </label>
                        <input
                          type="text"
                          value={teamCreationData.teamName}
                          onChange={(e) => setTeamCreationData(prev => ({
                            ...prev,
                            teamName: e.target.value
                          }))}
                          placeholder="Enter team name..."
                          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: themeConfig.backgroundColor,
                            borderColor: themeConfig.borderColor,
                            color: themeConfig.textColor,
                            '--tw-ring-color': themeConfig.accentColor
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textColor }}>
                          Description
                        </label>
                        <textarea
                          value={teamCreationData.description}
                          onChange={(e) => setTeamCreationData(prev => ({
                            ...prev,
                            description: e.target.value
                          }))}
                          placeholder="Describe your team..."
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: themeConfig.backgroundColor,
                            borderColor: themeConfig.borderColor,
                            color: themeConfig.textColor,
                            '--tw-ring-color': themeConfig.accentColor
                          }}
                        />
                      </div>

                      <button
                        onClick={createTeam}
                        disabled={!teamCreationData.teamName.trim()}
                        className="w-full py-3 rounded-lg transition disabled:opacity-50"
                        style={{ 
                          backgroundColor: themeConfig.accentColor,
                          color: 'white'
                        }}
                      >
                        Create Team
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                        You're already in a team. You can only be in one team per hackathon.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyTeam;
