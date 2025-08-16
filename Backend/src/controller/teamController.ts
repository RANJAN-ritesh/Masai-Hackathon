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

    if (!teams || teams.length === 0) {
      res.status(404).json({ message: "No teams found" });
      return;
    }

    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams", error });
  }
};



export const createTeams = async( req:Request<{}, {}, {teamName: string, createdBy: mongoose.Schema.Types.ObjectId}>, res:Response) : Promise<void> => {
    try {
        const { teamName, createdBy } = req.body;

        if (!teamName || !createdBy) {
            res.status(400).json({ message: "Team Creation failed!!! Incomplete information" });
            return;
        }

        const userExists = await user.findById(createdBy);

        if (!userExists) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        if (userExists.teamId) {
            res.status(400).json({ message: "User is already in a team" });
            return;
        }

        const existingTeam = await team.findOne({ teamName, createdBy });
        if (existingTeam) {
            res.status(400).json({ message: "You have already created a team with this name!" });
            return;
        }

        // Create the team
        const newTeam = await team.create({
            teamName,
            createdBy,
            teamMembers: [createdBy]
        });

        if (newTeam) {
            // Update user with teamId
            await user.findByIdAndUpdate(createdBy, { teamId: newTeam._id });

            await teamRequests.deleteMany({ userId: createdBy });

            res.status(201).json({ message: "Team created successfully", team: newTeam });
        }
    } catch (error) {
        res.status(500).json({ message: "Error creating team", error });
    }
}

export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teamId, userId } = req.body;

        if (!teamId || !userId) {
            res.status(400).json({ message: "Team ID and User ID are required" });
            return;
        }

        // ✅ Find the team
        const existingTeam = await team.findById(teamId);
        if (!existingTeam) {
            res.status(404).json({ message: "Team not found" });
            return;
        }

        // ✅ Check if the user is the creator
        if (existingTeam.createdBy.toString() !== userId) {
            res.status(403).json({ message: "Only the team creator can delete the team" });
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