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

// Hackathon routes
router.get("/hackathons", (req, res) => {
  res.json([mockHackathon]);
});

router.get("/hackathons/:id", (req, res) => {
  res.json(mockHackathon);
});

// Problem statement routes
router.get("/problem-statements", (req, res) => {
  res.json(mockProblemStatements);
});

router.get("/problem-statements/:hackathonId", (req, res) => {
  res.json(mockProblemStatements);
});

export default router;