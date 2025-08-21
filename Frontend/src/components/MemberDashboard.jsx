import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../context/AuthContextProvider';
import { useTheme } from '../context/ThemeContextProvider';
import { 
  Calendar, 
  Users, 
  Trophy, 
  Clock, 
  MapPin, 
  UserCheck, 
  Target, 
  Bell, 
  CheckCircle, 
  AlertCircle,
  User,
  Mail,
  Phone,
  Code
} from 'lucide-react';
import { toast } from 'react-toastify';

const MemberDashboard = () => {
  const { userData, hackathon, setHackathon } = useContext(MyContext);
  const { themeConfig } = useTheme();
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamInfo, setTeamInfo] = useState(null);
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

  useEffect(() => {
    fetchMemberData();
    
    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      setMemberStats(prev => {
        if (prev.loading) {
          console.warn('⚠️ Fallback timeout triggered - forcing loading to false');
          toast.warning('Dashboard loading is taking longer than expected. Some data may be incomplete.');
          return { ...prev, loading: false };
        }
        return prev;
      });
    }, 10000); // Reduced from 15 to 10 seconds

    return () => clearTimeout(fallbackTimeout);
  }, [userData]);

  const fetchMemberData = async () => {
    if (!userData?._id) return;

    try {
      setMemberStats(prev => ({ ...prev, loading: true }));

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 8000); // Reduced to 8 seconds
      });

      // Get user's hackathons with timeout - OPTIMIZED: Parallel requests
      const userResponse = await Promise.race([
        fetch(`${baseURL}/users/get-user/${userData._id}`),
        timeoutPromise
      ]);

      if (userResponse.ok) {
        const userInfo = await userResponse.json();
        console.log(`✅ User data loaded for: ${userInfo.name}`);
        
        // OPTIMIZATION: Make all requests in parallel instead of sequentially
        const promises = [];
        
        // Get hackathons user is part of
        if (userInfo.hackathonIds && userInfo.hackathonIds.length > 0) {
          const hackathonPromises = userInfo.hackathonIds.map(async (hackathonId) => {
            try {
              const hackathonResponse = await Promise.race([
                fetch(`${baseURL}/hackathons/${hackathonId}`),
                timeoutPromise
              ]);
              if (hackathonResponse.ok) {
                return await hackathonResponse.json();
              }
            } catch (error) {
              console.error(`Error fetching hackathon ${hackathonId}:`, error);
            }
            return null;
          });
          promises.push(Promise.all(hackathonPromises));
        } else {
          promises.push(Promise.resolve([]));
        }

        // Get team information if user has a team
        let teamPromise = Promise.resolve({ currentTeam: null, teamMembers: [] });
        if (userInfo.teamId) {
          teamPromise = (async () => {
            try {
              console.log(`🔍 Fetching team data for user ${userInfo.name} with teamId: ${userInfo.teamId}`);
              const teamResponse = await Promise.race([
                fetch(`${baseURL}/team/get-teams`),
                timeoutPromise
              ]);
              
              if (teamResponse.ok) {
                const teams = await teamResponse.json();
                console.log(`📋 Found ${teams.length} total teams`);
                const currentTeam = teams.find(team => team._id === userInfo.teamId);
                if (currentTeam) {
                  const teamMembers = currentTeam.teamMembers || [];
                  console.log(`✅ Found user's team: ${currentTeam.teamName} with ${teamMembers.length} members`);
                  return { currentTeam, teamMembers };
                } else {
                  console.warn(`⚠️ Team with ID ${userInfo.teamId} not found in ${teams.length} teams`);
                  return { currentTeam: null, teamMembers: [] };
                }
              } else {
                console.error(`❌ Failed to fetch teams: ${teamResponse.status}`);
                return { currentTeam: null, teamMembers: [] };
              }
            } catch (error) {
              console.error('❌ Error fetching team data:', error);
              return { currentTeam: null, teamMembers: [] };
            }
          })();
        }
        promises.push(teamPromise);

        // Execute all promises in parallel
        const [hackathons, teamData] = await Promise.all(promises);
        const { currentTeam, teamMembers } = teamData;
        
        console.log(`✅ Loaded ${hackathons.filter(Boolean).length} hackathons and team data in parallel`);

        setMemberStats({
          hackathons: hackathons.filter(Boolean),
          currentTeam,
          teamMembers,
          loading: false,
          error: null
        });
        console.log(`✅ Member dashboard data loaded successfully`);
      } else {
        console.error(`❌ Failed to fetch user data: ${userResponse.status}`);
        toast.error('Failed to load user data');
        setMemberStats(prev => ({ ...prev, loading: false, error: 'Failed to load user data' }));
      }
    } catch (error) {
      console.error('❌ Error fetching member data:', error);
      if (error.message === 'Request timeout') {
        toast.error('Dashboard loading timed out. Please refresh the page.');
      } else {
        toast.error('Failed to load dashboard data');
      }
      setMemberStats(prev => ({ ...prev, loading: false, error: 'Failed to load dashboard data' }));
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

  // ... existing useEffect and fetchMemberData code would go here ...

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: themeConfig.backgroundColor }}
      >
        <div 
          className="animate-spin rounded-full h-16 w-16 border-b-4"
          style={{ borderColor: themeConfig.accentColor }}
        ></div>
      </div>
    );
  }

  if (memberStats.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 p-5 rounded-full inline-block mb-6">
            <AlertCircle className="w-16 h-16 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Dashboard Loading Failed</h2>
          <p className="text-gray-600 text-lg mb-6">
            {memberStats.error === 'Request timeout' 
              ? 'The dashboard is taking too long to load. This might be due to slow network or server issues.'
              : 'There was an error loading your dashboard data. Please try again.'
            }
          </p>
          <div className="space-y-3">
            <button
              onClick={fetchMemberData}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
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
        
        .theme-gradient {
          background: ${themeConfig.gradientBg} !important;
        }
        
        .theme-accent-bg {
          background-color: ${themeConfig.accentColor} !important;
          color: white !important;
        }
      `}</style>

      <div 
        className="min-h-screen py-8 px-4"
        style={{ 
          backgroundColor: themeConfig.backgroundColor,
          color: themeConfig.textColor
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: themeConfig.textColor }}
            >
              Welcome back, {userData?.name || 'Member'}!
            </h1>
            <p 
              className="text-lg"
              style={{ color: themeConfig.textColor, opacity: 0.7 }}
            >
              Ready to build something amazing?
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="theme-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: themeConfig.textColor, opacity: 0.7 }}
                  >
                    Current Hackathon
                  </p>
                  <p 
                    className="text-2xl font-bold"
                    style={{ color: themeConfig.textColor }}
                  >
                    {hackathon?.title || 'No Active Hackathon'}
                  </p>
                </div>
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: themeConfig.accentColor }}
                >
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="theme-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: themeConfig.textColor, opacity: 0.7 }}
                  >
                    Team Status
                  </p>
                  <p 
                    className="text-2xl font-bold"
                    style={{ color: themeConfig.textColor }}
                  >
                    {teamInfo ? 'In Team' : 'No Team'}
                  </p>
                </div>
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: teamInfo ? themeConfig.successColor : themeConfig.warningColor }}
                >
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="theme-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: themeConfig.textColor, opacity: 0.7 }}
                  >
                    Days Left
                  </p>
                  <p 
                    className="text-2xl font-bold"
                    style={{ color: themeConfig.textColor }}
                  >
                    {hackathon ? calculateDaysLeft(hackathon.endDate) : '--'}
                  </p>
                </div>
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: themeConfig.accentColor }}
                >
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="theme-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: themeConfig.textColor, opacity: 0.7 }}
                  >
                    Your Role
                  </p>
                  <p 
                    className="text-2xl font-bold capitalize"
                    style={{ color: themeConfig.textColor }}
                  >
                    {userData?.role || 'Member'}
                  </p>
                </div>
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: themeConfig.accentColor }}
                >
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Hackathon */}
            <div className="lg:col-span-2">
              <div className="theme-card rounded-xl p-6">
                <h2 
                  className="text-xl font-bold mb-4 flex items-center"
                  style={{ color: themeConfig.textColor }}
                >
                  <Trophy className="mr-2" style={{ color: themeConfig.accentColor }} />
                  Current Hackathon
                </h2>
                
                {hackathon ? (
                  <div>
                    <h3 
                      className="text-2xl font-bold mb-2"
                      style={{ color: themeConfig.textColor }}
                    >
                      {hackathon.title}
                    </h3>
                    <p 
                      className="mb-4"
                      style={{ color: themeConfig.textColor, opacity: 0.8 }}
                    >
                      {hackathon.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5" style={{ color: themeConfig.accentColor }} />
                        <span style={{ color: themeConfig.textColor }}>
                          {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5" style={{ color: themeConfig.accentColor }} />
                        <span style={{ color: themeConfig.textColor }}>
                          Team Size: {hackathon.teamSize?.min || 2}-{hackathon.teamSize?.max || 4}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setHackathon(hackathon);
                        navigate('/hackathon');
                      }}
                      className="theme-button px-6 py-3 rounded-lg font-semibold"
                    >
                      View Hackathon Details
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4" style={{ color: themeConfig.warningColor }} />
                    <p style={{ color: themeConfig.textColor, opacity: 0.7 }}>
                      No active hackathon found. Contact your administrator.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Card */}
            <div>
              <div className="theme-card rounded-xl p-6 mb-6">
                <h2 
                  className="text-xl font-bold mb-4 flex items-center"
                  style={{ color: themeConfig.textColor }}
                >
                  <User className="mr-2" style={{ color: themeConfig.accentColor }} />
                  Your Profile
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="mr-3 h-4 w-4" style={{ color: themeConfig.accentColor }} />
                    <span style={{ color: themeConfig.textColor }}>{userData?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="mr-3 h-4 w-4" style={{ color: themeConfig.accentColor }} />
                    <span style={{ color: themeConfig.textColor }}>{userData?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Code className="mr-3 h-4 w-4" style={{ color: themeConfig.accentColor }} />
                    <span style={{ color: themeConfig.textColor }}>{userData?.vertical || 'Not specified'}</span>
                  </div>
                  {userData?.phoneNumber && (
                    <div className="flex items-center">
                      <Phone className="mr-3 h-4 w-4" style={{ color: themeConfig.accentColor }} />
                      <span style={{ color: themeConfig.textColor }}>{userData.phoneNumber}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate('/profile')}
                  className="w-full mt-4 theme-button-secondary px-4 py-2 rounded-lg font-medium"
                >
                  Edit Profile
                </button>
              </div>

              {/* Team Info */}
              <div className="theme-card rounded-xl p-6">
                <h2 
                  className="text-xl font-bold mb-4 flex items-center"
                  style={{ color: themeConfig.textColor }}
                >
                  <Users className="mr-2" style={{ color: themeConfig.accentColor }} />
                  Team Information
                </h2>
                
                {teamInfo ? (
                  <div>
                    <p 
                      className="font-semibold mb-2"
                      style={{ color: themeConfig.textColor }}
                    >
                      {teamInfo.teamName}
                    </p>
                    <p 
                      className="text-sm mb-4"
                      style={{ color: themeConfig.textColor, opacity: 0.7 }}
                    >
                      {teamInfo.members?.length || 0} members
                    </p>
                    <button
                      onClick={() => navigate('/select-team')}
                      className="w-full theme-button px-4 py-2 rounded-lg font-medium"
                    >
                      View Team
                    </button>
                  </div>
                ) : (
                  <div>
                    <p 
                      className="text-sm mb-4"
                      style={{ color: themeConfig.textColor, opacity: 0.7 }}
                    >
                      You're not part of any team yet.
                    </p>
                    <button
                      onClick={() => navigate('/create-participant-team')}
                      className="w-full theme-button px-4 py-2 rounded-lg font-medium mb-2"
                    >
                      Create Team
                    </button>
                    <button
                      onClick={() => navigate('/select-team')}
                      className="w-full theme-button-secondary px-4 py-2 rounded-lg font-medium"
                    >
                      Join Team
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/select-team')}
              className="theme-card p-4 text-left hover:shadow-lg transition-all duration-300 rounded-xl"
            >
              <Users className="h-6 w-6 mb-2" style={{ color: themeConfig.accentColor }} />
              <h3 
                className="font-medium"
                style={{ color: themeConfig.textColor }}
              >
                Teams
              </h3>
              <p 
                className="text-sm"
                style={{ color: themeConfig.textColor, opacity: 0.7 }}
              >
                View and join teams
              </p>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="theme-card p-4 text-left hover:shadow-lg transition-all duration-300 rounded-xl"
            >
              <UserCheck className="h-6 w-6 mb-2" style={{ color: themeConfig.successColor }} />
              <h3 
                className="font-medium"
                style={{ color: themeConfig.textColor }}
              >
                Profile
              </h3>
              <p 
                className="text-sm"
                style={{ color: themeConfig.textColor, opacity: 0.7 }}
              >
                Update your information
              </p>
            </button>

            <button
              onClick={() => navigate('/resource-hub')}
              className="theme-card p-4 text-left hover:shadow-lg transition-all duration-300 rounded-xl"
            >
              <Target className="h-6 w-6 mb-2" style={{ color: themeConfig.warningColor }} />
              <h3 
                className="font-medium"
                style={{ color: themeConfig.textColor }}
              >
                Resources
              </h3>
              <p 
                className="text-sm"
                style={{ color: themeConfig.textColor, opacity: 0.7 }}
              >
                Access learning materials
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper function
const calculateDaysLeft = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export default MemberDashboard; 