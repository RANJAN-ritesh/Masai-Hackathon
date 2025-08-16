import { Request, Response } from "express";
import mongoose from "mongoose";
import user from "../model/user";
import team from "../model/team";
import teamRequests from "../model/teamRequests";

// export const acceptJoinRequest = async(req:Request<{}, {}, {requestId:string; teamId:string; }>)

export const getPendingJoinRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teamId } = req.params; // Extract teamId from URL
        // ✅ Validate input
        if (!teamId) {
            res.status(400).json({ message: "Team ID is required" });
            return;
        }

        // ✅ Fetch pending join requests for the team
        const pendingRequests = await teamRequests.find({ teamId, status: "pending" })
            .populate("userId", "name email") // Populate user details (name & email)
            .exec();

        res.status(200).json({
            message: "Pending join requests retrieved successfully",
            pendingRequests
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending join requests", error });
    }
};

export const sendJoinRequest = async (
    req: Request<{}, {}, { userId: string; teamId: string }>,
    res: Response): Promise<void> => {
    try {
        const { userId, teamId } = req.body;

        // ✅ Validate input
        if (!userId || !teamId) {
            res.status(400).json({ message: "User ID and Team ID are required" });
            return;
        }

        // ✅ Check if user exists
        const userExists = await user.findById(userId);
        if (!userExists) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // ✅ Check if team exists
        const teamExists = await team.findById(teamId);
        if (!teamExists) {
            res.status(404).json({ message: "Team not found" });
            return;
        }

        // ✅ Check if request already exists
        const existingRequest = await teamRequests.findOne({ userId, teamId });
        if (existingRequest) {
            res.status(400).json({ message: "You have already sent a request to this team" });
            return;
        }

        // ✅ Create a new request
        const newRequest = new teamRequests({
            requestId: new mongoose.Types.ObjectId().toString(),
            userId,
            teamId,
            status: "pending"
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

        // ✅ Add user to the team
        selectedTeam.teamMembers.push(joinRequest.userId);
        await selectedTeam.save();

        // update teamId of user using userId
        await user.findByIdAndUpdate(joinRequest.userId, { teamId: teamId });


        // ✅ Mark request as approved
        joinRequest.status = "approved";
        await joinRequest.save();

        // ✅ Delete all other pending requests from this user
        await teamRequests.deleteMany({ userId: joinRequest.userId, status: "pending" });

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

        // ✅ Mark as rejected instead of deleting
        joinRequest.status = "rejected";
        await joinRequest.save();

        res.status(200).json({ message: "Join request declined" });
    } catch (error) {
        res.status(500).json({ message: "Error declining join request", error });
    }
};