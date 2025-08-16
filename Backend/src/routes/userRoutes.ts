import express from "express";
import { verifyUser, getUserById, leaveTeam, createUser } from "../controller/userController";
import { validateUserInput } from "../middleware/validation";
import bcrypt from "bcryptjs";
import User from "../model/user";

const router = express.Router();

router.post("/create-user", validateUserInput, createUser);
router.post("/verify-user", validateUserInput, verifyUser);
router.get("/get-user/:userId", getUserById);
router.post("/leave-team", leaveTeam);

// Registration routes that frontend expects
router.get("/registrations/user/:userId", async (req, res) => {
  try {
    // For now, return empty array - can be implemented later
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching registrations", error });
  }
});

// Route to create test users - ONLY for development/testing
router.post("/create-test-users", async (req, res) => {
  try {
    // Clear existing test users first
    await User.deleteMany({ email: { $in: ["admin@test.com", "leader@test.com", "member1@test.com", "member2@test.com"] } });
    
    const testUsers = [
      {
        userId: "ADMIN001",
        name: "Test Admin",
        code: "ADMIN001",
        course: "Admin Course",
        skills: ["Administration", "Management", "Leadership"],
        vertical: "Admin",
        phoneNumber: "+91-9999999991",
        email: "admin@test.com",
        password: await bcrypt.hash("admin123", 10),
        teamId: "",
        isVerified: true,
        role: "admin"
      },
      {
        userId: "LEAD001",
        name: "Test Leader",
        code: "LEAD001", 
        course: "Computer Science",
        skills: ["React", "Node.js", "Leadership", "Project Management"],
        vertical: "Full Stack",
        phoneNumber: "+91-9999999992",
        email: "leader@test.com",
        password: await bcrypt.hash("leader123", 10),
        teamId: "",
        isVerified: true,
        role: "leader"
      },
      {
        userId: "MEM001",
        name: "Test Member 1",
        code: "MEM001",
        course: "Computer Science", 
        skills: ["JavaScript", "Python", "React"],
        vertical: "Frontend",
        phoneNumber: "+91-9999999993",
        email: "member1@test.com",
        password: await bcrypt.hash("member123", 10),
        teamId: "",
        isVerified: true,
        role: "member"
      },
      {
        userId: "MEM002", 
        name: "Test Member 2",
        code: "MEM002",
        course: "Data Science",
        skills: ["Python", "Machine Learning", "Data Analysis"],
        vertical: "Data Science",
        phoneNumber: "+91-9999999994",
        email: "member2@test.com", 
        password: await bcrypt.hash("member123", 10),
        teamId: "",
        isVerified: true,
        role: "member"
      }
    ];

    const createdUsers = await User.insertMany(testUsers);
    
    res.status(201).json({
      message: "Test users created successfully",
      users: createdUsers.map(user => ({
        email: user.email,
        role: user.role,
        name: user.name
      }))
    });
  } catch (error) {
    console.error("Error creating test users:", error);
    res.status(500).json({ 
      message: "Error creating test users", 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;