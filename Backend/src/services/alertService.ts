import { Hackathon } from '../model/hackathon';
import { Team } from '../model/team';
import { User } from '../model/user';
import { TeamProblemSelection } from '../model/teamProblemSelection';
import { TeamSubmission } from '../model/teamSubmission';
import { notificationService } from './notificationService';

export class AlertService {
  private static instance: AlertService;
  private alertIntervals: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  public startAlertService(): void {
    console.log('🚨 Alert Service started');
    
    // Check for alerts every minute
    setInterval(() => {
      this.checkAllAlerts();
    }, 60 * 1000);
  }

  private async checkAllAlerts(): Promise<void> {
    try {
      const activeHackathons = await Hackathon.find({
        status: { $in: ['upcoming', 'active'] }
      });

      for (const hackathon of activeHackathons) {
        await this.checkHackathonAlerts(hackathon);
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  private async checkHackathonAlerts(hackathon: any): Promise<void> {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);
    const submissionStartDate = new Date(hackathon.submissionStartDate || startDate);
    const submissionEndDate = new Date(hackathon.submissionEndDate || endDate);

    // Check selection window alerts
    await this.checkSelectionWindowAlerts(hackathon, now, startDate, endDate);

    // Check submission deadline alerts
    await this.checkSubmissionDeadlineAlerts(hackathon, now, submissionEndDate);
  }

  private async checkSelectionWindowAlerts(hackathon: any, now: Date, startDate: Date, endDate: Date): Promise<void> {
    const selectionStart = new Date(startDate.getTime() - 48 * 60 * 60 * 1000);
    const selectionEnd = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

    // Alert when selection window opens
    if (this.isTimeWithinWindow(now, selectionStart, 5 * 60 * 1000)) {
      await this.sendSelectionWindowOpenedAlert(hackathon);
    }

    // Alert when selection window is about to close
    if (this.isTimeWithinWindow(now, selectionEnd, 2 * 60 * 60 * 1000)) {
      await this.sendSelectionWindowClosingAlert(hackathon);
    }
  }

  private async checkSubmissionDeadlineAlerts(hackathon: any, now: Date, submissionEndDate: Date): Promise<void> {
    // 6 hours before deadline
    if (this.isTimeWithinWindow(now, submissionEndDate, 6 * 60 * 60 * 1000)) {
      await this.sendSubmissionDeadlineAlert(hackathon, 6);
    }

    // 1 hour before deadline
    if (this.isTimeWithinWindow(now, submissionEndDate, 60 * 60 * 1000)) {
      await this.sendSubmissionDeadlineAlert(hackathon, 1);
    }

    // 10 minutes before deadline
    if (this.isTimeWithinWindow(now, submissionEndDate, 10 * 60 * 1000)) {
      await this.sendSubmissionDeadlineAlert(hackathon, 0.17); // 10 minutes = 0.17 hours
    }
  }

  private isTimeWithinWindow(now: Date, targetTime: Date, windowMs: number): boolean {
    const timeDiff = Math.abs(now.getTime() - targetTime.getTime());
    return timeDiff <= windowMs;
  }

  private async sendSelectionWindowOpenedAlert(hackathon: any): Promise<void> {
    try {
      const teams = await Team.find({ hackathonIds: hackathon._id });
      
      for (const team of teams) {
        const teamMembers = await User.find({ _id: { $in: team.teamMembers } });
        
        for (const member of teamMembers) {
          await notificationService.createNotification({
            userId: member._id,
            type: 'selection_window_opened',
            title: 'Problem Selection Window Opened',
            message: `The problem selection window for ${hackathon.title} is now open! You have 48 hours before the hackathon starts to select your problem statement.`,
            data: { hackathonId: hackathon._id, teamId: team._id }
          });
        }
      }
      
      console.log(`📢 Selection window opened alert sent for hackathon: ${hackathon.title}`);
    } catch (error) {
      console.error('Error sending selection window opened alert:', error);
    }
  }

  private async sendSelectionWindowClosingAlert(hackathon: any): Promise<void> {
    try {
      const teams = await Team.find({ hackathonIds: hackathon._id });
      
      for (const team of teams) {
        // Check if team has selected a problem
        const selection = await TeamProblemSelection.findOne({
          teamId: team._id,
          hackathonId: hackathon._id
        });
        
        if (!selection) {
          const teamMembers = await User.find({ _id: { $in: team.teamMembers } });
          
          for (const member of teamMembers) {
            await notificationService.createNotification({
              userId: member._id,
              type: 'selection_window_closing',
              title: 'Problem Selection Window Closing Soon',
              message: `The problem selection window for ${hackathon.title} is closing in 2 hours! Please select your problem statement now.`,
              data: { hackathonId: hackathon._id, teamId: team._id }
            });
          }
        }
      }
      
      console.log(`📢 Selection window closing alert sent for hackathon: ${hackathon.title}`);
    } catch (error) {
      console.error('Error sending selection window closing alert:', error);
    }
  }

  private async sendSubmissionDeadlineAlert(hackathon: any, hoursLeft: number): Promise<void> {
    try {
      const teams = await Team.find({ hackathonIds: hackathon._id });
      
      for (const team of teams) {
        // Check if team has submitted
        const submission = await TeamSubmission.findOne({
          teamId: team._id,
          hackathonId: hackathon._id
        });
        
        if (!submission) {
          const teamMembers = await User.find({ _id: { $in: team.teamMembers } });
          
          for (const member of teamMembers) {
            const timeText = hoursLeft >= 1 ? `${hoursLeft} hours` : `${Math.round(hoursLeft * 60)} minutes`;
            
            await notificationService.createNotification({
              userId: member._id,
              type: 'submission_deadline',
              title: 'Submission Deadline Approaching',
              message: `The submission deadline for ${hackathon.title} is in ${timeText}! Please submit your solution now.`,
              data: { hackathonId: hackathon._id, teamId: team._id, hoursLeft }
            });
          }
        }
      }
      
      console.log(`📢 Submission deadline alert sent for hackathon: ${hackathon.title} (${hoursLeft} hours left)`);
    } catch (error) {
      console.error('Error sending submission deadline alert:', error);
    }
  }

  public async sendRandomProblemAssignmentAlert(hackathon: any, team: any, assignedProblem: any): Promise<void> {
    try {
      const teamMembers = await User.find({ _id: { $in: team.teamMembers } });
      
      for (const member of teamMembers) {
        await notificationService.createNotification({
          userId: member._id,
          type: 'random_problem_assigned',
          title: 'Problem Statement Automatically Assigned',
          message: `No problem statement was selected for your team, so we've automatically assigned: ${assignedProblem.title}`,
          data: { 
            hackathonId: hackathon._id, 
            teamId: team._id, 
            problemId: assignedProblem._id 
          }
        });
      }
      
      console.log(`📢 Random problem assignment alert sent for team: ${team.name}`);
    } catch (error) {
      console.error('Error sending random problem assignment alert:', error);
    }
  }

  public async sendNoSubmissionAlert(hackathon: any, team: any): Promise<void> {
    try {
      const teamMembers = await User.find({ _id: { $in: team.teamMembers } });
      
      for (const member of teamMembers) {
        await notificationService.createNotification({
          userId: member._id,
          type: 'no_submission',
          title: 'No Submission Made',
          message: `The submission deadline for ${hackathon.title} has passed and no submission was made by your team.`,
          data: { hackathonId: hackathon._id, teamId: team._id }
        });
      }
      
      console.log(`📢 No submission alert sent for team: ${team.name}`);
    } catch (error) {
      console.error('Error sending no submission alert:', error);
    }
  }
}

export const alertService = AlertService.getInstance();
