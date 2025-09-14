// Frontend/src/components/dashboard/AdminDashboard.jsx
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
  BarChart3,
  Target,
  Plus,
  Settings,
  Calendar,
  MapPin,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Crown,
  Code,
  Palette,
  FileText,
  UserPlus,
  Copy,
  X
} from "lucide-react";

const AdminDashboard = () => {
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
  const { themeConfig } = useNewTheme();
  const { userData, role } = useContext(MyContext);
  const navigate = useNavigate();
  
  // State management
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHackathons: 0,
    activeHackathons: 0,
    totalParticipants: 0,
    totalTeams: 0
  });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});
  
  // Form states
  const [newHackathon, setNewHackathon] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    eventType: 'Virtual',
    teamCreationMode: 'admin',
    submissionStartDate: '',
    submissionEndDate: '',
    submissionDescription: ''
  });

  useEffect(() => {
    fetchHackathons();
    calculateStats();
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/hackathons`);
      if (response.ok) {
        const data = await response.json();
        setHackathons(data);
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      showToastMessage('error', 'Error', 'Failed to fetch hackathons');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const activeHackathons = hackathons.filter(h => {
      const startDate = new Date(h.startDate);
      const endDate = new Date(h.endDate);
      return startDate <= now && now <= endDate;
    });

    setStats({
      totalHackathons: hackathons.length,
      activeHackathons: activeHackathons.length,
      totalParticipants: hackathons.reduce((sum, h) => sum + (h.participants?.length || 0), 0),
      totalTeams: hackathons.reduce((sum, h) => sum + (h.teams?.length || 0), 0)
    });
  };

  const showToastMessage = (type, title, message) => {
    setToastConfig({ type, title, message });
    setShowToast(true);
  };

  const handleCreateHackathon = async () => {
    try {
      const response = await fetch(`${baseURL}/hackathons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(newHackathon)
      });

      if (response.ok) {
        showToastMessage('success', 'Success', 'Hackathon created successfully!');
        setShowCreateModal(false);
        setNewHackathon({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          eventType: 'Virtual',
          teamCreationMode: 'admin',
          submissionStartDate: '',
          submissionEndDate: '',
          submissionDescription: ''
        });
        fetchHackathons();
      } else {
        showToastMessage('error', 'Error', 'Failed to create hackathon');
      }
    } catch (error) {
      console.error('Error creating hackathon:', error);
      showToastMessage('error', 'Error', 'Failed to create hackathon');
    }
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
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Hackathon
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="gradient" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-100 to-red-200 rounded-xl mx-auto mb-4">
              <Trophy className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalHackathons}</h3>
            <p className="text-sm text-gray-600">Total Hackathons</p>
          </Card>
          
          <Card variant="gradient" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalParticipants}</h3>
            <p className="text-sm text-gray-600">Total Participants</p>
          </Card>
          
          <Card variant="gradient" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeHackathons}</h3>
            <p className="text-sm text-gray-600">Active Hackathons</p>
          </Card>
          
          <Card variant="gradient" className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl mx-auto mb-4">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTeams}</h3>
            <p className="text-sm text-gray-600">Total Teams</p>
          </Card>
        </div>

        {/* Hackathons Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => {
            const status = getHackathonStatus(hackathon);
            return (
              <Card key={hackathon._id} variant="elevated" className="hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{hackathon.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hackathon.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    status.color === 'green' ? 'bg-green-100 text-green-800' :
                    status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{hackathon.eventType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{hackathon.participants?.length || 0} participants</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/hackathon/${hackathon._id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/hackathon/${hackathon._id}/edit`)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {hackathons.length === 0 && (
          <Card variant="gradient" className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hackathons Yet</h3>
            <p className="text-gray-600 mb-6">Create your first hackathon to get started!</p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Hackathon
            </Button>
          </Card>
        )}
      </main>

      {/* Create Hackathon Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Create New Hackathon"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Hackathon Title"
              placeholder="Enter hackathon title"
              value={newHackathon.title}
              onChange={(e) => setNewHackathon({...newHackathon, title: e.target.value})}
              required
            />
            <Input 
              label="Event Type"
              placeholder="Virtual / In-person"
              value={newHackathon.eventType}
              onChange={(e) => setNewHackathon({...newHackathon, eventType: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              rows={4}
              placeholder="Describe your hackathon..."
              value={newHackathon.description}
              onChange={(e) => setNewHackathon({...newHackathon, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Start Date"
              type="datetime-local"
              value={newHackathon.startDate}
              onChange={(e) => setNewHackathon({...newHackathon, startDate: e.target.value})}
              required
            />
            <Input 
              label="End Date"
              type="datetime-local"
              value={newHackathon.endDate}
              onChange={(e) => setNewHackathon({...newHackathon, endDate: e.target.value})}
              required
            />
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleCreateHackathon}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Create Hackathon
            </Button>
          </div>
        </div>
      </Modal>

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

export default AdminDashboard;
