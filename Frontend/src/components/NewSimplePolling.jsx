import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const NewSimplePolling = ({ teamId }) => {
  const [pollData, setPollData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

  // Load poll status
  const loadPollStatus = async () => {
    if (!teamId) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${baseURL}/simple-polling/status/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPollData(data.pollData);
        
        // Check if user has voted
        const userId = localStorage.getItem('userId');
        if (data.pollData?.votes?.[userId]) {
          setUserVote(data.pollData.votes[userId]);
        }
      }
    } catch (error) {
      console.error('Error loading poll status:', error);
    }
  };

  // Start a new poll
  const startPoll = async (duration = 30) => {
    if (!teamId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${baseURL}/simple-polling/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId,
          duration
        })
      });

      if (response.ok) {
        toast.success('Poll started successfully!');
        await loadPollStatus();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to start poll');
      }
    } catch (error) {
      console.error('Error starting poll:', error);
      toast.error('Failed to start poll');
    } finally {
      setLoading(false);
    }
  };

  // Vote for a problem statement
  const vote = async (track) => {
    if (!teamId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${baseURL}/simple-polling/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId,
          track
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Vote recorded successfully!');
        setUserVote(track);
        
        // Update poll data with new vote counts
        setPollData(prev => ({
          ...prev,
          voteCounts: data.voteCounts,
          votes: {
            ...prev.votes,
            [localStorage.getItem('userId')]: track
          }
        }));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to record vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    } finally {
      setLoading(false);
    }
  };

  // End poll
  const endPoll = async () => {
    if (!teamId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${baseURL}/simple-polling/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teamId })
      });

      if (response.ok) {
        toast.success('Poll ended successfully!');
        await loadPollStatus();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to end poll');
      }
    } catch (error) {
      console.error('Error ending poll:', error);
      toast.error('Failed to end poll');
    } finally {
      setLoading(false);
    }
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!pollData?.endTime) return null;
    
    const now = new Date();
    const end = new Date(pollData.endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Load poll status on component mount and set up polling
  useEffect(() => {
    loadPollStatus();
    
    // Refresh poll status every 10 seconds (not too frequent)
    const interval = setInterval(loadPollStatus, 10000);
    
    return () => clearInterval(interval);
  }, [teamId]);

  if (!teamId) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">No team selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Team Problem Statement Poll</h3>
        
        {/* Poll Controls */}
        {!pollData?.isActive ? (
          <div className="space-y-3">
            <p className="text-gray-600">No active poll. Start a poll to select your team's problem statement.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => startPoll(10)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Start 10 min Poll
              </button>
              <button
                onClick={() => startPoll(30)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Start 30 min Poll
              </button>
              <button
                onClick={() => startPoll(60)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Start 60 min Poll
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Poll Status */}
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
              <div>
                <p className="text-green-800 font-medium">Poll Active</p>
                <p className="text-green-600 text-sm">
                  Duration: {pollData.duration} minutes | Time remaining: {getTimeRemaining()}
                </p>
              </div>
              <button
                onClick={endPoll}
                disabled={loading}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
              >
                End Poll
              </button>
            </div>

            {/* Problem Statements */}
            <div className="space-y-3">
              <h4 className="font-medium">Select Problem Statement:</h4>
              {pollData.problemStatements?.map((ps, index) => (
                <div key={ps.track} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h5 className="font-medium text-lg">{ps.track}</h5>
                      <p className="text-gray-600 text-sm">{ps.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {pollData.voteCounts?.[ps.track] || 0}
                        </div>
                        <div className="text-xs text-gray-500">votes</div>
                      </div>
                      <button
                        onClick={() => vote(ps.track)}
                        disabled={loading}
                        className={`px-4 py-2 rounded font-medium ${
                          userVote === ps.track
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        } disabled:opacity-50`}
                      >
                        {userVote === ps.track ? 'Voted ✓' : 'Vote'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vote Summary */}
            {userVote && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-blue-800">
                  <span className="font-medium">Your vote:</span> {userVote}
                </p>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewSimplePolling;
