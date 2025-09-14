import React, { useState, useEffect } from 'react';
import { Download, Users, Trophy, Calendar, Target, Link, Mail, Phone, Crown, User } from 'lucide-react';

const HackathonDataView = ({ hackathon, hackathonData }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (hackathonData) {
      setData(hackathonData);
      setLoading(false);
    }
  }, [hackathonData]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredData = data.filter(row => 
    row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.teamName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aVal.toString().localeCompare(bVal.toString());
    } else {
      return bVal.toString().localeCompare(aVal.toString());
    }
  });

  const exportToCSV = () => {
    const headers = [
      'Email', 'Name', 'Phone Number', 'Hackathon Name', 'Participation Date',
      'Team Name', 'Rank', 'Problem Statement Picked', 'Problem Statement Picked Timestamp',
      'Submission Link', 'Submission Timestamp'
    ];

    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => [
        row.email || '',
        row.name || '',
        row.phoneNumber || '',
        row.hackathonName || '',
        row.participationDate || '',
        row.teamName || '',
        row.rank || '',
        row.problemStatementPicked || '',
        row.problemStatementPickedTimestamp || '',
        row.submissionLink || '',
        row.submissionTimestamp || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hackathon?.title || 'hackathon'}_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Hackathon Data - {hackathon?.title}
          </h2>
          <p className="text-gray-600 mt-1">
            Complete participation and submission data
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Total Participants</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{data.length}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Teams</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {new Set(data.map(row => row.teamName).filter(Boolean)).size}
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">Leaders</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {data.filter(row => row.rank === 'leader').length}
          </p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">Submissions</span>
          </div>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {data.filter(row => row.submissionLink).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search participants, teams, or emails..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                  {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Name
                  {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Phone
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Participation Date
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('teamName')}
              >
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Team Name
                  {sortField === 'teamName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  Rank
                  {sortField === 'rank' && (sortDirection === 'asc' ? '↑' : '↓')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Problem Statement
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Problem Picked At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Link className="w-4 h-4" />
                  Submission Link
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submission At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.email}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.phoneNumber || 'N/A'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.participationDate ? new Date(row.participationDate).toLocaleString() : 'N/A'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.teamName || 'No Team'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    row.rank === 'leader' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {row.rank === 'leader' ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Leader
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        Member
                      </>
                    )}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.problemStatementPicked || 'N/A'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.problemStatementPickedTimestamp ? new Date(row.problemStatementPickedTimestamp).toLocaleString() : 'N/A'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  {row.submissionLink ? (
                    <a 
                      href={row.submissionLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline truncate max-w-xs block"
                    >
                      {row.submissionLink}
                    </a>
                  ) : (
                    <span className="text-gray-400">No submission</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.submissionTimestamp ? new Date(row.submissionTimestamp).toLocaleString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No participants found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default HackathonDataView;
