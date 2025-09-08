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
  Mail,
  Vote,
  Target,
  BarChart3
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

  // Problem Statement Polling State
  const [problemStatements, setProblemStatements] = useState([]);
  const [pollActive, setPollActive] = useState(false);
  const [pollResults, setPollResults] = useState({});
  const [showPollModal, setShowPollModal] = useState(false);
  const [selectedProblemStatement, setSelectedProblemStatement] = useState(null);
  const [pollDuration, setPollDuration] = useState(90); // Default 90 minutes (1.5 hours)
  const [pollStartTime, setPollStartTime] = useState(null);
  const [pollEndTime, setPollEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loadingPollStatus, setLoadingPollStatus] = useState(false);

  // Check team creation mode
  const isParticipantTeamMode = hackathon?.allowParticipantTeams && hackathon?.teamCreationMode === 'participant';
  const isAdminTeamMode = !hackathon?.allowParticipantTeams && hackathon?.teamCreationMode === 'admin';

  useEffect(() => {
    if (hackathon && userId) {
      loadData();
    }
  }, [hackathon, userId]);

  // Load poll status when team data is loaded
  useEffect(() => {
    if (currentTeam) {
      loadPollStatus();
    }
  }, [currentTeam]);

  // Poll timer effect
  useEffect(() => {
    if (!pollActive || !pollStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const endTime = new Date(pollEndTime);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        setPollActive(false);
        toast.warning('Poll time has ended! Team leader should select the final problem statement.');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds, expired: false });

      // Send notifications at specific intervals
      const totalMinutes = Math.floor(diff / (1000 * 60));
      if (totalMinutes === 20 || totalMinutes === 10) {
        toast.info(`Poll ends in ${totalMinutes} minutes! Please cast your vote.`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pollActive, pollStartTime, pollEndTime]);

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
      const response = await fetch(`${baseURL}/team/hackathon/${hackathon._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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

  // Start problem statement poll
  const startProblemStatementPoll = async () => {
    if (!currentTeam) {
      toast.error('You need to be in a team to start a poll');
      return;
    }

    if (currentTeam.teamLeader?._id !== userId && !currentTeam.teamMembers.find(m => m._id === userId)?.role === 'leader') {
      toast.error('Only team leaders can start problem statement polls');
      return;
    }

    if (problemStatements.length === 0) {
      toast.error('No problem statements available for this hackathon');
      return;
    }

    // Just show the modal - don't start poll automatically
    setShowPollModal(true);
  };

  // Load poll status from backend
  const loadPollStatus = async () => {
    if (!currentTeam || loadingPollStatus) return;
    
    setLoadingPollStatus(true);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch(`${baseURL}/team-polling/poll-status/${currentTeam._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const pollData = await response.json();
        setPollActive(pollData.pollActive || false);
        setPollStartTime(pollData.pollStartTime ? new Date(pollData.pollStartTime) : null);
        setPollEndTime(pollData.pollEndTime ? new Date(pollData.pollEndTime) : null);
        setPollDuration(pollData.pollDuration || 90);
        
        // Only update selectedProblemStatement if there's an active poll
        if (pollData.pollActive && pollData.pollProblemStatement) {
          setSelectedProblemStatement(pollData.pollProblemStatement);
        }
        
        // Update team with poll data
        if (currentTeam) {
          setCurrentTeam(prev => ({
            ...prev,
            pollActive: pollData.pollActive,
            pollStartTime: pollData.pollStartTime,
            pollEndTime: pollData.pollEndTime,
            pollDuration: pollData.pollDuration,
            pollProblemStatement: pollData.pollProblemStatement,
            problemStatementVotes: pollData.problemStatementVotes || {},
            problemStatementVoteCount: pollData.problemStatementVoteCount || {}
          }));
        }
      }
    } catch (error) {
      console.error('Error loading poll status:', error);
    } finally {
      setLoadingPollStatus(false);
    }
  };

  // Vote on problem statement
  const voteOnProblemStatement = async (problemStatementId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`${baseURL}/team-polling/vote-problem-statement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId: currentTeam._id,
          problemStatementId,
          hackathonId: hackathon._id
        })
      });

      if (response.ok) {
        toast.success('Vote recorded successfully!');
        // Reload poll status to get updated vote counts
        await loadPollStatus();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to record vote');
      }
    } catch (error) {
      console.error('Error voting on problem statement:', error);
      toast.error('Failed to record vote');
    }
  };

  // Conclude poll function
  const concludePoll = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to conclude the poll?\n\n' +
      'This will end the voting process and select the problem statement with the most votes.\n' +
      'This action cannot be undone.\n\n' +
      'Do you want to proceed?'
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
      
      const response = await fetch(`${baseURL}/team-polling/conclude-poll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId: currentTeam._id
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Poll concluded! Selected: ${result.winningProblemStatement || 'No votes received'}`);
        
        // Reload poll status to get updated state
        await loadPollStatus();
        
        // Close the poll modal if open
        setShowPollModal(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to conclude poll');
      }
    } catch (error) {
      console.error('Error concluding poll:', error);
      toast.error('Failed to conclude poll');
    }
  };

  // Load poll results
  const loadPollResults = async () => {
    try {
      const response = await fetch(`${baseURL}/team-polling/poll-results/${currentTeam._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPollResults(data.results || {});
      }
    } catch (error) {
      console.error('Error loading poll results:', error);
    }
  };

  // End poll and select problem statement
  const endPollAndSelectProblem = async (problemStatementId) => {
    try {
      const response = await fetch(`${baseURL}/team-polling/select-problem-statement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          teamId: currentTeam._id,
          problemStatementId,
          hackathonId: hackathon._id
        })
      });

      if (response.ok) {
        setPollActive(false);
        setShowPollModal(false);
        setSelectedProblemStatement(problemStatementId);
        toast.success('Problem statement selected successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to select problem statement');
      }
    } catch (error) {
      console.error('Error selecting problem statement:', error);
      toast.error('Failed to select problem statement');
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
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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

    if (sentInvitations.has(participantId)) {
      toast.info('Invitation already sent to this participant.');
      return;
    }

    setInvitationLoading(prev => new Set([...prev, participantId]));

    try {
      const response = await fetch(`${baseURL}/participant-team/send-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
      const res = await fetch(`${baseURL}/participant-team/respond-request/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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

        {/* Problem Statement Poll Modal */}
        {showPollModal && (
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
                  Problem Statement Poll
                </h2>
                <button
                  onClick={() => setShowPollModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Poll Duration Configuration (only for team leaders before poll starts) */}
              {!pollActive && currentTeam?.teamLeader?._id === userId && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: themeConfig.accentColor + '10' }}>
                  <h3 className="font-semibold mb-3" style={{ color: themeConfig.textColor }}>
                    Configure Poll Duration
                  </h3>
                  <div className="flex items-center space-x-4">
                    <label className="text-sm" style={{ color: themeConfig.textColor }}>
                      Duration:
                    </label>
                    <select
                      value={pollDuration}
                      onChange={(e) => setPollDuration(parseInt(e.target.value))}
                      className="px-3 py-2 rounded-lg border"
                      style={{
                        backgroundColor: themeConfig.backgroundColor,
                        borderColor: themeConfig.borderColor,
                        color: themeConfig.textColor
                      }}
                    >
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                    <button
                      onClick={startProblemStatementPoll}
                      className="px-4 py-2 rounded-lg transition"
                      style={{ 
                        backgroundColor: themeConfig.accentColor,
                        color: 'white'
                      }}
                    >
                      Start Poll
                    </button>
                  </div>
                </div>
              )}

              {/* Poll Timer Display */}
              {pollActive && timeLeft && (
                <div className="mb-6 p-4 rounded-lg text-center" style={{ backgroundColor: timeLeft.expired ? '#ef4444' + '20' : themeConfig.accentColor + '10' }}>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="w-5 h-5" style={{ color: timeLeft.expired ? '#ef4444' : themeConfig.accentColor }} />
                    <span className="font-semibold" style={{ color: timeLeft.expired ? '#ef4444' : themeConfig.textColor }}>
                      {timeLeft.expired ? 'Poll Ended' : 'Time Remaining'}
                    </span>
                  </div>
                  {!timeLeft.expired && (
                    <div className="text-2xl font-mono" style={{ color: themeConfig.textColor }}>
                      {timeLeft.hours.toString().padStart(2, '0')}:
                      {timeLeft.minutes.toString().padStart(2, '0')}:
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {problemStatements.map((problem, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: themeConfig.backgroundColor,
                      borderColor: themeConfig.borderColor
                    }}
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
                        {pollResults[problem.track] && (
                          <div className="mt-2">
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="w-4 h-4" style={{ color: themeConfig.accentColor }} />
                              <span 
                                className="text-sm"
                                style={{ color: themeConfig.textColor }}
                              >
                                {pollResults[problem.track]} votes
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => voteOnProblemStatement(problem.track)}
                          className="px-4 py-2 rounded-lg transition"
                          style={{ 
                            backgroundColor: themeConfig.accentColor,
                            color: 'white'
                          }}
                        >
                          <Vote className="w-4 h-4" />
                        </button>
                        {currentTeam?.teamLeader?._id === userId && (
                          <button
                            onClick={() => endPollAndSelectProblem(problem.track)}
                            className="px-4 py-2 rounded-lg transition border"
                            style={{ 
                              borderColor: themeConfig.accentColor,
                              color: themeConfig.accentColor
                            }}
                          >
                            <Target className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {currentTeam?.teamLeader?._id === userId && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowPollModal(false)}
                    className="px-6 py-2 rounded-lg transition"
                    style={{ 
                      backgroundColor: themeConfig.accentColor,
                      color: 'white'
                    }}
                  >
                    Close Poll
                  </button>
                </div>
              )}
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

                {/* Submission Interface */}
                {(currentTeam.teamLeader?._id === userId || currentTeam.teamMembers.find(m => m._id === userId)?.role === 'leader') ? (
                  <div className="border-t pt-4" style={{ borderColor: '#22c55e' }}>
                    <h4 className="font-medium mb-2" style={{ color: '#166534' }}>
                      Team Leader Submission Interface
                    </h4>
                    <p className="text-sm mb-3" style={{ color: '#166534', opacity: 0.8 }}>
                      Once your team is ready, you can submit your project solution. This is a final submission that cannot be changed.
                    </p>
                    <button 
                      className="px-4 py-2 rounded-lg font-medium transition"
                      style={{ 
                        backgroundColor: '#22c55e',
                        color: 'white'
                      }}
                      onClick={() => {
                        toast.info('Submission interface will be available during the submission window');
                      }}
                    >
                      Submit Project (Available During Submission Window)
                    </button>
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

            {/* Active Poll Section (Visible to All Team Members) */}
            {pollActive && (
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
                        onClick={() => voteOnProblemStatement(problem._id || problem.track)}
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
                <p>• <strong>Problem Statement Selection:</strong> Only the team leader can initiate and manage polls for problem selection.</p>
                <p>• <strong>Voting:</strong> All team members can vote during active polls to help choose the problem statement.</p>
                <p>• <strong>Final Submission:</strong> Only the team leader can submit the final project for the team.</p>
                <p>• <strong>Communication:</strong> Stay coordinated with your team leader for all major decisions.</p>
                <p>• <strong>Poll Duration:</strong> Polls run for 1-2 hours as configured by the team leader.</p>
                <p>• <strong>Problem Locking:</strong> Once a problem is selected, it cannot be changed.</p>
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
                  <button
                    onClick={() => setShowPollModal(true)}
                    className="px-6 py-3 rounded-lg transition-all hover:shadow-lg flex items-center gap-2 font-medium"
                    style={{ 
                      backgroundColor: '#f59e0b',
                      color: 'white'
                    }}
                  >
                    <Vote className="w-5 h-5" />
                    {pollActive ? 'View Poll Progress' : 'Start Problem Statement Poll'}
                  </button>
                  
                  {pollActive && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#fbbf24' }}>
                      <Clock className="w-4 h-4" style={{ color: '#92400e' }} />
                      <span className="text-sm font-medium" style={{ color: '#92400e' }}>
                        Poll Active
                      </span>
                    </div>
                  )}
                </div>
                
                {problemStatements.length === 0 && (
                  <p className="text-sm mt-2" style={{ color: '#92400e', opacity: 0.7 }}>
                    No problem statements available for this hackathon.
                  </p>
                )}
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
                  ...(role !== 'admin' ? [{ id: 'create', label: 'Create Team', icon: Plus }] : []),
                  { id: 'invitations', label: 'Invitations', icon: Mail }
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
                              onClick={() => setShowPollModal(true)}
                              className="px-4 py-2 rounded-lg transition"
                              style={{ 
                                backgroundColor: themeConfig.accentColor,
                                color: 'white'
                              }}
                            >
                              {pollActive ? 'View Poll Progress' : 'Start Problem Statement Poll'}
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
                            disabled={sentInvitations.has(participant._id) || invitationLoading.has(participant._id)}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition disabled:opacity-50"
                            style={{ 
                              backgroundColor: sentInvitations.has(participant._id) ? '#10b981' : themeConfig.accentColor,
                              color: 'white'
                            }}
                          >
                            {sentInvitations.has(participant._id) ? 'Invited' : 
                             invitationLoading.has(participant._id) ? 'Sending...' : 'Invite'}
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
                          <th className="text-left py-3 px-4" style={{ color: themeConfig.textColor }}>
                            Actions
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
                            <td className="py-3 px-4">
                              {/* Show invite button for team leaders and available participants */}
                              {currentTeam && 
                               (currentTeam.createdBy?._id === userId || currentTeam.teamLeader?._id === userId) &&
                               !participant.currentTeamId && 
                               participant._id !== userId && (
                                <button
                                  onClick={() => sendInvitation(participant._id)}
                                  disabled={sentInvitations.has(participant._id) || invitationLoading.has(participant._id)}
                                  className="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:opacity-80 disabled:opacity-50"
                                  style={{
                                    backgroundColor: sentInvitations.has(participant._id) ? '#10b981' : themeConfig.accentColor,
                                    color: 'white'
                                  }}
                                >
                                  {sentInvitations.has(participant._id) ? 'Invited' : 
                                   invitationLoading.has(participant._id) ? 'Sending...' : 'Invite'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Invitations Tab */}
              {activeTab === 'invitations' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: themeConfig.textColor }}>
                    Team Invitations
                  </h3>
                  
                  {teamRequests.filter(request => 
                    request.toUserId === userId && request.requestType === 'invite'
                  ).length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 mx-auto mb-4" style={{ color: themeConfig.textColor, opacity: 0.5 }} />
                      <p className="text-lg font-medium mb-2" style={{ color: themeConfig.textColor }}>
                        No Invitations
                      </p>
                      <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                        You don't have any pending team invitations.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamRequests
                        .filter(request => request.toUserId === userId && request.requestType === 'invite')
                        .map((invitation) => (
                          <div 
                            key={invitation._id}
                            className="p-4 rounded-lg border"
                            style={{ 
                              backgroundColor: themeConfig.backgroundColor,
                              borderColor: themeConfig.borderColor
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold" style={{ color: themeConfig.textColor }}>
                                  Team Invitation
                                </h4>
                                <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                                  {invitation.message || 'You are invited to join a team!'}
                                </p>
                                <p className="text-xs" style={{ color: themeConfig.textColor, opacity: 0.5 }}>
                                  Sent {new Date(invitation.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => respondToInvitation(invitation._id, 'accepted')}
                                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                  style={{
                                    backgroundColor: '#10b981',
                                    color: 'white'
                                  }}
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => respondToInvitation(invitation._id, 'rejected')}
                                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                  style={{
                                    backgroundColor: '#ef4444',
                                    color: 'white'
                                  }}
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
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

        {/* Poll Modal */}
        {showPollModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              style={{ backgroundColor: themeConfig.cardBg }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: themeConfig.textColor }}>
                  <Vote className="w-5 h-5" style={{ color: themeConfig.accentColor }} />
                  Problem Statement Poll
                </h3>
                <button
                  onClick={() => setShowPollModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!pollActive ? (
                <div>
                  <p className="mb-4" style={{ color: themeConfig.textColor }}>
                    Select problem statements for your team to vote on, then configure the poll duration.
                  </p>
                  
                  {/* Problem Statement Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textColor }}>
                      Available Problem Statements
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {problemStatements.map((problem, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedProblemStatement === problem.track ? 'ring-2 ring-blue-500' : ''
                          }`}
                          style={{ 
                            backgroundColor: selectedProblemStatement === problem.track ? '#dbeafe' : themeConfig.backgroundColor,
                            borderColor: selectedProblemStatement === problem.track ? '#3b82f6' : themeConfig.borderColor
                          }}
                          onClick={() => setSelectedProblemStatement(problem.track)}
                        >
                          <h4 className="font-medium mb-1" style={{ color: themeConfig.textColor }}>
                            {problem.track}
                          </h4>
                          <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                            {problem.description?.substring(0, 80)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textColor }}>
                      Poll Duration
                    </label>
                    <select
                      value={pollDuration}
                      onChange={(e) => setPollDuration(parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg"
                      style={{ 
                        backgroundColor: themeConfig.backgroundColor,
                        borderColor: themeConfig.borderColor,
                        color: themeConfig.textColor
                      }}
                    >
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    {!selectedProblemStatement && (
                      <div className="w-full text-center py-2 px-4 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm">
                        ⚠️ Please select a problem statement above to enable the Start Poll button
                      </div>
                    )}
                    <button
                      onClick={async () => {
                        if (!selectedProblemStatement) {
                          toast.error('Please select a problem statement first');
                          return;
                        }
                        
                        try {
                          const token = localStorage.getItem('authToken');
                          if (!token) {
                            toast.error('Authentication token not found. Please log in again.');
                            return;
                          }
                          const response = await fetch(`${baseURL}/team-polling/start-poll`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              teamId: currentTeam._id,
                              problemStatementId: selectedProblemStatement,
                              duration: pollDuration
                            })
                          });

                          if (response.ok) {
                            const result = await response.json();
                            setPollActive(true);
                            setPollStartTime(new Date(result.pollStartTime));
                            setPollEndTime(new Date(result.pollEndTime));
                            setShowPollModal(false);
                            toast.success(`Poll started for "${selectedProblemStatement}"! Duration: ${pollDuration} minutes. Team members can now vote.`);
                            
                            // Reload poll status to sync with backend
                            setTimeout(() => loadPollStatus(), 1000);
                          } else {
                            const error = await response.json();
                            toast.error(error.message || 'Failed to start poll');
                          }
                        } catch (error) {
                          console.error('Error starting poll:', error);
                          toast.error('Failed to start poll');
                        }
                      }}
                      disabled={!selectedProblemStatement}
                      className="flex-1 py-2 px-4 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: selectedProblemStatement ? '#f59e0b' : '#9ca3af',
                        color: 'white'
                      }}
                    >
                      Start Poll
                    </button>
                    <button
                      onClick={() => setShowPollModal(false)}
                      className="flex-1 py-2 px-4 rounded-lg border font-medium transition"
                      style={{ 
                        backgroundColor: themeConfig.backgroundColor,
                        borderColor: themeConfig.borderColor,
                        color: themeConfig.textColor
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#fef3c7' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" style={{ color: '#92400e' }} />
                      <span className="font-medium" style={{ color: '#92400e' }}>
                        Poll Active
                      </span>
                    </div>
                    {timeLeft && !timeLeft.expired && (
                      <div className="text-lg font-mono" style={{ color: '#92400e' }}>
                        {timeLeft.hours.toString().padStart(2, '0')}:
                        {timeLeft.minutes.toString().padStart(2, '0')}:
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2" style={{ color: themeConfig.textColor }}>
                      Vote Results
                    </h4>
                    {Object.keys(pollResults).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(pollResults).map(([problemId, votes]) => (
                          <div key={problemId} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: themeConfig.backgroundColor }}>
                            <span style={{ color: themeConfig.textColor }}>{problemId}</span>
                            <span className="font-medium" style={{ color: themeConfig.accentColor }}>{votes} votes</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                        No votes yet
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setShowPollModal(false)}
                    className="w-full py-2 px-4 rounded-lg border font-medium transition"
                    style={{ 
                      backgroundColor: themeConfig.backgroundColor,
                      borderColor: themeConfig.borderColor,
                      color: themeConfig.textColor
                    }}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeam;
