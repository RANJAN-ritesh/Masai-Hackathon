import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from '../context/AuthContextProvider';
import { useTheme } from '../context/ThemeContextProvider';
import { useWebSocket } from '../context/WebSocketContextProvider';
import { toast } from 'react-toastify';

const SimplePolling = ({ currentTeam, hackathon }) => {
  const { userId } = useContext(MyContext);
  const { themeConfig } = useTheme();
  const { registerVoteUpdateCallback, registerPollUpdateCallback, registerPollConclusionCallback } = useWebSocket();
  
  const [pollData, setPollData] = useState({
    pollActive: false,
    pollStartTime: null,
    pollEndTime: null,
    pollDuration: 0,
    pollProblemStatement: null,
    votes: {},
    voteCounts: {}
  });
  
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });
  const [loading, setLoading] = useState(false);

  // Load poll status
  const loadPollStatus = async () => {
    if (!currentTeam) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/team-polling/poll-status/${currentTeam._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPollData({
          pollActive: data.pollActive || false,
          pollStartTime: data.pollStartTime,
          pollEndTime: data.pollEndTime,
          pollDuration: data.pollDuration,
          pollProblemStatement: data.pollProblemStatement,
          pollProblemStatements: data.pollProblemStatements || [],
          votes: data.problemStatementVotes || {},
          voteCounts: data.problemStatementVoteCount || {}
        });
        
        // Update timer if poll is active
        if (data.pollActive && data.pollEndTime) {
          const now = new Date();
          const endTime = new Date(data.pollEndTime);
          const diff = endTime - now;
          
          if (diff <= 0) {
            setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
          } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeLeft({ hours, minutes, seconds, expired: false });
          }
        }
      }
    } catch (error) {
      console.error('Error loading poll status:', error);
    }
  };

  // Vote on problem statement
  const voteOnProblemStatement = async (problemStatementId) => {
    if (!currentTeam || !pollData.pollActive) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/team-polling/vote-problem-statement`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId: currentTeam._id,
          problemStatementId: problemStatementId,
          hackathonId: hackathon?._id
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Vote cast successfully!');
        // Reload poll status to get updated vote counts
        await loadPollStatus();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    } finally {
      setLoading(false);
    }
  };

  // Start poll
  const startPoll = async (problemStatementId, duration = 120) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/simple-polling/start-poll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId: currentTeam._id,
          problemStatementId: problemStatementId,
          duration: duration
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        await loadPollStatus();
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error starting poll:', error);
      toast.error('Failed to start poll');
    } finally {
      setLoading(false);
    }
  };

  // Conclude poll
  const concludePoll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/simple-polling/conclude-poll`, {
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
        toast.success(result.message);
        await loadPollStatus();
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error concluding poll:', error);
      toast.error('Failed to conclude poll');
    } finally {
      setLoading(false);
    }
  };

  // Load poll status on component mount and when team changes
  useEffect(() => {
    loadPollStatus();
  }, [currentTeam?._id]);

  // Register WebSocket callbacks for real-time updates
  useEffect(() => {
    console.log('🔌 Registering WebSocket callbacks for SimplePolling');
    
    const unsubscribeVoteUpdate = registerVoteUpdateCallback((voteData) => {
      console.log('🔄 Vote update received in SimplePolling:', voteData);
      // Reload poll status to get updated vote counts
      loadPollStatus();
    });

    const unsubscribePollUpdate = registerPollUpdateCallback((pollData) => {
      console.log('🔄 Poll update received in SimplePolling:', pollData);
      // Reload poll status to get updated poll state
      loadPollStatus();
    });

    const unsubscribePollConclusion = registerPollConclusionCallback((conclusionData) => {
      console.log('🔄 Poll conclusion received in SimplePolling:', conclusionData);
      // Reload poll status to get final results
      loadPollStatus();
    });

    return () => {
      console.log('🔌 Unregistering WebSocket callbacks for SimplePolling');
      unsubscribeVoteUpdate();
      unsubscribePollUpdate();
      unsubscribePollConclusion();
    };
  }, [currentTeam?._id]);

  // Timer effect
  useEffect(() => {
    if (!pollData.pollActive || !pollData.pollEndTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const endTime = new Date(pollData.pollEndTime);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        setPollData(prev => ({ ...prev, pollActive: false }));
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ hours, minutes, seconds, expired: false });
    }, 1000);

    return () => clearInterval(interval);
  }, [pollData.pollActive, pollData.pollEndTime]);

  // Check if user is team leader
  const isTeamLeader = currentTeam?.teamLeader?.toString() === userId || currentTeam?.createdBy?.toString() === userId;

  // Get problem statements from hackathon
  const problemStatements = hackathon?.problemStatements || [];

  return (
    <div className="space-y-6">
      {/* Team Leader Actions */}
      {isTeamLeader && !pollData.pollActive && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Team Leader Actions</h3>
          <div className="space-y-2">
            {problemStatements.map((problem, index) => (
              <button
                key={index}
                onClick={() => startPoll(problem.track)}
                disabled={loading}
                className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                Start Poll for {problem.track}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Poll */}
      {pollData.pollActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Active Poll: Problem Statement Selection</h3>
          
          {/* Timer */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-blue-600">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <p className="text-sm text-blue-600">Time remaining</p>
          </div>

          {/* Voting Options */}
          <div className="space-y-3 mb-4">
            {(pollData.pollProblemStatements || problemStatements).map((problem, index) => {
              const userVote = pollData.votes?.[userId];
              const isSelected = userVote === problem.track;
              const voteCount = pollData.voteCounts?.[problem.track] || 0;
              
              return (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => !isSelected && voteOnProblemStatement(problem.track)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{problem.track}</h4>
                      <p className="text-sm text-gray-600">{problem.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{voteCount}</div>
                      <div className="text-xs text-gray-500">votes</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-2 text-sm text-green-600 font-medium">✓ You voted for this</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live Vote Results */}
          <div className="bg-white rounded-lg p-3 border">
            <h4 className="font-medium text-gray-800 mb-2">Live Vote Results</h4>
            {Object.keys(pollData.voteCounts || {}).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(pollData.voteCounts).map(([problemStatementId, count]) => (
                  <div key={problemStatementId} className="flex justify-between text-sm">
                    <span>{problemStatementId}:</span>
                    <span className="font-medium">{count} votes</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No votes cast yet</p>
            )}
          </div>

          {/* Conclude Poll Button */}
          {isTeamLeader && (
            <div className="mt-4 text-center">
              <button
                onClick={concludePoll}
                disabled={loading}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Conclude Poll Now
              </button>
              <p className="text-xs text-gray-500 mt-1">Only team leaders can conclude the poll early</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Problem Statement */}
      {currentTeam?.selectedProblemStatement && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Selected Problem Statement</h3>
          <p className="text-green-700 font-medium">{currentTeam.selectedProblemStatement}</p>
          <p className="text-sm text-green-600 mt-1">
            Selected on: {new Date(currentTeam.problemStatementSelectedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default SimplePolling;
