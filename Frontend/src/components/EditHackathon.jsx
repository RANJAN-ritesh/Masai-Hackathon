import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Save,
  ArrowLeft,
  AlertCircle,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditHackathon = () => {
  const { hackathonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_BASE_URL;
  
  const [hackathonData, setHackathonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    eventType: "",
    minTeamSize: 2,
    maxTeamSize: 4,
    status: "upcoming"
  });

  useEffect(() => {
    if (location.state?.hackathonData) {
      const data = location.state.hackathonData;
      setHackathonData(data);
      setFormData({
        title: data.title || data.name || "",
        description: data.description || "",
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "",
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "",
        eventType: data.eventType || "",
        minTeamSize: data.minTeamSize || 2,
        maxTeamSize: data.maxTeamSize || 4,
        status: data.status || "upcoming"
      });
      setLoading(false);
    } else {
      // Fetch hackathon data if not passed via state
      fetchHackathonData();
    }
  }, [hackathonId, location.state]);

  const fetchHackathonData = async () => {
    try {
      const response = await fetch(`${baseURL}/hackathons/${hackathonId}`);
      if (response.ok) {
        const data = await response.json();
        setHackathonData(data);
        setFormData({
          title: data.title || data.name || "",
          description: data.description || "",
          startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "",
          endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "",
          eventType: data.eventType || "",
          minTeamSize: data.minTeamSize || 2,
          maxTeamSize: data.maxTeamSize || 4,
          status: data.status || "upcoming"
        });
      } else {
        toast.error("Failed to fetch hackathon data");
      }
    } catch (error) {
      toast.error("Error fetching hackathon data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`${baseURL}/hackathons/${hackathonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Hackathon updated successfully!");
        navigate('/eligible-hackathons');
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update hackathon");
      }
    } catch (error) {
      toast.error("Error updating hackathon");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/eligible-hackathons')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hackathons
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Hackathon</h1>
          <p className="text-gray-600 mt-2">Update hackathon details and settings</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hackathon Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Event Type</option>
                <option value="Team Hackathon">Team Hackathon</option>
                <option value="Individual Hackathon">Individual Hackathon</option>
                <option value="Interactive Hackathon">Interactive Hackathon</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Team Size
              </label>
              <input
                type="number"
                name="minTeamSize"
                value={formData.minTeamSize}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Team Size
              </label>
              <input
                type="number"
                name="maxTeamSize"
                value={formData.maxTeamSize}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your hackathon event..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/eligible-hackathons')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHackathon;
