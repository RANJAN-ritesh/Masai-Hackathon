import mongoose, { Schema, Document } from "mongoose";

export interface ITeam extends Document {
    teamName: string;
    createdBy: mongoose.Types.ObjectId;
    teamMembers: mongoose.Types.ObjectId[];
    memberLimit: number;
    hackathonId?: string; // Associate teams with specific hackathons
    description?: string;
    status?: string;
    // NEW FIELDS FOR PARTICIPANT TEAM CREATION
    isFinalized: boolean;
    creationMethod: "admin" | "participant" | "auto";
    finalizedAt?: Date;
    canReceiveRequests: boolean;
    pendingRequests: mongoose.Types.ObjectId[];
    teamStatus: "forming" | "finalized" | "locked";
    teamLeader: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>({
    teamName: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    memberLimit: { type: Number, required: true, default: 4 },
    hackathonId: { type: String, required: false }, // Link teams to hackathons
    description: { type: String, required: false },
    status: { type: String, required: false, default: 'active', enum: ['active', 'inactive', 'completed'] },
    // NEW FIELDS FOR PARTICIPANT TEAM CREATION
    isFinalized: { type: Boolean, default: false },
    creationMethod: { type: String, enum: ["admin", "participant", "auto"], default: "admin" },
    finalizedAt: { type: Date },
    canReceiveRequests: { type: Boolean, default: true },
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TeamRequest' }],
    teamStatus: { type: String, enum: ["forming", "finalized", "locked"], default: "forming" },
    teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<ITeam>("Team", TeamSchema);