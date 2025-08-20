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
    rank: string;
    prize: string;
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
    status: { type: String, required: true, default: "active", enum: ["active", "inactive", "completed"] },
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
      rank: { type: String },
      prize: { type: String },
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
    }
  },
  { timestamps: true }
);

export default mongoose.model<IHackathon>("Hackathon", HackathonSchema); 