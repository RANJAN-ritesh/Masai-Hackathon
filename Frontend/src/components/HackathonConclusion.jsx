import React, { useState, useEffect } from 'react';
import { Trophy, Clock, MessageSquare, Users, Award, Calendar, Target, Link } from 'lucide-react';

const HackathonConclusion = ({ hackathon, currentTeam, userId }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [chatLocked, setChatLocked] = useState(false);

  useEffect(() => {
    if (!hackathon?.endDate) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endDate = new Date(hackathon.endDate);
      const chatEndDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000); // 1 day after hackathon ends

      if (now > chatEndDate) {
        setChatLocked(true);
        return null;
      }

      const difference = chatEndDate - now;
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [hackathon?.endDate]);

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  const isTeamLeader = currentTeam?.createdBy?._id === userId || 
                      currentTeam?.teamLeader?._id === userId ||
                      currentTeam?.members?.some(member => member._id === userId && member.role === 'leader');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Celebration Header */}
      <div className="text-center py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Trophy className="w-24 h-24 mx-auto text-yellow-400 mb-6 animate-bounce" />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Hackathon Complete!
            </h1>
            <h2 className="text-3xl font-semibold mb-2">{hackathon?.title}</h2>
            <p className="text-xl text-blue-200">
              Congratulations on completing this amazing journey!
            </p>
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-2xl font-bold mb-2">{currentTeam?.teamMembers?.length || 0}</h3>
              <p className="text-blue-200">Team Members</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Target className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h3 className="text-2xl font-bold mb-2">{currentTeam?.selectedProblemStatement || 'N/A'}</h3>
              <p className="text-green-200">Problem Solved</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Award className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-2xl font-bold mb-2">{isTeamLeader ? 'Leader' : 'Member'}</h3>
              <p className="text-purple-200">Your Role</p>
            </div>
          </div>

          {/* Team Achievement */}
          {currentTeam && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
              <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6" />
                Team Achievement
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team: {currentTeam.teamName}
                  </h4>
                  <p className="text-blue-200">
                    {currentTeam.teamMembers?.length || 0} members collaborated successfully
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Problem Statement
                  </h4>
                  <p className="text-green-200">
                    {currentTeam.selectedProblemStatement || 'No problem selected'}
                  </p>
                </div>
                
                {currentTeam.submissionLink && (
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Link className="w-5 h-5" />
                      Project Submission
                    </h4>
                    <a 
                      href={currentTeam.submissionLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 underline break-all"
                    >
                      {currentTeam.submissionLink}
                    </a>
                    <p className="text-sm text-gray-300 mt-1">
                      Submitted on: {currentTeam.submissionTime ? new Date(currentTeam.submissionTime).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Access Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Team Chat Access
            </h3>
            
            {chatLocked ? (
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-red-400" />
                <p className="text-lg text-red-300">
                  Chat access has expired
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  You can still view your team overview and achievements
                </p>
              </div>
            ) : timeLeft ? (
              <div className="text-center">
                <div className="mb-4">
                  <p className="text-lg mb-2">Chat access expires in:</p>
                  <div className="flex justify-center gap-4 text-2xl font-mono">
                    {timeLeft.days > 0 && (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400">{formatTime(timeLeft.days)}</div>
                        <div className="text-sm text-gray-300">Days</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400">{formatTime(timeLeft.hours)}</div>
                      <div className="text-sm text-gray-300">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400">{formatTime(timeLeft.minutes)}</div>
                      <div className="text-sm text-gray-300">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400">{formatTime(timeLeft.seconds)}</div>
                      <div className="text-sm text-gray-300">Seconds</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-blue-200">
                  Continue chatting with your team for one more day!
                </p>
              </div>
            ) : (
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <p className="text-lg text-green-300">
                  Chat access is still available
                </p>
              </div>
            )}
          </div>

          {/* Motivational Message */}
          <div className="mt-12 text-center">
            <p className="text-xl text-blue-200 mb-4">
              "Every great achievement was once considered impossible until someone dared to try."
            </p>
            <p className="text-lg text-gray-300">
              Thank you for participating in this hackathon. Your dedication and creativity have made this event truly special!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonConclusion;
