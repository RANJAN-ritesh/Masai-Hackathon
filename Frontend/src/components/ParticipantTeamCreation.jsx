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
  Calendar
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
        
        .theme-input {
          background-color: ${themeConfig.inputBg} !important;
          border: 1px solid ${themeConfig.inputBorder} !important;
          color: ${themeConfig.textColor} !important;
          transition: all 0.3s ease;
        }
        
        .theme-input:focus {
          outline: none;
          border-color: ${themeConfig.accentColor} !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>

      <div 
        className="min-h-screen py-8 px-4"
        style={{ 
          backgroundColor: themeConfig.backgroundColor,
          color: themeConfig.textColor
        }}
      >
        {/* Header */}
        <div className="theme-card rounded-xl shadow-sm border mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: themeConfig.accentColor, color: 'white' }}
                >
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Create Your Team</h1>
                  <p style={{ color: themeConfig.mutedText }}>
                    Build the perfect team for your hackathon journey
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="theme-button-secondary px-4 py-2 rounded-lg transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Hackathon Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Select a Hackathon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hackathons.map((hackathon) => {
                const status = getHackathonStatus(hackathon);
                return (
                  <div
                    key={hackathon._id}
                    className={`theme-card rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                      selectedHackathon?._id === hackathon._id 
                        ? 'border-blue-500 shadow-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedHackathon(hackathon)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold line-clamp-2">
                          {hackathon.title}
                        </h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="capitalize">{status}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-4 line-clamp-3" style={{ color: themeConfig.mutedText }}>
                        {hackathon.description}
                      </p>
                      
                      <div className="space-y-2 text-sm" style={{ color: themeConfig.mutedText }}>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span>Team Size: {hackathon.teamSize?.min || 2}-{hackathon.teamSize?.max || 4}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {selectedHackathon?._id === hackathon._id && (
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: themeConfig.borderColor }}>
                          <div className="flex items-center space-x-2" style={{ color: themeConfig.accentColor }}>
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
            <div className="theme-card rounded-xl shadow-sm border p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: themeConfig.successColor, color: 'white' }}
                >
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Create Your Team</h2>
                  <p style={{ color: themeConfig.mutedText }}>
                    You're creating a team for: <span style={{ color: themeConfig.accentColor }}>{selectedHackathon.title}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-6">
                {/* Team Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.teamName}
                      onChange={handleTeamNameChange}
                      className="theme-input w-full px-4 py-3 rounded-lg transition-all duration-200"
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
                  <p className="mt-2 text-sm" style={{ color: themeConfig.mutedText }}>
                    Only lowercase letters, underscores, and hyphens allowed. Maximum 16 characters.
                  </p>
                </div>

                {/* Team Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Team Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="theme-input w-full px-4 py-3 rounded-lg transition-all duration-200"
                    placeholder="Describe your team's goals, skills, or what you're looking for..."
                  />
                </div>

                {/* Team Rules */}
                <div 
                  className="rounded-lg p-4"
                  style={{ 
                    backgroundColor: themeConfig.accentColor + '10',
                    border: `1px solid ${themeConfig.accentColor + '30'}`
                  }}
                >
                  <h4 className="font-medium mb-3 flex items-center space-x-2" style={{ color: themeConfig.accentColor }}>
                    <Shield className="w-5 h-5" />
                    <span>Team Creation Rules</span>
                  </h4>
                  <ul className="space-y-2 text-sm" style={{ color: themeConfig.accentColor }}>
                    <li className="flex items-start space-x-2">
                      <Star className="w-4 h-4 mt-0.5" />
                      <span>You can only create one team per hackathon</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Star className="w-4 h-4 mt-0.5" />
                      <span>Team name must be unique and follow naming conventions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Star className="w-4 h-4 mt-0.5" />
                      <span>Once finalized, teams cannot be modified</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Star className="w-4 h-4 mt-0.5" />
                      <span>Team creator cannot leave until all members leave</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowParticipants(true);
                      fetchParticipants(selectedHackathon._id);
                    }}
                    className="theme-button-secondary px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>View Participants</span>
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || !formData.teamName.trim()}
                    className="theme-button px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="theme-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: themeConfig.borderColor }}>
                  <h3 className="text-xl font-semibold">
                    Hackathon Participants
                  </h3>
                  <button
                    onClick={() => setShowParticipants(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    style={{ backgroundColor: themeConfig.hoverBg }}
                  >
                    <XCircle className="w-5 h-5" style={{ color: themeConfig.mutedText }} />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {participants.map((participant) => (
                      <div 
                        key={participant._id} 
                        className="rounded-lg p-4 border transition-all duration-200 hover:shadow-md"
                        style={{ 
                          backgroundColor: themeConfig.hoverBg,
                          borderColor: themeConfig.borderColor
                        }}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: themeConfig.accentColor, color: 'white' }}
                          >
                            <span className="font-semibold">
                              {participant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{participant.name}</h4>
                            <p className="text-sm" style={{ color: themeConfig.mutedText }}>{participant.code}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Course:</span> {participant.course}
                          </p>
                          <p>
                            <span className="font-medium">Vertical:</span> {participant.vertical}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {participant.skills?.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs rounded-full"
                                style={{ 
                                  backgroundColor: themeConfig.accentColor + '20',
                                  color: themeConfig.accentColor
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                            {participant.skills?.length > 3 && (
                              <span 
                                className="px-2 py-1 text-xs rounded-full"
                                style={{ 
                                  backgroundColor: themeConfig.mutedText + '20',
                                  color: themeConfig.mutedText
                                }}
                              >
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
    </>
  );
};

export default ParticipantTeamCreation; 