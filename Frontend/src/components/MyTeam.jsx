import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../context/AuthContextProvider';
import { useTheme } from '../context/ThemeContextProvider';
import ParticipantTeamMode from './ParticipantTeamMode';
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
  Mail,
  Target,
  CheckCircle
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
  const [sentInvitations, setSentInvitations] = useState(new Set()); // Track sent invitations
  const [invitationLoading, setInvitationLoading] = useState(new Set()); // Track loading states

  // Problem Statement Selection State
  const [problemStatements, setProblemStatements] = useState([]);
  const [selectedProblemStatement, setSelectedProblemStatement] = useState(null);
  const [showProblemSelectionModal, setShowProblemSelectionModal] = useState(false);
  const [submissionLink, setSubmissionLink] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // Check team creation mode
  const isParticipantTeamMode = hackathon?.allowParticipantTeams && hackathon?.teamCreationMode === 'participant';
  const isAdminTeamMode = !hackathon?.allowParticipantTeams && hackathon?.teamCreationMode === 'admin';

  useEffect(() => {
    if (hackathon && userId) {
      loadData();
    }
  }, [hackathon, userId]);

  // Load selected problem statement when team data is loaded
  useEffect(() => {
    if (currentTeam?.selectedProblemStatement) {
      setSelectedProblemStatement(currentTeam.selectedProblemStatement);
    }
  }, [currentTeam?.selectedProblemStatement]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCurrentTeam(),
        loadHackathonParticipants(),
        loadHackathonTeams(),
        loadTeamRequests(),
        loadProblemStatements()
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
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${baseURL}/team/hackathon/${hackathon._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userTeam = data.teams?.find(team => 
          team.teamMembers.some(member => member._id === userId) ||
          team.createdBy?._id === userId
        );
        setCurrentTeam(userTeam || null);
      } else {
        console.error('Failed to load current team:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading current team:', error);
    }
  };

  const loadHackathonParticipants = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${baseURL}/participant-team/participants/${hackathon._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHackathonParticipants(data.participants || []);
      } else {
        console.error('Failed to load participants:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const loadHackathonTeams = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${baseURL}/team/hackathon/${hackathon._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHackathonTeams(data.teams || []);
      } else {
        console.error('Failed to load teams:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadTeamRequests = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${baseURL}/participant-team/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeamRequests(data.requests || []);
      } else {
        console.error('Failed to load team requests:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading team requests:', error);
    }
  };

  // Load problem statements from hackathon
  const loadProblemStatements = async () => {
    try {
      if (hackathon?.problemStatements) {
        setProblemStatements(hackathon.problemStatements);
      }
    } catch (error) {
      console.error('Error loading problem statements:', error);
    }
  };

  // Select problem statement (team leader only)
  const selectProblemStatement = async (problemStatement) => {
    const confirmed = window.confirm(
      `Are you sure you want to select "${problemStatement.track}"?\n\n` +
      `This will be your team's final problem statement and cannot be changed.\n\n` +
      `Do you want to proceed?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${baseURL}/team/select-problem-statement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId: currentTeam._id,
          problemStatement: problemStatement.track
        })
      });

      if (response.ok) {
        toast.success(`Problem statement "${problemStatement.track}" selected successfully!`);
        setSelectedProblemStatement(problemStatement.track);
        setShowProblemSelectionModal(false);
        
        // Update local team data
        setCurrentTeam(prev => ({
          ...prev,
          selectedProblemStatement: problemStatement.track
        }));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to select problem statement');
      }
    } catch (error) {
      console.error('Error selecting problem statement:', error);
      toast.error('Failed to select problem statement');
    }
  };

  // Submit project (team leader only)
  const submitProject = async () => {
    if (!submissionLink.trim()) {
      toast.error('Please enter a submission link');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to submit this project?\n\n` +
      `Submission Link: ${submissionLink}\n\n` +
      `This is your final submission and cannot be changed.\n\n` +
      `Do you want to proceed?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${baseURL}/team/submit-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId: currentTeam._id,
          submissionLink: submissionLink.trim()
        })
      });

      if (response.ok) {
        toast.success('Project submitted successfully!');
        setShowSubmissionModal(false);
        setSubmissionLink('');
        
        // Update local team data
        setCurrentTeam(prev => ({
          ...prev,
          submissionLink: submissionLink.trim(),
          submissionTime: new Date().toISOString()
        }));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit project');
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error('Failed to submit project');
    }
  };


  // Report team member function
  const reportTeamMember = async (memberId, reason) => {
    const confirmed = window.confirm(
      `Are you sure you want to report this team member?\n\n` +
      `This action will notify the admin if all other team members also report this person.\n\n` +
      `Reason: ${reason || 'No reason provided'}\n\n` +
      `Do you want to proceed?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`${baseURL}/team-reporting/report-member`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId: currentTeam._id,
          reportedUserId: memberId,
          reason: reason || 'No reason provided'
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Member reported successfully! ${result.allMembersReported ? 'Admin has been notified.' : ''}`);
        
        // Reload team data to update UI
        await loadTeamData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to report member');
      }
    } catch (error) {
      console.error('Error reporting member:', error);
      toast.error('Failed to report member');
    }
  };


  const createTeam = async () => {
    if (!teamCreationData.teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${baseURL}/participant-team/create-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        console.error('Create team error response:', error);
        toast.error(error.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  const sendJoinRequest = async (teamId) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${baseURL}/participant-team/send-join-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        console.error('Send join request error response:', error);
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

    if (sentInvitations.has(participantId)) {
      toast.info('Invitation already sent to this participant.');
      return;
    }

    setInvitationLoading(prev => new Set([...prev, participantId]));

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const response = await fetch(`${baseURL}/participant-team/send-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participantId,
          teamId: currentTeam._id,
          message: 'You are invited to join our team!'
        })
      });

      if (response.ok) {
        toast.success('Invitation sent successfully!');
        setSentInvitations(prev => new Set([...prev, participantId]));
      } else {
        const error = await response.json();
        console.error('Send invitation error response:', error);
        toast.error(error.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setInvitationLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(participantId);
        return newSet;
      });
    }
  };

  const respondToRequest = async (requestId, response, responseMessage = '') => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const res = await fetch(`${baseURL}/participant-team/respond-request/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        console.error('Respond to request error response:', error);
        toast.error(error.message || `Failed to ${response} request`);
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error(`Failed to ${response} request`);
    }
  };

  const respondToInvitation = async (requestId, response) => {
    try {
      const token = localStorage.getItem('authToken') || userId;
      console.log('🔍 Responding to invitation:', { requestId, response });
      
      const res = await fetch(`${baseURL}/participant-team/respond-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          response,
          message: response === 'accepted' ? 'I accept your invitation!' : 'I decline your invitation.'
        })
      });

      if (res.ok) {
        if (response === 'accepted') {
          toast.success('Invitation accepted! You are now part of the team! 🎉');
          // Redirect to overview tab after acceptance
          setActiveTab('overview');
        } else {
          toast.success('Invitation declined successfully.');
        }
        // Refresh all data to update team membership
        await loadData();
      } else {
        const error = await res.json();
        console.error('Error response:', error);
        toast.error(error.message || `Failed to ${response} invitation`);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error(`Failed to ${response} invitation`);
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

        {/* Problem Statement Selection Modal */}
        {showProblemSelectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
              style={{ backgroundColor: themeConfig.cardBg }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: themeConfig.textColor }}
                >
                  Select Problem Statement
                </h2>
                <button
                  onClick={() => setShowProblemSelectionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5" style={{ color: '#92400e' }} />
                  <span className="font-medium" style={{ color: '#92400e' }}>
                    Important Notice
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#92400e' }}>
                  Once you select a problem statement, it cannot be changed. Please discuss with your team members via chat before making your final decision.
                </p>
              </div>

              <div className="space-y-4">
                {problemStatements.map((problem, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md"
                    style={{ 
                      backgroundColor: themeConfig.backgroundColor,
                      borderColor: themeConfig.borderColor
                    }}
                    onClick={() => selectProblemStatement(problem)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 
                          className="font-semibold mb-2"
                          style={{ color: themeConfig.textColor }}
                        >
                          {problem.track}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ color: themeConfig.textColor, opacity: 0.7 }}
                        >
                          {problem.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          className="px-4 py-2 rounded-lg transition"
                          style={{ 
                            backgroundColor: themeConfig.accentColor,
                            color: 'white'
                          }}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowProblemSelectionModal(false)}
                  className="px-6 py-2 rounded-lg transition border"
                  style={{ 
                    borderColor: themeConfig.borderColor,
                    color: themeConfig.textColor
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submission Modal */}
        {showSubmissionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              style={{ backgroundColor: themeConfig.cardBg }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 
                  className="text-xl font-bold"
                  style={{ color: themeConfig.textColor }}
                >
                  Submit Project
                </h2>
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5" style={{ color: '#92400e' }} />
                  <span className="font-medium" style={{ color: '#92400e' }}>
                    Final Submission
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#92400e' }}>
                  This is your final submission and cannot be changed once submitted.
                </p>
                {hackathon?.submissionDescription && (
                  <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#fbbf24' }}>
                    <p className="text-sm font-medium" style={{ color: '#92400e' }}>
                      Submission Instructions:
                    </p>
                    <p className="text-sm" style={{ color: '#92400e' }}>
                      {hackathon.submissionDescription}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textColor }}>
                  Submission Link *
                </label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://github.com/your-repo or https://your-project.com"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: themeConfig.backgroundColor,
                    borderColor: themeConfig.borderColor,
                    color: themeConfig.textColor,
                    '--tw-ring-color': themeConfig.accentColor
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={submitProject}
                  className="flex-1 py-2 px-4 rounded-lg font-medium transition"
                  style={{ 
                    backgroundColor: themeConfig.accentColor,
                    color: 'white'
                  }}
                >
                  Submit Project
                </button>
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="px-4 py-2 rounded-lg transition border"
                  style={{ 
                    borderColor: themeConfig.borderColor,
                    color: themeConfig.textColor
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
              {currentTeam.teamMembers.map((member, index) => {
                const isLeader = currentTeam.teamLeader?._id === member._id || member.role === 'leader';
                return (
                  <div 
                    key={member._id}
                    className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                      isLeader ? 'ring-2 ring-yellow-400 shadow-lg' : ''
                    }`}
                    style={{ 
                      backgroundColor: isLeader ? '#fef3c7' : themeConfig.backgroundColor,
                      borderColor: isLeader ? '#f59e0b' : themeConfig.borderColor
                    }}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                        isLeader ? 'ring-2 ring-yellow-400' : ''
                      }`}
                      style={{ 
                        backgroundColor: isLeader ? '#f59e0b' : themeConfig.accentColor, 
                        color: 'white' 
                      }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium flex items-center" style={{ color: themeConfig.textColor }}>
                        {member.name}
                        {isLeader && (
                          <>
                            <Crown className="w-4 h-4 inline ml-1" style={{ color: '#f59e0b' }} />
                            <span className="ml-1 text-xs font-bold" style={{ color: '#f59e0b' }}>
                              LEADER
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                        {member.email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Problem Statement */}
            {currentTeam.selectedProblemStatement && (
              <div className="mb-6 p-4 rounded-lg border-2" style={{
                backgroundColor: '#dcfce7',
                borderColor: '#22c55e'
              }}>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: '#166534' }}>
                  <Target className="w-5 h-5" style={{ color: '#22c55e' }} />
                  Selected Problem Statement
                </h3>
                <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: '#f0fdf4' }}>
                  <h4 className="font-medium mb-1" style={{ color: '#166534' }}>
                    {currentTeam.selectedProblemStatement}
                  </h4>
                  <p className="text-sm" style={{ color: '#166534', opacity: 0.7 }}>
                    This problem has been selected for your team.
                  </p>
                </div>

                {/* Submission Status */}
                {currentTeam.submissionLink && (
                  <div className="border-t pt-4 mt-4" style={{ borderColor: '#22c55e' }}>
                    <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: '#166534' }}>
                      <CheckCircle className="w-4 h-4" style={{ color: '#22c55e' }} />
                      Project Submitted
                    </h4>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                      <p className="text-sm mb-2" style={{ color: '#166534' }}>
                        <strong>Submission Link:</strong> <a href={currentTeam.submissionLink} target="_blank" rel="noopener noreferrer" className="underline">{currentTeam.submissionLink}</a>
                      </p>
                      <p className="text-sm" style={{ color: '#166534', opacity: 0.8 }}>
                        <strong>Submitted on:</strong> {currentTeam.submissionTime ? new Date(currentTeam.submissionTime).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submission Interface */}
                {(currentTeam.teamLeader?._id === userId || currentTeam.teamMembers.find(m => m._id === userId)?.role === 'leader') ? (
                  <div className="border-t pt-4" style={{ borderColor: '#22c55e' }}>
                    <h4 className="font-medium mb-2" style={{ color: '#166534' }}>
                      Project Submission
                    </h4>
                    <p className="text-sm mb-3" style={{ color: '#166534', opacity: 0.8 }}>
                      Once your team is ready, you can submit your project solution. This is a final submission that cannot be changed.
                    </p>
                    {hackathon?.submissionStartDate && hackathon?.submissionEndDate ? (
                      (() => {
                        const now = new Date();
                        const startDate = new Date(hackathon.submissionStartDate);
                        const endDate = new Date(hackathon.submissionEndDate);
                        const isSubmissionPeriod = now >= startDate && now <= endDate;
                        
                        return isSubmissionPeriod ? (
                          <button 
                            className="px-4 py-2 rounded-lg font-medium transition"
                            style={{ 
                              backgroundColor: '#22c55e',
                              color: 'white'
                            }}
                            onClick={() => setShowSubmissionModal(true)}
                          >
                            Submit Project
                          </button>
                        ) : (
                          <div className="p-3 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                            <p className="text-sm" style={{ color: '#92400e' }}>
                              {now < startDate 
                                ? `Submission period starts: ${startDate.toLocaleDateString()}`
                                : `Submission period ended: ${endDate.toLocaleDateString()}`
                              }
                            </p>
                          </div>
                        );
                      })()
                    ) : (
                      <button 
                        className="px-4 py-2 rounded-lg font-medium transition"
                        style={{ 
                          backgroundColor: '#22c55e',
                          color: 'white'
                        }}
                        onClick={() => setShowSubmissionModal(true)}
                      >
                        Submit Project
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="border-t pt-4" style={{ borderColor: '#22c55e' }}>
                    <p className="text-sm" style={{ color: '#166534', opacity: 0.8 }}>
                      <strong>Note:</strong> Only your team leader can submit the final project. Stay coordinated with them for submission timing.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Problem Statements Section */}
            {problemStatements.length > 0 && !currentTeam.selectedProblemStatement && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: themeConfig.textColor }}>
                  <Target className="w-5 h-5" style={{ color: themeConfig.accentColor }} />
                  Available Problem Statements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {problemStatements.map((problem, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg border"
                      style={{ 
                        backgroundColor: themeConfig.backgroundColor,
                        borderColor: themeConfig.borderColor
                      }}
                    >
                      <h4 className="font-medium mb-1" style={{ color: themeConfig.textColor }}>
                        {problem.track}
                      </h4>
                      <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                        {problem.description?.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Problem Statement Selection */}
            {!selectedProblemStatement && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: themeConfig.textColor }}>
                  <Target className="w-5 h-5" style={{ color: themeConfig.accentColor }} />
                  Problem Statement Selection
                </h3>
                <div className="p-4 rounded-lg border" style={{ 
                  backgroundColor: '#f0f9ff',
                  borderColor: '#0ea5e9'
                }}>
                  <p className="text-sm mb-3" style={{ color: '#0c4a6e' }}>
                    <strong>Team Leader:</strong> Please select a problem statement for your team. This decision should be made after discussing with your team members via chat.
                  </p>
                  {(currentTeam.teamLeader?._id === userId || currentTeam.teamMembers.find(m => m._id === userId)?.role === 'leader') ? (
                    <button
                      onClick={() => setShowProblemSelectionModal(true)}
                      className="px-4 py-2 rounded-lg transition"
                      style={{ 
                        backgroundColor: themeConfig.accentColor,
                        color: 'white'
                      }}
                    >
                      Select Problem Statement
                    </button>
                  ) : (
                    <p className="text-sm" style={{ color: '#0c4a6e', opacity: 0.8 }}>
                      Waiting for team leader to select a problem statement...
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Active Poll Section (Visible to All Team Members) - DISABLED */}
            {false && pollActive && (
              <div 
                className="p-4 rounded-lg border-2 mb-6"
                style={{ 
                  backgroundColor: '#fef3c7',
                  borderColor: '#f59e0b'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2" style={{ color: '#92400e' }}>
                    <Vote className="w-5 h-5" style={{ color: '#f59e0b' }} />
                    Active Poll: Problem Statement Selection
                  </h3>
                  {timeLeft && !timeLeft.expired && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ backgroundColor: '#fbbf24' }}>
                      <Clock className="w-4 h-4" style={{ color: '#92400e' }} />
                      <span className="text-sm font-mono font-medium" style={{ color: '#92400e' }}>
                        {timeLeft.hours.toString().padStart(2, '0')}:
                        {timeLeft.minutes.toString().padStart(2, '0')}:
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm mb-4" style={{ color: '#92400e' }}>
                  Vote for your preferred problem statement. The poll will automatically close when the timer ends.
                </p>

                {/* Voting Interface */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {problemStatements.map((problem, index) => {
                    const userVote = currentTeam.problemStatementVotes?.[userId];
                    const isSelected = userVote === problem._id || userVote === problem.track;
                    const voteCount = currentTeam.problemStatementVoteCount?.[problem._id] || currentTeam.problemStatementVoteCount?.[problem.track] || 0;
                    
                    return (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                        style={{ 
                          backgroundColor: isSelected ? '#dbeafe' : themeConfig.backgroundColor,
                          borderColor: isSelected ? '#3b82f6' : themeConfig.borderColor
                        }}
                        onClick={() => voteOnProblemStatement(problem.track)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1" style={{ color: themeConfig.textColor }}>
                              {problem.track}
                            </h4>
                            <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                              {problem.description?.substring(0, 100)}...
                            </p>
                          </div>
                          <div className="ml-3 flex flex-col items-center">
                            {isSelected && <Check className="w-5 h-5 mb-1" style={{ color: '#3b82f6' }} />}
                            <span className="text-sm font-medium px-2 py-1 rounded" style={{ 
                              backgroundColor: '#e5e7eb',
                              color: '#374151'
                            }}>
                              {voteCount} votes
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Real-time Vote Summary (Visible to All) */}
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: '#f3f4f6' }}
                >
                  <h4 className="font-medium mb-2" style={{ color: '#374151' }}>
                    Live Vote Results
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(currentTeam.problemStatementVoteCount || {}).map(([problemId, votes]) => (
                      <div key={problemId} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'white' }}>
                        <span className="text-sm" style={{ color: '#374151' }}>{problemId}</span>
                        <span className="font-medium text-sm" style={{ color: '#059669' }}>{votes} votes</span>
                      </div>
                    ))}
                    {Object.keys(currentTeam.problemStatementVoteCount || {}).length === 0 && (
                      <p className="text-sm col-span-2" style={{ color: '#6b7280' }}>No votes cast yet</p>
                    )}
                  </div>
                </div>

                {/* Conclude Poll Button (Only for Team Leaders) */}
                {(currentTeam.teamLeader?._id === userId || currentTeam.teamMembers.find(m => m._id === userId)?.role === 'leader') && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: '#f59e0b' }}>
                    <button
                      onClick={concludePoll}
                      className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
                      style={{ 
                        backgroundColor: '#dc2626',
                        color: 'white'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                    >
                      🏁 Conclude Poll Now
                    </button>
                    <p className="text-xs mt-2 text-center" style={{ color: '#92400e', opacity: 0.8 }}>
                      Only team leaders can conclude the poll early
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Team Instructions */}
            <div 
              className="p-4 rounded-lg border mb-6"
              style={{ 
                backgroundColor: '#f0f9ff',
                borderColor: '#0ea5e9'
              }}
            >
              <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#0c4a6e' }}>
                <MessageSquare className="w-5 h-5" />
                Team Instructions
              </h3>
              <div className="text-sm space-y-2" style={{ color: '#0c4a6e' }}>
                <p>• <strong>Problem Statement Selection:</strong> Only the team leader can select the problem statement after discussing with teammates via chat.</p>
                <p>• <strong>Communication:</strong> Use the team chat to discuss and coordinate on problem statement selection.</p>
                <p>• <strong>Final Submission:</strong> Only the team leader can submit the final project for the team.</p>
                <p>• <strong>Problem Locking:</strong> Once a problem is selected, it cannot be changed.</p>
                <p>• <strong>Submission Locking:</strong> Once a project is submitted, it cannot be changed.</p>
              </div>
            </div>

            {/* Leader Actions */}
            {(currentTeam.teamLeader?._id === userId || currentTeam.teamMembers.find(m => m._id === userId)?.role === 'leader') && (
              <div 
                className="p-4 rounded-lg border-2"
                style={{ 
                  backgroundColor: '#fef3c7',
                  borderColor: '#f59e0b'
                }}
              >
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#92400e' }}>
                  <Crown className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  Team Leader Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  {!selectedProblemStatement ? (
                    <button
                      onClick={() => setShowProblemSelectionModal(true)}
                      className="px-6 py-3 rounded-lg transition-all hover:shadow-lg flex items-center gap-2 font-medium"
                      style={{ 
                        backgroundColor: '#f59e0b',
                        color: 'white'
                      }}
                    >
                      <Target className="w-5 h-5" />
                      Select Problem Statement
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#dcfce7' }}>
                      <CheckCircle className="w-4 h-4" style={{ color: '#166534' }} />
                      <span className="text-sm font-medium" style={{ color: '#166534' }}>
                        Problem Selected: {selectedProblemStatement}
                      </span>
                    </div>
                  )}
                  
                  {selectedProblemStatement && !currentTeam.submissionLink && (
                    (() => {
                      const now = new Date();
                      const startDate = hackathon?.submissionStartDate ? new Date(hackathon.submissionStartDate) : null;
                      const endDate = hackathon?.submissionEndDate ? new Date(hackathon.submissionEndDate) : null;
                      const isSubmissionPeriod = !startDate || !endDate || (now >= startDate && now <= endDate);
                      
                      return isSubmissionPeriod ? (
                        <button
                          onClick={() => setShowSubmissionModal(true)}
                          className="px-6 py-3 rounded-lg transition-all hover:shadow-lg flex items-center gap-2 font-medium"
                          style={{ 
                            backgroundColor: '#22c55e',
                            color: 'white'
                          }}
                        >
                          <CheckCircle className="w-5 h-5" />
                          Submit Project
                        </button>
                      ) : (
                        <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                          <span className="text-sm font-medium" style={{ color: '#92400e' }}>
                            {now < startDate 
                              ? `Submission starts: ${startDate.toLocaleDateString()}`
                              : `Submission ended: ${endDate.toLocaleDateString()}`
                            }
                          </span>
                        </div>
                      );
                    })()
                  )}
                </div>
                
                {problemStatements.length === 0 && (
                  <p className="text-sm mt-2" style={{ color: '#92400e', opacity: 0.7 }}>
                    No problem statements available for this hackathon.
                  </p>
                )}
              </div>
            )}

            {/* Team Chat Section */}
            <div className="mt-8">
              <h3 
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: themeConfig.textColor }}
              >
                <MessageSquare className="w-5 h-5" style={{ color: themeConfig.accentColor }} />
                Team Chat
              </h3>
              <div className="h-96 rounded-lg border" style={{ borderColor: themeConfig.borderColor }}>
                <TeamChat currentTeam={currentTeam} />
              </div>
            </div>
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
          <ParticipantTeamMode 
            hackathon={hackathon}
            userId={userId}
            baseURL={baseURL}
          />
        )}

      </div>
    </div>
  );
};

export default MyTeam;
