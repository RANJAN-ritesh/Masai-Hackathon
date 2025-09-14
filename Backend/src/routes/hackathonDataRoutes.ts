import express from 'express';
import { authenticateUser } from '../middleware/auth';
import Hackathon from '../model/hackathon';
import Team from '../model/team';
import User from '../model/user';

const router = express.Router();

// Get hackathon data for admin (Metabase-style table)
router.get('/data/:hackathonId', authenticateUser, async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user?.id;

    console.log('Fetching hackathon data:', { hackathonId, userId });

    // Find hackathon
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    // Check if user is admin (you might want to add proper admin check)
    // For now, assuming any authenticated user can access this
    // In production, you should verify admin role

    // Get all teams for this hackathon
    const teams = await Team.find({ hackathonId }).populate('teamMembers', 'name email phoneNumber');
    
    // Get all participants for this hackathon
    const participants = await User.find({ 
      currentHackathon: hackathonId 
    }).populate('currentTeamId');

    console.log('Found teams:', teams.length);
    console.log('Found participants:', participants.length);

    // Build the data table
    const dataTable = [];

    // Process each participant
    for (const participant of participants) {
      const team = teams.find(t => 
        t.teamMembers.some((member: any) => member._id.toString() === (participant._id as any).toString()) ||
        t.createdBy?.toString() === (participant._id as any).toString()
      );

      const isLeader = team ? (
        team.createdBy?.toString() === (participant._id as any).toString() ||
        team.teamLeader?.toString() === (participant._id as any).toString() ||
        (team as any).members?.some((member: any) => member._id.toString() === (participant._id as any).toString() && member.role === 'leader')
      ) : false;

      // Find participation date (when user was added to hackathon)
      const participationDate = (participant as any).currentHackathonJoinedAt || 
                               participant.createdAt || 
                               new Date();

      dataTable.push({
        email: participant.email,
        name: participant.name,
        phoneNumber: participant.phoneNumber || '',
        hackathonName: hackathon.title,
        participationDate: participationDate.toISOString(),
        teamName: team?.teamName || 'No Team',
        rank: isLeader ? 'leader' : 'member',
        problemStatementPicked: team?.selectedProblemStatement || '',
        problemStatementPickedTimestamp: team?.problemStatementSelectedAt?.toISOString() || '',
        submissionLink: team?.submissionLink || '',
        submissionTimestamp: team?.submissionTime?.toISOString() || ''
      });
    }

    console.log('Generated data table with', dataTable.length, 'rows');

    res.json({
      success: true,
      data: dataTable,
      hackathon: {
        id: hackathon._id,
        title: hackathon.title,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        status: hackathon.status
      },
      stats: {
        totalParticipants: dataTable.length,
        totalTeams: teams.length,
        totalLeaders: dataTable.filter(row => row.rank === 'leader').length,
        totalSubmissions: dataTable.filter(row => row.submissionLink).length
      }
    });

  } catch (error) {
    console.error('Error fetching hackathon data:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: (error as Error).message 
    });
  }
});

// Check if hackathon has ended
router.get('/status/:hackathonId', authenticateUser, async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    const now = new Date();
    const endDate = new Date(hackathon.endDate);
    const chatEndDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000); // 1 day after hackathon ends

    const isEnded = now > endDate;
    const chatLocked = now > chatEndDate;

    res.json({
      hackathonId,
      title: hackathon.title,
      endDate: hackathon.endDate,
      isEnded,
      chatLocked,
      chatEndDate: chatEndDate.toISOString(),
      timeUntilChatLock: chatLocked ? 0 : Math.max(0, chatEndDate.getTime() - now.getTime())
    });

  } catch (error) {
    console.error('Error checking hackathon status:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: (error as Error).message 
    });
  }
});

export default router;
