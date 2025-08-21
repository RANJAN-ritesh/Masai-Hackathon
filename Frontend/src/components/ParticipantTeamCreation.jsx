import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../context/AuthContextProvider';
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
  Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';

const ParticipantTeamCreation = () => {
  const { userData } = useContext(MyContext);
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
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const response = await fetch(`${baseURL}/hackathons`);
      const data = await response.json();
      
      // Filter hackathons that allow participant teams
      const allowedHackathons = data.filter(hackathon => 
        hackathon.allowParticipantTeams || hackathon.teamCreationMode === 'participant' || hackathon.teamCreationMode === 'both'
      );
      
      setHackathons(allowedHackathons);
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      toast.error('Failed to load hackathons');
    }
  };

  const fetchParticipants = async (hackathonId) => {
    try {
      const response = await fetch(`${baseURL}/participant-team/participants/${hackathonId}`, {
        headers: {
          'Authorization': `Bearer ${userData._id}` // Add authentication header
        }
      });
      const data = await response.json();
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    
    if (!formData.teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    if (!validateTeamName(formData.teamName)) {
      toast.error('Team name must be 16 characters or less and contain only lowercase letters, underscores, and hyphens');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/participant-team/create-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData._id}` // Add authentication header
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
        toast.error(data.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create Your Team</h1>
                <p className="text-gray-600">Build the perfect team for your hackathon journey</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hackathon Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Hackathon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => {
              const status = getHackathonStatus(hackathon);
              return (
                <div
                  key={hackathon._id}
                  className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                    selectedHackathon?._id === hackathon._id 
                      ? 'border-indigo-500 shadow-indigo-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedHackathon(hackathon)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {hackathon.title}
                      </h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="capitalize">{status}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {hackathon.description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>Team Size: {hackathon.minTeamSize}-{hackathon.maxTeamSize}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {selectedHackathon?._id === hackathon._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-indigo-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Selected</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Creation Form */}
        {selectedHackathon && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Your Team</h2>
                <p className="text-gray-600">You're creating a team for: <span className="font-medium text-indigo-600">{selectedHackathon.title}</span></p>
              </div>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-6">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.teamName}
                    onChange={handleTeamNameChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Enter your team name (e.g., code_crushers)"
                    maxLength={16}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      formData.teamName.length === 16 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {formData.teamName.length}/16
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Only lowercase letters, underscores, and hyphens allowed. Maximum 16 characters.
                </p>
              </div>

              {/* Team Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Describe your team's goals, skills, or what you're looking for..."
                />
              </div>

              {/* Team Rules */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Team Creation Rules</span>
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start space-x-2">
                    <Star className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>You can only create one team per hackathon</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Star className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>Team name must be unique and follow naming conventions</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Star className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>Once finalized, teams cannot be modified</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Star className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>Team creator cannot leave until all members leave</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowParticipants(true)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>View Participants</span>
                </button>
                
                <button
                  type="submit"
                  disabled={loading || !formData.teamName.trim()}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Team</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Participants Modal */}
        {showParticipants && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Hackathon Participants
                </h3>
                <button
                  onClick={() => setShowParticipants(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participants.map((participant) => (
                    <div key={participant._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{participant.name}</h4>
                          <p className="text-sm text-gray-600">{participant.code}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium">Course:</span> {participant.course}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Vertical:</span> {participant.vertical}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {participant.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {participant.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{participant.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantTeamCreation; 