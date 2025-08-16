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
router.get("/", (req, res) => {
  res.json(mockHackathons);
});

// GET specific hackathon by ID
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = mockHackathons.find(h => h._id === id);
    
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hackathon" });
  }
});

// POST - Create new hackathon
router.post("/", (req, res) => {
  try {
    const hackathonData = req.body;
    
    // Validate required fields
    if (!hackathonData.title || !hackathonData.startDate || !hackathonData.endDate) {
      return res.status(400).json({ message: "Title, start date, and end date are required" });
    }
    
    // Generate unique ID
    const newId = `hackathon_${Date.now()}`;
    
    const newHackathon = {
      _id: newId,
      ...hackathonData,
      createdAt: new Date().toISOString()
    };
    
    mockHackathons.push(newHackathon);
    
    res.status(201).json({
      message: "Hackathon created successfully",
      hackathon: newHackathon
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating hackathon" });
  }
});

// PUT - Update hackathon
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const hackathonIndex = mockHackathons.findIndex(h => h._id === id);
    if (hackathonIndex === -1) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    
    mockHackathons[hackathonIndex] = { ...mockHackathons[hackathonIndex], ...updateData };
    
    res.status(200).json({ 
      message: "Hackathon updated successfully",
      hackathon: mockHackathons[hackathonIndex]
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating hackathon" });
  }
});

// DELETE - Delete hackathon
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    
    const hackathonIndex = mockHackathons.findIndex(h => h._id === id);
    if (hackathonIndex === -1) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    
    const deletedHackathon = mockHackathons.splice(hackathonIndex, 1)[0];
    
    res.status(200).json({ 
      message: "Hackathon deleted successfully",
      deletedHackathon
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting hackathon" });
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