import express from "express";

const router = express.Router();

// Mock hackathon data for now - you can replace with actual database calls later
let mockHackathons = [
  {
    _id: "hackathon_001",
    title: "Masai Hackathon 2024",
    description: "Build innovative solutions with your team",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    eventType: "Team Hackathon",
    maxTeamSize: 4,
    status: "active"
  }
];

const mockProblemStatements = [
  {
    _id: "problem_001",
    title: "AI-Powered Learning Platform",
    description: "Build an intelligent learning platform that adapts to student needs",
    difficulty: "Hard",
    tags: ["AI", "Education", "Machine Learning"]
  },
  {
    _id: "problem_002",
    title: "Sustainable E-commerce Solution",
    description: "Create an eco-friendly e-commerce platform",
    difficulty: "Medium",
    tags: ["Sustainability", "E-commerce", "Green Tech"]
  }
];

// GET all hackathons
router.get("/hackathons", (req, res) => {
  res.json(mockHackathons);
});

// GET specific hackathon by ID
router.get("/hackathons/:id", (req, res) => {
  const { id } = req.params;
  const hackathon = mockHackathons.find(h => h._id === id);
  if (hackathon) {
    res.json(hackathon);
  } else {
    res.status(404).json({ message: "Hackathon not found" });
  }
});

// POST - Create new hackathon
router.post("/hackathons", (req, res) => {
  try {
    const hackathonData = req.body;
    console.log("Creating hackathon:", hackathonData);
    
    // For now, just return success - you can implement actual database saving later
    const newHackathon = {
      _id: `hackathon_${Date.now()}`,
      ...hackathonData,
      createdAt: new Date().toISOString(),
      status: "active"
    };
    
    // Add to our mock array
    mockHackathons.push(newHackathon);
    
    res.status(201).json({
      message: "Hackathon created successfully",
      hackathon: newHackathon
    });
  } catch (error) {
    console.error("Error creating hackathon:", error);
    res.status(500).json({ 
      message: "Error creating hackathon", 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// PUT - Update hackathon
router.put("/hackathons/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const hackathonIndex = mockHackathons.findIndex(h => h._id === id);
    if (hackathonIndex === -1) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    
    // Update the hackathon
    mockHackathons[hackathonIndex] = { ...mockHackathons[hackathonIndex], ...updateData };
    
    res.status(200).json({
      message: "Hackathon updated successfully",
      hackathon: mockHackathons[hackathonIndex]
    });
  } catch (error) {
    console.error("Error updating hackathon:", error);
    res.status(500).json({ 
      message: "Error updating hackathon", 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// DELETE - Delete hackathon
router.delete("/hackathons/:id", (req, res) => {
  try {
    const { id } = req.params;
    
    const hackathonIndex = mockHackathons.findIndex(h => h._id === id);
    if (hackathonIndex === -1) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    
    // Remove the hackathon
    const deletedHackathon = mockHackathons.splice(hackathonIndex, 1)[0];
    
    res.status(200).json({
      message: "Hackathon deleted successfully",
      hackathon: deletedHackathon
    });
  } catch (error) {
    console.error("Error deleting hackathon:", error);
    res.status(500).json({ 
      message: "Error deleting hackathon", 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Problem statement routes
router.get("/problem-statements", (req, res) => {
  res.json(mockProblemStatements);
});

router.get("/problem-statements/:hackathonId", (req, res) => {
  res.json(mockProblemStatements);
});

export default router;