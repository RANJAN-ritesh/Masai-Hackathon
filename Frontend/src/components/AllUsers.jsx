import React, { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';

const AllUsers = () => {
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen px-6 md:px-8 max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" /> All Users
        </h1>
        <div className="relative w-full max-w-sm">
          <input
            className="w-full pl-10 pr-3 py-2 rounded-lg theme-input"
            placeholder="Search by name, email, phone, role..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
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
                  <th className="px-4 py-3">Team</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.name || '-'}</td>
                    <td className="px-4 py-3">{u.email || '-'}</td>
                    <td className="px-4 py-3">{u.phoneNumber || '-'}</td>
                    <td className="px-4 py-3 capitalize">{u.role || '-'}</td>
                    <td className="px-4 py-3">{u.teamId ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>No users match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers; 