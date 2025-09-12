import mongoose, { Schema, Document } from "mongoose";

export interface IHackathon extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  submissionStartDate: Date;
  submissionEndDate: Date;
  submissionDescription: string;
  eventPlan: string;
  schedule: Array<{
    date: Date;
    activity: string;
    time: string;
  }>;
  problemStatements: Array<{
    track: string;
    description: string;
  }>;
  prizeDetails: Array<{
    position: number;
    amount: string;
    description: string;
  }>;
  teamSize: {
    min: number;
    max: number;
  };
  status: "upcoming" | "active" | "inactive" | "completed";
  participants: mongoose.Types.ObjectId[];
  teams: mongoose.Types.ObjectId[];
  socialLinks: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
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
  // NEW FIELDS FOR HACKATHON CUSTOMIZATION
  theme: "modern-tech" | "creative-arts" | "corporate" | "minimalist";
  fontFamily: "roboto" | "poppins" | "inter" | "montserrat";
  createdAt: Date;
  updatedAt: Date;
}

const HackathonSchema = new Schema<IHackathon>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    submissionStartDate: { type: Date },
    submissionEndDate: { type: Date },
    submissionDescription: { type: String, default: "Please submit your project solution here." },
    eventPlan: { type: String },
    schedule: [{
      date: { type: Date },
      activity: { type: String },
      time: { type: String }
    }],
    problemStatements: [{
      track: { type: String },
      description: { type: String }
    }],
    prizeDetails: [{
      position: { type: Number },
      amount: { type: String },
      description: { type: String }
    }],
    teamSize: {
      min: { type: Number, required: true, default: 2 },
      max: { type: Number, required: true, default: 4 }
    },
    status: { type: String, required: true, default: "upcoming", enum: ["upcoming", "active", "inactive", "completed"] },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    socialLinks: {
      website: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      instagram: { type: String },
      github: { type: String }
    },
    // NEW FIELDS FOR PARTICIPANT TEAM CREATION
    teamCreationMode: { type: String, enum: ["admin", "participant", "both"], default: "admin" },
    allowParticipantTeams: { type: Boolean, default: false },
    teamFinalizationRequired: { type: Boolean, default: true },
    minTeamSizeForFinalization: { type: Number, default: 2 },
    teamModificationLocked: { type: Boolean, default: false },
    teamModificationLockedAt: { type: Date },
    autoTeamCreationEnabled: { type: Boolean, default: true },
    autoTeamCreationTime: { type: Date },
    // NEW FIELDS FOR HACKATHON CUSTOMIZATION
    theme: { type: String, enum: ["modern-tech", "creative-arts", "corporate", "minimalist"], default: "modern-tech" },
    fontFamily: { type: String, enum: ["roboto", "poppins", "inter", "montserrat"], default: "roboto" }
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