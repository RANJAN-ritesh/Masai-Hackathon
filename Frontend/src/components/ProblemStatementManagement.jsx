import React, { useState, useEffect, useContext } from "react";
import { Plus, Edit, Trash2, Download, Eye, Users, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { MyContext } from "../context/AuthContextProvider";

const ProblemStatementManagement = ({ hackathonData }) => {
  const { userData } = useContext(MyContext);
  const [problemStatements, setProblemStatements] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTeamDataModal, setShowTeamDataModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "Medium"
  });

  useEffect(() => {
    if (hackathonData?._id) {
      loadProblemStatements();
    }
  }, [hackathonData]);

  const loadProblemStatements = async () => {
    try {
      const response = await fetch(`/problem-statements/hackathon/${hackathonData._id}`);
      const data = await response.json();
      if (data.success) {
        setProblemStatements(data.problemStatements);
      }
    } catch (error) {
      console.error("Error loading problem statements:", error);
      toast.error("Failed to load problem statements");
    }
  };

  const loadTeamData = async () => {
    try {
      const response = await fetch(`/problem-statements/admin/hackathon/${hackathonData._id}/team-data`);
      const data = await response.json();
      if (data.success) {
        setTeamData(data.teamData);
      }
    } catch (error) {
      console.error("Error loading team data:", error);
      toast.error("Failed to load team data");
    }
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/problem-statements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ...formData,
          hackathonId: hackathonData._id
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Problem statement created successfully!");
        setShowCreateModal(false);
        setFormData({ title: "", description: "", category: "", difficulty: "Medium" });
        loadProblemStatements();
      } else {
        toast.error(data.message || "Failed to create problem statement");
      }
    } catch (error) {
      console.error("Error creating problem:", error);
      toast.error("Failed to create problem statement");
    }
  };

  const handleEditProblem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/problem-statements/${editingProblem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Problem statement updated successfully!");
        setShowEditModal(false);
        setEditingProblem(null);
        setFormData({ title: "", description: "", category: "", difficulty: "Medium" });
        loadProblemStatements();
      } else {
        toast.error(data.message || "Failed to update problem statement");
      }
    } catch (error) {
      console.error("Error updating problem:", error);
      toast.error("Failed to update problem statement");
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm("Are you sure you want to delete this problem statement?")) {
      return;
    }
    
    try {
      const response = await fetch(`/problem-statements/${problemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success("Problem statement deleted successfully!");
        loadProblemStatements();
      } else {
        toast.error(data.message || "Failed to delete problem statement");
      }
    } catch (error) {
      console.error("Error deleting problem:", error);
      toast.error("Failed to delete problem statement");
    }
  };

  const handleExportCSV = () => {
    if (teamData.length === 0) {
      toast.error("No team data to export");
      return;
    }
    
    const csvData = teamData.map(team => ({
      "Team Name": team.team.name,
      "Team Leader": team.team.createdBy.name,
      "Team Members": team.team.teamMembers.map(member => member.name).join(", "),
      "Selected Problem": team.selection?.selectedProblemId?.title || "Not Selected",
      "Problem Category": team.selection?.selectedProblemId?.category || "N/A",
      "Problem Difficulty": team.selection?.selectedProblemId?.difficulty || "N/A",
      "Selection Method": team.selection?.selectionMethod || "N/A",
      "Selected At": team.selection?.selectedAt ? new Date(team.selection.selectedAt).toLocaleString() : "N/A",
      "Submission URL": team.submission?.submissionUrl || "Not Submitted",
      "Submitted At": team.submission?.submittedAt ? new Date(team.submission.submittedAt).toLocaleString() : "N/A",
      "Submitted By": team.submission?.submittedBy?.name || "N/A"
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${hackathonData.title}_team_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("CSV exported successfully!");
  };

  const openEditModal = (problem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title,
      description: problem.description,
      category: problem.category,
      difficulty: problem.difficulty
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowTeamDataModal(false);
    setEditingProblem(null);
    setFormData({ title: "", description: "", category: "", difficulty: "Medium" });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Problem Statement Management
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              loadTeamData();
              setShowTeamDataModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
          >
            <Eye size={20} />
            <span>View Team Data</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Problem Statements List */}
      <div className="space-y-4">
        {problemStatements.length > 0 ? (
          problemStatements.map((problem) => (
            <div key={problem._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-800">{problem.title}</h3>
                    <span className="text-sm text-gray-500">{problem.category}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{problem.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(problem)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteProblem(problem._id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No problem statements added yet. Click "Add Problem" to get started.
          </div>
        )}
      </div>

      {/* Create Problem Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg relative shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Create Problem Statement
            </h3>
            
            <form onSubmit={handleCreateProblem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="SDET">SDET</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Problem Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg relative shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Edit Problem Statement
            </h3>
            
            <form onSubmit={handleEditProblem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="SDET">SDET</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Data Modal */}
      {showTeamDataModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Team Data & Submissions
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
                >
                  <Download size={20} />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={closeModals}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {teamData.map((team, index) => (
                <div key={team.team._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{team.team.name}</h4>
                    <div className="flex items-center space-x-2">
                      {team.selection ? (
                        <span className="flex items-center space-x-1 text-green-600">
                          <CheckCircle size={16} />
                          <span className="text-sm">Problem Selected</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-red-600">
                          <XCircle size={16} />
                          <span className="text-sm">No Selection</span>
                        </span>
                      )}
                      {team.submission ? (
                        <span className="flex items-center space-x-1 text-green-600">
                          <CheckCircle size={16} />
                          <span className="text-sm">Submitted</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-red-600">
                          <XCircle size={16} />
                          <span className="text-sm">Not Submitted</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Team Members:</h5>
                      <p className="text-sm text-gray-600">
                        {team.team.teamMembers.map(member => member.name).join(", ")}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Selected Problem:</h5>
                      <p className="text-sm text-gray-600">
                        {team.selection?.selectedProblemId?.title || "Not Selected"}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Submission:</h5>
                      <p className="text-sm text-gray-600">
                        {team.submission?.submissionUrl || "Not Submitted"}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Selection Method:</h5>
                      <p className="text-sm text-gray-600">
                        {team.selection?.selectionMethod || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemStatementManagement;
