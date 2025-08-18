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



export const createTeams = async (req: Request<{}, {}, {teamName: string, createdBy?: string, hackathonId?: string, maxMembers?: number, description?: string}>, res: Response): Promise<void> => {
    try {
        const { teamName, createdBy, hackathonId, maxMembers, description } = req.body;

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

        // Create the team with hackathon association
        const newTeam = await team.create({
            teamName,
            createdBy: createdByObjectId,
            memberLimit: maxMembers || 4,
            teamMembers: [createdByObjectId],
            hackathonId: hackathonId || null, // Associate with specific hackathon
            description: description || "",
            status: 'active'
        });

        if (newTeam) {
            // Update user with teamId
            await user.findByIdAndUpdate(createdByObjectId, { teamId: newTeam._id });

            // Update user role to leader if not already admin
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