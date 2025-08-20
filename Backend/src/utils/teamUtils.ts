import { ITeamRequest, ITeam, IHackathon } from '../model';

// Calculate request expiry based on 24 hours OR hackathon start (whichever comes first)
export const calculateRequestExpiry = async (hackathonId: string, hackathonModel: any): Promise<Date> => {
  const hackathon = await hackathonModel.findById(hackathonId);
  const now = new Date();
  const hackathonStart = new Date(hackathon.startDate);
  const twentyFourHours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  // Whichever comes first: 24 hours or hackathon start
  return new Date(Math.min(twentyFourHours.getTime(), hackathonStart.getTime()));
};

// Check if request has expired
export const isRequestExpired = async (request: ITeamRequest, hackathonModel: any): Promise<{ expired: boolean; reason?: string }> => {
  const now = new Date();
  const hackathon = await hackathonModel.findById(request.hackathonId);
  const hackathonStart = new Date(hackathon.startDate);
  
  if (now >= request.expiresAt) {
    return {
      expired: true,
      reason: now >= hackathonStart ? "hackathon_start" : "time"
    };
  }
  return { expired: false };
};

// Validate team name (16 chars, a-z, _, - only)
export const validateTeamName = (teamName: string): boolean => {
  if (!teamName || teamName.length > 16) return false;
  
  // Only allow a-z, _, and -
  const validPattern = /^[a-z_-]+$/;
  return validPattern.test(teamName);
};

// Check if user can leave team
export const canLeaveTeam = async (userId: string, teamId: string, teamModel: any): Promise<boolean> => {
  const team = await teamModel.findById(teamId);
  
  // If user is team creator
  if (team.createdBy.toString() === userId) {
    // Check if team has other members
    const otherMembers = team.teamMembers.filter(
      (member: any) => member.toString() !== userId
    );
    
    // Creator can only leave if no other members
    return otherMembers.length === 0;
  }
  
  // Non-creators can always leave
  return true;
};

// Transfer team ownership
export const transferTeamOwnership = async (
  currentOwnerId: string, 
  newOwnerId: string, 
  teamId: string, 
  teamModel: any,
  userModel: any
): Promise<boolean> => {
  try {
    // Verify current owner is actually the owner
    const team = await teamModel.findById(teamId);
    if (team.createdBy.toString() !== currentOwnerId) {
      throw new Error("Only team creator can transfer ownership");
    }

    // Verify new owner is a team member
    if (!team.teamMembers.some((member: any) => member.toString() === newOwnerId)) {
      throw new Error("New owner must be a team member");
    }

    // Transfer ownership
    await teamModel.findByIdAndUpdate(teamId, {
      createdBy: newOwnerId,
      teamLeader: newOwnerId
    });

    // Update user roles
    await userModel.findByIdAndUpdate(currentOwnerId, { role: "member" });
    await userModel.findByIdAndUpdate(newOwnerId, { role: "leader" });

    return true;
  } catch (error) {
    console.error("Error transferring team ownership:", error);
    return false;
  }
};

// Check if team can receive requests
export const canTeamReceiveRequests = (team: ITeam): boolean => {
  return (
    team.canReceiveRequests && 
    !team.isFinalized && 
    team.teamMembers.length < team.memberLimit &&
    team.teamStatus !== "locked"
  );
};

// Check if user can send requests
export const canUserSendRequests = (user: any): boolean => {
  return (
    user.canSendRequests && 
    !user.currentTeamId && 
    user.role === "member"
  );
};

// Auto team creation 1 hour before hackathon starts
export const shouldAutoCreateTeams = (hackathon: IHackathon): boolean => {
  const now = new Date();
  const hackathonStart = new Date(hackathon.startDate);
  const oneHourBefore = new Date(hackathonStart.getTime() - 60 * 60 * 1000);
  
  return now >= oneHourBefore && hackathon.autoTeamCreationEnabled;
};

// Clean up expired requests (run periodically)
export const cleanupExpiredRequests = async (teamRequestModel: any, hackathonModel: any): Promise<void> => {
  const now = new Date();
  
  // Find all expired requests
  const expiredRequests = await teamRequestModel.find({
    status: "pending",
    expiresAt: { $lte: now }
  });

  for (const request of expiredRequests) {
    const hackathon = await hackathonModel.findById(request.hackathonId);
    const hackathonStart = new Date(hackathon.startDate);
    
    // Determine expiry reason
    const expiryReason = now >= hackathonStart ? "hackathon_start" : "time";
    
    // Mark as expired
    await teamRequestModel.findByIdAndUpdate(request._id, {
      status: "expired",
      expiryReason
    });
  }
}; 