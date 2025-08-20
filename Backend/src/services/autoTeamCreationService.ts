import { IHackathon } from '../model/hackathon';
import { ITeam } from '../model/team';
import { IUser } from '../model/user';
import Hackathon from '../model/hackathon';
import Team from '../model/team';
import User from '../model/user';
import { notificationService, createAutoTeamCreationNotification } from './notificationService';

export class AutoTeamCreationService {
  private static instance: AutoTeamCreationService;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): AutoTeamCreationService {
    if (!AutoTeamCreationService.instance) {
      AutoTeamCreationService.instance = new AutoTeamCreationService();
    }
    return AutoTeamCreationService.instance;
  }

  // Start the auto-team creation service
  public start(): void {
    if (this.intervalId) {
      console.log('Auto-team creation service is already running');
      return;
    }

    // Check every 5 minutes for hackathons that need auto-team creation
    this.intervalId = setInterval(async () => {
      await this.checkAndCreateTeams();
    }, 5 * 60 * 1000); // 5 minutes

    console.log('🚀 Auto-team creation service started');
  }

  // Stop the service
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Auto-team creation service stopped');
    }
  }

  // Check for hackathons that need auto-team creation
  private async checkAndCreateTeams(): Promise<void> {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      // Find hackathons that start within the next hour and allow participant teams
      const hackathons = await Hackathon.find({
        startDate: { $gte: now, $lte: oneHourFromNow },
        status: 'upcoming',
        allowParticipantTeams: true,
        autoTeamCreationEnabled: true
      });

      console.log(`🔍 Found ${hackathons.length} hackathons that may need auto-team creation`);

      for (const hackathon of hackathons) {
        await this.processHackathon(hackathon);
      }
    } catch (error) {
      console.error('❌ Error in auto-team creation check:', error);
    }
  }

  // Process a single hackathon for auto-team creation
  private async processHackathon(hackathon: IHackathon): Promise<void> {
    try {
      console.log(`🔍 Processing hackathon: ${hackathon.title}`);

      // Get all participants for this hackathon
      const participants = await User.find({
        hackathonIds: hackathon._id
      });

      console.log(`👥 Found ${participants.length} participants for hackathon ${hackathon.title}`);

      // Find participants who don't have teams yet
      const participantsWithoutTeams = participants.filter(p => !p.currentTeamId);
      
      if (participantsWithoutTeams.length === 0) {
        console.log(`✅ All participants in hackathon ${hackathon.title} already have teams`);
        return;
      }

      console.log(`⚠️ ${participantsWithoutTeams.length} participants without teams in hackathon ${hackathon.title}`);

      // Create teams for remaining participants
      const teamsCreated = await this.createTeamsForRemainingParticipants(
        hackathon,
        participantsWithoutTeams
      );

      if (teamsCreated.length > 0) {
        console.log(`🎉 Created ${teamsCreated.length} teams for remaining participants`);
        
        // Send notifications to all participants
        await this.sendAutoTeamCreationNotifications(hackathon, teamsCreated);
      }

    } catch (error) {
      console.error(`❌ Error processing hackathon ${hackathon.title}:`, error);
    }
  }

  // Create teams for remaining participants
  private async createTeamsForRemainingParticipants(
    hackathon: IHackathon,
    participants: IUser[]
  ): Promise<ITeam[]> {
    const teamsCreated: ITeam[] = [];
    const remainingParticipants = [...participants];

    while (remainingParticipants.length > 0) {
      // Calculate optimal team size
      const teamSize = this.calculateOptimalTeamSize(
        remainingParticipants.length,
        hackathon.minTeamSize,
        hackathon.maxTeamSize
      );

      // Take participants for this team
      const teamMembers = remainingParticipants.splice(0, teamSize);
      
      // Assign team leader (first member)
      const teamLeader = teamMembers[0];

      // Create team
      const team = new Team({
        teamName: `AutoTeam_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        description: `Auto-generated team for ${hackathon.title}`,
        hackathonId: hackathon._id,
        createdBy: teamLeader._id,
        teamMembers: teamMembers.map(p => p._id),
        memberLimit: hackathon.maxTeamSize,
        creationMethod: 'auto',
        teamStatus: 'finalized',
        isFinalized: true,
        finalizedAt: new Date(),
        canReceiveRequests: false,
        teamLeader: teamLeader._id
      });

      await team.save();
      teamsCreated.push(team);

      // Update all team members
      for (const member of teamMembers) {
        await User.findByIdAndUpdate(member._id, {
          currentTeamId: team._id,
          canSendRequests: false,
          canReceiveRequests: false,
          lastTeamActivity: new Date()
        });
      }

      console.log(`✅ Created auto-team with ${teamMembers.length} members`);
    }

    return teamsCreated;
  }

  // Calculate optimal team size
  private calculateOptimalTeamSize(
    remainingParticipants: number,
    minSize: number,
    maxSize: number
  ): number {
    if (remainingParticipants <= minSize) {
      return remainingParticipants;
    }

    // Try to create teams of max size, but ensure we don't leave too few people
    if (remainingParticipants >= maxSize) {
      return maxSize;
    }

    // If remaining participants is between min and max, use that
    if (remainingParticipants >= minSize) {
      return remainingParticipants;
    }

    return minSize;
  }

  // Send notifications about auto-team creation
  private async sendAutoTeamCreationNotifications(
    hackathon: IHackathon,
    teamsCreated: ITeam[]
  ): Promise<void> {
    try {
      // Get all participants for this hackathon
      const participants = await User.find({
        hackathonIds: hackathon._id
      });

      // Send notification to all participants
      for (const participant of participants) {
        notificationService.addNotification(
          participant._id.toString(),
          createAutoTeamCreationNotification(
            participant._id.toString(),
            hackathon._id.toString(),
            teamsCreated.length
          )
        );
      }

      console.log(`📢 Sent auto-team creation notifications to ${participants.length} participants`);
    } catch (error) {
      console.error('❌ Error sending auto-team creation notifications:', error);
    }
  }

  // Manual trigger for testing
  public async manualTrigger(hackathonId: string): Promise<void> {
    try {
      const hackathon = await Hackathon.findById(hackathonId);
      if (!hackathon) {
        throw new Error('Hackathon not found');
      }

      await this.processHackathon(hackathon);
    } catch (error) {
      console.error('❌ Error in manual trigger:', error);
      throw error;
    }
  }
}

export const autoTeamCreationService = AutoTeamCreationService.getInstance(); 