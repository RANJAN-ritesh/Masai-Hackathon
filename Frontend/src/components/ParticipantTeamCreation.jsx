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

  // Load hackathons on mount
  useEffect(() => {
    loadHackathons();
  }, []);

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

  // Add form state back
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    teamName: '',
    description: ''
  });
  const [selectedParticipantId, setSelectedParticipantId] = useState('');

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
        navigate('/my-team');
      } else {
        toast.error(data.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Failed to create team:', error);
      toast.error('Failed to create team');
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

        {/* Action Buttons */}
        {selectedHackathon && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
                      className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      disabled
                    >
                      Invite (Coming Soon)
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
      </div>
    </div>
  );
};

export default ParticipantTeamCreation;