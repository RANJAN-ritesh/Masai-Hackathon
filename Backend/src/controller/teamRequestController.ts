import { Request, Response } from "express";
import mongoose from "mongoose";
import teamRequests from "../model/teamRequests";
import team from "../model/team";
import user from "../model/user";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

export const getPendingJoinRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teamId } = req.params; // Extract teamId from URL
        // ✅ Validate input
        if (!teamId) {
            res.status(400).json({ message: "Team ID is required" });
            return;
        }

        // ✅ Fetch pending join requests for the team
        const pendingRequests = await teamRequests.find({ 
            teamId, 
            status: "pending" 
        }).populate("fromUserId", "name email").exec();

        res.status(200).json({
            message: "Pending join requests retrieved successfully",
            pendingRequests
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending join requests", error });
    }
};

export const sendJoinRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teamId } = req.body;
        const userId = req.user?.id;

        if (!userId || !teamId) {
            res.status(400).json({ message: "User ID and Team ID are required" });
            return;
        }

        // ✅ Check if request already exists
        const existingRequest = await teamRequests.findOne({ 
            fromUserId: userId, 
            teamId, 
            status: "pending" 
        });
        if (existingRequest) {
            res.status(400).json({ message: "You have already sent a request to this team" });
            return;
        }

        // ✅ Create a new request using new schema
        const newRequest = new teamRequests({
            fromUserId: userId,
            toUserId: teamId, // This will be updated to actual team creator ID
            teamId,
            hackathonId: "temp", // This will be updated
            requestType: "join",
            status: "pending",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        await newRequest.save();

        res.status(201).json({ message: "Join request sent successfully", request: newRequest });
    } catch (error) {
        res.status(500).json({ message: "Error sending join request", error });
    }
};

export const acceptJoinRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { requestId, teamId } = req.body;

        if (!requestId || !teamId) {
            res.status(400).json({ message: "Request ID and Team ID are required" });
            return;
        }

        const joinRequest = await teamRequests.findById(requestId);
        if (!joinRequest || joinRequest.status !== "pending") {
            res.status(404).json({ message: "Join request not found or already processed" });
            return;
        }

        const selectedTeam = await team.findById(teamId);
        if (!selectedTeam) {
            res.status(404).json({ message: "Team not found" });
            return;
        }

        // ✅ Check if team is full
        if (selectedTeam.teamMembers.length >= (selectedTeam.memberLimit || 3)) {
            res.status(400).json({ message: "Team is already full" });
            return;
        }

        // ✅ Add user to the team using fromUserId
        selectedTeam.teamMembers.push(joinRequest.fromUserId);
        await selectedTeam.save();

        // update teamId of user using fromUserId
        await user.findByIdAndUpdate(joinRequest.fromUserId, { teamId: teamId });

        // ✅ Mark request as accepted (new schema)
        joinRequest.status = "accepted";
        await joinRequest.save();

        // ✅ Delete all other pending requests from this user
        await teamRequests.deleteMany({ 
            fromUserId: joinRequest.fromUserId, 
            status: "pending" 
        });

        res.status(200).json({ message: "User accepted into the team", team: selectedTeam });
    } catch (error) {
        res.status(500).json({ message: "Error accepting join request", error });
    }
};

export const declineJoinRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { requestId } = req.body;

        if (!requestId) {
            res.status(400).json({ message: "Request ID is required" });
            return;
        }

        const joinRequest = await teamRequests.findById(requestId);
        if (!joinRequest || joinRequest.status !== "pending") {
            res.status(404).json({ message: "Join request not found or already processed" });
            return;
        }

        // ✅ Mark as rejected (new schema)
        joinRequest.status = "rejected";
        await joinRequest.save();

        res.status(200).json({ message: "Join request declined" });
    } catch (error) {
        res.status(500).json({ message: "Error declining join request", error });
    }
};