import express from "express";
import Hackathon from "../model/hackathon.js";

const router = express.Router();

// GET all hackathons
router.get("/", async (req, res) => {
  try {
    const hackathons = await Hackathon.find();
    res.json(hackathons);
  } catch (error) {
    console.error("Error fetching hackathons:", error);
    res.status(500).json({ message: "Error fetching hackathons" });
  }
});

// GET specific hackathon by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = await Hackathon.findById(id);
    
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    
    res.json(hackathon);
  } catch (error) {
    console.error("Error fetching hackathon:", error);
    res.status(500).json({ message: "Error fetching hackathon" });
  }
});

// POST - Create new hackathon
router.post("/", async (req, res) => {
  try {
    const hackathonData = req.body;
    
    // Validate required fields
    if (!hackathonData.title || !hackathonData.startDate || !hackathonData.endDate) {
      return res.status(400).json({ message: "Title, start date, and end date are required" });
    }
    
    // Create new hackathon in database
    const newHackathon = new Hackathon(hackathonData);
    const savedHackathon = await newHackathon.save();
    
    // Return the saved hackathon
    res.status(201).json(savedHackathon);
  } catch (error) {
    console.error("Error creating hackathon:", error);
    res.status(500).json({ message: "Error creating hackathon" });
  }
});

// PUT - Update hackathon
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedHackathon = await Hackathon.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedHackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    
    res.status(200).json({ 
      message: "Hackathon updated successfully",
      hackathon: updatedHackathon
    });
  } catch (error) {
    console.error("Error updating hackathon:", error);
    res.status(500).json({ message: "Error updating hackathon" });
  }
});

// DELETE - Delete hackathon
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedHackathon = await Hackathon.findByIdAndDelete(id);
    
    if (!deletedHackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    
    res.status(200).json({ 
      message: "Hackathon deleted successfully",
      hackathon: deletedHackathon
    });
  } catch (error) {
    console.error("Error deleting hackathon:", error);
    res.status(500).json({ message: "Error deleting hackathon" });
  }
});

// Problem statement routes - placeholder for future implementation
router.get("/problem-statements", async (req, res) => {
  try {
    // TODO: Implement actual problem statement logic
    res.json({ message: "Problem statements feature coming soon", data: [] });
  } catch (error) {
    console.error("Error fetching problem statements:", error);
    res.status(500).json({ message: "Error fetching problem statements" });
  }
});

router.get("/problem-statements/:hackathonId", async (req, res) => {
  try {
    const { hackathonId } = req.params;
    // TODO: Implement actual problem statement logic for specific hackathon
    res.json({ 
      message: "Problem statements feature coming soon", 
      hackathonId,
      data: [] 
    });
  } catch (error) {
    console.error("Error fetching problem statements:", error);
    res.status(500).json({ message: "Error fetching problem statements" });
  }
});

export default router;