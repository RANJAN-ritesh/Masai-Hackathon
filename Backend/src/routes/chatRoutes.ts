import express from "express";
import { authenticateUser } from "../middleware/auth";
import Team from "../model/team";
import ChatMessage from "../model/chatMessage";
import User from "../model/user";
import { getWebSocketInstance } from "../services/websocketService";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/chat';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common file types
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and common file types are allowed'));
    }
  }
});

// Get chat messages for a team
router.get("/messages/:teamId", authenticateUser, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Verify team exists and user is a member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isMember = team.teamMembers.some(member => 
      member.toString() === userId
    ) || team.createdBy?.toString() === userId;
    
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this team" });
    }

    // Get messages with pagination
    const skip = (Number(page) - 1) * Number(limit);
    const messages = await ChatMessage.find({
      teamId: teamId,
      isDeleted: false
    })
    .sort({ timestamp: -1 })
    .limit(Number(limit))
    .skip(skip)
    .lean();

    // Reverse to show oldest first
    messages.reverse();

    res.json({
      messages,
      hasMore: messages.length === Number(limit),
      page: Number(page)
    });

  } catch (error) {
    console.error("Error getting chat messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Send a text message
router.post("/send-message", authenticateUser, async (req, res) => {
  try {
    const { teamId, message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!teamId || !message || message.trim().length === 0) {
      return res.status(400).json({ message: "Team ID and message are required" });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: "Message too long (max 1000 characters)" });
    }

    // Verify team exists and user is a member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isMember = team.teamMembers.some(member => 
      member.toString() === userId
    ) || team.createdBy?.toString() === userId;
    
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this team" });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create message
    const chatMessage = new ChatMessage({
      teamId: teamId,
      senderId: userId,
      senderName: user.name,
      senderEmail: user.email,
      message: message.trim(),
      messageType: 'text',
      timestamp: new Date()
    });

    await chatMessage.save();

    // Send real-time update to all team members
    const teamMemberIds = team.teamMembers.map(member => member.toString());
    getWebSocketInstance().sendChatMessage(teamMemberIds, {
      type: 'new_message',
      message: {
        _id: chatMessage._id,
        teamId: chatMessage.teamId,
        senderId: chatMessage.senderId,
        senderName: chatMessage.senderName,
        senderEmail: chatMessage.senderEmail,
        message: chatMessage.message,
        messageType: chatMessage.messageType,
        timestamp: chatMessage.timestamp
      }
    });

    res.json({ 
      message: "Message sent successfully",
      chatMessage: {
        _id: chatMessage._id,
        teamId: chatMessage.teamId,
        senderId: chatMessage.senderId,
        senderName: chatMessage.senderName,
        senderEmail: chatMessage.senderEmail,
        message: chatMessage.message,
        messageType: chatMessage.messageType,
        timestamp: chatMessage.timestamp
      }
    });

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Upload file (image/meme)
router.post("/upload-file", authenticateUser, upload.single('file'), async (req, res) => {
  try {
    const { teamId, message = '' } = req.body;
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!teamId || !file) {
      return res.status(400).json({ message: "Team ID and file are required" });
    }

    // Verify team exists and user is a member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isMember = team.teamMembers.some(member => 
      member.toString() === userId
    ) || team.createdBy?.toString() === userId;
    
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this team" });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine message type based on file
    const isImage = /jpeg|jpg|png|gif|webp/i.test(file.mimetype);
    const messageType = isImage ? 'image' : 'file';

    // Create file URL (in production, this would be uploaded to cloud storage)
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/chat/${file.filename}`;

    // Create message
    const chatMessage = new ChatMessage({
      teamId: teamId,
      senderId: userId,
      senderName: user.name,
      senderEmail: user.email,
      message: message.trim() || (isImage ? '📷 Image shared' : '📎 File shared'),
      messageType: messageType,
      fileUrl: fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      timestamp: new Date()
    });

    await chatMessage.save();

    // Send real-time update to all team members
    const teamMemberIds = team.teamMembers.map(member => member.toString());
    getWebSocketInstance().sendChatMessage(teamMemberIds, {
      type: 'new_message',
      message: {
        _id: chatMessage._id,
        teamId: chatMessage.teamId,
        senderId: chatMessage.senderId,
        senderName: chatMessage.senderName,
        senderEmail: chatMessage.senderEmail,
        message: chatMessage.message,
        messageType: chatMessage.messageType,
        fileUrl: chatMessage.fileUrl,
        fileName: chatMessage.fileName,
        fileSize: chatMessage.fileSize,
        timestamp: chatMessage.timestamp
      }
    });

    res.json({ 
      message: "File uploaded successfully",
      chatMessage: {
        _id: chatMessage._id,
        teamId: chatMessage.teamId,
        senderId: chatMessage.senderId,
        senderName: chatMessage.senderName,
        senderEmail: chatMessage.senderEmail,
        message: chatMessage.message,
        messageType: chatMessage.messageType,
        fileUrl: chatMessage.fileUrl,
        fileName: chatMessage.fileName,
        fileSize: chatMessage.fileSize,
        timestamp: chatMessage.timestamp
      }
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Edit message
router.put("/edit-message/:messageId", authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (message.length > 1000) {
      return res.status(400).json({ message: "Message too long (max 1000 characters)" });
    }

    // Find message and verify ownership
    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (chatMessage.senderId.toString() !== userId) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    if (chatMessage.isDeleted) {
      return res.status(400).json({ message: "Cannot edit deleted message" });
    }

    // Update message
    chatMessage.message = message.trim();
    chatMessage.isEdited = true;
    chatMessage.editedAt = new Date();
    await chatMessage.save();

    // Send real-time update
    const team = await Team.findById(chatMessage.teamId);
    if (team) {
      const teamMemberIds = team.teamMembers.map(member => member.toString());
      getWebSocketInstance().sendChatMessage(teamMemberIds, {
        type: 'message_edited',
        message: {
          _id: chatMessage._id,
          message: chatMessage.message,
          isEdited: chatMessage.isEdited,
          editedAt: chatMessage.editedAt
        }
      });
    }

    res.json({ message: "Message edited successfully" });

  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete message
router.delete("/delete-message/:messageId", authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find message and verify ownership
    const chatMessage = await ChatMessage.findById(messageId);
    if (!chatMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (chatMessage.senderId.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    // Soft delete message
    chatMessage.isDeleted = true;
    chatMessage.deletedAt = new Date();
    await chatMessage.save();

    // Send real-time update
    const team = await Team.findById(chatMessage.teamId);
    if (team) {
      const teamMemberIds = team.teamMembers.map(member => member.toString());
      getWebSocketInstance().sendChatMessage(teamMemberIds, {
        type: 'message_deleted',
        messageId: chatMessage._id
      });
    }

    res.json({ message: "Message deleted successfully" });

  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
