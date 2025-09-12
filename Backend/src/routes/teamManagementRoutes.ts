import express from 'express';
import { authenticateUser } from '../middleware/auth';
import Team from '../model/team';
import Hackathon from '../model/hackathon';

const router = express.Router();

// Select problem statement (team leader only)
router.post('/select-problem-statement', authenticateUser, async (req, res) => {
  try {
    const { teamId, problemStatement } = req.body;
    const userId = req.user?.id;

    console.log('🎯 Selecting problem statement:', { teamId, problemStatement, userId });

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team leader
    const isLeader = team.createdBy?.toString() === userId || 
                    team.teamLeader?.toString() === userId;
    
    if (!isLeader) {
      return res.status(403).json({ message: 'Only team leaders can select problem statements' });
    }

    // Check if problem statement is already selected
    if (team.selectedProblemStatement) {
      return res.status(400).json({ message: 'Problem statement already selected and cannot be changed' });
    }

    // Get hackathon to validate problem statement
    const hackathon = await Hackathon.findById(team.hackathonId);
    if (!hackathon || !hackathon.problemStatements) {
      return res.status(404).json({ message: 'Hackathon or problem statements not found' });
    }

    // Validate problem statement exists
    const problemExists = hackathon.problemStatements.some(ps => ps.track === problemStatement);
    if (!problemExists) {
      return res.status(400).json({ message: 'Invalid problem statement' });
    }

    // Update team with selected problem statement
    await Team.findByIdAndUpdate(teamId, {
      selectedProblemStatement: problemStatement,
      problemStatementSelectedAt: new Date()
    });

    console.log('✅ Problem statement selected successfully');

    res.json({
      message: 'Problem statement selected successfully',
      selectedProblemStatement: problemStatement
    });

  } catch (error) {
    console.error('❌ Error selecting problem statement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit project (team leader only)
router.post('/submit-project', authenticateUser, async (req, res) => {
  try {
    const { teamId, submissionLink } = req.body;
    const userId = req.user?.id;

    console.log('📤 Submitting project:', { teamId, submissionLink, userId });

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team leader
    const isLeader = team.createdBy?.toString() === userId || 
                    team.teamLeader?.toString() === userId;
    
    if (!isLeader) {
      return res.status(403).json({ message: 'Only team leaders can submit projects' });
    }

    // Check if problem statement is selected
    if (!team.selectedProblemStatement) {
      return res.status(400).json({ message: 'Please select a problem statement first' });
    }

    // Check if project is already submitted
    if (team.submissionLink) {
      return res.status(400).json({ message: 'Project already submitted and cannot be changed' });
    }

    // Validate submission link
    if (!submissionLink || !submissionLink.trim()) {
      return res.status(400).json({ message: 'Submission link is required' });
    }

    // Update team with submission
    await Team.findByIdAndUpdate(teamId, {
      submissionLink: submissionLink.trim(),
      submissionTime: new Date()
    });

    console.log('✅ Project submitted successfully');

    res.json({
      message: 'Project submitted successfully',
      submissionLink: submissionLink.trim()
    });

  } catch (error) {
    console.error('❌ Error submitting project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get team status (including problem statement and submission status)
router.get('/status/:teamId', authenticateUser, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user?.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is team member
    const isMember = team.teamMembers.some(member => member.toString() === userId) ||
                    team.createdBy?.toString() === userId;
    
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this team' });
    }

    res.json({
      teamId: team._id,
      selectedProblemStatement: team.selectedProblemStatement,
      problemStatementSelectedAt: team.problemStatementSelectedAt,
      submissionLink: team.submissionLink,
      submissionTime: team.submissionTime,
      isLeader: team.createdBy?.toString() === userId || team.teamLeader?.toString() === userId
    });

  } catch (error) {
    console.error('❌ Error getting team status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
