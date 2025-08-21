import mongoose, { Schema, Document } from "mongoose";

export interface IHackathon extends Document {
  title: string;
  version?: string;
  description: string;
  startDate: Date;
  endDate: Date;
  submissionStart?: Date;
  submissionEnd?: Date;
  eventType: string;
  minTeamSize: number;
  maxTeamSize: number;
  status: string;
  problemStatements: Array<{
    _id: string;
    track: string;
    description: string;
    difficulty: string;
  }>;
  schedule: Array<{
    date: string;
    activity: string;
  }>;
  eventPlan: Array<{
    week?: number;
    phase: string;
    description: string;
    duration?: string;
  }>;
  prizeDetails: Array<{
    position: number;
    amount: string;
    description: string;
  }>;
  allowedEmails: string[];
  socialLinks: {
    zoom?: string;
    youtube?: string;
    slack?: string;
    github?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  // NEW FIELDS FOR PARTICIPANT TEAM CREATION
  teamCreationMode: "admin" | "participant" | "both";
  allowParticipantTeams: boolean;
  teamFinalizationRequired: boolean;
  minTeamSizeForFinalization: number;
  teamModificationLocked: boolean;
  teamModificationLockedAt?: Date;
  autoTeamCreationEnabled: boolean;
  autoTeamCreationTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HackathonSchema = new Schema<IHackathon>(
  {
    title: { type: String, required: true },
    version: { type: String },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    submissionStart: { type: Date },
    submissionEnd: { type: Date },
    eventType: { type: String, required: true, default: "Team Hackathon" },
    minTeamSize: { type: Number, required: true, default: 2 },
    maxTeamSize: { type: Number, required: true, default: 4 },
    status: { type: String, required: true, default: "upcoming", enum: ["upcoming", "active", "inactive", "completed"] },
    problemStatements: [{
      _id: { type: String },
      track: { type: String },
      description: { type: String },
      difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] }
    }],
    schedule: [{
      date: { type: String },
      activity: { type: String }
    }],
    eventPlan: [{
      week: { type: Number },
      phase: { type: String },
      description: { type: String },
      duration: { type: String }
    }],
    prizeDetails: [{
      position: { type: Number },
      amount: { type: String },
      description: { type: String }
    }],
    allowedEmails: [{ type: String }],
    socialLinks: {
      zoom: { type: String },
      youtube: { type: String },
      slack: { type: String },
      github: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      linkedin: { type: String }
    },
    // NEW FIELDS FOR PARTICIPANT TEAM CREATION
    teamCreationMode: { type: String, enum: ["admin", "participant", "both"], default: "admin" },
    allowParticipantTeams: { type: Boolean, default: false },
    teamFinalizationRequired: { type: Boolean, default: true },
    minTeamSizeForFinalization: { type: Number, default: 2 },
    teamModificationLocked: { type: Boolean, default: false },
    teamModificationLockedAt: { type: Date },
    autoTeamCreationEnabled: { type: Boolean, default: true },
    autoTeamCreationTime: { type: Date }
  },
  { timestamps: true }
);

// Debug: Log schema enum values
// console.log("🔧 Hackathon Schema Status Enum:", HackathonSchema.path('status').enumValues);
// console.log("🔧 Hackathon Schema Status Default:", HackathonSchema.path('status').defaultValue);

// Force model re-registration to ensure new schema is used
if (mongoose.models.Hackathon) {
  delete mongoose.models.Hackathon;
}

export default mongoose.model<IHackathon>("Hackathon", HackathonSchema); 