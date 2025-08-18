import mongoose, { Schema, Document } from "mongoose";

export interface ITeam extends Document {
    teamName: string;
    createdBy: mongoose.Types.ObjectId;
    teamMembers: mongoose.Types.ObjectId[];
    memberLimit: number;
    hackathonId?: string; // Associate teams with specific hackathons
    description?: string;
    status?: string;
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
    status: { type: String, required: false, default: 'active', enum: ['active', 'inactive', 'completed'] }
}, { timestamps: true });

export default mongoose.model<ITeam>("Team", TeamSchema);