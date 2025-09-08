import { Request, Response } from "express";
import mongoose from "mongoose";
import team, { ITeam } from "../model/team";
import user from "../model/user";
import teamRequests from "../model/teamRequests";

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await team
      .find()
      .populate("createdBy", "name") // Fetch only 'name' from createdBy
      .populate("teamMembers", "name"); // Fetch only 'name' from teamMembers

    // Return empty array if no teams found (not 404)
    res.status(200).json(teams || []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams", error });
  }
};



export const createTeams = async( req:Request<{}, {}, {teamName: string, createdBy?: string, hackathonId?: string, maxMembers?: number, memberLimit?: number, description?: string, teamMembers?: string[]}>, res:Response) : Promise<void> => {
    try {
        const { teamName, createdBy, hackathonId, maxMembers, memberLimit, description, teamMembers } = req.body;

        if (!teamName) {
            res.status(400).json({ message: "Team Creation failed!!! Team name is required" });
            return;
        }

        if (!createdBy) {
            res.status(400).json({ message: "Team Creation failed!!! CreatedBy is required" });
            return;
        }

        // Convert string ID to ObjectId
        let createdByObjectId: mongoose.Types.ObjectId;
        try {
            createdByObjectId = new mongoose.Types.ObjectId(createdBy) as mongoose.Types.ObjectId;
        } catch (error) {
            res.status(400).json({ message: "Invalid user ID format" });
            return;
        }

        // Check if user exists
        const userExists = await user.findById(createdByObjectId);
        if (!userExists) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        if (userExists.teamId) {
            res.status(400).json({ message: "User is already in a team" });
            return;
        }

        // Check for existing team with same name in the same hackathon
        const existingTeam = await team.findOne({ 
            teamName,
            hackathonId: hackathonId || null
        });
        if (existingTeam) {
            res.status(400).json({ message: "A team with this name already exists in this hackathon!" });
            return;
        }

        // Additional check: Look for any team with similar name to prevent duplicates
        const similarTeam = await team.findOne({ 
            teamName: { $regex: new RegExp(`^${teamName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            hackathonId: hackathonId || null
        });
        if (similarTeam) {
            res.status(400).json({ message: "A team with this name already exists in this hackathon!" });
            return;
        }

        // Process team members - always include creator first
        const teamMemberIdSet = new Set<string>([createdByObjectId.toString()]);
        
        if (teamMembers && Array.isArray(teamMembers)) {
            for (const memberId of teamMembers) {
                try {
                    const memberObjectId = new mongoose.Types.ObjectId(memberId);
                    const memberExists = await user.findById(memberObjectId);
                    if (memberExists) {
                        // Skip if already in a different team
                        if (memberExists.teamId && memberExists.teamId !== "") continue;
                        teamMemberIdSet.add(memberObjectId.toString());
                    }
                } catch (error) {
                    console.log(`Invalid member ID: ${memberId}`);
                }
            }
        }
        
        const teamMemberIds: mongoose.Types.ObjectId[] = Array.from(teamMemberIdSet).map(id => new mongoose.Types.ObjectId(id));

        // Create the team with hackathon association
        let newTeam;
        try {
            newTeam = await team.create({
                teamName,
                createdBy: createdByObjectId,
                teamLeader: createdByObjectId, // Set creator as team leader
                memberLimit: memberLimit || maxMembers || 4,
                teamMembers: teamMemberIds,
                hackathonId: hackathonId || null, // Associate with specific hackathon
                description: description || "",
                status: 'active',
                // Set default values for new fields
                isFinalized: false,
                creationMethod: 'participant',
                canReceiveRequests: true,
                pendingRequests: [],
                teamStatus: 'forming'
            });
        } catch (createError: any) {
            console.error('Team creation error:', createError);
            if (createError.code === 11000) {
                res.status(400).json({ 
                    message: "A team with this name already exists in this hackathon!",
                    error: "Duplicate team name"
                });
                return;
            }
            res.status(500).json({ 
                message: "Failed to create team", 
                error: createError.message 
            });
            return;
        }

        if (newTeam) {
            // Update all team members (including creator) with teamId and hackathon association
            const userUpdateOps = teamMemberIds.map(memberId => 
                user.findByIdAndUpdate(
                    memberId,
                    { 
                        teamId: newTeam._id,
                        $addToSet: { hackathonIds: hackathonId || null }
                    },
                    { new: true }
                )
            );
            await Promise.all(userUpdateOps);

            // Update team leader role if not already admin
            if (userExists.role === 'member') {
                await user.findByIdAndUpdate(createdByObjectId, { role: 'leader' });
            }

            res.status(201).json({ 
                message: "Team created successfully", 
                team: newTeam,
                _id: newTeam._id,
                teamName: newTeam.teamName,
                teamMembers: newTeam.teamMembers
            });
        } else {
            res.status(500).json({ message: "Failed to create team" });
        }
    } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({ message: "Internal server error", error: String(error) });
    }
};

export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teamId, userId } = req.body;

        if (!teamId) {
            res.status(400).json({ message: "Team ID is required" });
            return;
        }

        // ✅ Find the team
        const existingTeam = await team.findById(teamId);
        if (!existingTeam) {
            res.status(404).json({ message: "Team not found" });
            return;
        }

        // ✅ Check if user is admin or team creator
        let isAuthorized = false;
        
        if (userId) {
            const userDoc = await user.findById(userId);
            if (userDoc && userDoc.role === 'admin') {
                isAuthorized = true; // Admin can delete any team
            } else if (existingTeam.createdBy && existingTeam.createdBy.toString() === userId) {
                isAuthorized = true; // Team creator can delete their team
            }
        }

        if (!isAuthorized) {
            res.status(403).json({ message: "You are not authorized to delete this team" });
            return;
        }

        // ✅ Remove teamId from all members
        await user.updateMany(
            { _id: { $in: existingTeam.teamMembers } },
            { $unset: { teamId: "" } }
        );

        // ✅ Delete the team
        await team.findByIdAndDelete(teamId);

        res.status(200).json({ message: "Team deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting team", error });
    }
};



export default {getTeams};