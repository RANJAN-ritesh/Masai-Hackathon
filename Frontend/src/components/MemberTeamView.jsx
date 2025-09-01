import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Copy, User, Mail, Phone, Calendar, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContextProvider';

const MemberTeamView = () => {
  const navigate = useNavigate();
  const { userData, hackathon } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [hackathonData, setHackathonData] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';

  const fetchUserTeam = async () => {
    console.log('🚀 fetchUserTeam called');
    console.log('👤 userData:', userData);
    console.log('🏆 hackathon from context:', hackathon);
    
    if (!userData?._id) {
      console.log('❌ No userData._id found');
      setLoading(false);
      return;
    }

    // Get hackathon ID from multiple sources
    let hackathonId = hackathon?._id || 
                     localStorage.getItem('currentHackathon') ||
                     userData?.hackathonIds?.[0];

    if (!hackathonId) {
      console.log('❌ No hackathon ID found from any source');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`🔍 Fetching teams for hackathon ${hackathonId}`);

      // Use the SAME pattern as SelectTeamPage - fetch teams by hackathon
      const response = await fetch(`${baseURL}/team/hackathon/${hackathonId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch teams');
      }
      
      const teams = data.teams || data || [];
      console.log(`📋 Loaded ${teams.length} teams for hackathon ${hackathonId}`);
      console.log('📊 Teams:', teams);
      
      // Find user's team using the SAME logic as SelectTeamPage
      const userTeam = teams.find(team => {
        const isMember = team.teamMembers.some(member => member._id === userData._id);
        const isCreator = team.createdBy?._id === userData._id;
        return isMember || isCreator;
      });
      
      if (userTeam) {
        setTeamData(userTeam);
        console.log(`✅ Found user's team: ${userTeam.teamName}`);
        console.log('🎯 Team details:', userTeam);
        
        // Set hackathon data from context or fetch it
        if (hackathon) {
          setHackathonData(hackathon);
        } else if (userTeam.hackathonId) {
          // Fetch hackathon data if not in context
          const hackathonResponse = await fetch(`${baseURL}/hackathons/${userTeam.hackathonId}`);
          if (hackathonResponse.ok) {
            const hackathonData = await hackathonResponse.json();
            setHackathonData(hackathonData);
            console.log(`✅ Fetched hackathon: ${hackathonData.title}`);
          }
        }
      } else {
        console.warn(`⚠️ No team found for user ${userData.name} in hackathon ${hackathonId}`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching user team:', error);
      toast.error('Error loading team information');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`, { autoClose: 2000 });
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const copyTeamToClipboard = () => {
    if (!teamData) return;
    
    const csvHeader = "Name\tEmail\tRole\tCourse\tSkills\tVertical\tPhone\n";
    let csvContent = csvHeader;
    
    // Add team leader first
    const leader = teamData.createdBy;
    if (leader) {
      csvContent += `${leader.name || 'Unknown'}\t${leader.email || 'N/A'}\tleader\t${leader.course || 'N/A'}\t${leader.skills ? leader.skills.join(', ') : 'N/A'}\t${leader.vertical || 'N/A'}\t${leader.phoneNumber || 'N/A'}\n`;
    }
    
    // Add team members
    teamData.teamMembers?.forEach(member => {
      if (member._id !== teamData.createdBy?._id) {
        csvContent += `${member.name || 'Unknown'}\t${member.email || 'N/A'}\tmember\t${member.course || 'N/A'}\t${member.skills ? member.skills.join(', ') : 'N/A'}\t${member.vertical || 'N/A'}\t${member.phoneNumber || 'N/A'}\n`;
      }
    });
    
    copyToClipboard(csvContent, 'Team data');
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    fetchUserTeam();
  }, [userData, hackathon]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Team Not Found */}
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="bg-red-50 p-5 rounded-full inline-block mb-6">
              <Users className="w-16 h-16 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Team Not Found</h2>
            <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
              You haven't been assigned to a team yet for {hackathonData?.title || 'this hackathon'}.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={fetchUserTeam}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Retry
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium mr-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Team</h1>
              <p className="text-gray-600 mt-1">
                {hackathonData?.title || 'Team Information'}
              </p>
            </div>
          </div>
          
          <button
            onClick={copyTeamToClipboard}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Team Data
          </button>
        </div>

        {/* Team Information Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{teamData.teamName}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {teamData.teamMembers?.length || 0} members
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {hackathonData?.startDate ? new Date(hackathonData.startDate).toLocaleDateString() : 'TBD'}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {teamData.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Description */}
            {teamData.description && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{teamData.description}</p>
              </div>
            )}

            {/* Team Leader */}
            {teamData.createdBy && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-500" />
                  Team Leader
                </h3>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {teamData.createdBy.name?.charAt(0) || 'L'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{teamData.createdBy.name}</h4>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {teamData.createdBy.email}
                      </p>
                      {teamData.createdBy.phoneNumber && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {teamData.createdBy.phoneNumber}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        Leader
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Members */}
            {teamData.teamMembers && teamData.teamMembers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  Team Members ({teamData.teamMembers.length})
                </h3>
                <div className="grid gap-4">
                  {teamData.teamMembers.map((member, index) => {
                    const isLeader = member._id === teamData.createdBy?._id;
                    
                    return (
                      <div key={member._id || index} className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                            {member.name?.charAt(0) || 'M'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{member.name}</h4>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {member.email}
                            </p>
                            {member.phoneNumber && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {member.phoneNumber}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isLeader 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isLeader ? 'Leader' : 'Member'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hackathon Information */}
        {hackathonData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hackathon Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">{hackathonData.title}</h4>
                <p className="text-sm text-gray-600">{hackathonData.description}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Start:</strong> {hackathonData.startDate ? new Date(hackathonData.startDate).toLocaleDateString() : 'TBD'}</p>
                <p><strong>End:</strong> {hackathonData.endDate ? new Date(hackathonData.endDate).toLocaleDateString() : 'TBD'}</p>
                <p><strong>Status:</strong> <span className="capitalize">{hackathonData.status}</span></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberTeamView;
