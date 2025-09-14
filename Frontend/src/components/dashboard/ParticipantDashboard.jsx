// Frontend/src/components/dashboard/ParticipantDashboard.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../context/AuthContextProvider";
import { useNewTheme } from "../../context/NewThemeContextProvider";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Toast from "../ui/Toast";
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Clock,
  Eye,
  Target,
  Award,
  Star,
  Sparkles,
  Crown,
  Code,
  Palette,
  FileText,
  UserPlus,
  Copy,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Zap
} from "lucide-react";

const ParticipantDashboard = () => {
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
  const { themeConfig } = useNewTheme();
  const { userData, role, hackathon } = useContext(MyContext);
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    hackathonsParticipated: 0,
    teamsJoined: 0,
    achievements: 0,
    currentRank: 'Participant'
  });
  
  // Modal states
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      // Simulate fetching user stats
      setUserStats({
        hackathonsParticipated: 3,
        teamsJoined: 2,
        achievements: 5,
        currentRank: 'Participant'
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      showToastMessage('error', 'Error', 'Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (type, title, message) => {
    setToastConfig({ type, title, message });
    setShowToast(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getHackathonStatus = (hackathon) => {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);
    
    if (now < startDate) return { status: 'upcoming', color: 'blue' };
    if (now > endDate) return { status: 'completed', color: 'gray' };
    return { status: 'active', color: 'green' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-red-600"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Hackathon Platform</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/profile')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => navigate('/my-team')}
              >
                <Users className="w-4 h-4 mr-2" />
                My Team
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userData?.name || 'Participant'}!
          </h2>
          <p className="text-gray-600">
            Ready to tackle your next hackathon challenge?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="gradient" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-100 to-red-200 rounded-xl mx-auto mb-4">
              <Trophy className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{userStats.hackathonsParticipated}</h3>
            <p className="text-sm text-gray-600">Hackathons Participated</p>
          </Card>
          
          <Card variant="gradient" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{userStats.teamsJoined}</h3>
            <p className="text-sm text-gray-600">Teams Joined</p>
          </Card>
          
          <Card variant="gradient" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl mx-auto mb-4">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{userStats.achievements}</h3>
            <p className="text-sm text-gray-600">Achievements</p>
          </Card>
          
          <Card variant="gradient" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl mx-auto mb-4">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{userStats.currentRank}</h3>
            <p className="text-sm text-gray-600">Current Rank</p>
          </Card>
        </div>

        {/* Current Hackathon Section */}
        {hackathon ? (
          <Card variant="elevated" className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{hackathon.title}</h3>
                <p className="text-gray-600 mb-4">{hackathon.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{hackathon.eventType}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                getHackathonStatus(hackathon).color === 'green' ? 'bg-green-100 text-green-800' :
                getHackathonStatus(hackathon).color === 'blue' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getHackathonStatus(hackathon).status}
              </span>
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/hackathon')}
                className="flex-1"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Hackathon
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/my-team')}
                className="flex-1"
              >
                <Users className="w-5 h-5 mr-2" />
                My Team
              </Button>
            </div>
          </Card>
        ) : (
          <Card variant="gradient" className="text-center py-12 mb-8">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Hackathon</h3>
            <p className="text-gray-600 mb-6">You're not currently participating in any hackathon.</p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/profile')}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Update Profile
            </Button>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="elevated" className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-team')}>
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">My Team</h4>
            <p className="text-gray-600">View and manage your team</p>
          </Card>
          
          <Card variant="elevated" className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Profile</h4>
            <p className="text-gray-600">Update your profile information</p>
          </Card>
          
          <Card variant="elevated" className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/resource-hub')}>
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl mx-auto mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Resources</h4>
            <p className="text-gray-600">Access learning resources</p>
          </Card>
        </div>
      </main>

      {/* Toast */}
      {showToast && (
        <Toast 
          {...toastConfig}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ParticipantDashboard;
