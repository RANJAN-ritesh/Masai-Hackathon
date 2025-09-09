import express from "express";
import { authenticateUser } from "../middleware/auth";
import Team from "../model/team";
import Hackathon from "../model/hackathon";
import User from "../model/user";

const router = express.Router();

// Download hackathon data as CSV
router.get("/download-hackathon-data/:hackathonId", authenticateUser, async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Check if user is admin (hackathon creator or has admin role)
    const isAdmin = (hackathon as any).createdBy?.toString() === userId || req.user?.role === 'admin';
    
    console.log('🔍 CSV DOWNLOAD DEBUG:');
    console.log('Hackathon createdBy:', (hackathon as any).createdBy?.toString());
    console.log('User ID:', userId);
    console.log('User role:', req.user?.role);
    console.log('Is admin:', isAdmin);
    
    if (!isAdmin) {
      return res.status(403).json({ message: "Only hackathon admin can download data" });
    }

    // Get all teams for this hackathon
    const teams = await Team.find({ hackathonId: hackathonId }).populate('teamMembers teamLeader createdBy');

    // Prepare CSV data
    const csvData = [];
    
    // Add header row
    csvData.push([
      'Team ID',
      'Team Name',
      'Team Leader Name',
      'Team Leader Email',
      'Team Members',
      'Team Member Emails',
      'Problem Statement',
      'Submission Link',
      'Submission Time',
      'Team Creation Time',
      'Team Status'
    ]);

    // Add data rows
    for (const team of teams) {
      const teamMembers = team.teamMembers || [];
      const teamMemberNames = teamMembers.map((member: any) => member.name || 'Unknown').join('; ');
      const teamMemberEmails = teamMembers.map((member: any) => member.email || 'Unknown').join('; ');
      
      const teamLeader = team.teamLeader || {};
      const teamLeaderName = (teamLeader as any).name || 'Unknown';
      const teamLeaderEmail = (teamLeader as any).email || 'Unknown';

      csvData.push([
        (team._id as any).toString(),
        team.teamName || 'Unknown',
        teamLeaderName,
        teamLeaderEmail,
        teamMemberNames,
        teamMemberEmails,
        team.selectedProblemStatement || 'Not Selected',
        team.submissionLink || 'Not Submitted',
        team.submissionTime ? team.submissionTime.toISOString() : 'Not Submitted',
        team.createdAt ? team.createdAt.toISOString() : 'Unknown',
        team.status || 'Unknown'
      ]);
    }

    // Convert to CSV string
    const csvString = csvData.map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="hackathon-${hackathon.title}-data.csv"`);
    
    res.send(csvString);

  } catch (error) {
    console.error('Error downloading hackathon data:', error);
    res.status(500).json({ message: "Failed to download hackathon data", error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get hackathon statistics (for admin dashboard)
router.get("/hackathon-stats/:hackathonId", authenticateUser, async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Check if user is admin
    const isAdmin = (hackathon as any).createdBy?.toString() === userId;
    if (!isAdmin) {
      return res.status(403).json({ message: "Only hackathon admin can view statistics" });
    }

    // Get team statistics
    const teams = await Team.find({ hackathonId: hackathonId });
    
    const stats = {
      totalTeams: teams.length,
      teamsWithSubmissions: teams.filter(team => team.submissionLink).length,
      teamsWithoutSubmissions: teams.filter(team => !team.submissionLink).length,
      teamsWithProblemStatements: teams.filter(team => team.selectedProblemStatement).length,
      teamsWithoutProblemStatements: teams.filter(team => !team.selectedProblemStatement).length,
      totalParticipants: teams.reduce((sum, team) => sum + (team.teamMembers?.length || 0), 0),
      submissionRate: teams.length > 0 ? (teams.filter(team => team.submissionLink).length / teams.length * 100).toFixed(2) : 0
    };

    res.json({
      hackathonId: hackathonId,
      hackathonTitle: hackathon.title,
      stats: stats
    });

  } catch (error) {
    console.error('Error getting hackathon stats:', error);
    res.status(500).json({ message: "Failed to get hackathon statistics", error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
