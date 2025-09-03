import React, { useEffect, useState } from 'react';
import { Search, Users, Edit, Trash2, AlertTriangle, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-toastify';

const AllUsers = () => {
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${baseURL}/users/getAllUsers`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.users || []);
        setUsers(arr);
        setFiltered(arr);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const term = q.trim().toLowerCase();
    if (!term) {
      setFiltered(users);
    } else {
      setFiltered(
        users.filter(u =>
          [u.name, u.email, u.phoneNumber, u.role]
            .filter(Boolean)
            .some(v => String(v).toLowerCase().includes(term))
        )
      );
    }
  }, [q, users]);

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${baseURL}/users/delete-user/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`User "${userName}" deleted successfully`);
        // Refresh the users list
        const res = await fetch(`${baseURL}/users/getAllUsers`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.users || []);
        setUsers(arr);
        setFiltered(arr);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteAllUsers = async () => {
    if (!confirm('Are you sure you want to delete ALL non-admin users? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${baseURL}/users/delete-all-users`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`${result.deletedCount} users deleted successfully`);
        // Refresh the users list
        const res = await fetch(`${baseURL}/users/getAllUsers`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.users || []);
        setUsers(arr);
        setFiltered(arr);
        setShowDeleteAllModal(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete all users');
      }
    } catch (error) {
      console.error('Error deleting all users:', error);
      toast.error('Failed to delete all users');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedData) => {
    try {
      const response = await fetch(`${baseURL}/users/update-user/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('User updated successfully');
        // Refresh the users list
        const res = await fetch(`${baseURL}/users/getAllUsers`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data.users || []);
        setUsers(arr);
        setFiltered(arr);
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const nonAdminUsersCount = users.filter(user => user.role !== 'admin').length;

  return (
    <div className="min-h-screen px-6 md:px-8 max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" /> All Users ({users.length})
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg theme-input"
              placeholder="Search by name, email, phone, role..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
          </div>
          {nonAdminUsersCount > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete All ({nonAdminUsersCount})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.name || '-'}</td>
                    <td className="px-4 py-3">{u.email || '-'}</td>
                    <td className="px-4 py-3">{u.phoneNumber || '-'}</td>
                    <td className="px-4 py-3 capitalize">{u.role || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        u.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {u.isVerified ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            Verified
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.teamId ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name || u.email)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>No users match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete All Users Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold">Delete All Users</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This will permanently delete all {nonAdminUsersCount} non-admin users from the database. 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllUsers}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onSave={handleUpdateUser}
        />
      )}
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    role: user.role || 'member',
    isVerified: user.isVerified || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Edit User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="member">Member</option>
              <option value="leader">Leader</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVerified"
              checked={formData.isVerified}
              onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-900">
              Verified User
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AllUsers; 