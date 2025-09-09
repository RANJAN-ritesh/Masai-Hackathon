import express from "express";
import { authenticateUser } from "../middleware/auth";
import Team from "../model/team";
import User from "../model/user";
import Notification from "../model/notification";

const router = express.Router();

// Report a team member
router.post("/report-member", authenticateUser, async (req, res) => {
  try {
    const { teamId, reportedUserId, reason } = req.body;
    const reporterId = req.user?.id;

    if (!reporterId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!teamId || !reportedUserId) {
      return res.status(400).json({ message: "Team ID and reported user ID are required" });
    }

    // Verify team exists and user is a member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if reporter is a team member
    const isReporterMember = team.teamMembers.some(member => 
      member.toString() === reporterId
    );

    if (!isReporterMember) {
      return res.status(403).json({ message: "Only team members can report other members" });
    }

    // Check if reported user is a team member
    const isReportedMember = team.teamMembers.some(member => 
      member.toString() === reportedUserId
    );

    if (!isReportedMember) {
      return res.status(400).json({ message: "Reported user is not a team member" });
    }

    // Check if user is trying to report themselves
    if (reporterId === reportedUserId) {
      return res.status(400).json({ message: "Cannot report yourself" });
    }

    // Initialize reportedMembers if it doesn't exist
    if (!team.reportedMembers) {
      team.reportedMembers = new Map();
    }

    // Get existing reports for this user
    const existingReports = team.reportedMembers.get(reportedUserId) || [];
    
    // Check if this reporter has already reported this user
    if (existingReports.includes(reporterId)) {
      return res.status(400).json({ message: "You have already reported this member" });
    }

    // Add the report
    existingReports.push(reporterId);
    team.reportedMembers.set(reportedUserId, existingReports);

    await team.save();

    // Check if all other team members have reported this user
    const totalMembers = team.teamMembers.length;
    const reportsCount = existingReports.length;
    
    // If all members except the reported one have reported, notify admin
    if (reportsCount >= totalMembers - 1) {
      // Create notification for admin
      const adminNotification = new Notification({
        userId: team.createdBy, // Assuming admin is the team creator
        type: 'team_report',
        title: 'Team Member Reported by Entire Team',
        message: `All team members have reported ${reportedUserId} in team ${team.teamName}. Consider removing this member.`,
        data: {
          teamId: teamId,
          reportedUserId: reportedUserId,
          teamName: team.teamName,
          reason: reason || 'No reason provided'
        },
        isRead: false
      });

      await adminNotification.save();
    }

    res.json({ 
      message: "Member reported successfully",
      reportsCount: reportsCount,
      totalMembers: totalMembers - 1, // Excluding the reported member
      allMembersReported: reportsCount >= totalMembers - 1
    });

  } catch (error) {
    console.error('Error reporting member:', error);
    res.status(500).json({ message: "Failed to report member", error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get team reports (for admin)
router.get("/team-reports/:teamId", authenticateUser, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is admin (team creator)
    const isAdmin = team.createdBy?.toString() === userId;
    if (!isAdmin) {
      return res.status(403).json({ message: "Only team admin can view reports" });
    }

    const reports = {};
    if (team.reportedMembers) {
      for (const [reportedUserId, reporterIds] of team.reportedMembers) {
        (reports as any)[reportedUserId] = reporterIds;
      }
    }

    res.json({
      teamId: teamId,
      teamName: team.teamName,
      reports: reports
    });

  } catch (error) {
    console.error('Error getting team reports:', error);
    res.status(500).json({ message: "Failed to get team reports", error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Remove reported member (admin action)
router.post("/remove-reported-member", authenticateUser, async (req, res) => {
  try {
    const { teamId, memberToRemove } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is admin (team creator)
    const isAdmin = team.createdBy?.toString() === userId;
    if (!isAdmin) {
      return res.status(403).json({ message: "Only team admin can remove members" });
    }

    // Remove member from team
    team.teamMembers = team.teamMembers.filter(member => 
      member.toString() !== memberToRemove
    );

    // Remove from reported members
    if (team.reportedMembers) {
      team.reportedMembers.delete(memberToRemove);
    }

    // Update user's teamId to null
    await User.findByIdAndUpdate(memberToRemove, { teamId: null });

    await team.save();

    res.json({ 
      message: "Member removed successfully",
      remainingMembers: team.teamMembers.length
    });

  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: "Failed to remove member", error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
