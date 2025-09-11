import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  teamId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderEmail: string;
  message: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  timestamp: Date;
  isEdited?: boolean;
  editedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true,
    index: true 
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  senderName: { 
    type: String, 
    required: true 
  },
  senderEmail: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 1000 
  },
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'file'], 
    default: 'text' 
  },
  fileUrl: { 
    type: String 
  },
  fileName: { 
    type: String 
  },
  fileSize: { 
    type: Number 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  isEdited: { 
    type: Boolean, 
    default: false 
  },
  editedAt: { 
    type: Date 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date 
  }
}, { timestamps: true });

// Compound index for efficient team message queries
ChatMessageSchema.index({ teamId: 1, timestamp: -1 });

const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
