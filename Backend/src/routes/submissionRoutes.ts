import express from "express";
import { authenticateUser } from "../middleware/auth";
import Team from "../model/team";
import Hackathon from "../model/hackathon";

const router = express.Router();

// Submit project (team leader only)
router.post("/submit-project", authenticateUser, async (req, res) => {
  try {
    const { teamId, submissionLink } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!teamId || !submissionLink) {
      return res.status(400).json({ message: "Team ID and submission link are required" });
    }

    // Verify team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is team leader
    const isTeamLeader = team.teamLeader && (
      team.teamLeader.toString() === userId ||
      team.teamLeader.toString() === req.user?.id ||
      team.teamLeader.equals(userId) ||
      team.teamLeader.equals(req.user?.id)
    );
    
    const isTeamCreator = team.createdBy && (
      team.createdBy.toString() === userId ||
      team.createdBy.toString() === req.user?.id ||
      team.createdBy.equals(userId) ||
      team.createdBy.equals(req.user?.id)
    );
    
    const isTeamMember = team.teamMembers.some(member => 
      member.toString() === userId ||
      member.toString() === req.user?.id ||
      member.equals(userId) ||
      member.equals(req.user?.id)
    );
    
    const hasLeaderRole = req.user?.role === 'leader';
    const isLeader = isTeamLeader || isTeamCreator || (isTeamMember && hasLeaderRole);
    
    if (!isLeader) {
      return res.status(403).json({ 
        message: "Only team leaders can submit projects",
        debug: {
          teamLeader: team.teamLeader?.toString(),
          userId: userId,
          reqUserId: req.user?.id,
          createdBy: team.createdBy?.toString(),
          userRole: req.user?.role,
          isTeamLeader,
          isTeamCreator,
          isTeamMember,
          hasLeaderRole
        }
      });
    }

    // Check if submission window is open
    if (team.hackathonId) {
      const hackathon = await Hackathon.findById(team.hackathonId);
      if (hackathon) {
        const now = new Date();
        const submissionStart = new Date(hackathon.submissionStartDate);
        const submissionEnd = new Date(hackathon.submissionEndDate);

        if (now < submissionStart) {
          return res.status(400).json({ 
            message: "Submission window has not opened yet",
            submissionStart: submissionStart,
            submissionEnd: submissionEnd
          });
        }

        if (now > submissionEnd) {
          return res.status(400).json({ 
            message: "Submission window has closed",
            submissionStart: submissionStart,
            submissionEnd: submissionEnd
          });
        }
      }
    }

    // Check if team has already submitted
    if (team.submissionLink) {
      return res.status(400).json({ 
        message: "Team has already submitted a project",
        previousSubmission: team.submissionLink,
        submissionTime: team.submissionTime
      });
    }

    // Submit the project
    team.submissionLink = submissionLink;
    team.submissionTime = new Date();

    await team.save();

    res.json({ 
      message: "Project submitted successfully",
      submissionLink: submissionLink,
      submissionTime: team.submissionTime,
      teamId: teamId
    });

  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({ message: "Failed to submit project", error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get submission status
router.get("/submission-status/:teamId", authenticateUser, async (req, res) => {
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

    // Check if user is team member
    const isTeamMember = team.teamMembers.some(member => 
      member.toString() === userId ||
      member.toString() === req.user?.id ||
      member.equals(userId) ||
      member.equals(req.user?.id)
    );

    if (!isTeamMember) {
      return res.status(403).json({ message: "Only team members can view submission status" });
    }

    let submissionWindow = null;
    if (team.hackathonId) {
      const hackathon = await Hackathon.findById(team.hackathonId);
      if (hackathon) {
        submissionWindow = {
          startDate: hackathon.submissionStartDate,
          endDate: hackathon.submissionEndDate,
          isOpen: new Date() >= new Date(hackathon.submissionStartDate) && new Date() <= new Date(hackathon.submissionEndDate)
        };
      }
    }

    res.json({
      teamId: teamId,
      hasSubmitted: !!team.submissionLink,
      submissionLink: team.submissionLink,
      submissionTime: team.submissionTime,
      submissionWindow: submissionWindow
    });

  } catch (error) {
    console.error('Error getting submission status:', error);
    res.status(500).json({ message: "Failed to get submission status", error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
