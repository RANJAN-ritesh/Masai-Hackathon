/**
 * 🧹 AUTOMATIC CLEANUP SERVICE
 * 
 * This service runs periodically to:
 * 1. Remove invalid hackathon references from users
 * 2. Clean up orphaned team data
 * 3. Maintain database consistency
 */

import mongoose from 'mongoose';
import User from '../model/user';
import Team from '../model/team';
import Hackathon from '../model/hackathon';

class CleanupService {
  private isRunning: boolean = false;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Run cleanup every 24 hours
    this.startPeriodicCleanup(24 * 60 * 60 * 1000);
  }
  
  /**
   * Start periodic cleanup
   */
  startPeriodicCleanup(intervalMs: number) {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(async () => {
      if (!this.isRunning) {
        await this.performCleanup();
      }
    }, intervalMs);
    
    console.log(`🧹 Cleanup service started - running every ${intervalMs / (1000 * 60 * 60)} hours`);
  }
  
  /**
   * Perform database cleanup
   */
  async performCleanup() {
    if (this.isRunning) {
      console.log('🧹 Cleanup already running, skipping...');
      return;
    }
    
    this.isRunning = true;
    console.log('🧹 Starting automatic database cleanup...');
    
    try {
      // 1. Get all existing hackathon IDs
      const existingHackathons = await Hackathon.find({}, '_id');
      const existingHackathonIds = existingHackathons.map(h => (h._id as any).toString());
      
      // 2. Clean up users with invalid hackathon references
      const usersWithInvalidRefs = await User.find({
        hackathonIds: { $exists: true, $ne: [] }
      });
      
      let cleanedUsers = 0;
      for (const user of usersWithInvalidRefs) {
        if (user.hackathonIds && Array.isArray(user.hackathonIds)) {
          const originalCount = user.hackathonIds.length;
          const validRefs = user.hackathonIds.filter(id => 
            existingHackathonIds.includes(id.toString())
          );
          
          if (validRefs.length !== originalCount) {
            user.hackathonIds = validRefs;
            await user.save();
            cleanedUsers++;
          }
        }
      }
      
      // 3. Clean up orphaned teams
      const teamsWithInvalidRefs = await Team.find({
        hackathonId: { $exists: true, $ne: null }
      });
      
      let cleanedTeams = 0;
      for (const team of teamsWithInvalidRefs) {
        if (team.hackathonId && !existingHackathonIds.includes(team.hackathonId.toString())) {
          await Team.findByIdAndDelete(team._id);
          cleanedTeams++;
        }
      }
      
      // 4. Clean up invalid team references in users
      const teams = await Team.find({}, '_id');
      const existingTeamIds = teams.map(t => (t._id as any).toString());
      
      const usersWithInvalidTeams = await User.find({
        teamId: { $exists: true, $ne: "" }
      });
      
      let cleanedTeamRefs = 0;
      for (const user of usersWithInvalidTeams) {
        if (user.teamId && !existingTeamIds.includes(user.teamId.toString())) {
          user.teamId = "";
          await user.save();
          cleanedTeamRefs++;
        }
      }
      
      console.log(`🧹 Cleanup completed: ${cleanedUsers} users, ${cleanedTeams} teams, ${cleanedTeamRefs} team refs cleaned`);
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    } finally {
      this.isRunning = false;
    }
  }
  
  /**
   * Stop the cleanup service
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🧹 Cleanup service stopped');
    }
  }
  
  /**
   * Manual cleanup trigger
   */
  async triggerManualCleanup() {
    console.log('🧹 Manual cleanup triggered');
    await this.performCleanup();
  }
}

export default new CleanupService(); 