import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../context/AuthContextProvider';
import { Users, Mail, Phone, Award, ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const MemberTeamView = () => {
  const { userData } = useContext(MyContext);
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_BASE_URL || 'https://masai-hackathon.onrender.com';
  
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hackathonData, setHackathonData] = useState(null);

  useEffect(() => {
    fetchMemberTeamData();
  }, [userData]);

  const fetchMemberTeamData = async () => {
    if (!userData?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`🔍 Fetching team data for member ${userData.name} (${userData._id})`);

      // Get all teams and find the user's team
      const teamResponse = await fetch(`${baseURL}/team/get-teams`);
      if (teamResponse.ok) {
        const teams = await teamResponse.json();
        // Try multiple ways to find the user's team
        let userTeam = null;
        
        // Method 1: Check if user is in teamMembers array
        userTeam = teams.find(team => 
          team.teamMembers && 
          team.teamMembers.some(member => 
            member._id === userData._id || member === userData._id
          )
        );
        
        // Method 2: Check if user is the creator
        if (!userTeam) {
          userTeam = teams.find(team => 
            team.createdBy && 
            (team.createdBy._id === userData._id || team.createdBy === userData._id)
          );
        }
        
        // Method 3: Check if userData has teamId (fallback)
        if (!userTeam && userData.teamId) {
          userTeam = teams.find(team => team._id === userData.teamId);
        }
        
        if (userTeam) {
          setTeamData(userTeam);
          console.log(`✅ Found user's team: ${userTeam.teamName}`);
          
          // Get hackathon data if team has hackathonId
          if (userTeam.hackathonId) {
            const hackathonResponse = await fetch(`${baseURL}/hackathons/${userTeam.hackathonId}`);
            if (hackathonResponse.ok) {
              const hackathon = await hackathonResponse.json();
              setHackathonData(hackathon);
              console.log(`✅ Found hackathon: ${hackathon.title}`);
            }
          }
        } else {
          console.warn(`⚠️ No team found for user ${userData.name} (${userData._id})`);
          console.log('Available teams:', teams.map(t => ({ id: t._id, name: t.teamName, members: t.teamMembers?.length || 0 })));
        }
      } else {
        console.error(`❌ Failed to fetch teams: ${teamResponse.status}`);
        toast.error('Failed to fetch team data');
      }
    } catch (error) {
      console.error('❌ Error fetching team data:', error);
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

  if (!userData?.teamId) {
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

          {/* No Team Message */}
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="bg-indigo-50 p-5 rounded-full inline-block mb-6">
              <Users className="w-16 h-16 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Team Assigned</h2>
            <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
              You haven't been assigned to a team yet. Please contact your hackathon organizer.
            </p>
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
              Your team information couldn't be loaded. Please try refreshing the page.
            </p>
            <button
              onClick={fetchMemberTeamData}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Retry
            </button>
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {teamData.teamName}
                </h2>
                <p className="text-gray-600">
                  {teamData.description || 'No description provided'}
                </p>
              </div>
              
              <div className="text-right">
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  {teamData.teamMembers?.length || 0} / {teamData.memberLimit || 4} Members
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
              
              {/* Team Leader */}
              {teamData.createdBy && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {teamData.createdBy.name?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">
                            {teamData.createdBy.name || 'Unknown'}
                          </h4>
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <Award className="w-3 h-3 mr-1" />
                            LEADER
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {teamData.createdBy.email || 'No email'}
                          </div>
                          {teamData.createdBy.phoneNumber && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              {teamData.createdBy.phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        <div><strong>Course:</strong> {teamData.createdBy.course || 'N/A'}</div>
                        <div><strong>Vertical:</strong> {teamData.createdBy.vertical || 'N/A'}</div>
                        {teamData.createdBy.skills && (
                          <div><strong>Skills:</strong> {teamData.createdBy.skills.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Members */}
              {teamData.teamMembers?.filter(member => member._id !== teamData.createdBy?._id).map((member, index) => {
                const isCurrentUser = member._id === userData._id;
                return (
                  <div
                    key={member._id}
                    className={`border rounded-lg p-4 ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          isCurrentUser 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }`}>
                          {member.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">
                              {member.name || 'Unknown'}
                              {isCurrentUser && (
                                <span className="text-blue-600 ml-2">(You)</span>
                              )}
                            </h4>
                            <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              MEMBER
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {member.email || 'No email'}
                            </div>
                            {member.phoneNumber && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                {member.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          <div><strong>Course:</strong> {member.course || 'N/A'}</div>
                          <div><strong>Vertical:</strong> {member.vertical || 'N/A'}</div>
                          {member.skills && (
                            <div><strong>Skills:</strong> {member.skills.join(', ')}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hackathon Information */}
        {hackathonData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Hackathon Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Event Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Title:</strong> {hackathonData.title}</div>
                  <div><strong>Type:</strong> {hackathonData.eventType}</div>
                  <div><strong>Team Size:</strong> {hackathonData.minTeamSize}-{hackathonData.maxTeamSize} members</div>
                  <div><strong>Status:</strong> <span className="capitalize">{hackathonData.status}</span></div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Start:</strong> {new Date(hackathonData.startDate).toLocaleDateString()}</div>
                  <div><strong>End:</strong> {new Date(hackathonData.endDate).toLocaleDateString()}</div>
                  {hackathonData.submissionStart && (
                    <div><strong>Submission Start:</strong> {new Date(hackathonData.submissionStart).toLocaleDateString()}</div>
                  )}
                  {hackathonData.submissionEnd && (
                    <div><strong>Submission End:</strong> {new Date(hackathonData.submissionEnd).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberTeamView; 