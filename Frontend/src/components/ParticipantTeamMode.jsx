import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../context/AuthContextProvider';
import { useWebSocket } from '../context/WebSocketContextProvider';
import { useTheme } from '../context/ThemeContextProvider';
import TeamChat from './TeamChat';
import SubmissionTimer from './SubmissionTimer';
import { 
  Users, 
  Search, 
  UserPlus, 
  Crown, 
  MessageSquare,
  Eye,
  Plus,
  Check,
  X,
  Mail,
  Target,
  CheckCircle,
  Bell
} from 'lucide-react';
import { toast } from 'react-toastify';

const ParticipantTeamMode = ({ hackathon, userId, baseURL }) => {
  const { themeConfig } = useTheme();
  const { registerTeamUpdateCallback, registerProblemStatementCallback } = useWebSocket();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTeam, setCurrentTeam] = useState(null);
  const [hackathonParticipants, setHackathonParticipants] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [sentInvitations, setSentInvitations] = useState(new Set());
  const [invitationLoading, setInvitationLoading] = useState(new Set());
  const [problemStatements, setProblemStatements] = useState([]);
  const [selectedProblemStatement, setSelectedProblemStatement] = useState(null);
  const [showProblemSelectionModal, setShowProblemSelectionModal] = useState(false);
  const [submissionLink, setSubmissionLink] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [teamCreationData, setTeamCreationData] = useState({
    teamName: '',
    description: ''
  });

  // Load data on component mount
  useEffect(() => {
    if (hackathon && userId) {
      loadData();
    }
  }, [hackathon, userId]);

  // Load notification count
  useEffect(() => {
    loadNotificationCount();
  }, [teamRequests]);

  // WebSocket event listeners for real-time updates
  useEffect(() => {
    // Register team update callback
    const unregisterTeamUpdate = registerTeamUpdateCallback((update) => {
      console.log('🔄 Team update received in ParticipantTeamMode, refreshing data...');
      loadData(); // Refresh all team data
    });

    // Register problem statement callback
    const unregisterProblemStatement = registerProblemStatementCallback((update) => {
      console.log('Problem statement update received in ParticipantTeamMode, refreshing data...');
      loadData(); // Refresh all team data
    });

    // Cleanup on unmount
    return () => {
      unregisterTeamUpdate();
      unregisterProblemStatement();
    };
  }, [registerTeamUpdateCallback, registerProblemStatementCallback]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCurrentTeam(),
        loadHackathonParticipants(),
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
      if (!token) return;

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
        
        if (userTeam && userTeam.selectedProblemStatement) {
          // Fetch full problem details if a problem is selected
          try {
            const problemResponse = await fetch(`${baseURL}/hackathons/problems/${hackathon._id}`);
            if (problemResponse.ok) {
              const problemData = await problemResponse.json();
              const selectedProblem = problemData.problemStatements?.find(
                p => p.track === userTeam.selectedProblemStatement
              );
              if (selectedProblem) {
                userTeam.selectedProblemDetails = selectedProblem;
              }
            }
          } catch (error) {
            console.error('Error fetching problem details:', error);
          }
        }
        
        setCurrentTeam(userTeam || null);
        if (userTeam?.selectedProblemStatement) {
          setSelectedProblemStatement(userTeam.selectedProblemStatement);
        }
      }
    } catch (error) {
      console.error('Error loading current team:', error);
    }
  };

  const loadHackathonParticipants = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) return;

      const response = await fetch(`${baseURL}/participant-team/participants/${hackathon._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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

  const loadTeamRequests = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userId');
      if (!token) return;

      const response = await fetch(`${baseURL}/participant-team/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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

  const loadProblemStatements = async () => {
    try {
      if (hackathon?.problemStatements) {
        setProblemStatements(hackathon.problemStatements);
      }
    } catch (error) {
      console.error('Error loading problem statements:', error);
    }
  };

  const loadNotificationCount = () => {
    const pendingInvitations = teamRequests.filter(request => 
      request.toUserId === userId && 
      request.requestType === 'invite' && 
      request.status === 'pending'
    ).length;
    setNotificationCount(pendingInvitations);
  };

  // Select problem statement (team leader only)
  const selectProblemStatement = async (problemStatement) => {
    const confirmed = window.confirm(
      `Are you sure you want to select "${problemStatement.track}"?\n\n` +
      `This will be your team's final problem statement and cannot be changed.\n\n` +
      `Do you want to proceed?`
    );

    if (!confirmed) return;

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
        setSelectedProblemStatement(problemStatement);
        setShowProblemSelectionModal(false);
        
        setCurrentTeam(prev => ({
          ...prev,
          selectedProblemStatement: problemStatement.track,
          selectedProblemDetails: problemStatement
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

    if (!confirmed) return;

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

  // Send invitation
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

  // Create team
  const createTeam = async () => {
    if (!teamCreationData.teamName.trim()) {
      toast.error('Please enter a team name');
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
          teamName: teamCreationData.teamName.trim(),
          description: teamCreationData.description.trim(),
          hackathonId: hackathon._id,
          memberLimit: 4
        })
      });

      if (response.ok) {
        toast.success('Team created successfully!');
        setTeamCreationData({ teamName: '', description: '' });
        await loadData(); // Reload data to show the new team
        setActiveTab('overview'); // Switch to overview tab
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  // Respond to invitation
  const respondToInvitation = async (requestId, response) => {
    try {
      const token = localStorage.getItem('authToken') || userId;
      
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
          toast.success('Invitation accepted! You are now part of the team!');
          setActiveTab('overview');
          // Reload data to show updated team
          await loadData();
        } else {
          toast.success('Invitation declined successfully.');
        }
        // Reload data to update team status
        await loadData();
      } else {
        const error = await res.json();
        toast.error(error.message || `Failed to ${response} invitation`);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error(`Failed to ${response} invitation`);
    }
  };

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
        {/* Header - Removed to avoid duplication with parent component */}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 rounded-lg p-1" style={{ backgroundColor: themeConfig.cardBg }}>
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'members', label: 'Show Members', icon: Eye },
              { id: 'join-create', label: 'Join/Create Team', icon: UserPlus }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasNotifications = tab.id === 'members' && notificationCount > 0;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all relative ${
                    isActive ? 'shadow-sm' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? themeConfig.accentColor : 'transparent',
                    color: isActive ? 'white' : themeConfig.textColor
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {hasNotifications && (
                    <div 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      {notificationCount}
                    </div>
                  )}
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
          {/* Overview Tab - Exactly like admin team mode */}
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
                    {currentTeam.teamMembers.map((member) => {
                      const isLeader = currentTeam.teamLeader?._id === member._id || 
                                      currentTeam.createdBy?._id === member._id ||
                                      member.role === 'leader';
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
                        <h4 className="font-medium mb-2" style={{ color: '#166534' }}>
                          {currentTeam.selectedProblemStatement}
                        </h4>
                        {currentTeam.selectedProblemDetails && (
                          <div className="space-y-2">
                            {currentTeam.selectedProblemDetails.description && (
                              <div>
                                <span className="font-medium text-sm" style={{ color: '#166534' }}>Description:</span>
                                <p className="text-sm mt-1" style={{ color: '#166534', opacity: 0.8 }}>
                                  {currentTeam.selectedProblemDetails.description}
                                </p>
                              </div>
                            )}
                            {currentTeam.selectedProblemDetails.difficulty && (
                              <div>
                                <span className="font-medium text-sm" style={{ color: '#166534' }}>Difficulty:</span>
                                <span className="text-sm ml-2" style={{ color: '#166534', opacity: 0.8 }}>
                                  {currentTeam.selectedProblemDetails.difficulty}
                                </span>
                              </div>
                            )}
                            {currentTeam.selectedProblemDetails.link && (
                              <div>
                                <span className="font-medium text-sm" style={{ color: '#166534' }}>Resources:</span>
                                <a 
                                  href={currentTeam.selectedProblemDetails.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm ml-2 underline" 
                                  style={{ color: '#22c55e' }}
                                >
                                  View Full Problem Statement
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-sm mt-3" style={{ color: '#166534', opacity: 0.7 }}>
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
                      {(currentTeam.teamLeader?._id === userId || currentTeam.createdBy?._id === userId) ? (
                        <div className="border-t pt-4" style={{ borderColor: '#22c55e' }}>
                          <h4 className="font-medium mb-2" style={{ color: '#166534' }}>
                            Project Submission
                          </h4>
                          <p className="text-sm mb-3" style={{ color: '#166534', opacity: 0.8 }}>
                            Once your team is ready, you can submit your project solution. This is a final submission that cannot be changed.
                          </p>
                          
                          {/* Submission Timer */}
                          <div className="mb-4">
                            <SubmissionTimer hackathon={hackathon} userRole="leader" />
                          </div>
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
                          <h4 className="font-medium mb-2" style={{ color: '#166534' }}>
                            Project Submission
                          </h4>
                          <p className="text-sm mb-3" style={{ color: '#166534', opacity: 0.8 }}>
                            <strong>Note:</strong> Only your team leader can submit the final project. Stay coordinated with them for submission timing.
                          </p>
                          
                          {/* Submission Timer for Team Members */}
                          <div className="mb-4">
                            <SubmissionTimer hackathon={hackathon} userRole="member" />
                          </div>
                        </div>
                      )}
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
                        {(currentTeam.teamLeader?._id === userId || currentTeam.createdBy?._id === userId) ? (
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
                  {(currentTeam.teamLeader?._id === userId || currentTeam.createdBy?._id === userId) && (
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
                      onClick={() => setActiveTab('join-create')}
                      className="px-6 py-2 rounded-lg transition"
                      style={{ 
                        backgroundColor: themeConfig.accentColor,
                        color: 'white'
                      }}
                    >
                      Join Team
                    </button>
                    <button
                      onClick={() => setActiveTab('join-create')}
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

          {/* Show Members Tab - For sending invitations */}
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
                          {/* Show invite button for team leaders only and available participants */}
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

          {/* Join/Create Team Tab */}
          {activeTab === 'join-create' && (
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: themeConfig.textColor }}>
                Join or Create Team
              </h3>
              
              {!currentTeam ? (
                <div className="space-y-6">
                  {/* Create Team Section - Only show for participant team selection */}
                  {hackathon?.teamCreationMode === 'participant' && (
                    <div className="p-6 rounded-lg border" style={{ 
                      backgroundColor: themeConfig.backgroundColor,
                      borderColor: themeConfig.borderColor
                    }}>
                      <h4 className="text-lg font-semibold mb-4" style={{ color: themeConfig.textColor }}>
                        Create New Team
                      </h4>
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
                    </div>
                  )}

                  {/* Admin Team Selection Message */}
                  {hackathon?.teamCreationMode === 'admin' && (
                    <div className="p-6 rounded-lg border" style={{ 
                      backgroundColor: '#fef3c7',
                      borderColor: '#f59e0b'
                    }}>
                      <h4 className="text-lg font-semibold mb-4" style={{ color: '#92400e' }}>
                        Admin Team Selection
                      </h4>
                      <p className="text-sm" style={{ color: '#92400e' }}>
                        This hackathon uses admin-based team selection. Teams will be created and managed by administrators.
                        You cannot create teams yourself.
                      </p>
                    </div>
                  )}

                  {/* Join Team Section */}
                  <div className="p-6 rounded-lg border" style={{ 
                    backgroundColor: themeConfig.backgroundColor,
                    borderColor: themeConfig.borderColor
                  }}>
                    <h4 className="text-lg font-semibold mb-4" style={{ color: themeConfig.textColor }}>
                      Join Existing Teams
                    </h4>
                    <div className="space-y-4">
                      <p className="text-sm" style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                        No teams available to join at the moment.
                      </p>
                    </div>
                  </div>
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
      </div>
    </div>
  );
};

export default ParticipantTeamMode;
