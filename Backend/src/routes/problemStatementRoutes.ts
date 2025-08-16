import express from "express";

const router = express.Router();

// Mock hackathon data for now - you can replace with actual database calls later
const mockHackathon = {
  _id: "hackathon_001",
  title: "Masai Hackathon 2024",
  description: "Build innovative solutions with your team",
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  eventType: "Team Hackathon",
  maxTeamSize: 4,
  status: "active"
};

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
  res.json([mockHackathon]);
});

// GET specific hackathon by ID
router.get("/hackathons/:id", (req, res) => {
  const { id } = req.params;
  if (id === "hackathon_001") {
    res.json(mockHackathon);
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

// Problem statement routes
router.get("/problem-statements", (req, res) => {
  res.json(mockProblemStatements);
});

router.get("/problem-statements/:hackathonId", (req, res) => {
  res.json(mockProblemStatements);
});

export default router;