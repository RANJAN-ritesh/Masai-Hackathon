import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../context/AuthContextProvider';
import { toast } from 'react-toastify';
import { 
  Users, 
  Calendar, 
  Trophy, 
  Clock, 
  UserCheck, 
  AlertCircle,
  ChevronRight,
  BookOpen,
  Target
} from 'lucide-react';

const MemberDashboard = () => {
  const { userData, hackathon } = useContext(MyContext);
  const [memberStats, setMemberStats] = useState({
    hackathons: [],
    currentTeam: null,
    teamMembers: [],
    loading: true
  });
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchMemberData();
  }, [userData]);

  const fetchMemberData = async () => {
    if (!userData?._id) return;

    try {
      setMemberStats(prev => ({ ...prev, loading: true }));

      // Get user's hackathons
      const userResponse = await fetch(`${baseURL}/users/get-user/${userData._id}`);
      if (userResponse.ok) {
        const userInfo = await userResponse.json();
        
        // Get hackathons user is part of
        const hackathonPromises = (userInfo.hackathonIds || []).map(async (hackathonId) => {
          try {
            const hackathonResponse = await fetch(`${baseURL}/hackathons/${hackathonId}`);
            if (hackathonResponse.ok) {
              return await hackathonResponse.json();
            }
          } catch (error) {
            console.error(`Error fetching hackathon ${hackathonId}:`, error);
          }
          return null;
        });

        const hackathons = (await Promise.all(hackathonPromises)).filter(Boolean);

        // Get team information if user has a team
        let currentTeam = null;
        let teamMembers = [];
        if (userInfo.teamId) {
          try {
            const teamResponse = await fetch(`${baseURL}/team/get-teams`);
            if (teamResponse.ok) {
              const teams = await teamResponse.json();
              currentTeam = teams.find(team => team._id === userInfo.teamId);
              if (currentTeam) {
                teamMembers = currentTeam.teamMembers || [];
              }
            }
          } catch (error) {
            console.error('Error fetching team data:', error);
          }
        }

        setMemberStats({
          hackathons,
          currentTeam,
          teamMembers,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
      toast.error('Failed to load dashboard data');
      setMemberStats(prev => ({ ...prev, loading: false }));
    }
  };

  const getHackathonStatus = (hackathon) => {
    const now = new Date();
    const start = new Date(hackathon.startDate);
    const end = new Date(hackathon.endDate);

    if (now < start) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= start && now <= end) {
      return { label: 'Active', color: 'bg-green-100 text-green-800' };
    } else {
      return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (memberStats.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userData?.name || 'Member'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your hackathon dashboard
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hackathons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {memberStats.hackathons.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {memberStats.currentTeam ? 'In Team' : 'No Team'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {userData?.role || 'Member'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Team Section */}
        {memberStats.currentTeam && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Your Team</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {memberStats.currentTeam.teamName}
                </h3>
                <button
                  onClick={() => navigate('/select-team')}
                  className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  View Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Team Members</p>
                  <div className="space-y-2">
                    {memberStats.teamMembers.slice(0, 3).map((member, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="ml-2 text-sm text-gray-700">
                          {member.name || `Member ${index + 1}`}
                        </span>
                      </div>
                    ))}
                    {memberStats.teamMembers.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{memberStats.teamMembers.length - 3} more members
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Team Size</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {memberStats.teamMembers.length} / {memberStats.currentTeam.memberLimit}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Team Alert */}
        {!memberStats.currentTeam && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  You're not in a team yet
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Join a team to participate in hackathons and collaborate with other members.
                </p>
                <button
                  onClick={() => navigate('/select-team')}
                  className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700"
                >
                  Find a Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hackathons Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Hackathons</h2>
          </div>
          <div className="p-6">
            {memberStats.hackathons.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No hackathons yet</p>
                <p className="text-gray-400 text-sm">
                  You'll see hackathons here when an admin adds you to one
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {memberStats.hackathons.map((hackathon, index) => {
                  const status = getHackathonStatus(hackathon);
                  return (
                    <div key={hackathon._id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900 flex-1">
                          {hackathon.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {hackathon.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                      </div>
                      <button
                        onClick={() => {
                          localStorage.setItem('currentHackathon', hackathon._id);
                          navigate('/hackathon');
                        }}
                        className="mt-3 w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                      >
                        View Hackathon
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/select-team')}
            className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-50"
          >
            <Users className="h-6 w-6 text-indigo-600 mb-2" />
            <h3 className="font-medium text-gray-900">Teams</h3>
            <p className="text-sm text-gray-600">View and join teams</p>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-50"
          >
            <UserCheck className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Profile</h3>
            <p className="text-sm text-gray-600">Update your information</p>
          </button>

          <button
            onClick={() => navigate('/resource-hub')}
            className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-50"
          >
            <Target className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Resources</h3>
            <p className="text-sm text-gray-600">Access learning materials</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard; 