import mongoose, { Schema, Document } from "mongoose";

export interface IHackathon extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
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
    day: string;
    events: Array<{
      time: string;
      activity: string;
      description: string;
    }>;
  }>;
  eventPlan: Array<{
    phase: string;
    description: string;
    duration: string;
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
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
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
      day: { type: String },
      events: [{
        time: { type: String },
        activity: { type: String },
        description: { type: String }
      }]
    }],
    eventPlan: [{
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