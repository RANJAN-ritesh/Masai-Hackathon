import mongoose, { Schema, Document } from "mongoose";

export interface ITeamRequest extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  hackathonId: mongoose.Types.ObjectId;
  requestType: "join" | "invite";
  status: "pending" | "accepted" | "rejected" | "expired";
  message?: string;
  expiresAt: Date;
  createdAt: Date;
  respondedAt?: Date;
  responseMessage?: string;
  expiryReason?: "time" | "hackathon_start";
}

const TeamRequestSchema = new Schema<ITeamRequest>({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  requestType: { type: String, enum: ["join", "invite"], required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected", "expired"], default: "pending" },
  message: { type: String },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
  responseMessage: { type: String },
  expiryReason: { type: String, enum: ["time", "hackathon_start"] }
}, { timestamps: true });

// Index for efficient querying
TeamRequestSchema.index({ hackathonId: 1, status: 1 });
TeamRequestSchema.index({ teamId: 1, status: 1 });
TeamRequestSchema.index({ fromUserId: 1, status: 1 });
TeamRequestSchema.index({ toUserId: 1, status: 1 });
TeamRequestSchema.index({ expiresAt: 1 });

export default mongoose.model<ITeamRequest>("TeamRequest", TeamRequestSchema);