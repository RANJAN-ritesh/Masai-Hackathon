import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, User, Shield, Send, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';

const ParticipantTeamCreation = () => {
  const navigate = useNavigate();
  const baseURL = 'https://masai-hackathon.onrender.com';

  // Simple state
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // Add form state back
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    teamName: '',
    description: ''
  });
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [userTeam, setUserTeam] = useState(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [joinRequests, setJoinRequests] = useState(new Set()); // Track join requests sent
  const [hackathonTeams, setHackathonTeams] = useState([]); // Teams in selected hackathon
  const [showTeams, setShowTeams] = useState(false);

  // Load user's team if they have one
  const loadUserTeam = async (hackathonId) => {
    try {
      setTeamLoading(true);
      // Check if any participant in this hackathon has a team
      const response = await fetch(`${baseURL}/users/hackathon/${hackathonId}/participants`);
      const data = await response.json();
      
      if (data.participants && Array.isArray(data.participants)) {
        // Find participants who have teams
        const participantsWithTeams = data.participants.filter(p => p.teamId && p.teamId.trim() !== '');
        if (participantsWithTeams.length > 0) {
          setUserTeam(participantsWithTeams[0]); // Show first team found
        }
      }
    } catch (error) {
      console.error('Failed to load user team:', error);
    } finally {
      setTeamLoading(false);
    }
  };

  // Simple function to create team
  const createTeam = async (teamName, description) => {
    try {
      if (!teamName.trim()) {
        toast.error('Team name is required');
        return;
      }

      if (!selectedHackathon) {
        toast.error('Please select a hackathon first');
        return;
      }

      if (!selectedParticipantId) {
        toast.error('Please select a participant to create the team for');
        return;
      }

      // Use the existing working team creation endpoint
      const response = await fetch(`${baseURL}/team/create-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('userId')}`
        },
        body: JSON.stringify({
          teamName: teamName.trim(),
          description: description.trim(),
          hackathonId: selectedHackathon._id,
          createdBy: selectedParticipantId // Use selected participant ID
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Team created successfully! 🎉');
        setFormData({ teamName: '', description: '' });
        setShowCreateForm(false);
        setSelectedParticipantId('');
        // Reload user team data instead of full page refresh
        await loadUserTeam(selectedHackathon._id);
        toast.info('Your team has been created! Check the "Your Team" section below.');
      } else {
        toast.error(data.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Failed to create team:', error);
      toast.error('Failed to create team');
    }
  };

  // Load hackathons on mount
  useEffect(() => {
    loadHackathons();
  }, []);

  // Load user team when hackathon is selected
  useEffect(() => {
    if (selectedHackathon) {
      loadUserTeam(selectedHackathon._id);
    }
  }, [selectedHackathon]);

  // Refresh team data periodically
  useEffect(() => {
    if (selectedHackathon && userTeam) {
      const interval = setInterval(() => {
        loadUserTeam(selectedHackathon._id);
      }, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [selectedHackathon, userTeam]);

  // Function to invite participants to team
  const inviteParticipant = async (participantId, participantName) => {
    try {
      if (!userTeam) {
        toast.error('You need to create a team first before inviting participants');
        return;
      }

      if (!selectedHackathon) {
        toast.error('Please select a hackathon first');
        return;
      }

      // Get user ID from localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error('User authentication required');
        return;
      }

      console.log(`Sending invitation to ${participantName} (${participantId}) for team in hackathon ${selectedHackathon._id}`);

      const response = await fetch(`${baseURL}/participant-team/send-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}` // Using userId as token temporarily
        },
        body: JSON.stringify({
          participantId,
          teamId: userTeam.teamId,
          message: `You are invited to join our team for the ${selectedHackathon.title} hackathon!`
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Invitation sent to ${participantName}! 🎉`);
        console.log('Invitation sent successfully:', data);

        // Refresh participants list to show updated status
        await loadParticipants(selectedHackathon._id);
      } else {
        toast.error(data.message || 'Failed to send invitation');
        console.error('Failed to send invitation:', data);
      }
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast.error('Failed to send invitation. Please try again.');
    }
  };

  // Function to send join request to a team
  const sendJoinRequest = async (teamId, teamName) => {
    try {
      if (!selectedHackathon) {
        toast.error('Please select a hackathon first');
        return;
      }

      if (userTeam) {
        toast.error('You are already in a team');
        return;
      }

      // Get user ID from localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error('User authentication required');
        return;
      }

      console.log(`Sending join request to team ${teamName} (${teamId})`);

      const response = await fetch(`${baseURL}/participant-team/send-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({
          teamId,
          message: `I would like to join your team for the ${selectedHackathon.title} hackathon!`
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Join request sent to ${teamName}! 🎉`);
        console.log('Join request sent successfully:', data);

        // Mark this team as having a pending request
        setJoinRequests(prev => new Set(prev).add(teamId));
      } else {
        toast.error(data.message || 'Failed to send join request');
        console.error('Failed to send join request:', data);
      }
    } catch (error) {
      console.error('Failed to send join request:', error);
      toast.error('Failed to send join request. Please try again.');
    }
  };

  // Simple function to load hackathons
  const loadHackathons = async () => {
    try {
      const response = await fetch(`${baseURL}/hackathons`);
      const data = await response.json();
      
      // Filter hackathons that allow participant teams
      const allowedHackathons = data.filter(h => 
        h.allowParticipantTeams || h.teamCreationMode === 'participant' || h.teamCreationMode === 'both'
      );
      
      setHackathons(allowedHackathons);
      console.log('Loaded hackathons:', allowedHackathons.length);
    } catch (error) {
      console.error('Failed to load hackathons:', error);
      toast.error('Failed to load hackathons');
    }
  };

  // Function to load teams for the selected hackathon
  const loadHackathonTeams = async (hackathonId) => {
    try {
      console.log('Loading teams for hackathon:', hackathonId);
      const response = await fetch(`${baseURL}/team/hackathon/${hackathonId}`);
      const data = await response.json();

      if (response.ok && data.teams) {
        setHackathonTeams(data.teams);
        console.log('Loaded teams:', data.teams.length);
      } else {
        setHackathonTeams([]);
        console.log('No teams found or error loading teams');
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
      setHackathonTeams([]);
    }
  };

  // Simple function to load participants
  const loadParticipants = async (hackathonId) => {
    try {
      setLoading(true);
      console.log('Loading participants for hackathon:', hackathonId);
      
      // Use the existing working endpoint
      const response = await fetch(`${baseURL}/users/hackathon/${hackathonId}/participants`);
      const data = await response.json();
      
      if (data.participants && Array.isArray(data.participants)) {
        setParticipants(data.participants);
        toast.success(`Found ${data.participants.length} participants in ${data.hackathonTitle}`);
        console.log('Participants loaded:', data.participants);
      } else if (data.message && !data.participants) {
        toast.info(data.message);
        setParticipants([]);
      } else {
        toast.error('Failed to load participants');
        setParticipants([]);
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
      toast.error('Failed to load participants');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Team</h1>
          <p className="text-lg text-gray-600">Build your dream team for the hackathon</p>
        </div>

        {/* Hackathon Selection */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Select Hackathon</h2>
          
          {hackathons.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-2">No hackathons available</p>
              <p className="text-sm text-gray-500">There are no hackathons that allow participant team creation.</p>
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
                    setShowParticipants(false);
                  }}
                >
                  <h3 className="font-semibold mb-2">{hackathon.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{hackathon.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                      {hackathon.status || 'active'}
                    </span>
                    <span className="text-gray-500">
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
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create Team for {selectedHackathon.title}</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                {showCreateForm ? 'Cancel' : 'Create Team'}
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={(e) => { e.preventDefault(); createTeam(formData.teamName, formData.description); }} className="space-y-4">
                {/* Participant Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select Participant *</label>
                  <select
                    value={selectedParticipantId}
                    onChange={(e) => setSelectedParticipantId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a participant...</option>
                    {participants.map((participant) => (
                      <option key={participant._id} value={participant._id}>
                        {participant.name} ({participant.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select which participant will be the team creator
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Team Name *</label>
                  <input
                    type="text"
                    value={formData.teamName}
                    onChange={(e) => setFormData(prev => ({ ...prev, teamName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter team name"
                    required
                  />
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
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Create Team
                </button>
              </form>
            )}
          </div>
        )}

        {/* Your Team Section */}
        {selectedHackathon && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Your Team</h2>
            
            {teamLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Loading team information...</p>
              </div>
            )}

            {!teamLoading && userTeam ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Team Created Successfully!</h3>
                    <p className="text-sm text-green-600">You are now part of a team in this hackathon.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-700">Team Member:</span>
                    <p className="text-green-600">{userTeam.name} ({userTeam.email})</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Role:</span>
                    <p className="text-green-600">{userTeam.role}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <button
                    onClick={() => navigate('/my-team')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Go to Team Management
                  </button>
                </div>
              </div>
            ) : !teamLoading && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">No Team Yet</p>
                <p className="text-sm text-gray-500">Create a team above to get started with the hackathon.</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {selectedHackathon && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => {
                setShowParticipants(!showParticipants);
                if (!showParticipants && participants.length === 0) {
                  loadParticipants(selectedHackathon._id);
                }
              }}
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <Users className="h-5 w-5 mr-2" />
              {showParticipants ? 'Hide Participants' : 'View Participants'}
            </button>

            <button
              onClick={() => {
                setShowTeams(!showTeams);
                if (!showTeams && hackathonTeams.length === 0) {
                  loadHackathonTeams(selectedHackathon._id);
                }
              }}
              className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
            >
              <Shield className="h-5 w-5 mr-2" />
              {showTeams ? 'Hide Teams' : 'View Teams'}
            </button>

            <button
              onClick={() => navigate('/my-team')}
              className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Go to My Team
            </button>
          </div>
        )}

        {/* Participants List */}
        {selectedHackathon && showParticipants && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Participants in {selectedHackathon.title}</h2>
            
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Loading participants...</p>
              </div>
            )}

            {!loading && participants.length > 0 && (
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
                        {participant.role || 'member'}
                      </span>
                      <span className="text-gray-500">
                        {participant.skills?.slice(0, 2).join(', ') || 'No skills listed'}
                      </span>
                    </div>
                    <button
                      onClick={() => inviteParticipant(participant._id, participant.name)}
                      disabled={!userTeam || participant.teamId}
                      className={`w-full py-2 px-3 rounded-lg text-sm transition-colors ${
                        !userTeam || participant.teamId
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {!userTeam ? 'Create Team First' : participant.teamId ? 'Already in Team' : 'Invite to Team'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && participants.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">No participants found</p>
                <p className="text-sm text-gray-500">This hackathon doesn't have any participants yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Teams List */}
        {selectedHackathon && showTeams && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Teams in {selectedHackathon.title}</h2>

            {hackathonTeams.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">No teams available</p>
                <p className="text-sm text-gray-500">No teams have been created for this hackathon yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hackathonTeams.map((team) => (
                  <div key={team._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <Shield className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{team.teamName}</h4>
                        <p className="text-sm text-gray-500">
                          {team.teamMembers?.length || 0} / {team.memberLimit} members
                        </p>
                      </div>
                    </div>
                    {team.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{team.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-gray-500">
                        Created by: {team.teamLeader?.name || 'Unknown'}
                      </span>
                    </div>
                    <button
                      onClick={() => sendJoinRequest(team._id, team.teamName)}
                      disabled={userTeam || joinRequests.has(team._id) || (team.teamMembers?.length || 0) >= team.memberLimit}
                      className={`w-full py-2 px-3 rounded-lg text-sm transition-colors ${
                        userTeam
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : joinRequests.has(team._id)
                          ? 'bg-yellow-100 text-yellow-600 cursor-not-allowed'
                          : (team.teamMembers?.length || 0) >= team.memberLimit
                          ? 'bg-red-100 text-red-600 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {userTeam
                        ? 'Already in Team'
                        : joinRequests.has(team._id)
                        ? 'Request Sent'
                        : (team.teamMembers?.length || 0) >= team.memberLimit
                        ? 'Team Full'
                        : 'Request to Join'
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantTeamCreation;