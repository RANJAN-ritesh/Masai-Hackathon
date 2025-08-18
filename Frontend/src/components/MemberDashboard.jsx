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
  Target,
  TrendingUp,
  Award,
  Star
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';

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
    // Only fetch data if we have a user ID
    const userId = userData?._id || localStorage.getItem("userId");
    if (userId) {
      fetchMemberData();
    } else {
      console.log("No user ID available, skipping data fetch");
      setMemberStats(prev => ({ ...prev, loading: false }));
    }
  }, [userData]);

  const fetchMemberData = async () => {
    // Get userId from either context or localStorage as fallback
    const userId = userData?._id || localStorage.getItem("userId");
    
    if (!userId) {
      console.log("No user ID available");
      setMemberStats(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setMemberStats(prev => ({ ...prev, loading: true }));

      // Get user's hackathons
      console.log(`Fetching user data for ID: ${userId}`);
      const userResponse = await fetch(`${baseURL}/users/get-user/${userId}`);
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error(`Failed to fetch user data: ${userResponse.status} - ${errorText}`);
        throw new Error(`Failed to fetch user data: ${userResponse.status}`);
      }
      
      const userInfo = await userResponse.json();
      console.log("User info received:", userInfo);
      
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
            console.log(`Fetching team data for team ID: ${userInfo.teamId}`);
            const teamResponse = await fetch(`${baseURL}/team/get-teams`);
            if (teamResponse.ok) {
              const teams = await teamResponse.json();
              currentTeam = teams.find(team => team._id === userInfo.teamId);
              if (currentTeam) {
                teamMembers = currentTeam.teamMembers || [];
                console.log(`Found team: ${currentTeam.teamName} with ${teamMembers.length} members`);
              } else {
                console.log(`Team not found for ID: ${userInfo.teamId}`);
              }
            } else {
              console.error(`Failed to fetch teams: ${teamResponse.status}`);
            }
          } catch (error) {
            console.error('Error fetching team data:', error);
          }
        } else {
          console.log("User has no team ID");
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
      return { label: 'Upcoming', variant: 'info' };
    } else if (now >= start && now <= end) {
      return { label: 'Active', variant: 'success' };
    } else {
      return { label: 'Completed', variant: 'default' };
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg mb-6">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome back, {userData?.name || 'Member'}! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Here's your personalized hackathon dashboard. Track your progress, manage your team, and stay updated with all your events.
          </p>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card variant="primary" className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-red-700 mb-2">Active Hackathons</p>
            <p className="text-4xl font-bold text-red-900">
              {memberStats.hackathons.length}
            </p>
            <p className="text-sm text-red-600 mt-2">Events you're part of</p>
          </Card>

          <Card variant="secondary" className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-blue-700 mb-2">Team Status</p>
            <p className="text-2xl font-bold text-blue-900">
              {memberStats.currentTeam ? 'In Team' : 'No Team'}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              {memberStats.currentTeam ? 'Collaborating actively' : 'Ready to join'}
            </p>
          </Card>

          <Card variant="success" className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-green-700 mb-2">Your Role</p>
            <p className="text-2xl font-bold text-green-900 capitalize">
              {userData?.role || 'Member'}
            </p>
            <p className="text-sm text-green-600 mt-2">
              {userData?.role === 'admin' ? 'Platform administrator' : 
               userData?.role === 'leader' ? 'Team leader' : 'Team member'}
            </p>
          </Card>
        </div>

        {/* Enhanced Current Team Section */}
        {memberStats.currentTeam && (
          <Card variant="elevated" className="mb-12">
            <Card.Header>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Your Team</h2>
                    <p className="text-gray-600">Collaborate and build together</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/select-team')}
                  className="flex items-center"
                >
                  View Details
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card.Header>
            
            <Card.Body>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {memberStats.currentTeam.teamName}
                  </h3>
                  <div className="space-y-3">
                    {memberStats.teamMembers.slice(0, 4).map((member, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {member.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          <span className="text-sm font-medium text-gray-700">
                            {member.name || `Member ${index + 1}`}
                          </span>
                          <p className="text-xs text-gray-500">
                            {member.role || 'Member'}
                          </p>
                        </div>
                        {index === 0 && (
                          <Badge variant="success" size="sm">Leader</Badge>
                        )}
                      </div>
                    ))}
                    {memberStats.teamMembers.length > 4 && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">
                          +{memberStats.teamMembers.length - 4} more members
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                    <h4 className="font-semibold text-indigo-900 mb-3">Team Overview</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-700">Team Size</span>
                        <Badge variant="info">
                          {memberStats.teamMembers.length} / {memberStats.currentTeam.memberLimit}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-700">Status</span>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-700">Created</span>
                        <span className="text-indigo-700 text-sm">
                          {memberStats.currentTeam.createdAt ? 
                            formatDate(memberStats.currentTeam.createdAt) : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="info" 
                    size="lg" 
                    className="w-full"
                    onClick={() => navigate('/select-team')}
                  >
                    <Target className="mr-2 h-5 w-5" />
                    Manage Team
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Enhanced No Team Alert */}
        {!memberStats.currentTeam && (
          <Card variant="warning" className="mb-12">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  You're not in a team yet
                </h3>
                <p className="text-yellow-700 mb-4">
                  Join a team to participate in hackathons and collaborate with other members. 
                  Teams are where the magic happens!
                </p>
                <Button 
                  variant="warning" 
                  size="lg"
                  onClick={() => navigate('/select-team')}
                  className="flex items-center"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Find a Team
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Hackathons Section */}
        <Card variant="elevated">
          <Card.Header>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Hackathons</h2>
                <p className="text-gray-600">Track all your events and progress</p>
              </div>
            </div>
          </Card.Header>
          
          <Card.Body>
            {memberStats.hackathons.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No hackathons yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  You'll see hackathons here when an admin adds you to one. 
                  Check back soon or contact your administrator!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {memberStats.hackathons.map((hackathon, index) => {
                  const status = getHackathonStatus(hackathon);
                  return (
                    <Card key={hackathon._id || index} variant="gradient" className="border-0">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex-1 pr-4">
                          {hackathon.title}
                        </h3>
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {hackathon.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                      </div>
                      
                      <Button 
                        variant="primary" 
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          localStorage.setItem('currentHackathon', hackathon._id);
                          navigate('/hackathon');
                        }}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Hackathon
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Enhanced Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="gradient" className="text-center cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => navigate('/select-team')}>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Teams</h3>
            <p className="text-gray-600 text-sm">View and join teams</p>
          </Card>

          <Card variant="gradient" className="text-center cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => navigate('/profile')}>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-gray-600 text-sm">Update your information</p>
          </Card>

          <Card variant="gradient" className="text-center cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => navigate('/resource-hub')}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resources</h3>
            <p className="text-gray-600 text-sm">Access learning materials</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard; 