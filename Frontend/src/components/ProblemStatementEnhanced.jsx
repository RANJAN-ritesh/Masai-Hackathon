import React, { useState, useEffect, useContext } from "react";
import { 
  Code, 
  Database, 
  TestTube, 
  ChevronRight, 
  X, 
  Clock, 
  Vote, 
  CheckCircle, 
  Upload, 
  Users, 
  AlertTriangle,
  Lock,
  Timer,
  Send
} from "lucide-react";
import { toast } from "react-toastify";
import { MyContext } from "../context/AuthContextProvider";
import { useTheme } from "../context/ThemeContextProvider";

const ProblemStatementEnhanced = ({ hackathonData, themeConfig }) => {
  const { userData, hackathon } = useContext(MyContext);
  const { isDarkMode } = useTheme();
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Selection system state
  const [selectionWindow, setSelectionWindow] = useState(null);
  const [teamSelection, setTeamSelection] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  
  // Poll system state
  const [activePolls, setActivePolls] = useState([]);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  
  // Submission system state
  const [submissionWindow, setSubmissionWindow] = useState(null);
  const [teamSubmission, setTeamSubmission] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    url: '',
    title: '',
    description: ''
  });

  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (hackathonData && userId) {
      loadUserTeam();
      loadSelectionWindow();
      loadSubmissionWindow();
    }
  }, [hackathonData, userId]);

  useEffect(() => {
    if (userTeam && hackathonData) {
      loadTeamSelection();
      loadTeamPolls();
      loadTeamSubmission();
    }
  }, [userTeam, hackathonData]);

  // Timer for selection window
  useEffect(() => {
    if (!selectionWindow?.isSelectionActive) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(selectionWindow.selectionEnd).getTime();
      const timeLeft = endTime - now;
      
      if (timeLeft <= 0) {
        setSelectionWindow(prev => ({ ...prev, isSelectionActive: false }));
        loadTeamSelection(); // Refresh to see if random assignment happened
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectionWindow]);

  // Timer for submission window
  useEffect(() => {
    if (!submissionWindow?.isSubmissionActive) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(submissionWindow.submissionEnd).getTime();
      const timeLeft = endTime - now;
      
      if (timeLeft <= 0) {
        setSubmissionWindow(prev => ({ ...prev, isSubmissionActive: false }));
        toast.error("Submission window has closed!");
      } else {
        // Check for alerts
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hoursLeft === 6 && minutesLeft === 0) {
          toast.warning("⏰ 6 hours left to submit your solution!");
        } else if (hoursLeft === 1 && minutesLeft === 0) {
          toast.warning("🚨 1 hour left to submit your solution!");
        } else if (minutesLeft === 10) {
          toast.error("🚨 URGENT: 10 minutes left to submit!");
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [submissionWindow]);

  const loadUserTeam = async () => {
    try {
      const response = await fetch(`${baseURL}/team/hackathon/${hackathonData._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Find user's team (same logic as SelectTeamPage)
        const foundTeam = data.teams?.find(team => {
          const isMember = team.teamMembers?.some(member => {
            const memberId = typeof member === 'object' ? member._id : member;
            return memberId === userId;
          });
          
          const isCreator = team.createdBy === userId || 
                           (typeof team.createdBy === 'object' && team.createdBy._id === userId);
          
          return isMember || isCreator;
        });

        setUserTeam(foundTeam);
      }
    } catch (error) {
      console.error('Error loading user team:', error);
    }
  };

  const loadSelectionWindow = async () => {
    try {
      const response = await fetch(`${baseURL}/problemstatement/selection-window/${hackathonData._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectionWindow(data);
      }
    } catch (error) {
      console.error('Error loading selection window:', error);
    }
  };

  const loadTeamSelection = async () => {
    if (!userTeam) return;

    try {
      const response = await fetch(`${baseURL}/problemstatement/team-selection/${userTeam._id}/${hackathonData._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeamSelection(data.selection);
      }
    } catch (error) {
      console.error('Error loading team selection:', error);
    }
  };

  const loadTeamPolls = async () => {
    if (!userTeam) return;

    try {
      const response = await fetch(`${baseURL}/problemstatement/team-polls/${userTeam._id}/${hackathonData._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivePolls(data.polls || []);
      }
    } catch (error) {
      console.error('Error loading team polls:', error);
    }
  };

  const loadSubmissionWindow = async () => {
    try {
      const response = await fetch(`${baseURL}/problemstatement/submission-window/${hackathonData._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissionWindow(data);
      }
    } catch (error) {
      console.error('Error loading submission window:', error);
    }
  };

  const loadTeamSubmission = async () => {
    if (!userTeam) return;

    try {
      const response = await fetch(`${baseURL}/problemstatement/team-submission/${userTeam._id}/${hackathonData._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeamSubmission(data.submission);
      }
    } catch (error) {
      console.error('Error loading team submission:', error);
    }
  };

  const handleSelectProblem = async (problemId) => {
    if (!userTeam || teamSelection?.isLocked) return;

    try {
      const response = await fetch(`${baseURL}/problemstatement/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          teamId: userTeam._id,
          hackathonId: hackathonData._id,
          problemId
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Problem statement selected successfully!");
        loadTeamSelection();
        closeModal();
      } else {
        toast.error(data.message || "Failed to select problem statement");
      }
    } catch (error) {
      console.error('Error selecting problem:', error);
      toast.error("Failed to select problem statement");
    }
  };

  const handleCreatePoll = async (selectedProblems) => {
    if (!userTeam) return;

    try {
      const response = await fetch(`${baseURL}/problemstatement/create-poll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          teamId: userTeam._id,
          hackathonId: hackathonData._id,
          problemOptions: selectedProblems
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Poll created successfully! Team members will be notified.");
        loadTeamPolls();
        setShowCreatePollModal(false);
      } else {
        toast.error(data.message || "Failed to create poll");
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error("Failed to create poll");
    }
  };

  const handleVoteOnPoll = async (pollId, problemId) => {
    try {
      const response = await fetch(`${baseURL}/problemstatement/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ pollId, problemId })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Vote recorded successfully!");
        loadTeamPolls();
      } else {
        toast.error(data.message || "Failed to vote");
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error("Failed to vote");
    }
  };

  const handleSubmitSolution = async () => {
    if (!userTeam || !submissionForm.url.trim()) return;

    // Confirmation popup
    const confirmed = window.confirm(
      "⚠️ FINAL SUBMISSION CONFIRMATION\n\n" +
      "This is your ONE AND ONLY submission opportunity!\n\n" +
      `URL: ${submissionForm.url}\n` +
      `Title: ${submissionForm.title || 'No title'}\n\n` +
      "Once you submit, you CANNOT change or resubmit.\n\n" +
      "Are you absolutely sure you want to submit this solution?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${baseURL}/problemstatement/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          teamId: userTeam._id,
          hackathonId: hackathonData._id,
          submissionUrl: submissionForm.url,
          title: submissionForm.title,
          description: submissionForm.description
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("🎉 Solution submitted successfully!");
        if (!data.urlValid) {
          toast.warning("⚠️ URL validation failed, but submission recorded");
        }
        loadTeamSubmission();
        setShowSubmissionModal(false);
        setSubmissionForm({ url: '', title: '', description: '' });
      } else {
        toast.error(data.message || "Failed to submit solution");
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast.error("Failed to submit solution");
    }
  };

  const formatTimeLeft = (timeLeft) => {
    if (!timeLeft) return "Loading...";
    if (timeLeft.expired) return "Expired";
    return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
  };

  const getSelectionTimeLeft = () => {
    if (!selectionWindow?.isSelectionActive) return null;
    
    const now = new Date().getTime();
    const endTime = new Date(selectionWindow.selectionEnd).getTime();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) return { expired: true };
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, expired: false };
  };

  const getSubmissionTimeLeft = () => {
    if (!submissionWindow?.isSubmissionActive) return null;
    
    const now = new Date().getTime();
    const endTime = new Date(submissionWindow.submissionEnd).getTime();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) return { expired: true };
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, expired: false };
  };

  const isTeamLeader = userTeam && (
    userTeam.createdBy === userId || 
    (typeof userTeam.createdBy === 'object' && userTeam.createdBy._id === userId)
  );

  if (!hackathonData) return null;

  const selectionTimeLeft = getSelectionTimeLeft();
  const submissionTimeLeft = getSubmissionTimeLeft();

  return (
    <>
      <div className="lg:col-span-2 theme-card rounded-xl p-6 shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: themeConfig.textColor }}
          >
            Problem Statements
          </h2>
          
          {/* Status Indicators */}
          <div className="flex gap-2">
            {selectionWindow?.isSelectionActive && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800">
                <Clock size={16} />
                <span className="text-sm font-medium">
                  Selection: {selectionTimeLeft ? 
                    `${selectionTimeLeft.days}d ${selectionTimeLeft.hours}h ${selectionTimeLeft.minutes}m` : 
                    'Loading...'
                  }
                </span>
              </div>
            )}
            
            {submissionWindow?.isSubmissionActive && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                <Upload size={16} />
                <span className="text-sm font-medium">
                  Submit: {submissionTimeLeft ? 
                    `${submissionTimeLeft.days}d ${submissionTimeLeft.hours}h ${submissionTimeLeft.minutes}m` : 
                    'Loading...'
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Team Selection Status */}
        {userTeam && (
          <div className="mb-6 p-4 rounded-lg border" style={{ 
            borderColor: themeConfig.borderColor,
            backgroundColor: teamSelection?.isLocked ? '#f0f9ff' : '#fef3c7'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg" style={{ color: themeConfig.textColor }}>
                  Team: {userTeam.teamName}
                </h3>
                {teamSelection?.selectedProblemId ? (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <span style={{ color: themeConfig.textColor }}>
                      Selected: {teamSelection.selectedProblemId.title}
                    </span>
                    {teamSelection.isLocked && <Lock size={16} className="text-gray-500" />}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertTriangle size={20} className="text-yellow-600" />
                    <span style={{ color: themeConfig.textColor }}>
                      No problem statement selected
                    </span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                {isTeamLeader && selectionWindow?.isSelectionActive && !teamSelection?.isLocked && (
                  <button
                    onClick={() => setShowCreatePollModal(true)}
                    className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2"
                    style={{ backgroundColor: themeConfig.accentColor }}
                  >
                    <Vote size={16} />
                    Create Poll
                  </button>
                )}
                
                {submissionWindow?.isSubmissionActive && !teamSubmission && (
                  <button
                    onClick={() => setShowSubmissionModal(true)}
                    className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    <Send size={16} />
                    Submit Solution
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Polls */}
        {activePolls.length > 0 && (
          <div className="mb-6">
            {activePolls.map(poll => (
              <div key={poll._id} className="mb-4 p-4 rounded-lg border-2 border-blue-300 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-blue-800">
                    🗳️ {poll.title}
                  </h4>
                  <div className="text-sm text-blue-600">
                    {poll.status === 'active' ? (
                      <span className="flex items-center gap-1">
                        <Timer size={14} />
                        Expires: {new Date(poll.expiresAt).toLocaleTimeString()}
                      </span>
                    ) : (
                      <span>Completed</span>
                    )}
                  </div>
                </div>
                
                <p className="text-blue-700 mb-3">{poll.description}</p>
                
                {poll.status === 'active' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {poll.problemOptions.map(problem => (
                      <button
                        key={problem._id}
                        onClick={() => handleVoteOnPoll(poll._id, problem._id)}
                        className="p-3 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition text-left"
                      >
                        <div className="font-medium text-blue-800">{problem.title}</div>
                        <div className="text-sm text-blue-600">{problem.track}</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {poll.status === 'completed' && poll.winningProblemId && (
                  <div className="p-3 rounded-lg bg-green-100 border border-green-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="font-medium text-green-800">
                        Winner: {poll.winningProblemId.title}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Submission Status */}
        {teamSubmission && (
          <div className="mb-6 p-4 rounded-lg border bg-green-50 border-green-300">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-green-600" />
              <h3 className="font-semibold text-green-800">Solution Submitted</h3>
            </div>
            <p className="text-green-700">
              <strong>URL:</strong> <a href={teamSubmission.submissionUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {teamSubmission.submissionUrl}
              </a>
            </p>
            {teamSubmission.submissionTitle && (
              <p className="text-green-700">
                <strong>Title:</strong> {teamSubmission.submissionTitle}
              </p>
            )}
            <p className="text-sm text-green-600 mt-2">
              Submitted by {teamSubmission.submittedBy?.name} on {new Date(teamSubmission.submittedAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Problem Statements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hackathonData?.problemStatements?.length > 0 ? (
            hackathonData.problemStatements.map((problem, index) => {
              const isSelected = teamSelection?.selectedProblemId?._id === problem._id;
              const canSelect = selectionWindow?.isSelectionActive && !teamSelection?.isLocked && userTeam;
              
              return (
                <div
                  key={index}
                  className={`p-6 rounded-lg border transition transform hover:-translate-y-1 ${
                    isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  } ${canSelect ? 'cursor-pointer hover:shadow-md' : ''}`}
                  onClick={() => canSelect && openModal(problem)}
                  style={{
                    backgroundColor: isSelected ? '#f0f9ff' : themeConfig.cardBg,
                    borderColor: isSelected ? '#10b981' : themeConfig.borderColor
                  }}
                >
                  <div 
                    className="p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4"
                    style={{ backgroundColor: themeConfig.accentColor }}
                  >
                    {problem.track?.toLowerCase().includes('frontend') ? (
                      <Code size={24} className="text-white" />
                    ) : problem.track?.toLowerCase().includes('data') ? (
                      <Database size={24} className="text-white" />
                    ) : (
                      <TestTube size={24} className="text-white" />
                    )}
                  </div>
                  
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ color: themeConfig.textColor }}
                  >
                    {problem.title || problem.track}
                  </h3>
                  
                  <p 
                    className="text-sm mb-4"
                    style={{ color: themeConfig.textColor, opacity: 0.8 }}
                  >
                    {problem.description}
                  </p>
                  
                  {isSelected && (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle size={16} />
                      Selected
                    </div>
                  )}
                  
                  {canSelect && !isSelected && (
                    <div className="flex items-center gap-2" style={{ color: themeConfig.accentColor }}>
                      <span className="font-medium text-sm">Click to select</span>
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-8">
              <p style={{ color: themeConfig.textColor, opacity: 0.6 }}>
                No problem statements available yet
              </p>
            </div>
          )}
        </div>

        {/* Selection Window Status */}
        {!selectionWindow?.isSelectionActive && (
          <div className="mt-6 p-4 rounded-lg bg-gray-100 border border-gray-300">
            <div className="flex items-center gap-2">
              <Lock size={20} className="text-gray-600" />
              <span className="font-medium text-gray-800">
                Problem Selection Window Closed
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Selection was available 48 hours before to 24 hours after the hackathon
            </p>
          </div>
        )}
      </div>

      {/* Problem Selection Modal */}
      {showModal && selectedTrack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="max-w-4xl w-full mx-4 rounded-xl p-6 max-h-[80vh] overflow-y-auto"
            style={{ backgroundColor: themeConfig.cardBg }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 
                className="text-2xl font-bold"
                style={{ color: themeConfig.textColor }}
              >
                Select: {selectedTrack.title || selectedTrack.track}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={24} style={{ color: themeConfig.textColor }} />
              </button>
            </div>

            <div 
              className="p-4 rounded-lg mb-6"
              style={{ backgroundColor: themeConfig.backgroundColor, opacity: 0.1 }}
            >
              <p style={{ color: themeConfig.textColor }}>
                {selectedTrack.description}
              </p>
            </div>

            {selectionWindow?.isSelectionActive && !teamSelection?.isLocked && userTeam && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleSelectProblem(selectedTrack._id)}
                  className="px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2"
                  style={{ backgroundColor: '#10b981' }}
                >
                  <CheckCircle size={20} />
                  Confirm Selection
                </button>
                
                <button
                  onClick={closeModal}
                  className="px-6 py-3 rounded-lg border font-medium"
                  style={{ 
                    borderColor: themeConfig.borderColor,
                    color: themeConfig.textColor 
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="max-w-2xl w-full mx-4 rounded-xl p-6"
            style={{ backgroundColor: themeConfig.cardBg }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 
                className="text-2xl font-bold"
                style={{ color: themeConfig.textColor }}
              >
                🚀 Submit Your Solution
              </h2>
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={24} style={{ color: themeConfig.textColor }} />
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={20} className="text-yellow-600" />
                <span className="font-semibold text-yellow-800">Important Notice</span>
              </div>
              <p className="text-yellow-700">
                This is your <strong>ONE AND ONLY</strong> submission opportunity. 
                Once you submit, you cannot change or resubmit your solution.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textColor }}>
                  Solution URL * (GitHub, Demo Link, etc.)
                </label>
                <input
                  type="url"
                  value={submissionForm.url}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://github.com/yourteam/solution"
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: themeConfig.borderColor,
                    backgroundColor: themeConfig.cardBg,
                    color: themeConfig.textColor
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textColor }}>
                  Solution Title
                </label>
                <input
                  type="text"
                  value={submissionForm.title}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief title for your solution"
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: themeConfig.borderColor,
                    backgroundColor: themeConfig.cardBg,
                    color: themeConfig.textColor
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeConfig.textColor }}>
                  Description
                </label>
                <textarea
                  value={submissionForm.description}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your solution"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    borderColor: themeConfig.borderColor,
                    backgroundColor: themeConfig.cardBg,
                    color: themeConfig.textColor
                  }}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmitSolution}
                disabled={!submissionForm.url.trim()}
                className="flex-1 px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#dc2626' }}
              >
                <Send size={20} />
                Submit Solution (FINAL)
              </button>
              
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="px-6 py-3 rounded-lg border font-medium"
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
    </>
  );

  function openModal(track) {
    setSelectedTrack(track);
    setShowModal(true);
  }

  function closeModal() {
    setSelectedTrack(null);
    setShowModal(false);
  }
};

export default ProblemStatementEnhanced; 