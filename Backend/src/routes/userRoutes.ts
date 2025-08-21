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

// GET all users - Admin endpoint
router.get("/getAllUsers", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ 
      message: "Error fetching users", 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Registration routes that frontend expects
router.get("/registrations/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // For now, return empty array - can be implemented later with actual registrations
    // This endpoint should return hackathon registrations for a specific user
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching registrations", error });
  }
});

// Upload participants via CSV
router.post("/upload-participants", async (req, res) => {
  try {
    const { participants, hackathonId } = req.body;
    
    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({ message: "Invalid participants data" });
    }

    if (!hackathonId || hackathonId === 'new') {
      return res.status(400).json({ message: "Valid hackathon ID is required" });
    }

    let uploadedCount = 0;
    let existingCount = 0;
    let updatedCount = 0;
    let errors: Array<{email: string, error: string}> = [];

    for (const participant of participants) {
      try {
        // Validate required fields
        if (!participant["Email"]) {
          throw new Error("Email is required");
        }
        
        const email = participant["Email"].toLowerCase().trim();
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
          // User exists - add them to this hackathon if not already added
          if (!existingUser.hackathonIds?.includes(hackathonId)) {
            // VALIDATION: Check if user is already in another ongoing hackathon
            const otherHackathons = existingUser.hackathonIds || [];
            if (otherHackathons.length > 0) {
              // Check if any of the other hackathons are ongoing
              const Hackathon = require('../model/hackathon').default;
              const ongoingHackathons = await Hackathon.find({
                _id: { $in: otherHackathons },
                status: { $in: ['upcoming', 'active'] }
              });
              
              if (ongoingHackathons.length > 0) {
                errors.push({
                  email: email,
                  error: `User is already part of ongoing hackathon: ${ongoingHackathons[0].title}`
                });
                continue; // Skip this user
              }
            }
            
            existingUser.hackathonIds = existingUser.hackathonIds || [];
            existingUser.hackathonIds.push(hackathonId);
            
            // Ensure user is verified for login
            if (!existingUser.isVerified) {
              existingUser.isVerified = true;
            }
            
            try {
              await existingUser.save();
              updatedCount++;
            } catch (saveError) {
              console.error("Error saving existing user:", saveError);
              // Even if save fails, count as existing
              existingCount++;
            }
          } else {
            // User is already in this hackathon, but ensure they're verified
            if (!existingUser.isVerified) {
              existingUser.isVerified = true;
              try {
                await existingUser.save();
                updatedCount++;
              } catch (saveError) {
                console.error("Error updating user verification:", saveError);
                existingCount++;
              }
            } else {
              existingCount++;
            }
          }
        } else {
          // Create new user
          const userId = `USER${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const hashedPassword = await bcrypt.hash("password123", 10);
          
          try {
            const newUser = await User.create({
              userId,
              name: `${participant["First Name"] || "Unknown"} ${participant["Last Name"] || "User"}`,
              code: userId,
              course: participant["Course"] || "Not Specified",
              skills: participant["Skills"] ? participant["Skills"].split(", ") : ["General"],
              vertical: participant["Vertical"] || "Not Specified",
              phoneNumber: participant["Phone"] || undefined, // Phone number is optional
              email: email,
              password: hashedPassword,
              teamId: "",
              hackathonIds: [hackathonId], // Associate with this hackathon
              isVerified: true,
              role: participant["Role"] || "member"
            });
            
            uploadedCount++;
          } catch (createError) {
            console.error("Error creating new user:", createError);
            
            // Check if it's a duplicate error
            if (createError && typeof createError === 'object' && 'code' in createError && createError.code === 11000) {
              // Duplicate key error - user might have been created by another request
              const duplicateUser = await User.findOne({ email });
              if (duplicateUser && !duplicateUser.hackathonIds?.includes(hackathonId)) {
                duplicateUser.hackathonIds = duplicateUser.hackathonIds || [];
                duplicateUser.hackathonIds.push(hackathonId);
                await duplicateUser.save();
                updatedCount++;
              } else {
                existingCount++;
              }
            } else {
              throw createError; // Re-throw non-duplicate errors
            }
          }
        }
      } catch (error) {
        console.error("Error processing participant:", participant["Email"], error);
        errors.push({
          email: participant["Email"] || "Unknown",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    // Prepare detailed response message
    let message = [];
    if (uploadedCount > 0) message.push(`${uploadedCount} new participants created`);
    if (updatedCount > 0) message.push(`${updatedCount} existing participants added to hackathon`);
    if (existingCount > 0) message.push(`${existingCount} participants already in this hackathon`);
    
    const finalMessage = message.length > 0 ? message.join(', ') : 'No changes made';

    // Prepare admin-friendly notifications
    const notifications = [];
    if (errors.length > 0) {
      const ongoingHackathonErrors = errors.filter(e => e.error.includes('already part of ongoing hackathon'));
      if (ongoingHackathonErrors.length > 0) {
        notifications.push({
          type: 'info',
          title: 'Participants in Other Hackathons',
          message: `${ongoingHackathonErrors.length} participants are currently enrolled in other ongoing hackathons and will be available after those hackathons complete.`,
          details: ongoingHackathonErrors.map(e => ({
            email: e.email,
            currentHackathon: e.error.split(': ')[1]
          }))
        });
      }
    }

    res.status(200).json({
      message: finalMessage,
      uploadedCount,
      existingCount,
      updatedCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      notifications: notifications.length > 0 ? notifications : undefined,
      summary: {
        total: participants.length,
        newUsers: uploadedCount,
        existingUsersAdded: updatedCount,
        alreadyInHackathon: existingCount,
        errors: errors.length,
        ongoingHackathonUsers: errors.filter(e => e.error.includes('already part of ongoing hackathon')).length
      }
    });
  } catch (error) {
    console.error("Error uploading participants:", error);
    res.status(500).json({ 
      message: "Error uploading participants", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
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

// Get participants for a specific hackathon
router.get("/hackathon/:hackathonId/participants", async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    if (!hackathonId) {
      return res.status(400).json({ message: "Hackathon ID is required" });
    }

    // Find all users associated with this hackathon
    const participants = await User.find({ 
      hackathonIds: { $in: [hackathonId] } 
    }).select('-password'); // Exclude password field

    res.status(200).json({
      message: `Found ${participants.length} participants for hackathon`,
      participants,
      count: participants.length
    });
  } catch (error) {
    console.error("Error fetching hackathon participants:", error);
    res.status(500).json({ message: "Error fetching participants", error: String(error) });
  }
});

// Check if user is enrolled in any hackathon
router.get("/hackathon/:userId/enrollment", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find user and check their hackathon enrollment
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.hackathonIds || user.hackathonIds.length === 0) {
      return res.status(200).json({ 
        message: "User not enrolled in any hackathon",
        hackathon: null 
      });
    }

    // Get the most recent hackathon the user is enrolled in
    const Hackathon = require('../model/hackathon').default;
    const userHackathons = await Hackathon.find({
      _id: { $in: user.hackathonIds },
      status: { $in: ['upcoming', 'active'] }
    }).sort({ createdAt: -1 });

    if (userHackathons.length === 0) {
      return res.status(200).json({ 
        message: "User not enrolled in any active hackathon",
        hackathon: null 
      });
    }

    // Return the most recent active hackathon
    const enrolledHackathon = userHackathons[0];
    res.status(200).json({
      message: "User enrolled in hackathon",
      hackathon: enrolledHackathon,
      enrollmentDate: user.createdAt
    });

  } catch (error) {
    console.error("Error checking user enrollment:", error);
    res.status(500).json({ 
      message: "Error checking enrollment", 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;