import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import user from "../model/user";
import team from "../model/team";
import { generateToken } from "../middleware/auth";

export const leaveTeam = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.body;

        if (!userId) {
            res.status(400).json({ message: "User ID is required" });
            return;
        }

        // Find the user
        const existingUser = await user.findById(userId);
        if (!existingUser || !existingUser.teamId) {
            res.status(404).json({ message: "User not in any team or user not found" });
            return;
        }

        // Find the team
        const userTeam = await team.findById(existingUser.teamId);
        if (!userTeam) {
            res.status(404).json({ message: "Team not found" });
            return;
        }

        // Remove user from the team
        userTeam.teamMembers = userTeam.teamMembers.filter(memberId => memberId.toString() !== userId);
        await userTeam.save();

        // Clear user's teamId
        await user.findByIdAndUpdate(userId, { teamId: null });

        // If the user was the creator and no one else is left, delete the team
        if (userTeam.createdBy.toString() === userId && userTeam.teamMembers.length === 0) {
            await team.findByIdAndDelete(userTeam._id);
            res.status(200).json({ message: "Team deleted as the last member left" });
            return;
        }

        res.status(200).json({ message: "User has left the team" });
    } catch (error) {
        res.status(500).json({ message: "Error leaving the team", error });
    }
};

export const verifyUser = async(req:Request<{}, {}, {email : string, password: string, }>, res: Response): Promise<void> => {

    try {
        const {email, password} = req.body;

        if(!email || !password){
            res.status(400).json({message:"Email and Password is required"});       
            return; 
        }

        const verifiedUser = await user.findOne({email});

        if(!verifiedUser?.isVerified){
            res.status(400).json({message: "User is not verified"});
            return;
        }

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, verifiedUser.password);
        if (!isPasswordValid) {
            res.status(401).json({message: "Invalid email or password"});
            return;
        }
        // Generate JWT token
        const token = generateToken({
            userId: (verifiedUser._id as any).toString(),
            email: verifiedUser.email,
            role: verifiedUser.role
        });

        verifiedUser.isVerified = true;
        
        // Return user data with JWT token
        const userResponse = {
            _id: verifiedUser._id,
            userId: verifiedUser.userId,
            name: verifiedUser.name,
            email: verifiedUser.email,
            role: verifiedUser.role,
            isVerified: verifiedUser.isVerified,
            phoneNumber: verifiedUser.phoneNumber,
            course: verifiedUser.course,
            skills: verifiedUser.skills,
            vertical: verifiedUser.vertical,
            hackathonIds: verifiedUser.hackathonIds,
            teamId: verifiedUser.teamId
        };

        res.status(200).json({
            message: "Login Successful", 
            user: userResponse,
            token: token
        });
    } catch (error){
        res.status(500).json({message: "Server error", error});
    }

}

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, name, code, course, skills, vertical, phoneNumber, email, password } = req.body;

        // Validate required fields
        if (!userId || !name || !code || !course || !skills || !vertical || !phoneNumber || !email || !password) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        // Check if user already exists
        const existingUser = await user.findOne({ $or: [{ email }, { userId }, { phoneNumber }] });
        if (existingUser) {
            res.status(400).json({ message: "User with this email, ID, or phone number already exists" });
            return;
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new user({
            userId,
            name,
            code,
            course,
            skills,
            vertical,
            phoneNumber,
            email,
            password: hashedPassword,
            teamId: null,
            isVerified: true, // Set to true for now, can add email verification later
            role: "member"
        });

        await newUser.save();

        // Don't send password in response
        const { password: _, ...userWithoutPassword } = newUser.toObject();
        
        res.status(201).json({ 
            message: "User created successfully", 
            user: userWithoutPassword 
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: String(error) });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId) {
            res.status(400).json({ message: "User ID is required" });
            return;
        }

        // Find user by ID
        const foundUser = await user.findById(userId);

        if (!foundUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Send back user details (excluding password)
        res.status(200).json({
            userId: foundUser.userId,
            name: foundUser.name,
            email: foundUser.email,
            teamId: foundUser.teamId,
            role: foundUser.role,
            isVerified: foundUser.isVerified,
            phoneNumber : foundUser.phoneNumber,
            course : foundUser.course,
            skills : foundUser.skills,
            vertical : foundUser.vertical
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
