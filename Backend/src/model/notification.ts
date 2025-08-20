import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  hackathonId: mongoose.Types.ObjectId;
  type: "team_finalized" | "request_received" | "request_accepted" | "request_rejected" | "auto_team_creation" | "hackathon_starting" | "team_locked" | "ownership_transferred";
  title: string;
  message: string;
  isRead: boolean;
  relatedTeamId?: mongoose.Types.ObjectId;
  relatedRequestId?: mongoose.Types.ObjectId;
  createdAt: Date;
  readAt?: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  type: { 
    type: String, 
    enum: ["team_finalized", "request_received", "request_accepted", "request_rejected", "auto_team_creation", "hackathon_starting", "team_locked", "ownership_transferred"], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedTeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  relatedRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeamRequest' },
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date }
}, { timestamps: true });

// Index for efficient querying
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ hackathonId: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 });

export default mongoose.model<INotification>("Notification", NotificationSchema); 