import { Hackathon } from '../model/hackathon';
import { Team } from '../model/team';
import { ProblemStatement } from '../model/problemStatement';
import { TeamProblemSelection } from '../model/teamProblemSelection';
import { TeamSubmission } from '../model/teamSubmission';
import { alertService } from './alertService';

export class ProblemManagementService {
  private static instance: ProblemManagementService;
  private cleanupIntervals: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance(): ProblemManagementService {
    if (!ProblemManagementService.instance) {
      ProblemManagementService.instance = new ProblemManagementService();
    }
    return ProblemManagementService.instance;
  }

  public startProblemManagementService(): void {
    console.log('🎯 Problem Management Service started');
    
    // Check for cleanup tasks every hour
    setInterval(() => {
      this.performCleanupTasks();
    }, 60 * 60 * 1000);
  }

  private async performCleanupTasks(): Promise<void> {
    try {
      const activeHackathons = await Hackathon.find({
        status: { $in: ['upcoming', 'active'] }
      });

      for (const hackathon of activeHackathons) {
        await this.processHackathonCleanup(hackathon);
      }
    } catch (error) {
      console.error('Error performing cleanup tasks:', error);
    }
  }

  private async processHackathonCleanup(hackathon: any): Promise<void> {
    const now = new Date();
    const startDate = new Date(hackathon.startDate);
    const endDate = new Date(hackathon.endDate);
    const submissionEndDate = new Date(hackathon.submissionEndDate || endDate);

    // Check if selection window has closed
    const selectionEnd = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
    if (now > selectionEnd) {
      await this.assignRandomProblemsToUnselectedTeams(hackathon);
    }

    // Check if submission deadline has passed
    if (now > submissionEndDate) {
      await this.handleSubmissionDeadlinePassed(hackathon);
    }
  }

  private async assignRandomProblemsToUnselectedTeams(hackathon: any): Promise<void> {
    try {
      const teams = await Team.find({ hackathonIds: hackathon._id });
      const problemStatements = await ProblemStatement.find({ 
        hackathonId: hackathon._id, 
        isActive: true 
      });

      if (problemStatements.length === 0) {
        console.log(`No problem statements available for hackathon: ${hackathon.title}`);
        return;
      }

      for (const team of teams) {
        // Check if team already has a selection
        const existingSelection = await TeamProblemSelection.findOne({
          teamId: team._id,
          hackathonId: hackathon._id
        });

        if (!existingSelection) {
          // Assign random problem
          const randomProblem = problemStatements[Math.floor(Math.random() * problemStatements.length)];
          
          const selection = new TeamProblemSelection({
            teamId: team._id,
            hackathonId: hackathon._id,
            selectedProblemId: randomProblem._id,
            selectedBy: team.createdBy,
            selectedAt: new Date(),
            isLocked: true,
            selectionMethod: 'random'
          });

          await selection.save();

          // Send alert to team members
          await alertService.sendRandomProblemAssignmentAlert(hackathon, team, randomProblem);

          console.log(`Random problem assigned to team: ${team.name} - ${randomProblem.title}`);
        }
      }
    } catch (error) {
      console.error('Error assigning random problems:', error);
    }
  }

  private async handleSubmissionDeadlinePassed(hackathon: any): Promise<void> {
    try {
      const teams = await Team.find({ hackathonIds: hackathon._id });

      for (const team of teams) {
        // Check if team has submitted
        const submission = await TeamSubmission.findOne({
          teamId: team._id,
          hackathonId: hackathon._id
        });

        if (!submission) {
          // Send alert to team members
          await alertService.sendNoSubmissionAlert(hackathon, team);
          console.log(`No submission alert sent for team: ${team.name}`);
        }
      }
    } catch (error) {
      console.error('Error handling submission deadline:', error);
    }
  }

  public async createDefaultProblemStatements(hackathonId: string, createdBy: string): Promise<void> {
    try {
      const defaultProblems = [
        {
          title: "E-commerce Platform",
          description: "Build a full-stack e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.",
          category: "Software Development",
          difficulty: "Medium"
        },
        {
          title: "Data Visualization Dashboard",
          description: "Create an interactive dashboard to visualize complex datasets with real-time updates and filtering capabilities.",
          category: "Data Analytics",
          difficulty: "Medium"
        },
        {
          title: "Automated Testing Framework",
          description: "Develop a comprehensive testing framework for web applications with automated test generation and execution.",
          category: "SDET",
          difficulty: "Hard"
        },
        {
          title: "Mobile App for Social Networking",
          description: "Design and develop a mobile application for social networking with real-time messaging and content sharing.",
          category: "Software Development",
          difficulty: "Hard"
        },
        {
          title: "Predictive Analytics Model",
          description: "Build a machine learning model to predict user behavior and provide actionable insights from historical data.",
          category: "Data Analytics",
          difficulty: "Hard"
        },
        {
          title: "API Testing Suite",
          description: "Create a comprehensive API testing suite with automated test cases, performance testing, and security validation.",
          category: "SDET",
          difficulty: "Medium"
        }
      ];

      for (const problem of defaultProblems) {
        const problemStatement = new ProblemStatement({
          ...problem,
          hackathonId,
          createdBy
        });
        await problemStatement.save();
      }

      console.log(`Default problem statements created for hackathon: ${hackathonId}`);
    } catch (error) {
      console.error('Error creating default problem statements:', error);
    }
  }

  public async getProblemSelectionStats(hackathonId: string): Promise<any> {
    try {
      const teams = await Team.find({ hackathonIds: hackathonId });
      const problemStatements = await ProblemStatement.find({ 
        hackathonId, 
        isActive: true 
      });

      const stats = {
        totalTeams: teams.length,
        totalProblems: problemStatements.length,
        selectionsByMethod: {
          individual: 0,
          poll: 0,
          random: 0,
          admin: 0
        },
        selectionsByProblem: {},
        unselectedTeams: 0
      };

      for (const team of teams) {
        const selection = await TeamProblemSelection.findOne({
          teamId: team._id,
          hackathonId
        });

        if (selection) {
          stats.selectionsByMethod[selection.selectionMethod]++;
          
          const problemId = selection.selectedProblemId.toString();
          stats.selectionsByProblem[problemId] = (stats.selectionsByProblem[problemId] || 0) + 1;
        } else {
          stats.unselectedTeams++;
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting problem selection stats:', error);
      return null;
    }
  }

  public async getSubmissionStats(hackathonId: string): Promise<any> {
    try {
      const teams = await Team.find({ hackathonIds: hackathonId });
      const submissions = await TeamSubmission.find({ hackathonId });

      const stats = {
        totalTeams: teams.length,
        submittedTeams: submissions.length,
        unsubmittedTeams: teams.length - submissions.length,
        submissionRate: teams.length > 0 ? (submissions.length / teams.length) * 100 : 0
      };

      return stats;
    } catch (error) {
      console.error('Error getting submission stats:', error);
      return null;
    }
  }
}

export const problemManagementService = ProblemManagementService.getInstance();
