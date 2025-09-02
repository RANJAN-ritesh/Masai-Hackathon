import express from "express";
import Hackathon from "../model/hackathon";

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
    
    // Debug: Log incoming data
    console.log("🔧 Creating hackathon with data:", JSON.stringify(hackathonData, null, 2));
    console.log("🔧 Status value:", hackathonData.status, "Type:", typeof hackathonData.status);
    
    // Validate status enum
    const validStatuses = ["upcoming", "active", "inactive", "completed"];
    if (hackathonData.status && !validStatuses.includes(hackathonData.status)) {
      console.error("❌ Invalid status value:", hackathonData.status, "Valid values:", validStatuses);
      return res.status(400).json({ 
        message: `Invalid status value. Must be one of: ${validStatuses.join(", ")}`,
        received: hackathonData.status,
        validValues: validStatuses
      });
    }
    
    // Ensure status is set to a valid default if not provided
    if (!hackathonData.status) {
      hackathonData.status = "upcoming";
    }
    
    console.log("🔧 Final status value before save:", hackathonData.status);
    
    // Validate required fields
    if (!hackathonData.title || !hackathonData.startDate || !hackathonData.endDate) {
      return res.status(400).json({ message: "Title, start date, and end date are required" });
    }
    
    // Create new hackathon in database
    const newHackathon = new Hackathon(hackathonData);
    const savedHackathon = await newHackathon.save();
    
    console.log("✅ Hackathon created successfully with status:", savedHackathon.status);
    
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

// PUT - Update hackathon customization (theme and font)
router.put("/:id/customize", async (req, res) => {
  try {
    const { id } = req.params;
    const { theme, fontFamily } = req.body;

    // Validate theme and fontFamily
    const validThemes = ["modern-tech", "creative-arts", "corporate", "minimalist"];
    const validFonts = ["roboto", "poppins", "inter", "montserrat"];

    if (theme && !validThemes.includes(theme)) {
      return res.status(400).json({ error: "Invalid theme" });
    }

    if (fontFamily && !validFonts.includes(fontFamily)) {
      return res.status(400).json({ error: "Invalid font family" });
    }

    const updateData: any = {};
    if (theme) updateData.theme = theme;
    if (fontFamily) updateData.fontFamily = fontFamily;

    const hackathon = await Hackathon.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found" });
    }

    res.json({
      message: "Hackathon customization updated successfully",
      hackathon: {
        id: hackathon._id,
        theme: hackathon.theme,
        fontFamily: hackathon.fontFamily
      }
    });
  } catch (error) {
    console.error("Error updating hackathon customization:", error);
    res.status(500).json({ error: "Internal server error" });
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
